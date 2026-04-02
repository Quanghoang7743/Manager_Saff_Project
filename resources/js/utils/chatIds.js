const randomPart = () => Math.random().toString(36).slice(2, 8)

export const createClientMessageId = () => {
  const timestamp = Date.now().toString(36)
  return `web-${timestamp}-${randomPart()}-${randomPart()}`
}
