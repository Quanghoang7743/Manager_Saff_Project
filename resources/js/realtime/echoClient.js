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
  const isHttps = (import.meta.env.VITE_REVERB_SCHEME || 'http') === 'https'
  const browserHost = window.location.hostname
  const envHost = import.meta.env.VITE_REVERB_HOST
  const wsHost = browserHost || envHost

  return {
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost,
    wsPort: toNumber(import.meta.env.VITE_REVERB_PORT, 8080),
    wssPort: toNumber(import.meta.env.VITE_REVERB_PORT, 443),
    forceTLS: isHttps,
    enabledTransports: isHttps ? ['wss'] : ['ws'],
    authEndpoint: '/api/broadcasting/auth',
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
