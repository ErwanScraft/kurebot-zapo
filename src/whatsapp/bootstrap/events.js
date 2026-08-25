/**
 * Bootstrap Events.
 * Mendaftarkan seluruh event WhatsApp Client yang diperlukan
 * selama proses autentikasi, koneksi, dan penerimaan pesan.
 */

import { logger } from "#utils/terminal";
import { processMessage } from "#app";

export default function registerEvents(client, { useQr }) {
    // QR Code
    client.on('auth_qr', ({ qr, ttlMs }) => {
        if (!useQr) return

        console.log('\n========== QR CODE ==========')
        console.log(`Berlaku ${ttlMs} ms\n`)
        console.log(qr)
        console.log('=============================\n')
    })

    // Pairing Code
    client.on('auth_pairing_code', ({ code }) => {
        console.log('\n====== PAIRING CODE ======')
        console.log(code.match(/.{1,4}/g)?.join('-') ?? code)
        console.log('==========================\n')
    })

    // Login berhasil
    client.on('auth_paired', ({ credentials }) => {
        logger.success('Authentication successful.');
    })

    // Status koneksi
    client.on('connection', ({ status, reason }) => {
        switch (status) {
            
            case 'connecting':
                logger.info('Connecting...');
                break
        
            case 'open':
                logger.success('Client ready.');
                logger.line(54);
                break
        
            case 'close':
                logger.warn(`Connection closed.${reason ? ` (${reason})` : ''}`);
                break
        
            default:
                logger.info(`Connection: ${status}`);
        }
    })

    // Pesan masuk
    client.on('message', async (event) => {
        await processMessage(client, event)
    })
}