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

function createTempPath(extension) {
    return join(
        tmpdir(),
        `kurebot-sticker-${crypto.randomUUID()}.${extension}`
    );
}

async function createImageSticker(input) {
    return sharp(input)
        .resize(512, 512, {
            fit: "contain",
            background: {
                r: 0,
                g: 0,
                b: 0,
                alpha: 0
            }
        })
        .webp({
            quality: 90
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
            "-t", "6",
            "-vf",
            "fps=15,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=black@0",
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