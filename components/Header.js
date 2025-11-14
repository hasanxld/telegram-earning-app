// components/Header.js
import { useState } from 'react'

export default function Header({ setSidebarOpen, user, notifications }) {
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex justify-between items-center py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <button
            type="button"
            className="lg:hidden -ml-2 p-2 text-gray-400"
            onClick={() => setSidebarOpen(true)}
          >
            <i className="ri-menu-line text-xl"></i>
          </button>
          
          <div className="ml-4 lg:ml-0">
            <h1 className="text-xl font-semibold text-gray-900">
              Welcome back, {user?.first_name || 'User'}!
            </h1>
            <p className="text-sm text-gray-500">
              Balance: ৳{user?.balance || '0'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-gray-500">
            <i className="ri-notification-3-line text-xl"></i>
            {notifications.length > 0 && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center space-x-2 text-sm focus:outline-none"
            >
              <div className="w-8 h-8 bg-primary-600 rounded flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user?.first_name?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <span className="hidden md:block font-medium text-gray-700">
                {user?.first_name}
              </span>
              <i className="ri-arrow-down-s-line text-gray-400"></i>
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg border border-gray-200 py-1 z-50">
                <a
                  href="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <i className="ri-user-line mr-2"></i>
                  Profile
                </a>
                <a
                  href="/settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <i className="ri-settings-3-line mr-2"></i>
                  Settings
                </a>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={() => {
                    if (window.Telegram?.WebApp) {
                      window.Telegram.WebApp.close()
                    }
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  <i className="ri-logout-box-r-line mr-2"></i>
                  Exit
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
