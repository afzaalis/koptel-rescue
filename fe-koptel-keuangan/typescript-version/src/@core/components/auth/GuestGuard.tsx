// ** React Imports
import { ReactNode, ReactElement, useEffect, useState } from 'react' // Import useState

// ** Next Imports
import { useRouter } from 'next/router'

// ** Hooks Imports
import { useAuth } from 'src/hooks/useAuth'

interface GuestGuardProps {
  children: ReactNode
  fallback: ReactElement | null
}

const GuestGuard = (props: GuestGuardProps) => {
  const { children, fallback } = props
  const auth = useAuth()
  const router = useRouter()

  const [isAuthChecked, setIsAuthChecked] = useState(false); // New state

  useEffect(
    () => {
      if (!router.isReady) {
        return
      }

      if (!auth.loading) { // Once auth.loading is false, the auth state is resolved
        setIsAuthChecked(true); // Mark auth check as complete
        if (auth.user) { // User is authenticated, redirect from guest page
          router.replace('/') // Redirect to dashboard or home page if already logged in
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router.route, auth.user, router.isReady, auth.loading] // Added auth.loading to dependencies
  )

  // Render fallback while authentication status is being determined or if authenticated
  // We show fallback if:
  // 1. AuthContext is still loading (auth.loading is true)
  // 2. Our internal check hasn't completed yet (isAuthChecked is false)
  // 3. User is definitively not null (authenticated)
  if (auth.loading || !isAuthChecked || auth.user) {
    return fallback
  }

  // If not authenticated and check is complete, render children
  return <>{children}</>
}

export default GuestGuard
