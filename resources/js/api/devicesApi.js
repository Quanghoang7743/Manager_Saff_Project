import client from './httpClient.js'
import { toApiError, unwrap } from './response.js'

export const devicesApi = {
  async list() {
    try {
      const response = await client.get('/devices')
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not fetch devices')
    }
  },

  async create(payload) {
    try {
      const response = await client.post('/devices', payload)
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not register device')
    }
  },

  async show(deviceId) {
    try {
      const response = await client.get(`/devices/${deviceId}`)
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not fetch device')
    }
  },

  async update(deviceId, payload) {
    try {
      const response = await client.put(`/devices/${deviceId}`, payload)
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not update device')
    }
  },

  async destroy(deviceId) {
    try {
      const response = await client.delete(`/devices/${deviceId}`)
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not delete device')
    }
  },

  async activate(deviceId) {
    try {
      const response = await client.patch(`/devices/${deviceId}/activate`)
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not activate device')
    }
  },

  async deactivate(deviceId) {
    try {
      const response = await client.patch(`/devices/${deviceId}/deactivate`)
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not deactivate device')
    }
  },

  async touchLastActive(deviceId) {
    try {
      const response = await client.patch(`/devices/${deviceId}/last-active`)
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not update last active')
    }
  },
}
