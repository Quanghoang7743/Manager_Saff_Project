const DEVICE_UUID_KEY = 'messapp_device_uuid'

const randomSegment = () => Math.random().toString(16).slice(2, 10)

const generateDeviceUuid = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  return `${randomSegment()}-${randomSegment()}-${Date.now()}`
}

export const getDeviceUuid = () => {
  const existing = localStorage.getItem(DEVICE_UUID_KEY)
  if (existing) {
    return existing
  }

  const next = generateDeviceUuid()
  localStorage.setItem(DEVICE_UUID_KEY, next)

  return next
}

const resolveDeviceType = () => {
  const ua = navigator.userAgent.toLowerCase()

  if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ios')) {
    return 'ios'
  }

  if (ua.includes('android')) {
    return 'android'
  }

  if (ua.includes('windows') || ua.includes('macintosh') || ua.includes('linux')) {
    return 'desktop'
  }

  return 'web'
}

export const buildDevicePayload = () => ({
  device_uuid: getDeviceUuid(),
  device_type: resolveDeviceType(),
  device_name: navigator.platform || 'web-client',
  app_version: 'web-1.0.0',
  os_version: navigator.userAgent,
  is_active: true,
  touch_last_active: true,
})
