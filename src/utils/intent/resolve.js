/**
 * Intent Resolver.
 * Mendeteksi maksud pesan berdasarkan pola intent yang terdaftar
 * dan mengembalikan data intent tanpa konfigurasi internal matcher.
 */

const INTENTS = [
    {
        domain: "sticker",
        action: "create",
        patterns: [
            /\b(jadikan|ubah|buat|bikin|convert|konversi)\b.*\bsticker\b/i,
            /\bsticker\b.*\b(jadikan|ubah|buat|bikin|convert|konversi)\b/i
        ]
    },
    {
        domain: "sticker",
        action: "help",
        patterns: [
            /\b(bagaimana|gimana|cara|caranya|ajari|ajarin|ajarkan|tips)\b.*\b(buat|bikin|membuat|bikin)\b.*\bsticker\b/i,
            /\b(bagaimana|gimana|cara|caranya|tips)\b.*\bsticker\b/i
        ]
    }
];

export function resolveIntent(text = "") {
    const normalized = text.trim();

    if (!normalized) return null;

    const intent = INTENTS.find(({ patterns }) =>
        patterns.some((pattern) => pattern.test(normalized))
    );
    
    if (!intent) return null;
    
    return {
        domain: intent.domain,
        action: intent.action
    };
}