import client from './httpClient.js'
import { toApiError, unwrap } from './response.js'

export const authApi = {
  async register(payload) {
    try {
      const response = await client.post('/register', payload)
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Register failed')
    }
  },

  async login(payload) {
    try {
      const response = await client.post('/login', payload)
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Login failed')
    }
  },

  async logout() {
    try {
      const response = await client.post('/logout')
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Logout failed')
    }
  },

  async me() {
    try {
      const response = await client.get('/me')
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not fetch profile')
    }
  },
}
