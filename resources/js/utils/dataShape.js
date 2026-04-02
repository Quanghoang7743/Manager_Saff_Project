export const toArray = (value) => {
  if (Array.isArray(value)) {
    return value
  }

  if (Array.isArray(value?.data)) {
    return value.data
  }

  if (Array.isArray(value?.items)) {
    return value.items
  }

  if (Array.isArray(value?.items?.data)) {
    return value.items.data
  }

  return []
}

export const toPaginatorMeta = (value, fallback = {}) => {
  if (value?.meta && typeof value.meta === 'object') {
    return value.meta
  }

  if (fallback?.meta && typeof fallback.meta === 'object') {
    return fallback.meta
  }

  return {
    current_page: 1,
    last_page: 1,
    per_page: 0,
    total: 0,
  }
}

export const asConversationCollection = (payload) => {
  return {
    items: toArray(payload),
    meta: toPaginatorMeta(payload),
  }
}

export const asFriendCollection = (payload) => {
  return {
    items: toArray(payload?.items),
    meta: payload?.meta || {
      current_page: 1,
      last_page: 1,
      per_page: 0,
      total: 0,
    },
  }
}
