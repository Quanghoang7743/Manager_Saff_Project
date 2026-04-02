import React from 'react'
import { authApi } from '../api/authApi.js'
import {
  clearAccessToken,
  clearStoredAccessToken,
  getStoredAccessToken,
  setAccessToken,
  storeAccessToken,
} from '../api/httpClient.js'
import { firstErrorMessage, toApiError } from '../api/response.js'
import { disconnectEcho, initEcho } from '../realtime/echoClient.js'
import { buildDevicePayload } from '../utils/deviceIdentity.js'

const AuthContext = React.createContext(null)

const getErrorMessage = (error, fallbackMessage) => {
  const apiError = toApiError(error, fallbackMessage)

  if (apiError.errors) {
    return firstErrorMessage(apiError.errors, apiError.message || fallbackMessage)
  }

  return apiError.message || fallbackMessage
}

export function AuthProvider({ children }) {
  const [user, setUser] = React.useState(null)
  const [token, setToken] = React.useState(() => getStoredAccessToken())
  const [loading, setLoading] = React.useState(true)
  const [authError, setAuthError] = React.useState('')

  const clearAuthData = React.useCallback(() => {
    setUser(null)
    setToken(null)
    clearStoredAccessToken()
    clearAccessToken()
    disconnectEcho()
  }, [])

  const applyAuthData = React.useCallback((nextUser, nextToken) => {
    setUser(nextUser)
    setToken(nextToken)
    storeAccessToken(nextToken)
    setAccessToken(nextToken)
    initEcho(nextToken)
  }, [])

  const fetchMe = React.useCallback(async () => {
    try {
      const data = await authApi.me()
      setUser(data?.user || null)
    } catch (_error) {
      clearAuthData()
    } finally {
      setLoading(false)
    }
  }, [clearAuthData])

  React.useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }

    setAccessToken(token)
    initEcho(token)
    fetchMe()
  }, [fetchMe, token])

  const login = React.useCallback(
    async (payload) => {
      setAuthError('')

      try {
        const data = await authApi.login({
          ...payload,
          device: payload?.device || buildDevicePayload(),
        })

        const authUser = data?.user || null
        const authToken = data?.token
        applyAuthData(authUser, authToken)

        return { success: true, user: authUser, token: authToken }
      } catch (error) {
        const message = getErrorMessage(error, 'Login failed. Please try again.')
        setAuthError(message)
        return { success: false, message }
      }
    },
    [applyAuthData],
  )

  const signup = React.useCallback(
    async (payload) => {
      setAuthError('')

      try {
        const data = await authApi.register(payload)
        const authUser = data?.user || null
        const authToken = data?.token
        applyAuthData(authUser, authToken)

        return { success: true, user: authUser, token: authToken }
      } catch (error) {
        const message = getErrorMessage(error, 'Could not create account. Please try again.')
        setAuthError(message)
        return { success: false, message }
      }
    },
    [applyAuthData],
  )

  const refreshProfile = React.useCallback(async () => {
    try {
      const data = await authApi.me()
      setUser(data?.user || null)
      return data?.user || null
    } catch (error) {
      const message = getErrorMessage(error, 'Could not refresh profile.')
      setAuthError(message)
      return null
    }
  }, [])

  const logout = React.useCallback(async () => {
    try {
      await authApi.logout()
    } catch (_error) {
      // ignore network errors on logout
    } finally {
      clearAuthData()
      setAuthError('')
    }
  }, [clearAuthData])

  const value = React.useMemo(
    () => ({
      user,
      token,
      loading,
      authError,
      isAuthenticated: Boolean(user && token),
      login,
      signup,
      logout,
      refreshProfile,
      setUser,
      clearAuthError: () => setAuthError(''),
    }),
    [authError, loading, login, logout, refreshProfile, signup, token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = React.useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.')
  }

  return context
}
