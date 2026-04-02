import client from './httpClient.js'
import { toApiError, unwrap } from './response.js'

export const friendsApi = {
  async resolveByPhone(phoneNumber) {
    try {
      const response = await client.post('/friends/resolve-by-phone', {
        phone_number: phoneNumber,
      })
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not resolve user by phone')
    }
  },

  async sendRequest(payload) {
    try {
      const response = await client.post('/friend-requests', payload)
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not send friend request')
    }
  },

  async incoming(params = {}) {
    try {
      const response = await client.get('/friend-requests/incoming', { params })
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not fetch incoming friend requests')
    }
  },

  async outgoing(params = {}) {
    try {
      const response = await client.get('/friend-requests/outgoing', { params })
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not fetch outgoing friend requests')
    }
  },

  async accept(requestId) {
    try {
      const response = await client.patch(`/friend-requests/${requestId}/accept`)
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not accept friend request')
    }
  },

  async reject(requestId) {
    try {
      const response = await client.patch(`/friend-requests/${requestId}/reject`)
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not reject friend request')
    }
  },

  async cancel(requestId) {
    try {
      const response = await client.delete(`/friend-requests/${requestId}`)
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not cancel friend request')
    }
  },

  async list(params = {}) {
    try {
      const response = await client.get('/friends', { params })
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not fetch friends')
    }
  },

  async unfriend(userId) {
    try {
      const response = await client.delete(`/friends/${userId}`)
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not remove friend')
    }
  },
}
