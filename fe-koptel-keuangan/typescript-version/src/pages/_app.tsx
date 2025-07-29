import Head from 'next/head'
import { Router } from 'next/router'
import type { NextPage } from 'next'
import type { AppProps } from 'next/app'

// ** Loader Import
import NProgress from 'nprogress'

// ** Emotion Imports
import { CacheProvider } from '@emotion/react'
import type { EmotionCache } from '@emotion/cache'

// ** Config Imports
import themeConfig from 'src/configs/themeConfig'

// ** Component Imports
import UserLayout from 'src/layouts/UserLayout'
import ThemeComponent from 'src/@core/theme/ThemeComponent'

// ** Contexts
import { SettingsConsumer, SettingsProvider } from 'src/@core/context/settingsContext'

// ** Utils Imports
import { createEmotionCache } from 'src/@core/utils/create-emotion-cache'

// ** React Perfect Scrollbar Style
import 'react-perfect-scrollbar/dist/css/styles.css'

// ** Global css styles
import '../../styles/globals.css'

// ** Auth Provider Imports
import { AuthProvider } from 'src/context/authContext'
import AuthGuard from 'src/@core/components/auth/AuthGuard' 
import GuestGuard from 'src/@core/components/auth/GuestGuard' 

// ** Extend NextPage type to include custom properties
type NextPageWithAuth = NextPage & {
  authGuard?: boolean
  guestGuard?: boolean
}

// ** Extend App Props with Emotion and custom NextPage type
type ExtendedAppProps = AppProps & {
  Component: NextPageWithAuth 
  emotionCache: EmotionCache
}

const clientSideEmotionCache = createEmotionCache()

// ** Pace Loader
if (themeConfig.routingLoader) {
  Router.events.on('routeChangeStart', () => {
    NProgress.start()
  })
  Router.events.on('routeChangeError', () => {
    NProgress.done()
  })
  Router.events.on('routeChangeComplete', () => {
    NProgress.done()
  })
}

// ** Guard Component for handling authentication
const Guard = ({ children, authGuard, guestGuard }: any) => {
  if (guestGuard) {
    // If it's a guest-only page (like login/register), use GuestGuard
    return <GuestGuard fallback={<p>Loading...</p>}>{children}</GuestGuard>
  } else if (!guestGuard && !authGuard) {
    // If it's neither guest-only nor auth-required (public page), render directly
    return <>{children}</>
  } else {
    // If it's an auth-required page, use AuthGuard
    return <AuthGuard fallback={<p>Loading...</p>}>{children}</AuthGuard>
  }
}

// ** Configure JSS & ClassName
const App = (props: ExtendedAppProps) => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props

  const getLayout = Component.getLayout ?? (page => <UserLayout>{page}</UserLayout>)

  // Get authGuard and guestGuard properties from the page component
  const authGuard = Component.authGuard ?? false
  const guestGuard = Component.guestGuard ?? false

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <title>{`${themeConfig.templateName} - Material Design React Admin Template`}</title>
        <meta
          name='description'
          content={`${themeConfig.templateName} – Material Design React Admin Dashboard Template – is the most developer friendly & highly customizable Admin Dashboard Template based on MUI v5.`}
        />
        <meta name='keywords' content='Material Design, MUI, Admin Template, React Admin Template' />
        <meta name='viewport' content='initial-scale=1, width=device-width' />
      </Head>

      {/* Wrap the entire application with AuthProvider */}
      <AuthProvider>
        <SettingsProvider>
          <SettingsConsumer>
            {({ settings }) => {
              return (
                <ThemeComponent settings={settings}>
                  <Guard authGuard={authGuard} guestGuard={guestGuard}>
                    {getLayout(<Component {...pageProps} />)}
                  </Guard>
                </ThemeComponent>
              )
            }}
          </SettingsConsumer>
        </SettingsProvider>
      </AuthProvider>
    </CacheProvider>
  )
}

export default App
