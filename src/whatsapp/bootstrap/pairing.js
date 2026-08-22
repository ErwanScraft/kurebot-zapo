/**
 * Bootstrap Pairing.
 * Menangani proses autentikasi menggunakan Pairing Code
 * dengan meminta nomor WhatsApp dari pengguna.
 */

import readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'

import { logger } from '#utils/terminal'

export default function registerPairing(client) {
    client.once('auth_qr', async () => {
        const rl = readline.createInterface({
            input,
            output
        })

        try {
            let phone = await rl.question(
                'Masukkan nomor WhatsApp (628xxxxxxxxxx): '
            )

            phone = phone.replace(/\D/g, '')

            if (!phone) {
                logger.error('Nomor WhatsApp tidak valid.')
                return
            }

            logger.info('Meminta pairing code...')

            await client.auth.requestPairingCode(phone)

            logger.success('Pairing code berhasil dibuat.')
        } catch (error) {
            logger.error(
                `Gagal meminta pairing code: ${error?.message ?? error}`
            )
        } finally {
            rl.close()
        }
    })
}