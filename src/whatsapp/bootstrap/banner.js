/**
 * Bootstrap Banner.
 * Menampilkan banner aplikasi saat proses startup dimulai,
 * sekaligus membersihkan terminal sebelum informasi lainnya ditampilkan.
 */

import cfonts from 'cfonts'

export default function banner() {
    console.clear()

    cfonts.say('KUREBOT', {
        font: 'tiny',
        align: 'center',
        gradient: ['cyan', 'blue']
    })

    cfonts.say('WhatsApp Bot Framework', {
        font: 'console',
        align: 'center',
        colors: ['white']
    })

    cfonts.say('Modern • Modular • Professional', {
        font: 'console',
        align: 'center',
        colors: ['gray']
    })

    cfonts.say('v0.0.1', {
        font: 'console',
        align: 'center',
        colors: ['cyan']
    })

    console.log('─'.repeat(54))
}

// Directory: src/whatsapp/bootstrap/banner.js