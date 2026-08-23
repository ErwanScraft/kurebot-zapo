import { logger } from "#utils/terminal";

let client = null;

export function initSend(sock) {
    client = sock;
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
    },
    
    sticker(jid, media, options = {}) {
        if (!client) throw new Error("Sender belum diinisialisasi.");
    
        return client.message.send(jid, {
            type: "sticker",
            media,
            mimetype: "image/webp",
            ...options
        });
    },
};