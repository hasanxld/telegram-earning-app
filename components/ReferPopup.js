// components/ReferPopup.js
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function ReferPopup({ user, onClose, onSubmit }) {
  const [referCode, setReferCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [referrer, setReferrer] = useState(null)

  const checkReferCode = async (code) => {
    if (code.length === 6) {
      const { data } = await supabase
        .from('users')
        .select('username')
        .eq('refer_code', code.toUpperCase())
        .single()
      setReferrer(data)
    } else {
      setReferrer(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!referCode) {
      onClose()
      return
    }

    setLoading(true)
    const success = await onSubmit(referCode.toUpperCase())
    setLoading(false)
    
    if (success) {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Enter Referral Code</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Referral Code (Optional)
            </label>
            <input
              type="text"
              value={referCode}
              onChange={(e) => {
                setReferCode(e.target.value)
                checkReferCode(e.target.value)
              }}
              placeholder="Enter 6-digit code"
              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              maxLength={6}
              style={{ textTransform: 'uppercase' }}
            />
            {referrer && (
              <p className="text-green-600 text-sm mt-1">
                Valid code! Referred by: @{referrer.username}
              </p>
            )}
            {referCode && referCode.length === 6 && !referrer && (
              <p className="text-red-600 text-sm mt-1">
                Invalid referral code
              </p>
            )}
          </div>

          <div className="bg-blue-50 p-3 mb-4">
            <p className="text-sm text-blue-800">
              💰 Get ৳10 bonus when you use a referral code!
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 transition-colors duration-200"
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={loading || (referCode && !referrer)}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="loading-spinner w-4 h-4 mx-auto"></div>
              ) : (
                'Submit'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
                }
