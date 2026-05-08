import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  type ReactNode
} from 'react'

import type { Usuario } from '../types/auth.types'

import {
  logout as logoutApi, refreshSession
} from '../api/auth.api'



interface AuthContextType {
  usuario: Usuario | null
  token: string | null

  setAuth: (
    token: string,
    refreshToken: string,
    usuario: Usuario
  ) => void

  logout: () => Promise<void>

  showSessionAlert: boolean
  secondsLeft: number

  isAuthenticated: boolean
  initializing: boolean
  hideSessionAlert: () => void

  refreshAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

const getInitialToken = (): string | null => {
  return localStorage.getItem('access_token')
}

const getInitialUsuario = (): Usuario | null => {
  try {
    const stored = localStorage.getItem('usuario')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export const AuthProvider = ({
  children
}: {
  children: ReactNode
}) => {

  // =========================
  // STATES
  // =========================

  const [token, setToken] = useState<string | null>(
    getInitialToken()
  )

  const [usuario, setUsuario] = useState<Usuario | null>(
    getInitialUsuario()
  )

  const [initializing, setInitializing] = useState(true)

  const [showSessionAlert, setShowSessionAlert] =
    useState(false)

  const [secondsLeft, setSecondsLeft] =
    useState(120)

  const countdownRef = useRef<number | null>(null)

  const warningTimeoutRef = useRef<number | null>(null)

  // =========================
  // INIT SESSION
  // =========================

  useEffect(() => {

    const tokenLS = localStorage.getItem('access_token')
    const userLS = getInitialUsuario()

    if (tokenLS && userLS) {
      setToken(tokenLS)
      setUsuario(userLS)
    } else {
      setToken(null)
      setUsuario(null)
    }

    setInitializing(false)

  }, [])

  // =========================
  // SAVE AUTH
  // =========================

  const setAuth = (
    accessToken: string,
    refreshToken: string,
    user: Usuario
  ) => {

    localStorage.setItem(
      'access_token',
      accessToken
    )

    localStorage.setItem(
      'refresh_token',
      refreshToken
    )

    localStorage.setItem(
      'usuario',
      JSON.stringify(user)
    )

    setToken(accessToken)
    setUsuario(user)
  }

  // =========================
  // REFRESH SESSION
  // =========================

 // =========================
// REFRESH SESSION
// =========================

const refreshAuth = async () => {

  try {

    const data = await refreshSession()

    localStorage.setItem(
      'access_token',
      data.access_token
    )

    localStorage.setItem(
      'refresh_token',
      data.refresh_token
    )

    // reinicia watcher
    setToken(data.access_token)

    // cerrar modal
    setShowSessionAlert(false)

    // limpiar countdown viejo
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
    }

  } catch {

    await logout()
  }
}
  // =========================
  // LOGOUT
  // =========================

  const logout = async () => {

    try {
      await logoutApi()
    } catch { }

    if (countdownRef.current) {
      clearInterval(countdownRef.current)
    }

    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current)
    }

    setShowSessionAlert(false)

    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('usuario')

    setToken(null)
    setUsuario(null)
  }

  // =========================
  // JWT PARSER
  // =========================

  const parseJwt = (token: string) => {

    try {
      return JSON.parse(
        atob(token.split('.')[1])
      )
    } catch {
      return null
    }
  }

  // =========================
  // SESSION WATCHER
  // =========================

  useEffect(() => {

    if (!token) return

    // limpiar timers anteriores
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
    }

    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current)
    }

    const payload = parseJwt(token)

    if (!payload?.exp) return

    const expirationTime = payload.exp * 1000

    // mostrar alerta 2 minutos antes
    const warningTime =
      expirationTime - (2 * 60 * 1000)

    const delay = Math.max(
      warningTime - Date.now(),
      0
    )

    warningTimeoutRef.current = window.setTimeout(() => {

      setShowSessionAlert(true)

      const updateCountdown = () => {

        const remainingSeconds = Math.max(
          Math.floor(
            (expirationTime - Date.now()) / 1000
          ),
          0
        )

        setSecondsLeft(remainingSeconds)

        if (remainingSeconds <= 0) {

          if (countdownRef.current) {
            clearInterval(countdownRef.current)
          }

          logout()
        }
      }

      // ejecutar inmediatamente
      updateCountdown()

      // luego cada segundo
      countdownRef.current = window.setInterval(() => {
        updateCountdown()
      }, 1000)

    }, delay)

    return () => {

      if (countdownRef.current) {
        clearInterval(countdownRef.current)
      }

      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current)
      }
    }

  }, [token])

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        setAuth,
        logout,
        showSessionAlert,
        refreshAuth,
        secondsLeft,
        isAuthenticated: !!token,
        initializing,
        hideSessionAlert: () => setShowSessionAlert(false)
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {

  const ctx = useContext(AuthContext)

  if (!ctx) {
    throw new Error(
      'useAuth debe usarse dentro de AuthProvider'
    )
  }

  return ctx
}