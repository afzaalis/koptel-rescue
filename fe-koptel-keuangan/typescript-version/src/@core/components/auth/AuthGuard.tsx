import { ReactNode, ReactElement, useEffect, useState } from 'react' // Import useState

// ** Next Imports
import { useRouter } from 'next/router'

// ** Hooks Imports
import { useAuth } from 'src/hooks/useAuth'

interface AuthGuardProps {
  children: ReactNode
  fallback: ReactElement | null
}

const AuthGuard = (props: AuthGuardProps) => {
  const { children, fallback } = props
  const auth = useAuth()
  const router = useRouter()

  // State to track if auth check is complete and user is authenticated
  const [isAuthChecked, setIsAuthChecked] = useState(false); // New state

  useEffect(
    () => {
      // This effect runs only once after the component mounts
      // and when router is ready.
      if (!router.isReady) {
        return
      }

      // This part ensures that we wait for the AuthContext to finish its initial loading
      // and determine the user's authentication status.
      if (!auth.loading) { // Once auth.loading is false, the auth state is resolved
        setIsAuthChecked(true); // Mark auth check as complete
        if (auth.user === null) {
          // User is not authenticated, redirect to login
          if (router.asPath !== '/') {
            router.replace({
              pathname: '/pages/login',
              query: { returnUrl: router.asPath }
            })
          } else {
            router.replace('/pages/login')
          }
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router.route, auth.user, router.isReady, auth.loading, router.asPath] // Added auth.loading and router.asPath to dependencies
  )

  // Render fallback while authentication status is being determined or if not authenticated
  // We show fallback if:
  // 1. AuthContext is still loading (auth.loading is true)
  // 2. Our internal check hasn't completed yet (isAuthChecked is false)
  // 3. User is definitively null (not authenticated)
  if (auth.loading || !isAuthChecked || auth.user === null) {
    return fallback
  }

  // If authenticated and check is complete, render children
  return <>{children}</>
}

export default AuthGuard