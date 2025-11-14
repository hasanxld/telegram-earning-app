// pages/contact.js
import { useState } from 'react'
import Layout from '../components/Layout'
import { useTelegramAuth } from '../hooks/useTelegramAuth'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function Contact() {
  const { user, loading } = useTelegramAuth()
  const [formData, setFormData] = useState({
    subject: '',
    message: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.subject.trim() || !formData.message.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    setSubmitting(true)

    try {
      const { error } = await supabase
        .from('contacts')
        .insert([{
          user_id: user.id,
          subject: formData.subject,
          message: formData.message
        }])

      if (error) throw error

      toast.success('Message sent successfully! We will get back to you soon.')
      setFormData({ subject: '', message: '' })
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <Layout user={user} loading={loading} title="Contact Support">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Contact Support</h1>
          <p className="text-gray-600">Get help with any issues or questions</p>
        </div>

        <div className="bg-white p-6 shadow-sm border-0 mb-6">
          <div className="flex items-start mb-6">
            <i className="ri-customer-service-2-line text-2xl text-primary-600 mr-3"></i>
            <div>
              <h3 className="font-semibold text-gray-900">Need Help?</h3>
              <p className="text-gray-600 text-sm">
                Our support team is here to help you with any questions or issues you might have.
                We typically respond within 24 hours.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Brief description of your issue"
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                maxLength={255}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Describe your issue in detail..."
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-vertical"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="loading-spinner w-4 h-4"></div>
                  Sending...
                </div>
              ) : (
                'Send Message'
              )}
            </button>
          </form>
        </div>

        {/* Contact Information */}
        <div className="bg-white p-6 shadow-sm border-0">
          <h3 className="text-lg font-semibold mb-4">Other Ways to Contact</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <i className="ri-telegram-line text-xl text-blue-600 mr-3"></i>
              <div>
                <p className="font-medium text-gray-900">Telegram</p>
                <p className="text-gray-600">@hasam_x_fire</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <i className="ri-email-line text-xl text-red-600 mr-3"></i>
              <div>
                <p className="font-medium text-gray-900">Email</p>
                <p className="text-gray-600">admin@example.com</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <i className="ri-time-line text-xl text-green-600 mr-3"></i>
              <div>
                <p className="font-medium text-gray-900">Response Time</p>
                <p className="text-gray-600">Within 24 hours</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white p-6 shadow-sm border-0 mt-6">
          <h3 className="text-lg font-semibold mb-4">Frequently Asked Questions</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900">How long do withdrawals take?</h4>
              <p className="text-gray-600 text-sm mt-1">
                Withdrawals are typically processed within 24-48 hours.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900">Why was my task rejected?</h4>
              <p className="text-gray-600 text-sm mt-1">
                Tasks are rejected if they don't meet the requirements. Check the task description carefully.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900">How do I earn from referrals?</h4>
              <p className="text-gray-600 text-sm mt-1">
                You earn ৳10 for each friend who joins using your referral code and completes their first task.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
