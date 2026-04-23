import client from './httpClient.js'
import { toApiError, unwrap } from './response.js'

export const employeesApi = {
  async list(params = {}) {
    try {
      const response = await client.get('/employees', { params })
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not fetch employees')
    }
  },

  async show(employeeId) {
    try {
      const response = await client.get(`/employees/${employeeId}`)
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not fetch employee')
    }
  },

  async create(payload) {
    try {
      const response = await client.post('/employees', payload)
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not create employee')
    }
  },

  async update(employeeId, payload) {
    try {
      const response = await client.put(`/employees/${employeeId}`, payload)
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not update employee')
    }
  },
}
