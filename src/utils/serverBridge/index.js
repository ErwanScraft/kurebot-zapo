import { logger } from "#utils/terminal";

function getConfig() {
    return globalThis.serverbridge || {};
}

async function request(action, data = {}) {
    const config = getConfig();

    if (!config.enabled) {
        return {
            success: false,
            error: "ServerBridge tidak diaktifkan."
        };
    }

    const url = String(config.url || "").trim();
    const secret = String(config.secret || "").trim();

    if (!url) {
        return {
            success: false,
            error: "URL ServerBridge belum dikonfigurasi."
        };
    }

    if (!secret) {
        return {
            success: false,
            error: "Secret ServerBridge belum dikonfigurasi."
        };
    }

    const timeout = Number(config.timeout) || 10000;

    const controller = new AbortController();
    const timer = setTimeout(() => {
        controller.abort();
    }, timeout);

    try {
        const response = await fetch(url, {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${secret}`
            },

            body: JSON.stringify({
                version: 1,
                action,
                ...data
            }),

            signal: controller.signal
        });

        let result;

        try {
            result = await response.json();
        } catch {
            result = {
                success: false,
                error: `ServerBridge returned HTTP ${response.status}`
            };
        }

        if (!response.ok) {
            return {
                success: false,
                error: result.error || `HTTP ${response.status}`
            };
        }

        return result;

    } catch (error) {
        if (error.name === "AbortError") {
            return {
                success: false,
                error: "Koneksi ke ServerBridge timeout."
            };
        }

        logger.error(
            `ServerBridge request failed: ${error.message}`
        );

        return {
            success: false,
            error: "Gagal terhubung ke ServerBridge."
        };

    } finally {
        clearTimeout(timer);
    }
}

export async function sendChat(message) {
    return request("chat", {
        message
    });
}

export async function executeCommand(command) {
    return request("command", {
        command
    });
}