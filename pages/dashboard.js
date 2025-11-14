// pages/dashboard.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import { useTelegramAuth } from '../hooks/useTelegramAuth'
import { supabase } from '../lib/supabase'
import ReferPopup from '../components/ReferPopup'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { user, loading, refreshUser } = useTelegramAuth()
  const router = useRouter()
  const [stats, setStats] = useState({})
  const [showReferPopup, setShowReferPopup] = useState(false)
  const [recentTasks, setRecentTasks] = useState([])
  const [topUsers, setTopUsers] = useState([])

  useEffect(() => {
    if (user) {
      fetchDashboardData()
      checkReferCode()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      const [
        { data: tasks },
        { data: referrals },
        { data: userTasks },
        { data: topUsersData }
      ] = await Promise.all([
        supabase.from('user_tasks').select('*').eq('user_id', user.id),
        supabase.from('referrals').select('*').eq('referrer_id', user.id),
        supabase.from('user_tasks').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('users').select('username, total_earned').order('total_earned', { ascending: false }).limit(5).eq('is_blocked', false)
      ])

      setStats({
        totalTasks: tasks?.length || 0,
        completedTasks: tasks?.filter(t => t.status === 'completed').length || 0,
        pendingTasks: tasks?.filter(t => t.status === 'pending').length || 0,
        totalReferrals: referrals?.length || 0,
        pendingBalance: user.task_wallet + user.refer_wallet
      })

      setRecentTasks(userTasks || [])
      setTopUsers(topUsersData || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    }
  }

  const checkReferCode = () => {
    if (!user.referred_by && !user.is_admin) {
      setShowReferPopup(true)
    }
  }

  const handleReferSubmit = async (referCode) => {
    try {
      const { data: referrer } = await supabase
        .from('users')
        .select('id')
        .eq('refer_code', referCode)
        .single()

      if (!referrer) {
        toast.error('Invalid referral code')
        return false
      }

      // Update user with referral
      const { error } = await supabase
        .from('users')
        .update({ referred_by: referCode })
        .eq('id', user.id)

      if (error) throw error

      // Create referral record
      const { error: referralError } = await supabase
        .from('referrals')
        .insert([{
          referrer_id: referrer.id,
          referred_id: user.id,
          bonus_amount: 10 // Default bonus
        }])

      if (referralError) throw referralError

      toast.success('Referral code applied successfully!')
      setShowReferPopup(false)
      refreshUser()
      return true
    } catch (error) {
      console.error('Referral error:', error)
      toast.error('Failed to apply referral code')
      return false
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <Layout user={user} loading={loading} title="Dashboard">
      {showReferPopup && (
        <ReferPopup 
          user={user} 
          onClose={() => setShowReferPopup(false)}
          onSubmit={handleReferSubmit}
        />
      )}
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white p-6 shadow-sm border-0">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <i className="ri-wallet-3-line text-2xl text-blue-600"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Balance</p>
              <p className="text-2xl font-bold text-gray-900">৳{user.balance}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 shadow-sm border-0">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <i className="ri-task-line text-2xl text-green-600"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Task Wallet</p>
              <p className="text-2xl font-bold text-gray-900">৳{user.task_wallet}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 shadow-sm border-0">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <i className="ri-user-share-line text-2xl text-purple-600"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Refer Wallet</p>
              <p className="text-2xl font-bold text-gray-900">৳{user.refer_wallet}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 shadow-sm border-0">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <i className="ri-group-line text-2xl text-orange-600"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Referrals</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalReferrals}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mb-8 sm:grid-cols-4">
        <a
          href="/tasks"
          className="bg-white p-4 shadow-sm border-0 text-center hover:bg-gray-50 transition-colors"
        >
          <i className="ri-task-line text-2xl text-blue-600 mb-2"></i>
          <p className="text-sm font-medium text-gray-900">Tasks</p>
        </a>
        
        <a
          href="/withdraw"
          className="bg-white p-4 shadow-sm border-0 text-center hover:bg-gray-50 transition-colors"
        >
          <i className="ri-money-dollar-circle-line text-2xl text-green-600 mb-2"></i>
          <p className="text-sm font-medium text-gray-900">Withdraw</p>
        </a>
        
        <a
          href="/refer"
          className="bg-white p-4 shadow-sm border-0 text-center hover:bg-gray-50 transition-colors"
        >
          <i className="ri-user-share-line text-2xl text-purple-600 mb-2"></i>
          <p className="text-sm font-medium text-gray-900">Refer & Earn</p>
        </a>
        
        <a
          href="/profile"
          className="bg-white p-4 shadow-sm border-0 text-center hover:bg-gray-50 transition-colors"
        >
          <i className="ri-user-line text-2xl text-orange-600 mb-2"></i>
          <p className="text-sm font-medium text-gray-900">Profile</p>
        </a>
      </div>

      {/* Recent Activities & Top Users */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Tasks */}
        <div className="bg-white p-6 shadow-sm border-0">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <i className="ri-history-line mr-2"></i>
            Recent Tasks
          </h3>
          <div className="space-y-3">
            {recentTasks.length > 0 ? (
              recentTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Task #{task.id.slice(-6)}</p>
                    <p className="text-xs text-gray-500">
                      Status: <span className={`font-medium ${
                        task.status === 'completed' ? 'text-green-600' : 
                        task.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {task.status}
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">৳{task.amount}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(task.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No tasks completed yet</p>
            )}
          </div>
          <a
            href="/task-history"
            className="block text-center mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            View All Tasks
          </a>
        </div>

        {/* Top Users */}
        <div className="bg-white p-6 shadow-sm border-0">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <i className="ri-trophy-line mr-2"></i>
            Top Earners
          </h3>
          <div className="space-y-3">
            {topUsers.length > 0 ? (
              topUsers.map((user, index) => (
                <div key={user.username} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">@{user.username}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">৳{user.total_earned}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No user data available</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
