export function message(event) {
    const key = event.key ?? {};
    const attrs = event.rawNode?.attrs ?? {};
    
    function extractText(message) {
        if (!message) return undefined
        return (
            message.conversation ??
            message.extendedTextMessage?.text ??
            message.imageMessage?.caption ??
            message.videoMessage?.caption ??
            undefined
        )
    }

    return {
        id: key.id,

        // Chat
        chat: key.remoteJid,
        chat2: key.remoteJidAlt,
        sender: key.participant
    ?? attrs.participant
    ?? attrs.from
    ?? key.remoteJid,

        // Status
        isMe: key.fromMe,
        isGroup: key.isGroup,
        isPrivate: !key.isGroup,
        isBroadcast: key.isBroadcast,
        isNewsletter: key.isNewsletter,

        // Informasi user
        pushName: event.pushName ?? attrs.notify ?? "",
        notify: attrs.notify,
        senderPn: attrs.sender_pn,

        // Waktu
        timestamp: event.timestampSeconds,
        
        // Pesan
        fullText: extractText(event.message),
        prefix: ".",
        command: fullText.startsWith(prefix) ? fullText.split(" ")[0] : "",
        text: fullText.startsWith(prefix) ? fullText.slice(command.length).trim() : fullText,
        words: text.split(/\s+/),

        // Isi pesan
        message: event.message,
        type: event.stanzaType,

        raw: event
    };
}
