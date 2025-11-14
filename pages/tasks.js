// pages/tasks.js
import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useTelegramAuth } from '../hooks/useTelegramAuth'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function Tasks() {
  const { user, loading } = useTelegramAuth()
  const [tasks, setTasks] = useState([])
  const [loadingTasks, setLoadingTasks] = useState(true)
  const [activeTask, setActiveTask] = useState(null)
  const [submissionUrl, setSubmissionUrl] = useState('')

  useEffect(() => {
    if (user) {
      fetchTasks()
    }
  }, [user])

  const fetchTasks = async () => {
    try {
      const { data: availableTasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Check which tasks user has already taken
      const { data: userTasks } = await supabase
        .from('user_tasks')
        .select('task_id, status')
        .eq('user_id', user.id)

      const tasksWithStatus = availableTasks.map(task => {
        const userTask = userTasks?.find(ut => ut.task_id === task.id)
        return {
          ...task,
          userStatus: userTask?.status || 'available',
          userTaskId: userTask?.id
        }
      })

      setTasks(tasksWithStatus)
    } catch (error) {
      console.error('Error fetching tasks:', error)
      toast.error('Failed to load tasks')
    } finally {
      setLoadingTasks(false)
    }
  }

  const startTask = async (task) => {
    try {
      const { data, error } = await supabase
        .from('user_tasks')
        .insert([{
          user_id: user.id,
          task_id: task.id,
          amount: task.amount,
          status: 'in_progress'
        }])
        .select()
        .single()

      if (error) throw error

      setActiveTask({ ...task, userTaskId: data.id })
      toast.success('Task started! Complete the requirements and submit proof.')
    } catch (error) {
      console.error('Error starting task:', error)
      toast.error('Failed to start task')
    }
  }

  const submitTask = async () => {
    if (!submissionUrl.trim()) {
      toast.error('Please provide submission URL or proof')
      return
    }

    try {
      const { error } = await supabase
        .from('user_tasks')
        .update({
          status: 'pending',
          submitted_url: submissionUrl,
          submitted_at: new Date().toISOString()
        })
        .eq('id', activeTask.userTaskId)

      if (error) throw error

      toast.success('Task submitted for review!')
      setActiveTask(null)
      setSubmissionUrl('')
      fetchTasks()
    } catch (error) {
      console.error('Error submitting task:', error)
      toast.error('Failed to submit task')
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <Layout user={user} loading={loading} title="Available Tasks">
      {/* Task Submission Modal */}
      {activeTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Submit Task</h3>
              <button
                onClick={() => setActiveTask(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <div className="mb-4">
              <h4 className="font-medium text-gray-900">{activeTask.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{activeTask.description}</p>
              <p className="text-green-600 font-semibold mt-2">Reward: ৳{activeTask.amount}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Submission URL or Proof
              </label>
              <input
                type="text"
                value={submissionUrl}
                onChange={(e) => setSubmissionUrl(e.target.value)}
                placeholder="Enter the URL or describe your completion proof"
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setActiveTask(null)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4"
              >
                Cancel
              </button>
              <button
                onClick={submitTask}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4"
              >
                Submit Task
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Available Tasks</h1>
        <p className="text-gray-600">Complete tasks and earn money</p>
      </div>

      {loadingTasks ? (
        <div className="flex justify-center py-8">
          <div className="loading-spinner w-8 h-8"></div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-8">
          <i className="ri-task-line text-4xl text-gray-400 mb-4"></i>
          <p className="text-gray-500">No tasks available at the moment</p>
          <p className="text-sm text-gray-400">Check back later for new tasks</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {tasks.map((task) => (
            <div key={task.id} className="bg-white p-6 shadow-sm border-0">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                  <p className="text-gray-600 mt-1">{task.description}</p>
                  
                  {task.required_actions && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-700">Requirements:</p>
                      <p className="text-sm text-gray-600">{task.required_actions}</p>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">৳{task.amount}</div>
                  <div className="text-sm text-gray-500">
                    Slots: {task.completed_slots}/{task.total_slots || '∞'}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  {task.task_url && (
                    <a 
                      href={task.task_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700"
                    >
                      <i className="ri-external-link-line mr-1"></i>
                      Visit Task
                    </a>
                  )}
                </div>

                <div>
                  {task.userStatus === 'available' && (
                    <button
                      onClick={() => startTask(task)}
                      className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4"
                    >
                      Start Task
                    </button>
                  )}
                  {task.userStatus === 'in_progress' && (
                    <button
                      onClick={() => setActiveTask(task)}
                      className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4"
                    >
                      Submit Proof
                    </button>
                  )}
                  {task.userStatus === 'pending' && (
                    <span className="bg-yellow-100 text-yellow-800 font-medium py-2 px-4">
                      Under Review
                    </span>
                  )}
                  {task.userStatus === 'completed' && (
                    <span className="bg-green-100 text-green-800 font-medium py-2 px-4">
                      Completed
                    </span>
                  )}
                  {task.userStatus === 'rejected' && (
                    <span className="bg-red-100 text-red-800 font-medium py-2 px-4">
                      Rejected
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}
