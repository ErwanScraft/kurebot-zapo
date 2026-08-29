 /**
 * Sticker Command.
 * Mengubah gambar atau video menjadi WebP sticker
 * dengan dukungan metadata packname dan author.
 */

import { logger } from "#utils/terminal";
import {
    createSticker,
    injectStickerMetadata
} from "#utils/media";
import { parseOptions } from "#command";

const MAX_STICKER_SIZE = 10 * 1024 * 1024;

function getStickerMedia(m) {
    if (m.message?.imageMessage) {
        return {
            event: m.raw,
            type: "image"
        };
    }

    if (m.message?.videoMessage) {
        return {
            event: m.raw,
            type: "video"
        };
    }

    if (m.quoted?.imageMessage) {
        return {
            event: {
                ...m.raw,
                message: m.quoted
            },
            type: "image"
        };
    }

    if (m.quoted?.videoMessage) {
        return {
            event: {
                ...m.raw,
                message: m.quoted
            },
            type: "video"
        };
    }

    return null;
}

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
            const media = getStickerMedia(m);

            if (!media) {
                return send.text(
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
            logger.error(error);

            return send.text(
                "Gagal membuat sticker."
            );
        }
    }
};