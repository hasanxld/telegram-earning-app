// pages/refer.js
import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useTelegramAuth } from '../hooks/useTelegramAuth'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function Refer() {
  const { user, loading } = useTelegramAuth()
  const [referrals, setReferrals] = useState([])
  const [referralStats, setReferralStats] = useState({})
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    if (user) {
      fetchReferralData()
    }
  }, [user])

  const fetchReferralData = async () => {
    try {
      const [
        { data: referralsData },
        { data: referralEarnings }
      ] = await Promise.all([
        supabase
          .from('referrals')
          .select(`
            *,
            referred_user:referred_id (
              username,
              created_at
            )
          `)
          .eq('referrer_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('users')
          .select('refer_wallet, total_earned')
          .eq('id', user.id)
          .single()
      ])

      setReferrals(referralsData || [])
      setReferralStats({
        totalReferrals: referralsData?.length || 0,
        referralEarnings: referralEarnings?.refer_wallet || 0,
        totalEarned: referralEarnings?.total_earned || 0
      })
    } catch (error) {
      console.error('Error fetching referral data:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  const copyReferralLink = () => {
    const referralLink = `https://t.me/your_bot_username?start=${user.refer_code}`
    navigator.clipboard.writeText(referralLink)
    toast.success('Referral link copied to clipboard!')
  }

  const shareOnTelegram = () => {
    const message = `Join Telegram Earning App and start earning money! Use my referral code: ${user.refer_code}`
    const url = `https://t.me/share/url?url=${encodeURIComponent('https://t.me/your_bot_username')}&text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  if (loading) return <div>Loading...</div>

  return (
    <Layout user={user} loading={loading} title="Refer & Earn">
      <div className="max-w-4xl mx-auto">
        {/* Referral Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
          <div className="bg-white p-6 shadow-sm border-0 text-center">
            <i className="ri-group-line text-3xl text-blue-600 mb-3"></i>
            <div className="text-2xl font-bold text-gray-900">{referralStats.totalReferrals}</div>
            <p className="text-gray-600">Total Referrals</p>
          </div>
          
          <div className="bg-white p-6 shadow-sm border-0 text-center">
            <i className="ri-money-dollar-circle-line text-3xl text-green-600 mb-3"></i>
            <div className="text-2xl font-bold text-gray-900">৳{referralStats.referralEarnings}</div>
            <p className="text-gray-600">Referral Earnings</p>
          </div>
          
          <div className="bg-white p-6 shadow-sm border-0 text-center">
            <i className="ri-trophy-line text-3xl text-orange-600 mb-3"></i>
            <div className="text-2xl font-bold text-gray-900">৳{referralStats.totalEarned}</div>
            <p className="text-gray-600">Total Earned</p>
          </div>
        </div>

        {/* Referral Code Card */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white mb-8">
          <div className="text-center">
            <i className="ri-gift-line text-4xl mb-4"></i>
            <h2 className="text-2xl font-bold mb-2">Invite Friends & Earn Money!</h2>
            <p className="mb-4 opacity-90">
              Get ৳10 for each friend who joins using your referral code
            </p>
            
            <div className="bg-white bg-opacity-20 p-4 rounded mb-4">
              <p className="text-sm opacity-90 mb-2">Your Referral Code</p>
              <div className="text-3xl font-bold tracking-wider">{user.refer_code}</div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={copyReferralLink}
                className="flex-1 bg-white text-blue-600 font-medium py-3 px-4 hover:bg-opacity-90 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <i className="ri-link"></i>
                Copy Link
              </button>
              <button
                onClick={shareOnTelegram}
                className="flex-1 bg-white text-blue-600 font-medium py-3 px-4 hover:bg-opacity-90 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <i className="ri-telegram-line"></i>
                Share
              </button>
            </div>
          </div>
        </div>

        {/* How it Works */}
        <div className="bg-white p-6 shadow-sm border-0 mb-8">
          <h3 className="text-lg font-semibold mb-4">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="ri-user-share-line text-xl"></i>
              </div>
              <h4 className="font-semibold mb-2">1. Share Your Code</h4>
              <p className="text-sm text-gray-600">
                Share your referral code with friends
              </p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="ri-user-add-line text-xl"></i>
              </div>
              <h4 className="font-semibold mb-2">2. Friends Join</h4>
              <p className="text-sm text-gray-600">
                Friends join using your referral code
              </p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="ri-money-dollar-circle-line text-xl"></i>
              </div>
              <h4 className="font-semibold mb-2">3. Earn Money</h4>
              <p className="text-sm text-gray-600">
                Get ৳10 when friends complete their first task
              </p>
            </div>
          </div>
        </div>

        {/* Referral History */}
        <div className="bg-white p-6 shadow-sm border-0">
          <h3 className="text-lg font-semibold mb-4">Referral History</h3>
          
          {loadingStats ? (
            <div className="flex justify-center py-4">
              <div className="loading-spinner w-6 h-6"></div>
            </div>
          ) : referrals.length === 0 ? (
            <div className="text-center py-8">
              <i className="ri-user-share-line text-4xl text-gray-400 mb-4"></i>
              <p className="text-gray-500">No referrals yet</p>
              <p className="text-sm text-gray-400">Start sharing your referral code to earn more</p>
            </div>
          ) : (
            <div className="space-y-3">
              {referrals.map((referral) => (
                <div key={referral.id} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded flex items-center justify-center">
                      <i className="ri-user-line"></i>
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">
                        @{referral.referred_user?.username || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Joined: {new Date(referral.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-green-600 font-semibold">
                      +৳{referral.bonus_amount}
                    </div>
                    <div className={`text-xs px-2 py-1 mt-1 ${
                      referral.status === 'active' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {referral.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
