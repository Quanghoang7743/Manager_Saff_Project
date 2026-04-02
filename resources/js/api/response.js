export const toApiError = (error, fallbackMessage = 'Request failed') => {
  if (error?.isApiError) {
    return error
  }

  const payload = error?.response?.data
  const message = payload?.message || error?.message || fallbackMessage

  const apiError = new Error(message)
  apiError.isApiError = true
  apiError.status = error?.response?.status || 0
  apiError.message = message
  apiError.errors = payload?.errors || null
  apiError.data = payload?.data || null

  return apiError
}

export const unwrap = (response) => {
  const payload = response?.data || {}

  if (payload.success === false) {
    const apiError = new Error(payload.message || 'Request failed')
    apiError.isApiError = true
    apiError.status = response?.status || 400
    apiError.errors = payload.errors || null
    apiError.data = payload.data || null
    throw apiError
  }

  return payload.data
}

export const firstErrorMessage = (errors, fallback = 'Validation error') => {
  if (!errors || typeof errors !== 'object') {
    return fallback
  }

  const first = Object.values(errors)[0]
  if (Array.isArray(first) && first.length > 0) {
    return first[0]
  }

  return fallback
}
