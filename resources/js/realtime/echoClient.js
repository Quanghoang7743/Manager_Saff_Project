import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

window.Pusher = Pusher

let echoInstance = null
let activeToken = null

const toNumber = (value, fallback) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const resolveConfig = () => {
  const appUrl = import.meta.env.VITE_APP_URL
  const authEndpoint = appUrl
    ? `${appUrl.replace(/\/$/, '')}/api/broadcasting/auth`
    : '/api/broadcasting/auth'

  return {
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    forceTLS: true,
    enabledTransports: ['ws', 'wss'],
    authEndpoint,
  }
}

export const initEcho = (token) => {
  if (!token) {
    return null
  }

  if (echoInstance && activeToken === token) {
    return echoInstance
  }

  if (echoInstance) {
    echoInstance.disconnect()
  }

  const config = resolveConfig()

  echoInstance = new Echo({
    ...config,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    },
  })

  activeToken = token

  return echoInstance
}

export const getEcho = () => echoInstance

export const disconnectEcho = () => {
  if (echoInstance) {
    echoInstance.disconnect()
  }

  echoInstance = null
  activeToken = null
}
