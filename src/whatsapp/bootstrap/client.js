/**
 * Bootstrap WhatsApp Client.
 * Bertanggung jawab untuk membuat dan mengonfigurasi instance WaClient
 * beserta logger internal yang digunakan selama proses koneksi.
 */

import pino from 'pino'
import { WaClient } from 'zapo-js'
import { createMediaProcessor } from "@zapo-js/media-utils";

export default function createClient(store) {
    return new WaClient(
        {
            store,
            sessionId: 'default',
            media: {
                processor: createMediaProcessor(),
                generateThumbnail: true,
                generateWaveform: true
            },
            connectTimeoutMs: 15_000,
            nodeQueryTimeoutMs: 30_000,
            markOnlineOnConnect: true,
            linkPreview: {
                enabled: true,
                uploadHqThumbnail: true
            },
            history: {
                enabled: true,
                requireFullSync: true
            }
        },
        pino({
            level: client.pino.level
        })
    )
}

// Directory : src/whatsapp/bootstrap/client.js