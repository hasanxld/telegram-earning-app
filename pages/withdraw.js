// pages/withdraw.js
import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useTelegramAuth } from '../hooks/useTelegramAuth'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function Withdraw() {
  const { user, loading, refreshUser } = useTelegramAuth()
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [walletType, setWalletType] = useState('bkash')
  const [walletAddress, setWalletAddress] = useState('')
  const [settings, setSettings] = useState({})
  const [loadingSettings, setLoadingSettings] = useState(true)

  useEffect(() => {
    if (user) {
      fetchSettings()
    }
  }, [user])

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value')
      
      if (error) throw error

      const settingsObj = {}
      data.forEach(setting => {
        settingsObj[setting.key] = setting.value
      })
      setSettings(settingsObj)
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoadingSettings(false)
    }
  }

  const handleWithdraw = async (e) => {
    e.preventDefault()
    
    const amount = parseFloat(withdrawAmount)
    const minWithdraw = parseFloat(settings.min_withdraw) || 50
    const maxWithdraw = parseFloat(settings.max_withdraw) || 5000

    if (!amount || amount < minWithdraw) {
      toast.error(`Minimum withdrawal amount is ৳${minWithdraw}`)
      return
    }

    if (amount > maxWithdraw) {
      toast.error(`Maximum withdrawal amount is ৳${maxWithdraw}`)
      return
    }

    if (amount > user.balance) {
      toast.error('Insufficient balance')
      return
    }

    if (!walletAddress.trim()) {
      toast.error('Please enter your wallet address')
      return
    }

    try {
      const { error } = await supabase
        .from('withdrawals')
        .insert([{
          user_id: user.id,
          amount: amount,
          wallet_type: walletType,
          wallet_address: walletAddress,
          status: 'pending'
        }])

      if (error) throw error

      // Deduct from user balance
      const { error: updateError } = await supabase
        .from('users')
        .update({
          balance: user.balance - amount,
          total_withdrawn: user.total_withdrawn + amount
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      toast.success('Withdrawal request submitted successfully!')
      setWithdrawAmount('')
      setWalletAddress('')
      refreshUser()
    } catch (error) {
      console.error('Withdrawal error:', error)
      toast.error('Failed to process withdrawal')
    }
  }

  const walletOptions = [
    { value: 'bkash', label: 'bKash', icon: 'ri-wallet-line' },
    { value: 'nagad', label: 'Nagad', icon: 'ri-wallet-line' },
    { value: 'rocket', label: 'Rocket', icon: 'ri-wallet-line' },
    { value: 'upay', label: 'Upay', icon: 'ri-wallet-line' },
  ]

  if (loading || loadingSettings) return <div>Loading...</div>

  return (
    <Layout user={user} loading={loading} title="Withdraw Funds">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Withdraw Funds</h1>
          <p className="text-gray-600">Transfer your earnings to your wallet</p>
        </div>

        {/* Balance Card */}
        <div className="bg-white p-6 shadow-sm border-0 mb-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-wallet-3-line text-2xl"></i>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">৳{user.balance}</h2>
            <p className="text-gray-600">Available Balance</p>
            <div className="mt-4 text-sm text-gray-500">
              <p>Min: ৳{settings.min_withdraw} | Max: ৳{settings.max_withdraw}</p>
            </div>
          </div>
        </div>

        {/* Withdraw Form */}
        <div className="bg-white p-6 shadow-sm border-0">
          <form onSubmit={handleWithdraw}>
            {/* Amount Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Withdrawal Amount (৳)
              </label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder={`Enter amount between ${settings.min_withdraw} - ${settings.max_withdraw}`}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                min={settings.min_withdraw}
                max={settings.max_withdraw}
                step="1"
              />
            </div>

            {/* Wallet Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Wallet
              </label>
              <div className="grid grid-cols-2 gap-3">
                {walletOptions.map((wallet) => (
                  <button
                    key={wallet.value}
                    type="button"
                    onClick={() => setWalletType(wallet.value)}
                    className={`p-3 border text-left ${
                      walletType === wallet.value
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <i className={`${wallet.icon} mr-2`}></i>
                    {wallet.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Wallet Address */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {walletType.charAt(0).toUpperCase() + walletType.slice(1)} Number
              </label>
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder={`Enter your ${walletType} number`}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Terms */}
            <div className="bg-yellow-50 p-4 mb-6">
              <div className="flex">
                <i className="ri-information-line text-yellow-600 text-lg mr-3"></i>
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Important Information</p>
                  <ul className="mt-1 list-disc list-inside space-y-1">
                    <li>Withdrawal processing time: 24-48 hours</li>
                    <li>Ensure your wallet number is correct</li>
                    <li>Contact support if you face any issues</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 transition-colors duration-200"
            >
              Request Withdrawal
            </button>
          </form>
        </div>

        {/* Quick Amount Buttons */}
        <div className="bg-white p-6 shadow-sm border-0 mt-6">
          <h3 className="font-medium text-gray-900 mb-3">Quick Amount</h3>
          <div className="grid grid-cols-4 gap-2">
            {[100, 200, 500, 1000].map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => setWithdrawAmount(amount.toString())}
                className="py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors duration-200"
              >
                ৳{amount}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
