import { logger } from "#utils/terminal";

let client = null;

export function initSend(sock) {
    client = sock;
}

function ensureClient() {
    if (client) return;

    const error = new Error("Sender belum diinisialisasi.");

    logger.error(error.message);
    throw error;
}

export const send = {
    text(jid, text, options = {}) {
        ensureClient();

        return client.message.send(jid, text, options);
    },

    linkPreview(jid, text, options = {}) {
        ensureClient();

        return client.message.send(jid, {
            type: "text",
            text,
            linkPreview: true,
            ...options
        });
    },

    sticker(jid, media, options = {}) {
        ensureClient();

        return client.message.send(jid, {
            type: "sticker",
            media,
            mimetype: "image/webp",
            ...options
        });
    },
};