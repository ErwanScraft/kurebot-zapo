import { logger } from "#utils/terminal";

let client = null;

export function initSend(sock) {
    client = sock;

    logger.success("Sender initialized");
}

export const send = {
    text(jid, text, options = {}) {
        if (!client) throw new Error("Sender belum diinisialisasi.");
        
        return client.message.send(jid, text, options);
    },

    linkPreview(jid, text, options = {}) {
        if (!client) throw new Error("Sender belum diinisialisasi.");

        return client.message.send(jid, {
            type: "text",
            text,
            linkPreview: true,
            ...options
        });
    }
};