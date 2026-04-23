import client from './httpClient.js'
import { toApiError, unwrap } from './response.js'

export const departmentsApi = {
  async list(params = {}) {
    try {
      const response = await client.get('/departments', { params })
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not fetch departments')
    }
  },
}
