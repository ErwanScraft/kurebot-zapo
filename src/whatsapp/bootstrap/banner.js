/**
 * Bootstrap Banner.
 * Menampilkan banner aplikasi saat proses startup dimulai,
 * sekaligus membersihkan terminal sebelum informasi lainnya ditampilkan.
 */

import cfonts from 'cfonts'
import { logger } from "#utils/terminal";

export default function banner() {
    console.clear()

    cfonts.say('KUREBOT', {
        font: 'tiny',
        align: 'center',
        gradient: ['cyan', 'blue']
    })

    cfonts.say('Propesional WhatsApp Assistant', {
        font: 'console',
        align: 'center',
        colors: ['white']
    })

    cfonts.say('Modular • Efficient • Reliable', {
        font: 'console',
        align: 'center',
        colors: ['gray']
    })

    cfonts.say('v0.0.1', {
        font: 'console',
        align: 'center',
        colors: ['cyan']
    })

    logger.line(54)
}

// Directory: src/whatsapp/bootstrap/banner.js