// components/DebugInfo.js
import { useState, useEffect } from 'react'

export default function DebugInfo() {
  const [telegramInfo, setTelegramInfo] = useState({})
  const [showDebug, setShowDebug] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const tg = window.Telegram?.WebApp
      if (tg) {
        setTelegramInfo({
          version: tg.version,
          platform: tg.platform,
          initData: tg.initData,
          initDataUnsafe: tg.initDataUnsafe,
          colorScheme: tg.colorScheme,
          themeParams: tg.themeParams
        })
      }
    }
  }, [])

  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        className="fixed bottom-4 left-4 bg-gray-800 text-white p-2 text-xs rounded"
      >
        Debug
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Debug Information</h3>
          <button
            onClick={() => setShowDebug(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <pre className="text-xs bg-gray-100 p-4 rounded overflow-x-auto">
          {JSON.stringify(telegramInfo, null, 2)}
        </pre>
        
        <div className="mt-4 text-sm text-gray-600">
          <p><strong>Telegram WebApp Available:</strong> {typeof window !== 'undefined' && window.Telegram?.WebApp ? 'Yes' : 'No'}</p>
          <p><strong>User Data:</strong> {telegramInfo.initDataUnsafe?.user ? 'Available' : 'Not Available'}</p>
        </div>
      </div>
    </div>
  )
    }
