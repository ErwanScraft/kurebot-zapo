export function parseOptions(words = []) {
    const options = {};

    for (let i = 0; i < words.length; i++) {
        const word = words[i];

        if (!word.startsWith("--")) {
            continue;
        }

        const key = word.slice(2);

        if (!key) {
            continue;
        }

        const value = words[i + 1];

        if (!value || value.startsWith("--")) {
            options[key] = true;
            continue;
        }

        options[key] = value;
        i++;
    }

    return options;
}