// In dashboard.js - update the stats cards
<div className="bg-white p-6 shadow-sm border-0">
  <div className="flex items-center">
    <div className="flex-shrink-0">
      <div className="w-8 h-8 bg-blue-600 flex items-center justify-center">
        <i className="ri-wallet-3-line text-white text-lg"></i>
      </div>
    </div>
    <div className="ml-4">
      <p className="text-sm font-medium text-gray-600">Total Balance</p>
      <p className="text-2xl font-bold text-gray-900">৳{user.balance}</p>
    </div>
  </div>
</div>    <p className="text-gray-500 text-center py-4">No user data available</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
