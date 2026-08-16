/**
 * Bootstrap Pairing.
 * Menangani proses autentikasi menggunakan Pairing Code
 * dengan meminta nomor WhatsApp dari pengguna.
 */

import readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'

export default function registerPairing(client) {
    client.once('auth_pairing_required', async () => {
        const rl = readline.createInterface({
            input,
            output
        })

        let phone = await rl.question(
            'Masukkan nomor WhatsApp (628xxxxxxxxxx): '
        )

        rl.close()

        phone = phone.replace(/\D/g, '')

        console.log('[INFO] Requesting pairing code...')

        await client.auth.requestPairingCode(phone)
    })
}

// Directory : src/whatsapp/bootstrap/pairing.js