// pages/profile.js
import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useTelegramAuth } from '../hooks/useTelegramAuth'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, loading, refreshUser } = useTelegramAuth()
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({})
  const [stats, setStats] = useState({})

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
      })
      fetchUserStats()
    }
  }, [user])

  const fetchUserStats = async () => {
    try {
      const [
        { data: tasks },
        { data: referrals },
        { data: withdrawals }
      ] = await Promise.all([
        supabase.from('user_tasks').select('id, status, amount').eq('user_id', user.id),
        supabase.from('referrals').select('id').eq('referrer_id', user.id),
        supabase.from('withdrawals').select('id, amount').eq('user_id', user.id).eq('status', 'completed')
      ])

      setStats({
        totalTasks: tasks?.length || 0,
        completedTasks: tasks?.filter(t => t.status === 'completed').length || 0,
        totalEarned: tasks?.filter(t => t.status === 'completed').reduce((sum, t) => sum + (t.amount || 0), 0) || 0,
        totalReferrals: referrals?.length || 0,
        totalWithdrawals: withdrawals?.length || 0,
        withdrawnAmount: withdrawals?.reduce((sum, w) => sum + w.amount, 0) || 0
      })
    } catch (error) {
      console.error('Error fetching user stats:', error)
    }
  }

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('users')
        .update(formData)
        .eq('id', user.id)

      if (error) throw error

      toast.success('Profile updated successfully!')
      setEditing(false)
      refreshUser()
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <Layout user={user} loading={loading} title="My Profile">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white p-6 shadow-sm border-0 mb-6">
          <div className="flex items-center">
            <div className="w-20 h-20 bg-primary-600 rounded flex items-center justify-center text-white text-2xl font-bold">
              {user.first_name?.[0]?.toUpperCase()}
            </div>
            <div className="ml-6">
              <h1 className="text-2xl font-bold text-gray-900">
                {user.first_name} {user.last_name}
              </h1>
              <p className="text-gray-600">@{user.username}</p>
              <p className="text-sm text-gray-500">
                Member since {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6 sm:grid-cols-3 lg:grid-cols-6">
          <div className="bg-white p-4 shadow-sm border-0 text-center">
            <div className="text-lg font-bold text-gray-900">{stats.totalTasks}</div>
            <p className="text-xs text-gray-600">Total Tasks</p>
          </div>
          <div className="bg-white p-4 shadow-sm border-0 text-center">
            <div className="text-lg font-bold text-green-600">{stats.completedTasks}</div>
            <p className="text-xs text-gray-600">Completed</p>
          </div>
          <div className="bg-white p-4 shadow-sm border-0 text-center">
            <div className="text-lg font-bold text-blue-600">৳{stats.totalEarned}</div>
            <p className="text-xs text-gray-600">Total Earned</p>
          </div>
          <div className="bg-white p-4 shadow-sm border-0 text-center">
            <div className="text-lg font-bold text-purple-600">{stats.totalReferrals}</div>
            <p className="text-xs text-gray-600">Referrals</p>
          </div>
          <div className="bg-white p-4 shadow-sm border-0 text-center">
            <div className="text-lg font-bold text-orange-600">{stats.totalWithdrawals}</div>
            <p className="text-xs text-gray-600">Withdrawals</p>
          </div>
          <div className="bg-white p-4 shadow-sm border-0 text-center">
            <div className="text-lg font-bold text-red-600">৳{stats.withdrawnAmount}</div>
            <p className="text-xs text-gray-600">Withdrawn</p>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-white p-6 shadow-sm border-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Profile Information</h2>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setEditing(false)
                    setFormData({
                      username: user.username || '',
                      first_name: user.first_name || '',
                      last_name: user.last_name || '',
                    })
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telegram ID
              </label>
              <input
                type="text"
                value={user.telegram_id}
                disabled
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                disabled={!editing}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                disabled={!editing}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                disabled={!editing}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Referral Code
              </label>
              <input
                type="text"
                value={user.refer_code}
                disabled
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 text-gray-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Status
              </label>
              <input
                type="text"
                value={user.is_blocked ? 'Blocked' : 'Active'}
                disabled
                className={`w-full px-3 py-2 bg-gray-100 border border-gray-300 ${
                  user.is_blocked ? 'text-red-600' : 'text-green-600'
                }`}
              />
            </div>
          </div>

          {/* Balance Information */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Balance Information</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="bg-gray-50 p-4">
                <p className="text-sm text-gray-600">Main Balance</p>
                <p className="text-xl font-bold text-gray-900">৳{user.balance}</p>
              </div>
              <div className="bg-gray-50 p-4">
                <p className="text-sm text-gray-600">Task Wallet</p>
                <p className="text-xl font-bold text-gray-900">৳{user.task_wallet}</p>
              </div>
              <div className="bg-gray-50 p-4">
                <p className="text-sm text-gray-600">Referral Wallet</p>
                <p className="text-xl font-bold text-gray-900">৳{user.refer_wallet}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
