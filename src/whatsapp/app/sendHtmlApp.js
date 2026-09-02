import crypto from 'node:crypto'

const HTML_PRIMITIVE = 'GenAIaeacdsnwHtmlPrimitive'
const BOT_JID = '867051314767696@bot'

export function createRelayMessage({
  html,
  botResponseId = crypto.randomUUID(),
  responseId = crypto.randomUUID(),
  messageText = '',
  trustedSources = [],
  verificationMetadata,
  botJid = BOT_JID
}) {
  const unifiedResponse = {
    response_id: responseId,
    sections: [
      {
        view_model: {
          primitive: {
            __typename: HTML_PRIMITIVE,
            payload: html,
            trusted_sources: trustedSources
          },
          __typename: 'GenAISingleLayoutViewModel'
        }
      }
    ]
  }

  return {
    messageContextInfo: {
      deviceListMetadata: {},
      deviceListMetadataVersion: 2,
      botMetadata: {
        messageDisclaimerText: '',
        botResponseId,
        ...(verificationMetadata
          ? { verificationMetadata }
          : {})
      }
    },

    botForwardedMessage: {
      message: {
        richResponseMessage: {
          messageType: 1,

          submessages: [
            {
              messageType: 2,
              messageText
            }
          ],

          unifiedResponse: {
            data: Buffer.from(
              JSON.stringify(unifiedResponse),
              'utf8'
            )
          },

          contextInfo: {
            forwardingScore: 1,
            isForwarded: true,

            forwardedAiBotMessageInfo: {
              botJid
            },

            forwardOrigin: 4
          }
        }
      }
    }
  }
}

/**
 * Relay native ZapoJS.
 *
 * Tidak memakai Baileys.
 * Tidak membuat transport sendiri.
 */
export async function relayMessage(
  client,
  jid,
  message,
  options = {}
) {
  if (!client?.message?.send) {
    throw new Error(
      'ZapoJS client.message.send() tidak tersedia'
    )
  }

  return client.message.send(
    jid,
    message,
    options
  )
}

/**
 * Shortcut khusus HTML AI Rich.
 */
export async function sendHtmlApp(
  client,
  jid,
  {
    html,
    messageText = '',
    trustedSources = [],
    botResponseId = crypto.randomUUID(),
    responseId = crypto.randomUUID(),
    verificationMetadata,
    botJid = BOT_JID
  }
) {
  const message = createRelayMessage({
    html,
    messageText,
    trustedSources,
    botResponseId,
    responseId,
    verificationMetadata,
    botJid
  })

  return relayMessage(
    client,
    jid,
    message,
    {}
  )
}