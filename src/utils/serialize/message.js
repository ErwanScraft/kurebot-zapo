export function message(client, event) {
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
    
    function extractQuoted(message) {
        if (!message) return null;
    
        return (
            message.extendedTextMessage?.contextInfo?.quotedMessage ??
            message.imageMessage?.contextInfo?.quotedMessage ??
            message.videoMessage?.contextInfo?.quotedMessage ??
            null
        );
    }
    
    function extractMentionedJid(message) {
        if (!message) return [];

        return (
            message.extendedTextMessage?.contextInfo?.mentionedJid ??
            message.imageMessage?.contextInfo?.mentionedJid ??
            message.videoMessage?.contextInfo?.mentionedJid ??
            []
        );
    }

    function normalizeJid(jid) {
        return jid?.replace(/:\d+(?=@)/, "");
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
        
    const quoted = extractQuoted(event.message);
    
    const credentials = client?.getCredentials?.() ?? {};

    const botJid = credentials.meJid ?? "";
    const botLid = credentials.meLid ?? "";
    const botNumber = botJid.split("@")[0].split(":")[0];

    const mentionedJid = extractMentionedJid(event.message);
    const mentions = mentionedJid.map(normalizeJid);

    const sender =
        key.participant ??
        attrs.participant ??
        attrs.from ??
        key.remoteJid;

    const normalizedSender = normalizeJid(sender);
    const normalizedSenderPn = normalizeJid(
        key.participantAlt ??
        attrs.participant_pn ??
        attrs.sender_pn
    );

    const isBot =
        key.fromMe === true ||
        normalizedSender === normalizeJid(botJid) ||
        normalizedSender === normalizeJid(botLid) ||
        normalizedSenderPn === normalizeJid(botJid);

    return {
        id: key.id,

        // Chat
        chat: key.remoteJid,
        chat2: key.remoteJidAlt,

        sender,
        
        // Bot
        botNumber,
        botJid,
        botLid,
        isBot,

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
        
        // Mention
        mentionedJid,
        mentions,
        
        // Quoted
        quoted,

        // Isi pesan
        message: event.message,
        type: event.stanzaType,

        raw: event
    };
}