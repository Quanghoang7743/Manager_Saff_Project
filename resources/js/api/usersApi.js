import client from './httpClient.js'
import { toApiError, unwrap } from './response.js'

export const usersApi = {
  async search(params = {}) {
    try {
      const response = await client.get('/users/search', { params })
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not search users')
    }
  },

  async show(userId) {
    try {
      const response = await client.get(`/users/${userId}`)
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not fetch user')
    }
  },

  async update(userId, payload) {
    try {
      const response = await client.put(`/users/${userId}`, payload)
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not update user')
    }
  },

  async destroy(userId) {
    try {
      const response = await client.delete(`/users/${userId}`)
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not delete user')
    }
  },
}
