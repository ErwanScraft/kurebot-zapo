import { sendChat } from "#utils/serverBridge";

export default {
    command: "serverchat",
    aliases: ["schat"],

    description: "Kirim pesan ke Minecraft server",

    meta: {
        scope: "global",
        status: "register",

        access: {
            owner: true,
            admin: true,
            premium: false,
            limit: false
        },

        tracker: {
            mode: false,
            type: "-"
        },

        category: "Server"
    },

    async run({ m, send }) {
        const message = m.text;

        if (!message) {
            return send.text(
                m.chat,
                "Gunakan: .serverchat <pesan>"
            );
        }

        const sender = m.pushName?.trim() || "Unknown";

        const result = await sendChat(sender, message);
        
        if (!result.success) {
            return send.text(
                m.chat,
                `❌ ${result.error}`
            );
        }
        
        return send.text(
            m.chat,
            result.message || "Pesan berhasil dikirim ke server."
        );
    }
};