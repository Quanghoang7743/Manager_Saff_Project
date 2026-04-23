import client from './httpClient.js'
import { toApiError, unwrap } from './response.js'

export const tasksApi = {
  async list(params = {}) {
    try {
      const response = await client.get('/tasks', { params })
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not fetch tasks')
    }
  },

  async show(taskId) {
    try {
      const response = await client.get(`/tasks/${taskId}`)
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not fetch task')
    }
  },

  async create(payload) {
    try {
      const response = await client.post('/tasks', payload)
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not create task')
    }
  },

  async update(taskId, payload) {
    try {
      const response = await client.put(`/tasks/${taskId}`, payload)
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not update task')
    }
  },

  async destroy(taskId) {
    try {
      const response = await client.delete(`/tasks/${taskId}`)
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not delete task')
    }
  },

  async comments(taskId) {
    try {
      const response = await client.get(`/tasks/${taskId}/comments`)
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not fetch task comments')
    }
  },

  async addComment(taskId, payload) {
    try {
      const response = await client.post(`/tasks/${taskId}/comments`, payload)
      return unwrap(response)
    } catch (error) {
      throw toApiError(error, 'Could not add task comment')
    }
  },
}
