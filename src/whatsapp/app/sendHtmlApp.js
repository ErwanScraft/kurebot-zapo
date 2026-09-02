const HTML_PRIMITIVE = "GenAIaeacdsnwHtmlPrimitive";
const BOT_JID = "867051314767696@bot";

/**
 * Mengunci tinggi WebView HTML.
 */
function lockHeight(height) {
    const value = Number(height);

    if (!Number.isFinite(value) || value <= 0) {
        throw new TypeError("height must be a positive number");
    }

    return `
        <style>
            html, body {
                height: ${value}px !important;
                min-height: ${value}px !important;
                max-height: ${value}px !important;
                overflow: auto !important;
            }
        </style>
    `;
}

/**
 * Membuat primitive HTML AIRich.
 */
function createHtmlPrimitive(
    html,
    {
        trustedSources = [],
        height
    } = {}
) {
    if (typeof html !== "string" || !html.trim()) {
        throw new TypeError("HTML must be a non-empty string");
    }

    return {
        payload:
            height === undefined
                ? html
                : lockHeight(height) + html,

        trusted_sources: trustedSources.map(String),

        __typename: HTML_PRIMITIVE
    };
}

/**
 * Membuat satu AIRich section.
 */
function createHtmlSection(
    html,
    options = {}
) {
    return {
        view_model: {
            primitive: createHtmlPrimitive(html, options)
        }
    };
}

/**
 * Membuat isi unifiedResponse.
 *
 * Elaina melakukan:
 *
 * JSON UTF-8
 *      ↓
 * Base64
 *      ↓
 * AIRichResponseUnifiedResponse.data
 */
function encodeUnifiedResponse(
    html,
    options = {}
) {
    const unifiedResponse = {
        sections: [
            createHtmlSection(html, options)
        ]
    };

    return Buffer
        .from(
            JSON.stringify(unifiedResponse),
            "utf8"
        )
        .toString("base64");
}

/**
 * Metadata yang digunakan oleh AIRich Elaina.
 */
function createContextInfo(
    {
        botResponseId,
        verificationMetadata,
        contextInfo = {}
    } = {}
) {
    return {
        forwardingScore: 1,
        isForwarded: true,

        forwardedAiBotMessageInfo: {
            botJid: BOT_JID
        },

        forwardOrigin: 4,

        ...contextInfo,

        ...(botResponseId
            ? {
                botResponseId
            }
            : {}),

        ...(verificationMetadata
            ? {
                verificationMetadata
            }
            : {})
    };
}

/**
 * Membuat raw Proto.IMessage AIRich.
 */
export function createHtmlAppMessage(
    html,
    {
        trustedSources = [],
        height,

        botResponseId,
        verificationMetadata,

        contextInfo = {},

        submessages = []
    } = {}
) {
    const unifiedResponseData = encodeUnifiedResponse(
        html,
        {
            trustedSources,
            height
        }
    );

    return {
        botForwardedMessage: {
            message: {
                richResponseMessage: {
                    messageType: 1,

                    submessages,

                    unifiedResponse: {
                        data: unifiedResponseData
                    },

                    contextInfo: createContextInfo({
                        botResponseId,
                        verificationMetadata,
                        contextInfo
                    })
                }
            }
        }
    };
}

/**
 * Kirim HTML Mini App native WhatsApp.
 *
 * client.message.send()
 * akan menerima raw Proto.IMessage
 * dan Zapo yang melakukan protobuf encoding.
 */
export async function sendHtmlApp(
    client,
    jid,
    html,
    options = {}
) {
    if (!client) {
        throw new TypeError("client is required");
    }

    if (!jid || typeof jid !== "string") {
        throw new TypeError("jid must be a string");
    }

    const message = createHtmlAppMessage(
        html,
        options
    );

    return client.message.send(
        jid,
        message
    );
}

export {
    HTML_PRIMITIVE,
    createHtmlPrimitive,
    createHtmlSection,
    encodeUnifiedResponse
};

export default sendHtmlApp;