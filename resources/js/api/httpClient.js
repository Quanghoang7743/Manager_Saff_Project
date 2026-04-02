import axios from 'axios'

const TOKEN_STORAGE_KEY = 'messapp_auth_token'

const client = axios.create({
  baseURL: '/api',
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    Accept: 'application/json',
  },
})

let accessToken = null

export const setAccessToken = (token) => {
  accessToken = token || null

  if (accessToken) {
    client.defaults.headers.common.Authorization = `Bearer ${accessToken}`
  } else {
    delete client.defaults.headers.common.Authorization
  }
}

export const getAccessToken = () => accessToken

export const clearAccessToken = () => setAccessToken(null)

export const getStoredAccessToken = () => localStorage.getItem(TOKEN_STORAGE_KEY)

export const storeAccessToken = (token) => {
  if (!token) {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    return
  }

  localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export const clearStoredAccessToken = () => localStorage.removeItem(TOKEN_STORAGE_KEY)

export { TOKEN_STORAGE_KEY }

export default client
