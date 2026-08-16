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
        sender: key.participant ?? attrs.participant ?? attrs.from ?? remoteJid,

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
        fullText = extractText(event.message); // "Contoh Output Pesan"
        prefix = ".";
        command = fullText.startsWith(prefix) ? fullText.split(" ")[0] : ""; // .command 
        text = fullText.startsWith(prefix) ? fullText.slice(command.length).trim() : fullText; // "teks setelah command"
        words = text.split(/\s+/); // ["teks", "setelah", "command"]

        // Isi pesan
        message: event.message,
        type: event.stanzaType,

        // Raw bila sewaktu-waktu dibutuhkan
        raw: event
    };
}
