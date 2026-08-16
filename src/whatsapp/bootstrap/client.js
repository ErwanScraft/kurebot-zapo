/**
 * Bootstrap WhatsApp Client.
 * Bertanggung jawab untuk membuat dan mengonfigurasi instance WaClient
 * beserta logger internal yang digunakan selama proses koneksi.
 */

import pino from 'pino'
import { WaClient } from 'zapo-js'

export default function createClient(store) {
    return new WaClient(
        {
            store,
            sessionId: 'default',
            connectTimeoutMs: 15_000,
            nodeQueryTimeoutMs: 30_000,
            markOnlineOnConnect: true,
            history: {
                enabled: true,
                requireFullSync: true
            }
        },
        pino({
            level: 'silent'
        })
    )
}

// Directory : src/whatsapp/bootstrap/client.js