import { logger } from "#utils/terminal";
import { loadConfig } from "#utils/system";
import { initSend } from "#utils/serialize";

import banner from './banner.js'
import systemInfo from './system.js'
import createAppStore from './store.js'
import createClient from './client.js'
import registerEvents from './events.js'
import registerPairing from './pairing.js'

export default async function bootstrap() {
    const useQr = process.argv.includes('--qr')

    banner()
    
    systemInfo({
        session: 'default',
        database: 'MySQL',
        historySync: true,
        useQr
    })

    const store = createAppStore()
    
    const client = createClient(store)

    registerEvents(client, { useQr })

    try {
        logger.info('Connecting to WhatsApp...');
    
        if (!useQr) {
            registerPairing(client)
        }
        
        loadConfig()
        initSend(client)
        
        await client.connect()
    
        logger.success('Client ready.');
    } catch (err) {
        logger.error('Terjadi kesalahan:');
        console.error(err)
    }
}