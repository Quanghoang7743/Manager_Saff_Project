import { getEcho } from './echoClient.js'

const noop = () => {}

export const subscribeUserChannel = (userId, handlers = {}) => {
  const echo = getEcho()
  if (!echo || !userId) {
    return noop
  }

  const channelName = `user.${userId}`
  const channel = echo.private(channelName)

  channel.listen('.friend.request.received', (payload) => handlers.onFriendRequestReceived?.(payload))
  channel.listen('.friend.request.accepted', (payload) => handlers.onFriendRequestAccepted?.(payload))
  channel.listen('.friend.request.rejected', (payload) => handlers.onFriendRequestRejected?.(payload))
  channel.listen('.friend.removed', (payload) => handlers.onFriendRemoved?.(payload))
  channel.listen('.conversation.participant.settings.updated', (payload) => handlers.onConversationSettingsUpdated?.(payload))

  return () => {
    echo.leave(channelName)
  }
}
