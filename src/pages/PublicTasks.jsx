import { useState, useEffect } from 'react'
import { Calendar, FileText, Clock } from 'lucide-react'
import { tasksService } from '../supabase/dataService'

const PublicTasks = () => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState('')

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    setLoading(true)
    setError('')

    try {
      const tasksData = await tasksService.getAll()
      setTasks(tasksData)
    } catch (loadError) {
      console.error('Error loading tasks:', loadError)
      setTasks([])
      setError('Supabase not configured or tasks table is missing. Please update .env and table setup.')
    } finally {
      setLoading(false)
    }
  }

  const getTaskStatus = (dueDate) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const due = new Date(dueDate)
    due.setHours(0, 0, 0, 0)

    if (due < today) return 'overdue'
    if (due.getTime() === today.getTime()) return 'today'
    return 'upcoming'
  }

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'all') return true
    const status = getTaskStatus(task.dueDate)
    if (filter === 'upcoming') return status === 'upcoming' || status === 'today'
    if (filter === 'overdue') return status === 'overdue'
    return true
  })

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Student Tasks</h1>
        <p className="mt-2 text-gray-600">View all assignments and their due dates</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded">
          <p className="font-medium">{error}</p>
        </div>
      )}

      <div className="card mb-8">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'upcoming'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('overdue')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'overdue'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Overdue
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="card text-center py-12 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No tasks available at this time.</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const status = getTaskStatus(task.dueDate)
            const statusConfig = {
              overdue: { className: 'bg-red-100 text-red-800', label: 'Overdue' },
              today: { className: 'bg-yellow-100 text-yellow-800', label: 'Due Today' },
              upcoming: { className: 'bg-green-100 text-green-800', label: 'Upcoming' }
            }[status]

            return (
              <div key={task.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="bg-primary-100 p-2 rounded-lg">
                        <FileText className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                          {task.title}
                        </h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.className}`}>
                          <Clock className="w-3 h-3" />
                          {statusConfig.label}
                        </span>
                      </div>
                    </div>

                    {task.description && (
                      <p className="text-gray-600 mb-3 ml-11">{task.description}</p>
                    )}

                    <div className="flex items-center gap-2 text-sm text-gray-500 ml-11">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Due: {new Date(task.dueDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default PublicTasks
