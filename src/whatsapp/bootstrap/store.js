/**
 * Bootstrap Store.
 * Membuat dan mengonfigurasi penyimpanan data yang digunakan
 * oleh WhatsApp Client untuk autentikasi, sesi, kontak, dan pesan.
 */

import { createStore } from 'zapo-js'
import { createMysqlStore } from '@zapo-js/store-mysql'

export default function createAppStore() {
    return createStore({
        backends: {
            mysql: createMysqlStore({
                pool: {
                    host: mysql_store.host,
                    port: mysql_store.port,
                    user: mysql_store.user,
                    password: mysql_store.password,
                    database: mysql_store.database
                }
            })
        },
        providers: {
            auth: 'mysql',
            signal: 'mysql',
            preKey: 'mysql',
            session: 'mysql',
            identity: 'mysql',
            senderKey: 'mysql',
            appState: 'mysql',
            privacyToken: 'mysql',
            messages: 'mysql',
            threads: 'mysql',
            contacts: 'mysql'
        }
    })
}

// Directory : src/whatsapp/bootstrap/store.js