import { sendHtmlApp } from "../../src/whatsapp/app/sendHtmlApp.js";

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

    async run({ main, m }) {
        const html = `
<!DOCTYPE html>
<html>
<body>
    <h1>Halo KureBot</h1>
    <p>Test AIRich native ZapoJS</p>
</body>
</html>
`;

        console.log("[TEST] sending native Zapo AIRich");

        const result = await sendHtmlApp(
            main,
            m.chat,
            {
                html,
                messageText: "KureBot",
                trustedSources: []
            }
        );

        console.dir(result, { depth: 5 });
    }
};