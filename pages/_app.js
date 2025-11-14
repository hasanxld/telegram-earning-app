// pages/_app.js
import '../styles/globals.css'
import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import Script from 'next/script'

function MyApp({ Component, pageProps }) {
  const [telegramReady, setTelegramReady] = useState(false)

  useEffect(() => {
    // Load Telegram Web App script
    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-web-app.js'
    script.async = true
    script.onload = () => setTelegramReady(true)
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  return (
    <>
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="beforeInteractive"
      />
      <Toaster position="top-right" />
      <Component {...pageProps} telegramReady={telegramReady} />
    </>
  )
}

export default MyApp
