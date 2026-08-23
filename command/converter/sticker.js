import { logger } from "#utils/terminal";
import {
    createSticker,
    injectStickerMetadata
} from "#utils/media";
import { parseOptions } from "#command";

const MAX_STICKER_SIZE = 10 * 1024 * 1024;

export default {
    command: "sticker",
    aliases: ["s"],
    description: lang.description.sticker,

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
            const media = m.message?.imageMessage
                ? {
                    event: m.raw,
                    type: "image"
                }
                : m.message?.videoMessage
                    ? {
                        event: m.raw,
                        type: "video"
                    }
                    : m.quoted?.imageMessage
                        ? {
                            event: {
                                ...m.raw,
                                message: m.quoted
                            },
                            type: "image"
                        }
                        : m.quoted?.videoMessage
                            ? {
                                event: {
                                    ...m.raw,
                                    message: m.quoted
                                },
                                type: "video"
                            }
                            : null;
            
            if (!media) {
                return send.sendText(
                    "Kirim atau reply gambar/video dengan perintah .sticker"
                );
            }
            
            const buffer = await main.message.downloadBytes(
                media.event,
                {
                    maxBytes: MAX_STICKER_SIZE
                }
            );
            
          
            const sticker = await createSticker(
                buffer,
                media.type
            );
            
            const options = parseOptions(m.words);
            
            const packname =
                options.packname ||
                bot.metadata.packname;
            
            const author =
                options.author ||
                bot.metadata.author;
            
            const stickerWithMetadata =
                await injectStickerMetadata(sticker, {
                    packname,
                    author
                });
            
            await send.sticker(
                m.chat,
                stickerWithMetadata
            );

        } catch (error) {
            logger.error(error.message);

            return send.text(
                "Gagal membuat sticker."
            );
        }
    }
};