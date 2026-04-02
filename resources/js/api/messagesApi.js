import client from './httpClient.js'
import { toApiError, unwrap } from './response.js'

export const messagesApi = {
  async list(conversationId, params = {}) {
    try {
      const response = await client.get(`/conversations/${conversationId}/messages`, { params })
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not fetch messages')
    }
  },

  async send(conversationId, payload) {
    try {
      const response = await client.post(`/conversations/${conversationId}/messages`, payload)
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not send message')
    }
  },

  async show(messageId) {
    try {
      const response = await client.get(`/messages/${messageId}`)
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not fetch message')
    }
  },

  async update(messageId, payload) {
    try {
      const response = await client.put(`/messages/${messageId}`, payload)
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not update message')
    }
  },

  async destroy(messageId) {
    try {
      const response = await client.delete(`/messages/${messageId}`)
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not delete message')
    }
  },

  async deleteForEveryone(messageId) {
    try {
      const response = await client.patch(`/messages/${messageId}/delete-for-everyone`)
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not delete message for everyone')
    }
  },

  async forward(messageId, payload) {
    try {
      const response = await client.post(`/messages/${messageId}/forward`, payload)
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not forward message')
    }
  },

  async addAttachment(messageId, payload) {
    try {
      const response = await client.post(`/messages/${messageId}/attachments`, payload)
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not add attachment')
    }
  },

  async removeAttachment(attachmentId) {
    try {
      const response = await client.delete(`/attachments/${attachmentId}`)
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not delete attachment')
    }
  },

  async addReaction(messageId, reactionCode) {
    try {
      const response = await client.post(`/messages/${messageId}/reactions`, { reaction_code: reactionCode })
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not add reaction')
    }
  },

  async removeReaction(messageId, reactionCode) {
    try {
      const response = await client.delete(`/messages/${messageId}/reactions`, {
        data: { reaction_code: reactionCode },
      })
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not remove reaction')
    }
  },

  async listReactions(messageId) {
    try {
      const response = await client.get(`/messages/${messageId}/reactions`)
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not fetch reactions')
    }
  },
}
