import React from 'react'
import { joinConversationPresence, subscribeConversationChannel } from './conversationRealtime.js'

export const useConversationRealtime = (conversationId, handlers = {}) => {
  React.useEffect(() => {
    if (!conversationId) {
      return undefined
    }

    const leaveConversation = subscribeConversationChannel(conversationId, handlers)
    const leavePresence = joinConversationPresence(conversationId, handlers)

    return () => {
      leaveConversation()
      leavePresence()
    }
  }, [conversationId, handlers])
}
