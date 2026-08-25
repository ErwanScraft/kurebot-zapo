import sharp from "sharp";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
    writeFile,
    readFile,
    unlink
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import crypto from "node:crypto";

const execFileAsync = promisify(execFile);

const STICKER_SIZE = 512;
const VIDEO_DURATION = 6;
const VIDEO_FPS = 12;

function createTempPath(extension) {
    return join(
        tmpdir(),
        `kurebot-sticker-${crypto.randomUUID()}.${extension}`
    );
}

async function createImageSticker(input) {
    return sharp(input)
        .resize(STICKER_SIZE, STICKER_SIZE, {
            fit: "contain",
            withoutEnlargement: true,
            background: {
                r: 0,
                g: 0,
                b: 0,
                alpha: 0
            }
        })
        .webp({
            quality: 85
        })
        .toBuffer();
}

async function createVideoSticker(input) {
    const inputPath = createTempPath("mp4");
    const outputPath = createTempPath("webp");

    try {
        await writeFile(inputPath, input);

        await execFileAsync("ffmpeg", [
            "-y",
            "-i", inputPath,
            "-t", String(VIDEO_DURATION),
            "-vf",
            `fps=${VIDEO_FPS},scale=${STICKER_SIZE}:${STICKER_SIZE}:force_original_aspect_ratio=decrease,pad=${STICKER_SIZE}:${STICKER_SIZE}:(ow-iw)/2:(oh-ih)/2:color=black@0`,
            "-loop", "0",
            "-an",
            "-c:v", "libwebp",
            "-quality", "80",
            outputPath
        ]);

        return await readFile(outputPath);

    } finally {
        await Promise.allSettled([
            unlink(inputPath),
            unlink(outputPath)
        ]);
    }
}

export async function createSticker(input, type = "image") {
    if (!input) {
        throw new Error("Media sticker tidak ditemukan.");
    }

    if (type === "video") {
        return createVideoSticker(input);
    }

    return createImageSticker(input);
}