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
            return send.linkPreview(m.chat, "https://chat.whatsapp.com/JqKVTtGxwOx79RyJyULCh0?s=cl&p=a&ilr=0\nPong!");
        } catch (error) {
            console.error(error);
        }
    }
};