import chalk from "chalk";
import { detectConversationStarter } from "#utils/message";
import { message, send } from "#utils/serialize";
import { systemLogger } from "#utils/system";
import { antiSpam } from "#utils/guard";
import {
    executeRegisteredCommand
} from "../../command/index.js";

export async function prosesMessage(client, event) {
    try {
    
        const m = await message(event);

        const now = new Date();

        const time = new Date().toLocaleString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
        });

        const label = m.isGroup ? "[GROUP]" : "[PRIVATE]";

        const type = m.isGroup
            ? chalk.bgBlue.white.bold(label)
            : chalk.bgGreen.white.bold(label);

        const title = m.isGroup
            ? m.groupName || "Unknown Group"
            : m.pushName || "Unknown User";

        const header = `${type} ${chalk.bold(title)}`;
        const plainHeader = `${label} ${title}`;

        const padding = Math.max(1, 60 - plainHeader.length);

        console.log(header + " ".repeat(padding) + chalk.gray(time));
        
        
        // Tandai chat telah dibaca
        await client.message.sendReceipt(event, { type: 'read' })

        if (m.isGroup) {
            console.log(
                `  ${chalk.gray("└─")} ${chalk.cyan(m.pushName || "Unknown User")} ${chalk.gray("=>")} ${chalk.white(m.text || "")}`
            );
        } else {
            console.log(`  ${chalk.gray("└─")} ${chalk.white(m.text || "")}`);
        }
        
        const guard = antiSpam(m);

        if (guard.blocked || guard.spam) {
            if (guard.message) {
                await send.text(m.chat, guard.message);
            }
        
            return;
        }
        
        if (m.command) {
            const executed = await executeRegisteredCommand(m.command, {
                main: client,
                m,
                send
            });
        
            if (executed) {
                return;
            }
        }
        
        // Sapaan
        const sapa = detectConversationStarter(m);
        
        if (!m.isGroup && sapa.status) {
            await send.text(m.chat, `Halo ${m.pushName}, Ada yang bisa dibantu?`)
        }

    } catch (error) {
        systemLogger.error(error, "./src/whatsapp/app/index.js");
    }
}
