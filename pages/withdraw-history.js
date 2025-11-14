// pages/withdraw-history.js
import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useTelegramAuth } from '../hooks/useTelegramAuth'
import { supabase } from '../lib/supabase'

export default function WithdrawHistory() {
  const { user, loading } = useTelegramAuth()
  const [withdrawals, setWithdrawals] = useState([])
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(true)

  useEffect(() => {
    if (user) {
      fetchWithdrawals()
    }
  }, [user])

  const fetchWithdrawals = async () => {
    try {
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setWithdrawals(data || [])
    } catch (error) {
      console.error('Error fetching withdrawals:', error)
    } finally {
      setLoadingWithdrawals(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'rejected': return 'text-red-600 bg-red-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getWalletIcon = (type) => {
    switch (type) {
      case 'bkash': return 'ri-wallet-line text-green-600'
      case 'nagad': return 'ri-wallet-line text-red-600'
      case 'rocket': return 'ri-wallet-line text-purple-600'
      case 'upay': return 'ri-wallet-line text-blue-600'
      default: return 'ri-wallet-line text-gray-600'
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <Layout user={user} loading={loading} title="Withdrawal History">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Withdrawal History</h1>
        <p className="text-gray-600">Track your withdrawal requests</p>
      </div>

      {loadingWithdrawals ? (
        <div className="flex justify-center py-8">
          <div className="loading-spinner w-8 h-8"></div>
        </div>
      ) : withdrawals.length === 0 ? (
        <div className="text-center py-8">
          <i className="ri-bank-card-line text-4xl text-gray-400 mb-4"></i>
          <p className="text-gray-500">No withdrawal history found</p>
          <p className="text-sm text-gray-400">You haven't made any withdrawal requests yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {withdrawals.map((withdrawal) => (
            <div key={withdrawal.id} className="bg-white p-6 shadow-sm border-0">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center">
                  <i className={`${getWalletIcon(withdrawal.wallet_type)} text-xl mr-3`}></i>
                  <div>
                    <h3 className="font-semibold text-gray-900 capitalize">
                      {withdrawal.wallet_type}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {withdrawal.wallet_address}
                    </p>
                    {withdrawal.admin_notes && (
                      <p className="text-sm text-gray-700 mt-1">
                        Note: {withdrawal.admin_notes}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    ৳{withdrawal.amount}
                  </div>
                  <div className={`text-xs px-2 py-1 mt-1 ${getStatusColor(withdrawal.status)}`}>
                    {withdrawal.status}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>
                  Requested: {new Date(withdrawal.created_at).toLocaleDateString()}
                </span>
                {withdrawal.processed_at && (
                  <span>
                    Processed: {new Date(withdrawal.processed_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}
