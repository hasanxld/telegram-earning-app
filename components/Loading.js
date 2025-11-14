// components/Loading.js
export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="loading-spinner w-12 h-12 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading Telegram Earning App...</p>
        <p className="text-sm text-gray-500 mt-2">Please wait while we set up your account</p>
      </div>
    </div>
  )
}
