/**
 * Anti Spam / Cooldown
 *
 * Mode:
 * - "command" (default) [ command / global ]
 *   Cooldown hanya berlaku untuk command yang sama.
 *   Contoh:
 *     .menu
 *     .menu   ✅ terkena cooldown
 *
 *     .menu
 *     .help   ❌ tidak terkena cooldown
 *
 * - "global"
 *   Semua command dihitung menjadi satu.
 *   Contoh:
 *     .menu
 *     .help
 *     .ping   ✅ semuanya menambah hitungan spam
 *
 * Return:
 * - spam               : Status spam.
 * - blocked            : Sedang dalam masa cooldown.
 * - remaining          : Sisa cooldown (ms).
 * - remainingSeconds   : Sisa cooldown (detik).
 * - count              : Jumlah pesan dalam interval.
 * - message            : Pesan yang siap dikirim ke pengguna.
 *
 * Contoh:
 * const result = antiSpam(sender, command);
 *
 * if (result.spam) {
 *     return send.text(result.message);
 * }
 */

const cache = new Map();

const DEFAULT_OPTIONS = {
    limit: 5,
    interval: 10_000,
    blockTime: 60_000,
    mode: "command"
};

export function antiSpam(m, options = {}) {
    const {
        limit,
        interval,
        blockTime,
        mode
    } = { ...DEFAULT_OPTIONS, ...options };

    const key = mode === "global"
        ? m.sender
        : `${m.sender}:${m.command}`;

    const now = Date.now();

    let data = cache.get(key);

    if (!data) {
        data = {
            messages: [],
            blockedUntil: 0
        };
    }

    // Sedang cooldown
    if (data.blockedUntil > now) {
        const remaining = data.blockedUntil - now;

        return {
            spam: true,
            blocked: true,
            remaining,
            remainingSeconds: Math.ceil(remaining / 1000),
            count: data.messages.length,
            message: `⏳ Harap menunggu ${Math.ceil(remaining / 1000)} detik lagi.`
        };
    }

    // Hapus pesan di luar interval
    data.messages = data.messages.filter(
        time => now - time <= interval
    );

    data.messages.push(now);

    let spam = false;
    let message = null;

    if (data.messages.length >= limit) {
        spam = true;
        data.blockedUntil = now + blockTime;

        message = `🚫 Cooldown ${Math.ceil(blockTime / 1000)} detik.`;
    }

    cache.set(key, data);

    return {
        spam,
        blocked: false,
        remaining: 0,
        remainingSeconds: 0,
        count: data.messages.length,
        limit,
        interval,
        blockTime,
        mode,
        message
    };
}

export function resetAntiSpam(m, mode = "command") {
    const key = mode === "global"
        ? m.sender
        : `${m.sender}:${m.command}`;

    cache.delete(key);
}

export function clearAntiSpam() {
    cache.clear();
}