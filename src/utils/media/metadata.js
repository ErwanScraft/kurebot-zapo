 /**
 * Sticker Metadata Utility.
 * Menambahkan metadata EXIF packname, author, dan kategori
 * ke dalam WebP sticker agar informasi sticker tetap terbawa
 * saat dikirim melalui WhatsApp.
 */

import { readFile, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import webp from "node-webpmux";
import { tmpdir } from "node:os";

export async function injectStickerMetadata(
    media,
    {
        packname = "",
        author = "",
        categories = [""]
    } = {}
) {
    if (!Buffer.isBuffer(media)) {
        throw new TypeError("Parameter media harus berupa Buffer.");
    }

    if (!packname && !author) {
        return media;
    }

    const fileId = crypto.randomBytes(6)
        .readUIntLE(0, 6)
        .toString(36);

    const input = path.join(
        tmpdir(),
        `${fileId}-input.webp`
    );

    const output = path.join(
        tmpdir(),
        `${fileId}-output.webp`
    );

    try {
        await writeFile(input, media);

        const image = new webp.Image();

        await image.load(input);

        const metadata = {
            "sticker-pack-id": "https://www.kurebot.my.id",
            "sticker-pack-name": packname,
            "sticker-pack-publisher": author,
            emojis: categories
        };

        const exifHeader = Buffer.from([
            0x49, 0x49, 0x2A, 0x00,
            0x08, 0x00, 0x00, 0x00,
            0x01, 0x00, 0x41, 0x57,
            0x07, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x16, 0x00,
            0x00, 0x00
        ]);

        const jsonBuffer = Buffer.from(
            JSON.stringify(metadata),
            "utf8"
        );

        const exif = Buffer.concat([
            exifHeader,
            jsonBuffer
        ]);

        exif.writeUIntLE(
            jsonBuffer.length,
            14,
            4
        );

        image.exif = exif;

        await image.save(output);

        return await readFile(output);

    } finally {
        await Promise.allSettled([
            unlink(input),
            unlink(output)
        ]);
    }
}