// pages/index.js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useTelegramAuth } from '../hooks/useTelegramAuth'
import Loading from '../components/Loading'
import Head from 'next/head'

export default function Home() {
  const { user, loading, isAuthenticated } = useTelegramAuth()
  const router = useRouter()
  const [isTelegram, setIsTelegram] = useState(false)

  useEffect(() => {
    // Check if we're in Telegram Mini App
    if (typeof window !== 'undefined') {
      const isTelegramApp = window.Telegram?.WebApp !== undefined
      setIsTelegram(isTelegramApp)
      
      if (isTelegramApp) {
        console.log('Running in Telegram Mini App')
      } else {
        console.log('Running in regular browser')
      }
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated && user) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, user, router])

  if (loading) {
    return <Loading />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Head>
        <title>Telegram Mini Earning App</title>
        <meta name="description" content="Earn money by completing tasks on Telegram" />
      </Head>

      <div className="max-w-md w-full">
        <div className="bg-white shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-blue-600 mx-auto mb-6 flex items-center justify-center text-white text-2xl">
            💰
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Telegram Earning
          </h1>
          
          <p className="text-gray-600 mb-6">
            Complete tasks and earn money directly through Telegram
          </p>

          {isTelegram ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 p-4">
                <div className="text-green-600 text-xl mb-2">✅</div>
                <p className="text-green-800 text-sm">
                  Telegram Mini App Detected
                </p>
                <p className="text-green-700 text-xs mt-1">
                  {user ? 'Logged in successfully!' : 'Setting up your account...'}
                </p>
              </div>

              {!user && (
                <div className="bg-yellow-50 border border-yellow-200 p-4">
                  <div className="text-yellow-600 text-xl mb-2">⏳</div>
                  <p className="text-yellow-800 text-sm">
                    Setting up your account...
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 p-4">
                <div className="text-yellow-600 text-xl mb-2">ℹ️</div>
                <p className="text-yellow-800 text-sm">
                  Open this app through Telegram to start earning
                </p>
              </div>

              <button
                onClick={() => {
                  window.open('https://t.me/your_bot_username', '_blank')
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <span>📱</span>
                Open in Telegram
              </button>

              <div className="text-xs text-gray-500 space-y-1">
                <p>💰 Earn money by completing tasks</p>
                <p>👥 Refer friends and get bonuses</p>
                <p>⚡ Instant withdrawals</p>
                <p>🛡️ Secure and reliable</p>
              </div>
            </div>
          )}
        </div>

        <div className="text-center mt-6 text-gray-500 text-sm">
          <p>Contact admin for support: @hasam_x_fire</p>
        </div>
      </div>
    </div>
  )
                  }
