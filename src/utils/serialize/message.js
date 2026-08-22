export function message(event) {
    const key = event.key ?? {};
    const attrs = event.rawNode?.attrs ?? {};

    function extractText(message) {
        if (!message) return "";

        return (
            message.conversation ??
            message.extendedTextMessage?.text ??
            message.imageMessage?.caption ??
            message.videoMessage?.caption ??
            ""
        );
    }

    const fullText = extractText(event.message);
    const prefix = ".";
    const hasPrefix = fullText.startsWith(prefix);

    const command = hasPrefix
        ? fullText.split(/\s+/)[0]
        : "";

    const text = hasPrefix
        ? fullText.slice(command.length).trim()
        : fullText;

    const words = text
        ? text.split(/\s+/)
        : [];

    return {
        id: key.id,

        // Chat
        chat: key.remoteJid,
        chat2: key.remoteJidAlt,

        sender:
            key.participant ??
            attrs.participant ??
            attrs.from ??
            key.remoteJid,

        // Status
        isMe: key.fromMe ?? false,
        isGroup: key.isGroup ?? false,
        isPrivate: !(key.isGroup ?? false),
        isBroadcast: key.isBroadcast ?? false,
        isNewsletter: key.isNewsletter ?? false,

        // Informasi user
        pushName: event.pushName ?? attrs.notify ?? "",
        notify: attrs.notify,
        senderPn: attrs.sender_pn,

        // Waktu
        timestamp: event.timestampSeconds,

        // Pesan
        fullText,
        prefix,
        command,
        text,
        words,

        // Isi pesan
        message: event.message,
        type: event.stanzaType,

        raw: event
    };
}