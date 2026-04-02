import { getEcho } from './echoClient.js'

const noop = () => {}

export const subscribeConversationChannel = (conversationId, handlers = {}) => {
  const echo = getEcho()
  if (!echo || !conversationId) {
    return noop
  }

  const channelName = `conversation.${conversationId}`
  const channel = echo.private(channelName)

  channel.listen('.message.created', (payload) => handlers.onMessageCreated?.(payload))
  channel.listen('.message.updated', (payload) => handlers.onMessageUpdated?.(payload))
  channel.listen('.message.deleted_for_everyone', (payload) => handlers.onMessageDeletedForEveryone?.(payload))
  channel.listen('.message.reaction.changed', (payload) => handlers.onReactionChanged?.(payload))
  channel.listen('.conversation.read.updated', (payload) => handlers.onReadUpdated?.(payload))
  channel.listen('.conversation.delivered.updated', (payload) => handlers.onDeliveredUpdated?.(payload))
  channel.listen('.conversation.typing.updated', (payload) => handlers.onTypingUpdated?.(payload))

  return () => {
    echo.leave(channelName)
  }
}

export const joinConversationPresence = (conversationId, handlers = {}) => {
  const echo = getEcho()
  if (!echo || !conversationId) {
    return noop
  }

  const channelName = `conversation-presence.${conversationId}`

  echo
    .join(channelName)
    .here((users) => handlers.onHere?.(users))
    .joining((user) => handlers.onJoining?.(user))
    .leaving((user) => handlers.onLeaving?.(user))
    .error((error) => handlers.onError?.(error))

  return () => {
    echo.leave(channelName)
  }
}
