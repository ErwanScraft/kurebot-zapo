export default {
    command: "ping",
    aliases: ["p"],

    description: "Tes Command",

    meta: {
        scope: "global",
        status: "register",

        access: {
            owner: false,
            admin: false,
            premium: false,
            limit: false
        },

        tracker: {
            mode: false,
            type: "-"
        },

        category: "Utility"
    },

    async run({ main, m, send }) {
        try {
            return send.text(m.chat, "Pong!");
        } catch (error) {
            console.error(error);
        }
    }
};