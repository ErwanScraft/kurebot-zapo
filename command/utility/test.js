const queue = [];
const cooldowns = new Map();
const streams = new Map();

let activeRequest = null;
let processingQueue = false;
let listenerRegistered = false;

const COOLDOWN_MS = 5_000;
const REQUEST_TIMEOUT_MS = 60_000;
const TIMEOUT_GRACE_MS = 10_000;

function getBotJid(bot) {
    if (
        typeof bot?.jid === "string" &&
        bot.jid.endsWith("@bot")
    ) {
        return bot.jid;
    }

    if (
        typeof bot?.fbidJid === "string" &&
        bot.fbidJid.endsWith("@bot")
    ) {
        return bot.fbidJid;
    }

    return null;
}

async function getDefaultBot(main) {
    const bots = await main.bot.listBots();

    if (!Array.isArray(bots) || bots.length === 0) {
        return null;
    }

    return (
        bots.find((bot) => bot?.isDefault === true) ??
        bots[0]
    );
}

function extractBotText(event) {
    const submessages =
        event?.message
            ?.protocolMessage
            ?.editedMessage
            ?.richResponseMessage
            ?.submessages;

    if (Array.isArray(submessages)) {
        const text = submessages
            .map((item) => item?.messageText ?? "")
            .filter(Boolean)
            .join("\n")
            .trim();

        if (text) {
            return text;
        }
    }

    const conversation =
        event?.message?.conversation ??
        event?.message?.extendedTextMessage?.text ??
        "";

    return typeof conversation === "string"
        ? conversation.trim()
        : "";
}

function isMetaAIError(text) {
    if (!text) {
        return false;
    }

    const value = text
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();

    return (
        value.includes(
            "there was a problem generating a response"
        ) ||
        value.includes(
            "please try again later"
        ) ||
        value.includes(
            "something went wrong"
        ) ||
        value.includes(
            "unable to generate a response"
        )
    );
}

async function sendAIResponse(request, text) {
    if (!request || request.finished) {
        return;
    }

    request.finished = true;

    if (request.timeout) {
        clearTimeout(request.timeout);
        request.timeout = null;
    }

    if (request.graceTimeout) {
        clearTimeout(request.graceTimeout);
        request.graceTimeout = null;
    }

    try {
        if (isMetaAIError(text)) {
            await request.send(
                "⚠️ Meta AI sedang mengalami kendala saat membuat jawaban.\n\nSilakan coba lagi beberapa saat."
            );
        } else {
            await request.send(text);
        }
    } catch (error) {
        console.error(
            "[AI] Failed to send response:",
            error
        );
    }
}

function registerBotChunkListener(main) {
    if (listenerRegistered) {
        return;
    }

    listenerRegistered = true;

    main.on("message_bot_chunk", async (event) => {
        try {
            if (!activeRequest) {
                return;
            }

            if (activeRequest.finished) {
                return;
            }

            const targetMessageId =
                event?.targetMessageId;

            if (!targetMessageId) {
                return;
            }

            const botJid =
                event?.key?.participant ??
                event?.key?.remoteJid ??
                null;

            if (
                activeRequest.botJid &&
                botJid &&
                botJid !== activeRequest.botJid
            ) {
                return;
            }

            /*
             * Karena queue hanya menjalankan satu request,
             * chunk pertama dianggap milik request aktif.
             */
            if (!activeRequest.targetMessageId) {
                activeRequest.targetMessageId =
                    targetMessageId;
            }

            /*
             * Abaikan chunk dari stream lain.
             */
            if (
                activeRequest.targetMessageId !==
                targetMessageId
            ) {
                return;
            }

            const stream =
                streams.get(targetMessageId) ?? {
                    text: "",
                    editType: null
                };

            const text =
                extractBotText(event);

            /*
             * messageText pada richResponseMessage
             * dapat berupa isi terbaru/full text,
             * bukan delta.
             *
             * Karena itu jangan:
             *
             * stream.text += text
             *
             * melainkan replace.
             */
            if (text) {
                stream.text = text;
            }

            stream.editType =
                event?.editType ?? null;

            streams.set(
                targetMessageId,
                stream
            );

            const finished =
                event?.editType === "last" ||
                event?.editType === "full";

            if (!finished) {
                return;
            }

            const finalText =
                stream.text?.trim() ?? "";

            streams.delete(
                targetMessageId
            );

            if (!finalText) {
                return;
            }

            await sendAIResponse(
                activeRequest,
                finalText
            );

            activeRequest.resolve?.();
        } catch (error) {
            console.error(
                "[AI] message_bot_chunk error:",
                error
            );

            if (activeRequest) {
                await sendAIResponse(
                    activeRequest,
                    "⚠️ Terjadi kesalahan saat menerima response Meta AI."
                );

                activeRequest.resolve?.();
            }
        }
    });
}

async function processQueue() {
    if (processingQueue) {
        return;
    }

    processingQueue = true;

    try {
        while (queue.length > 0) {
            const request =
                queue.shift();

            if (!request) {
                continue;
            }

            await processRequest(
                request
            );
        }
    } finally {
        processingQueue = false;
    }
}

async function processRequest(request) {
    let responseResolved = false;
    let resolveResponse;

    /*
     * Promise dibuat SEBELUM sendPrompt().
     *
     * Ini penting karena message_bot_chunk
     * bisa datang sebelum sendPrompt() selesai.
     */
    const responsePromise =
        new Promise((resolve) => {
            resolveResponse = resolve;
        });

    const finish = () => {
        if (responseResolved) {
            return;
        }

        responseResolved = true;
        resolveResponse();
    };

    activeRequest = {
        ...request,
        botJid: null,
        targetMessageId: null,
        finished: false,
        timeout: null,
        graceTimeout: null,
        resolve: finish
    };

    try {
        const bot =
            await getDefaultBot(
                request.main
            );

        if (!bot) {
            await request.send(
                "⚠️ Tidak ada WhatsApp AI yang tersedia."
            );

            finish();
            return;
        }

        const botJid =
            getBotJid(bot);

        if (!botJid) {
            console.error(
                "[AI] Invalid bot JID:",
                bot
            );

            await request.send(
                "⚠️ JID WhatsApp AI tidak valid."
            );

            finish();
            return;
        }

        activeRequest.botJid =
            botJid;

        console.log(
            `[AI] → ${botJid}`
        );

        /*
         * Timeout utama.
         */
        activeRequest.timeout =
            setTimeout(async () => {
                if (
                    !activeRequest ||
                    activeRequest.finished
                ) {
                    return;
                }

                console.warn(
                    "[AI] Request timeout:",
                    request.prompt
                );

                activeRequest.finished =
                    true;

                try {
                    await request.send(
                        "⚠️ Meta AI tidak memberikan jawaban dalam 60 detik.\n\nSilakan coba lagi."
                    );
                } catch (error) {
                    console.error(
                        "[AI] Failed to send timeout:",
                        error
                    );
                }

                /*
                 * Beri waktu tambahan agar event lama
                 * selesai sebelum queue dilanjutkan.
                 */
                activeRequest.graceTimeout =
                    setTimeout(() => {
                        finish();
                    }, TIMEOUT_GRACE_MS);
            }, REQUEST_TIMEOUT_MS);

        /*
         * Kirim prompt DIRECT ke Meta AI.
         */
        try {
            await request.main.bot.sendPrompt(
                botJid,
                request.prompt
            );
        } catch (error) {
            console.error(
                "[AI] sendPrompt failed:",
                error
            );

            if (activeRequest.timeout) {
                clearTimeout(
                    activeRequest.timeout
                );

                activeRequest.timeout =
                    null;
            }

            await request.send(
                "⚠️ Gagal menghubungi Meta AI.\n\nSilakan coba lagi beberapa saat."
            );

            finish();
            return;
        }

        /*
         * Tunggu sampai:
         *
         * 1. chunk terakhir diterima
         * 2. Meta AI error diterima
         * 3. timeout terjadi
         * 4. sendPrompt gagal
         */
        await responsePromise;
    } catch (error) {
        console.error(
            "[AI] Request error:",
            error
        );

        if (activeRequest?.timeout) {
            clearTimeout(
                activeRequest.timeout
            );

            activeRequest.timeout =
                null;
        }

        if (
            activeRequest?.graceTimeout
        ) {
            clearTimeout(
                activeRequest.graceTimeout
            );

            activeRequest.graceTimeout =
                null;
        }

        if (
            !activeRequest?.finished
        ) {
            await request.send(
                "⚠️ Terjadi kesalahan saat memproses permintaan AI."
            );
        }

        finish();
    } finally {
        if (activeRequest?.timeout) {
            clearTimeout(
                activeRequest.timeout
            );
        }

        if (
            activeRequest?.graceTimeout
        ) {
            clearTimeout(
                activeRequest.graceTimeout
            );
        }

        if (
            activeRequest?.targetMessageId
        ) {
            streams.delete(
                activeRequest.targetMessageId
            );
        }

        activeRequest = null;
    }
}

function cleanupCooldowns() {
    const now = Date.now();

    for (
        const [key, timestamp]
        of cooldowns
    ) {
        if (
            now - timestamp >=
            COOLDOWN_MS
        ) {
            cooldowns.delete(key);
        }
    }
}

function getCooldownKey(m) {
    return (
        m?.sender ??
        m?.participant ??
        m?.key?.participant ??
        m?.chat
    );
}

export default {
    command: "ai",

    aliases: [
        "text",
        "ask"
    ],

    description:
        "Chat dengan WhatsApp AI",

    meta: {
        scope: "global",

        status: "register",

        access: {
            owner: false,
            admin: false,
            premium: false,
            limit: false
        },

        tracker: {
            mode: false,
            type: "-"
        },

        category: "AI"
    },

    async run({
        main,
        m,
        send
    }) {
        /*
         * Listener hanya didaftarkan sekali.
         */
        registerBotChunkListener(
            main
        );

        cleanupCooldowns();

        const prompt =
            m.text?.trim();

        if (!prompt) {
            await send.text(
                m.chat,
                "Masukkan pertanyaan.\n\nContoh:\n.ai halo"
            );

            return;
        }

        /*
         * Cooldown berdasarkan USER,
         * bukan m.chat.
         *
         * Jadi di group:
         *
         * User A → .ai halo
         * User B → .ai siapa kamu
         *
         * tidak saling memblokir cooldown.
         */
        const cooldownKey =
            getCooldownKey(m);

        const lastRequest =
            cooldowns.get(
                cooldownKey
            );

        if (lastRequest) {
            const elapsed =
                Date.now() -
                lastRequest;

            if (
                elapsed <
                COOLDOWN_MS
            ) {
                const remaining =
                    Math.ceil(
                        (
                            COOLDOWN_MS -
                            elapsed
                        ) / 1000
                    );

                await send.text(
                    m.chat,
                    `⏳ Tunggu ${remaining} detik sebelum menggunakan .ai lagi.`
                );

                return;
            }
        }

        cooldowns.set(
            cooldownKey,
            Date.now()
        );

        const request = {
            main,
            m,

            send: async (text) => {
                await send.text(
                    m.chat,
                    text
                );
            },

            prompt
        };

        queue.push(
            request
        );

        /*
         * Posisi antrean.
         */
        const position =
            queue.length +
            (activeRequest ? 1 : 0);

        if (activeRequest) {
            await send.text(
                m.chat,
                `⏳ Permintaan AI masuk antrean #${position}.`
            );
        }

        processQueue().catch(
            (error) => {
                console.error(
                    "[AI] Queue processor error:",
                    error
                );
            }
        );
    }
};