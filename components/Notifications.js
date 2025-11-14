// components/Notifications.js
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Notifications({ user }) {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user) {
      fetchNotifications()
      
      // Subscribe to new notifications
      const subscription = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notices',
            filter: `target_user_id=eq.${user.id}`
          },
          (payload) => {
            setNotifications(prev => [payload.new, ...prev])
            setUnreadCount(prev => prev + 1)
          }
        )
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [user])

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notices')
      .select('*')
      .or(`is_public.eq.true${user ? ',target_user_id.eq.' + user.id : ''}`)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(10)

    setNotifications(data || [])
  }

  const markAsRead = () => {
    setUnreadCount(0)
  }

  if (notifications.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {unreadCount > 0 && (
        <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center absolute -top-1 -right-1">
          {unreadCount}
        </div>
      )}
      
      <div className="bg-white shadow-lg border border-gray-200 max-w-sm">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="font-semibold">Notifications</h3>
          <button
            onClick={markAsRead}
            className="text-primary-600 hover:text-primary-700 text-sm"
          >
            Mark all read
          </button>
        </div>
        
        <div className="max-h-64 overflow-y-auto">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50"
            >
              <h4 className="font-medium text-gray-900">{notification.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
              <p className="text-xs text-gray-400 mt-2">
                {new Date(notification.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
