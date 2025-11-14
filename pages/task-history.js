// pages/task-history.js
import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useTelegramAuth } from '../hooks/useTelegramAuth'
import { supabase } from '../lib/supabase'

export default function TaskHistory() {
  const { user, loading } = useTelegramAuth()
  const [tasks, setTasks] = useState([])
  const [loadingTasks, setLoadingTasks] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (user) {
      fetchTaskHistory()
    }
  }, [user, filter])

  const fetchTaskHistory = async () => {
    try {
      let query = supabase
        .from('user_tasks')
        .select(`
          *,
          tasks (
            title,
            description
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error('Error fetching task history:', error)
    } finally {
      setLoadingTasks(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'rejected': return 'text-red-600 bg-red-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'in_progress': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <Layout user={user} loading={loading} title="Task History">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Task History</h1>
        <p className="text-gray-600">View your completed and pending tasks</p>
      </div>

      {/* Filter Buttons */}
      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
        {['all', 'pending', 'completed', 'rejected', 'in_progress'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
              filter === status
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status === 'all' ? 'All' : status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loadingTasks ? (
        <div className="flex justify-center py-8">
          <div className="loading-spinner w-8 h-8"></div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-8">
          <i className="ri-history-line text-4xl text-gray-400 mb-4"></i>
          <p className="text-gray-500">No tasks found</p>
          <p className="text-sm text-gray-400">
            {filter === 'all' 
              ? "You haven't completed any tasks yet" 
              : `No ${filter} tasks found`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((userTask) => (
            <div key={userTask.id} className="bg-white p-6 shadow-sm border-0">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {userTask.tasks?.title || 'Task'}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {userTask.tasks?.description}
                  </p>
                  
                  {userTask.submitted_url && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-700">
                        Submitted: {userTask.submitted_url}
                      </p>
                    </div>
                  )}

                  {userTask.admin_notes && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-700">
                        Admin Notes: {userTask.admin_notes}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="text-right ml-4">
                  <div className="text-lg font-bold text-green-600">
                    ৳{userTask.amount}
                  </div>
                  <div className={`text-xs px-2 py-1 mt-1 ${getStatusColor(userTask.status)}`}>
                    {userTask.status.replace('_', ' ')}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>
                  Started: {new Date(userTask.created_at).toLocaleDateString()}
                </span>
                {userTask.completed_at && (
                  <span>
                    Completed: {new Date(userTask.completed_at).toLocaleDateString()}
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
