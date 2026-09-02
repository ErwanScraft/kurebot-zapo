import sendHtmlApp from "../../src/whatsapp/app/sendHtmlApp.js";

export default {
    command: "test",
    aliases: [],

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
        console.log("[TEST] command terpanggil");
        console.log("[TEST] chat:", m.chat);
    
        try {
            const result = await sendHtmlApp(
                main,
                m.chat,
                `
                <!DOCTYPE html>
                <html>
                <body>
                    <h1>Halo KureBot</h1>
                    <p>Ini HTML Mini App native WhatsApp.</p>
                </body>
                </html>
                `
            );
    
            console.log("[TEST] sendHtmlApp berhasil:", result);
        } catch (error) {
            console.error("[TEST] sendHtmlApp gagal:", error);
    
            await send.text(
                m.chat,
                `❌ sendHtmlApp error:\n${error?.message || error}`
            );
        }
    }
};