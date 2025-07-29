import { createContext, useState, useEffect, ReactNode } from 'react'

// ** Next Imports
import { useRouter } from 'next/router'

// ** Third Party Imports
import axios from 'axios'

// ** Config
import authConfig from 'src/configs/auth'

// ** Types
interface User {
  user_id: string | number
  username: string
  role: 'sales' | 'keuangan' | 'admin'
  email?: string
  fullName?: string
}

interface AuthValuesType {
  user: User | null
  loading: boolean
  setUser: (user: User | null) => void
  setLoading: (value: boolean) => void
  login: (params: any, errorCallback?: (err: any) => void) => void
  logout: () => void
}

// ** Defaults
const defaultProvider: AuthValuesType = {
  user: null,
  loading: true,
  setUser: () => null,
  setLoading: () => Boolean,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve()
}

const AuthContext = createContext(defaultProvider)

type Props = {
  children: ReactNode
}

const AuthProvider = ({ children }: Props) => {
  // ** States
  const [user, setUser] = useState<User | null>(defaultProvider.user)
  const [loading, setLoading] = useState<boolean>(defaultProvider.loading)

  // ** Hooks
  const router = useRouter()

  useEffect(() => {
    const initAuth = async (): Promise<void> => {
      const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName)!
      if (storedToken) {
        setLoading(true)
        try {
          // In a real application, you would verify the token with your backend
          // and fetch user details based on the token.
          // For this example, we'll simulate fetching user data.
          const response = await axios.get(authConfig.meEndpoint, {
            headers: {
              Authorization: `Bearer ${storedToken}`
            }
          })
          const userData = response.data.userData // Assume backend returns { userData: { user_id, username, role, ... } }
          setUser(userData)
        } catch (err: any) {
          console.error('Error initializing auth:', err)
          localStorage.removeItem('userData')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('accessToken')
          setUser(null)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const handleLogin = async (params: any, errorCallback?: (err: any) => void) => {
    try {
      const response = await axios.post(authConfig.loginEndpoint, params)
      const { accessToken, refreshToken, userData } = response.data; 

      window.localStorage.setItem(authConfig.storageTokenKeyName, accessToken)
      if (refreshToken) window.localStorage.setItem(authConfig.onTokenExpiration, refreshToken)
      window.localStorage.setItem('userData', JSON.stringify(userData)) 

      setUser(userData)
      setLoading(false)

      const returnUrl = router.query.returnUrl

      const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/'
      router.replace(redirectURL as string)
    } catch (err: any) {
      if (errorCallback) errorCallback(err)
      else console.error('Login failed:', err)
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setUser(null)
    window.localStorage.removeItem('userData')
    window.localStorage.removeItem(authConfig.storageTokenKeyName)
    window.localStorage.removeItem(authConfig.onTokenExpiration) // If you use refresh tokens
    router.push('/pages/login')
  }

  const values = {
    user,
    loading,
    setUser,
    setLoading,
    login: handleLogin,
    logout: handleLogout
  }

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }
