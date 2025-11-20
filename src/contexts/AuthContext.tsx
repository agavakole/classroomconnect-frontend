import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ACCESS_TOKEN_KEY, ROLE_KEY } from '../constants/storage'

const FULL_NAME_KEY = 'classroomconnect_user_full_name'

type UserRole = 'teacher' | 'student' | null

interface AuthContextValue {
  token: string | null
  role: UserRole
  fullName: string | null
  isTeacher: boolean
  isStudent: boolean
  login: (token: string, role: Exclude<UserRole, null>, fullName?: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const navigate = useNavigate()
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(ACCESS_TOKEN_KEY),
  )
  const [role, setRole] = useState<UserRole>(() => {
    const storedRole = localStorage.getItem(ROLE_KEY)
    return storedRole === 'teacher' || storedRole === 'student'
      ? storedRole
      : null
  })
  const [fullName, setFullName] = useState<string | null>(() =>
    localStorage.getItem(FULL_NAME_KEY),
  )

  const login = useCallback(
    (authToken: string, userRole: Exclude<UserRole, null>, name?: string) => {
      localStorage.setItem(ACCESS_TOKEN_KEY, authToken)
      localStorage.setItem(ROLE_KEY, userRole)
      setToken(authToken)
      setRole(userRole)
      
      if (name) {
        localStorage.setItem(FULL_NAME_KEY, name)
        setFullName(name)
      }
    },
    [],
  )

  const logout = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(ROLE_KEY)
    localStorage.removeItem(FULL_NAME_KEY)
    setToken(null)
    setRole(null)
    setFullName(null)
    navigate('/', { replace: true })
  }, [navigate])

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === ACCESS_TOKEN_KEY) {
        setToken(event.newValue)
      }
      if (event.key === ROLE_KEY) {
        const nextRole =
          event.newValue === 'teacher' || event.newValue === 'student'
            ? event.newValue
            : null
        setRole(nextRole)
      }
      if (event.key === FULL_NAME_KEY) {
        setFullName(event.newValue)
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      role,
      fullName,
      isTeacher: role === 'teacher',
      isStudent: role === 'student',
      login,
      logout,
    }),
    [login, logout, role, token, fullName],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
