const INTENTS = [
    {
        domain: "sticker",
        action: "create",
        patterns: [
            /\b(jadikan|ubah|buat|bikin|convert|konversi)\b.*\bsticker\b/i,
            /\bsticker\b.*\b(jadikan|ubah|buat|bikin|convert|konversi)\b/i
        ]
    }
];

export function resolveIntent(text = "") {
    const normalized = text.trim();

    if (!normalized) return null;

    return (
        INTENTS.find(({ patterns }) =>
            patterns.some((pattern) => pattern.test(normalized))
        ) ?? null
    );
}