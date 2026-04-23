import client from './httpClient.js'
import { toApiError, unwrap } from './response.js'

export const attendanceApi = {
  async shifts() {
    try {
      const response = await client.get('/attendance/shifts')
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not fetch shifts')
    }
  },

  async myAssignments(params = {}) {
    try {
      const response = await client.get('/attendance/assignments/me', { params })
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not fetch shift assignments')
    }
  },

  async myLogs(params = {}) {
    try {
      const response = await client.get('/attendance/logs/me', { params })
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not fetch attendance logs')
    }
  },

  async teamLogs(params = {}) {
    try {
      const response = await client.get('/attendance/logs/team', { params })
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not fetch team attendance logs')
    }
  },

  async report(params = {}) {
    try {
      const response = await client.get('/attendance/reports', { params })
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not fetch attendance report')
    }
  },

  async checkIn(payload) {
    try {
      const response = await client.post('/attendance/check-in', payload)
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not check in')
    }
  },

  async checkOut(payload) {
    try {
      const response = await client.post('/attendance/check-out', payload)
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not check out')
    }
  },
}
