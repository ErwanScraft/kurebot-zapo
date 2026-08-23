/**
 * Console Logger Utility.
 *
 * Menyediakan utilitas logging dengan format yang konsisten
 * untuk seluruh aplikasi. Logger ini menggunakan warna terminal
 * agar setiap level log mudah dikenali saat proses development
 * maupun debugging.
 *
 * Available Levels:
 * - info    : Informasi umum (putih)
 * - success : Operasi berhasil (hijau)
 * - init    : Proses inisialisasi (putih)
 * - warn    : Peringatan (kuning)
 * - error   : Kesalahan (merah)
 * - line    : Garis pemisah (abu-abu)
 */

import chalk from 'chalk'

export const logger = {
    info(message) {
        console.log(`${chalk.white('[INFO]')} ${message}`)
    },

    success(message) {
        console.log(`${chalk.green('[ OK ]')} ${message}`)
    },

    init(message) {
        console.log(`${chalk.white('[INIT]')} ${message}`)
    },

    warn(message) {
        console.log(`${chalk.yellow('[WARN]')} ${message}`)
    },

    error(message) {
        console.log(`${chalk.red('[FAIL]')} ${message}`)
    },

    line(length = 50) {
        console.log(chalk.gray('─'.repeat(length)))
    }
}