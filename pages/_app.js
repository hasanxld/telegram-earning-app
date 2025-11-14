// pages/_app.js
import '../styles/globals.css'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Load Telegram Web App script
    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-web-app.js'
    script.async = true
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  return (
    <>
      <Toaster position="top-right" />
      <Component {...pageProps} />
    </>
  )
}

export default MyApp
