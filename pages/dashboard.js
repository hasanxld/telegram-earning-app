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
    <Layout user={user} loading={loading}
