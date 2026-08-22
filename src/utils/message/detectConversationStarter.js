const GREETINGS = [
    'p',
    'pp',
    'ppp',

    'halo',
    'hallo',
    'hello',
    'helo',
    'hi',
    'hai',
    'hey',
    'hy',

    'permisi',
    'punten',

    'ass',
    'assalamualaikum',
    'assalamu alaikum',
    'ass wr wb',
    'assalamualaikum wr wb',

    'selamat pagi',
    'selamat siang',
    'selamat sore',
    'selamat malam',

    'pagi',
    'siang',
    'sore',
    'malam'
]

const CALLS = [
    'admin',
    'min',
    'bot',
    'bang',
    'bg',
    'bro',
    'bos',
    'gan',
    'kak',
    'ka',
    'mas',
    'mbak',
    'om',
    'pak',
    'bu'
]

export function detectConversationStarter(m) {
    const original = m?.text ?? ''

    const normalized = original
        .toLowerCase()
        .trim()
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')
        .replace(/\s+/g, ' ')

    if (!normalized) {
        return {
            status: false,
            type: 'empty',
            original,
            normalized
        }
    }

    const words = normalized.split(' ')

    const greeting = GREETINGS.find(g =>
        normalized === g ||
        normalized.startsWith(`${g} `)
    )

    const call = CALLS.find(c =>
        words.includes(c)
    )

    const extraWords = words.filter(word =>
        !GREETINGS.includes(word) &&
        !CALLS.includes(word)
    )

    const isStarter =
        !!greeting &&
        extraWords.length === 0

    return {
        status: isStarter,
        type: isStarter
            ? 'conversation_starter'
            : 'message',

        original,
        normalized,

        greeting: greeting ?? null,
        call: call ?? null,

        words,
        wordCount: words.length,
        extraWords
    }
}