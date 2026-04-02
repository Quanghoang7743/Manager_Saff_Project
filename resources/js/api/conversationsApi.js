import client from './httpClient.js'
import { toApiError, unwrap } from './response.js'

export const conversationsApi = {
  async list(params = {}) {
    try {
      const response = await client.get('/conversations', { params })
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not fetch conversations')
    }
  },

  async createDirect(targetUserId) {
    try {
      const response = await client.post('/conversations/direct', { target_user_id: targetUserId })
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not create direct conversation')
    }
  },

  async createGroup(payload) {
    try {
      const response = await client.post('/conversations/group', payload)
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not create group conversation')
    }
  },

  async show(conversationId) {
    try {
      const response = await client.get(`/conversations/${conversationId}`)
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not fetch conversation')
    }
  },

  async update(conversationId, payload) {
    try {
      const response = await client.put(`/conversations/${conversationId}`, payload)
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not update conversation')
    }
  },

  async destroy(conversationId) {
    try {
      const response = await client.delete(`/conversations/${conversationId}`)
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not delete conversation')
    }
  },

  async archive(conversationId) {
    try {
      const response = await client.patch(`/conversations/${conversationId}/archive`)
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not archive conversation')
    }
  },

  async unarchive(conversationId) {
    try {
      const response = await client.patch(`/conversations/${conversationId}/unarchive`)
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not unarchive conversation')
    }
  },

  async pin(conversationId, userId) {
    try {
      const response = await client.patch(`/conversations/${conversationId}/participants/${userId}/pin`)
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not pin conversation')
    }
  },

  async unpin(conversationId, userId) {
    try {
      const response = await client.patch(`/conversations/${conversationId}/participants/${userId}/unpin`)
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not unpin conversation')
    }
  },

  async mute(conversationId, userId, mutedUntil = null) {
    try {
      const response = await client.patch(`/conversations/${conversationId}/participants/${userId}/mute`, {
        muted_until: mutedUntil,
      })
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not mute conversation')
    }
  },

  async unmute(conversationId, userId) {
    try {
      const response = await client.patch(`/conversations/${conversationId}/participants/${userId}/unmute`)
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not unmute conversation')
    }
  },

  async hide(conversationId, userId) {
    try {
      const response = await client.patch(`/conversations/${conversationId}/participants/${userId}/hide`)
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not hide conversation')
    }
  },

  async unhide(conversationId, userId) {
    try {
      const response = await client.patch(`/conversations/${conversationId}/participants/${userId}/unhide`)
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not unhide conversation')
    }
  },

  async typing(conversationId, isTyping = true) {
    try {
      const response = await client.post(`/conversations/${conversationId}/typing`, { is_typing: isTyping })
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not update typing status')
    }
  },

  async listParticipants(conversationId) {
    try {
      const response = await client.get(`/conversations/${conversationId}/participants`)
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not fetch participants')
    }
  },

  async addParticipants(conversationId, participantIds) {
    try {
      const response = await client.post(`/conversations/${conversationId}/participants`, {
        participant_ids: participantIds,
      })
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not add participants')
    }
  },

  async removeParticipant(conversationId, userId) {
    try {
      const response = await client.delete(`/conversations/${conversationId}/participants/${userId}`)
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not remove participant')
    }
  },

  async updateParticipantRole(conversationId, userId, participantRole) {
    try {
      const response = await client.patch(`/conversations/${conversationId}/participants/${userId}/role`, {
        participant_role: participantRole,
      })
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not update participant role')
    }
  },

  async markRead(conversationId, userId, lastReadMessageId) {
    try {
      const response = await client.patch(`/conversations/${conversationId}/participants/${userId}/read`, {
        last_read_message_id: lastReadMessageId,
      })
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not update read receipt')
    }
  },

  async markDelivered(conversationId, userId, lastDeliveredMessageId) {
    try {
      const response = await client.patch(`/conversations/${conversationId}/participants/${userId}/delivered`, {
        last_delivered_message_id: lastDeliveredMessageId,
      })
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not update delivered receipt')
    }
  },
}
