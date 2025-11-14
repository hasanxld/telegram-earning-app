// components/Layout.js
import { useState, useEffect } from 'react'
import Head from 'next/head'
import Sidebar from './Sidebar'
import Header from './Header'
import Loading from './Loading'
import Notifications from './Notifications'

export default function Layout({ children, user, loading, title = "Dashboard" }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    if (user) {
      fetchNotifications()
    }
  }, [user])

  const fetchNotifications = async () => {
    // Implementation for fetching notifications
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div className="min-h-screen bg-gray-50 font-space-grotesk">
      <Head>
        <title>{title} - Telegram Earning</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Sidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        user={user} 
      />
      
      <div className="lg:pl-64 flex flex-col flex-1">
        <Header 
          setSidebarOpen={setSidebarOpen} 
          user={user} 
          notifications={notifications}
        />
        
        <main className="flex-1 pb-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      <Notifications notifications={notifications} />
    </div>
  )
}
