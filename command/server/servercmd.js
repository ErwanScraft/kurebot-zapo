import { executeCommand } from "#utils/serverBridge";

export default {
    command: "servercmd",
    aliases: ["scmd"],

    description: "Jalankan command Minecraft dari WhatsApp",

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
        const command = m.words;

        if (!command) {
            return send.text(
                m.chat,
                "Gunakan: .servercmd <command>"
            );
        }

        const result = await executeCommand(command);

        if (!result.success) {
            return send.text(
                m.chat,
                `❌ ${result.error}`
            );
        }

        return send.text(
            m.chat,
            "✅ Command berhasil dikirim ke server."
        );
    }
};