import http from "node:http";
import crypto from "node:crypto";

import { logger } from "#utils/terminal";

function sendResponse(res, statusCode, body) {
    res.writeHead(statusCode, {
        "Content-Type": "application/json; charset=utf-8"
    });

    res.end(
        JSON.stringify(body)
    );
}

function readBody(req) {
    return new Promise((resolve, reject) => {
        let body = "";

        req.setEncoding("utf8");

        req.on("data", (chunk) => {
            body += chunk;

            if (body.length > 1_000_000) {
                reject(
                    new Error(
                        "Webhook request body is too large."
                    )
                );

                req.destroy();
            }
        });

        req.on("end", () => {
            resolve(body);
        });

        req.on("error", reject);
    });
}

function verifySecret(req, secret) {
    if (!secret) {
        return true;
    }

    const authorization =
        req.headers.authorization ?? "";

    const expected =
        `Bearer ${secret}`;

    const receivedBuffer =
        Buffer.from(
            authorization,
            "utf8"
        );

    const expectedBuffer =
        Buffer.from(
            expected,
            "utf8"
        );

    if (
        receivedBuffer.length !==
        expectedBuffer.length
    ) {
        return false;
    }

    return crypto.timingSafeEqual(
        receivedBuffer,
        expectedBuffer
    );
}

function formatPlayerJoinMessage(
    payload,
    template
) {
    const player =
        payload?.player?.name ??
        "Unknown Player";

    const uuid =
        payload?.player?.uuid ??
        "Unknown UUID";

    return template
        .replaceAll(
            "{player}",
            player
        )
        .replaceAll(
            "{uuid}",
            uuid
        );
}

async function handleRequest(
    req,
    res,
    config,
    send
) {
    if (
        req.method !== "POST" ||
        req.url !== "/webhook/minecraft"
    ) {
        sendResponse(
            res,
            404,
            {
                success: false,
                error: "Not Found"
            }
        );

        return;
    }

    const webhook =
        config.webhook?.minecraft;

    if (
        !webhook?.enabled
    ) {
        sendResponse(
            res,
            404,
            {
                success: false,
                error: "Webhook disabled"
            }
        );

        return;
    }

    if (
        !verifySecret(
            req,
            webhook.secret
        )
    ) {
        sendResponse(
            res,
            401,
            {
                success: false,
                error: "Unauthorized"
            }
        );

        return;
    }

    let payload;

    try {
        const body =
            await readBody(req);

        payload =
            JSON.parse(body);
    } catch {
        sendResponse(
            res,
            400,
            {
                success: false,
                error: "Invalid JSON"
            }
        );

        return;
    }

    if (
        !payload ||
        typeof payload !== "object"
    ) {
        sendResponse(
            res,
            400,
            {
                success: false,
                error: "Invalid payload"
            }
        );

        return;
    }

    const event =
        payload.event;

    if (
        event === "player_join"
    ) {
        if (
            webhook.events?.player_join === false
        ) {
            sendResponse(
                res,
                200,
                {
                    success: true,
                    ignored: true
                }
            );

            return;
        }

        const template =
            webhook.messages?.player_join ??
            "🟢 *Player Joined*\n\n" +
            "👤 {player}\n" +
            "🆔 {uuid}";

        const message =
            formatPlayerJoinMessage(
                payload,
                template
            );

        const targets =
            Array.isArray(webhook.targets)
                ? webhook.targets
                : [];

        if (
            targets.length === 0
        ) {
            logger.warn(
                "[Webhook] No WhatsApp targets configured."
            );

            sendResponse(
                res,
                500,
                {
                    success: false,
                    error: "No WhatsApp targets configured"
                }
            );

            return;
        }

        const results = [];

        for (
            const jid of targets
        ) {
            try {
                await send.text(
                    jid,
                    message
                );

                results.push({
                    jid,
                    success: true
                });
            } catch (error) {
                logger.error(
                    `[Webhook] Failed to send to ${jid}:`,
                    error
                );

                results.push({
                    jid,
                    success: false
                });
            }
        }

        logger.info(
            `[Webhook] player_join received: ${
                payload.player?.name ??
                "Unknown Player"
            }`
        );

        sendResponse(
            res,
            200,
            {
                success: true,
                event,
                sent: results
            }
        );

        return;
    }

    sendResponse(
        res,
        400,
        {
            success: false,
            error: `Unsupported event: ${event ?? "unknown"}`
        }
    );
}

export function createWebhookServer(
    config,
    send
) {
    const webhook =
        config.webhook?.minecraft;

    if (
        !webhook?.enabled
    ) {
        logger.info(
            "[Webhook] Minecraft webhook disabled."
        );

        return null;
    }

    const host =
        webhook.host ??
        "0.0.0.0";

    const port =
        Number(webhook.port ?? 3000);

    const server =
        http.createServer(
            async (req, res) => {
                try {
                    await handleRequest(
                        req,
                        res,
                        config,
                        send
                    );
                } catch (error) {
                    logger.error(
                        "[Webhook] Request error:",
                        error
                    );

                    if (!res.headersSent) {
                        sendResponse(
                            res,
                            500,
                            {
                                success: false,
                                error: "Internal Server Error"
                            }
                        );
                    }
                }
            }
        );

    server.listen(
        port,
        host,
        () => {
            logger.success(
                `[Webhook] Minecraft webhook listening on ${host}:${port}`
            );
        }
    );

    server.on(
        "error",
        (error) => {
            logger.error(
                "[Webhook] Server error:",
                error
            );
        }
    );

    return server;
}