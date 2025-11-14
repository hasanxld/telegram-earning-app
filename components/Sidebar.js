// components/Sidebar.js
import { useRouter } from 'next/router'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: 'ri-dashboard-line' },
  { name: 'Tasks', href: '/tasks', icon: 'ri-task-line' },
  { name: 'Task History', href: '/task-history', icon: 'ri-history-line' },
  { name: 'Withdraw', href: '/withdraw', icon: 'ri-money-dollar-circle-line' },
  { name: 'Withdraw History', href: '/withdraw-history', icon: 'ri-bank-card-line' },
  { name: 'Refer & Earn', href: '/refer', icon: 'ri-user-share-line' },
  { name: 'Refer History', href: '/refer-history', icon: 'ri-group-line' },
  { name: 'Profile', href: '/profile', icon: 'ri-user-line' },
  { name: 'Contact', href: '/contact', icon: 'ri-customer-service-2-line' },
]

const adminNavigation = [
  { name: 'Admin Dashboard', href: '/admin', icon: 'ri-admin-line' },
  { name: 'User Management', href: '/admin/users', icon: 'ri-user-settings-line' },
  { name: 'Task Management', href: '/admin/tasks', icon: 'ri-task-line' },
  { name: 'Withdrawal Management', href: '/admin/withdrawals', icon: 'ri-money-dollar-box-line' },
  { name: 'Notifications', href: '/admin/notifications', icon: 'ri-notification-3-line' },
  { name: 'Settings', href: '/admin/settings', icon: 'ri-settings-3-line' },
]

export default function Sidebar({ sidebarOpen, setSidebarOpen, user }) {
  const router = useRouter()

  return (
    <>
      {/* Mobile sidebar */}
      <div className={`lg:hidden ${sidebarOpen ? 'fixed inset-0 z-40' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
        
        <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-white shadow-xl">
          <div className="flex items-center justify-between h-16 px-4 bg-primary-600 text-white">
            <span className="text-lg font-semibold">Telegram Earning</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-white"
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>
          
          <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium ${
                  router.pathname === item.href
                    ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <i className={`${item.icon} mr-3 text-lg`}></i>
                {item.name}
              </a>
            ))}
            
            {user?.is_admin && (
              <>
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <p className="px-3 text-xs font-semibold text-gray-400 uppercase">Admin</p>
                </div>
                {adminNavigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium ${
                      router.pathname === item.href
                        ? 'bg-red-50 text-red-700 border-r-2 border-red-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <i className={`${item.icon} mr-3 text-lg`}></i>
                    {item.name}
                  </a>
                ))}
              </>
            )}
          </nav>
          
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary-600 rounded flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.first_name?.[0]?.toUpperCase()}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user?.first_name}</p>
                <p className="text-xs text-gray-500">৳{user?.balance}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:bg-white">
        <div className="flex items-center h-16 px-6 bg-primary-600 text-white">
          <span className="text-lg font-semibold">Telegram Earning</span>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2 text-sm font-medium ${
                router.pathname === item.href
                  ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <i className={`${item.icon} mr-3 text-lg`}></i>
              {item.name}
            </a>
          ))}
          
          {user?.is_admin && (
            <>
              <div className="pt-4 mt-4 border-t border-gray-200">
                <p className="px-3 text-xs font-semibold text-gray-400 uppercase">Admin</p>
              </div>
              {adminNavigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium ${
                    router.pathname === item.href
                      ? 'bg-red-50 text-red-700 border-r-2 border-red-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <i className={`${item.icon} mr-3 text-lg`}></i>
                  {item.name}
                </a>
              ))}
            </>
          )}
        </nav>
        
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-primary-600 rounded flex items-center justify-center">
              <span className="text-white font-medium">
                {user?.first_name?.[0]?.toUpperCase()}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user?.first_name}</p>
              <p className="text-xs text-gray-500">Balance: ৳{user?.balance}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
            }
