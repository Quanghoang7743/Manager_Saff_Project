import React from 'react'
import { attendanceApi } from '../../js/api/attendanceApi.js'
import { employeesApi } from '../../js/api/employeesApi.js'
import { tasksApi } from '../../js/api/tasksApi.js'
import { toApiError } from '../../js/api/response.js'
import { useAuth } from '../../js/context/AuthContext.jsx'

const MANAGE_ROLES = new Set(['super_admin', 'hr_admin', 'manager'])

const monthRange = () => {
  const now = new Date()
  const from = new Date(now.getFullYear(), now.getMonth(), 1)
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  }
}

const formatDate = (value) => {
  if (!value) {
    return 'No due date'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'No due date'
  }

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const isDueSoon = (value) => {
  if (!value) {
    return false
  }

  const due = new Date(value)
  if (Number.isNaN(due.getTime())) {
    return false
  }

  const now = new Date()
  const diffDays = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  return diffDays >= 0 && diffDays <= 7
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [stats, setStats] = React.useState({
    totalEmployees: 0,
    leaveEmployees: 0,
    openTasks: 0,
    doneTasks: 0,
    myTasks: 0,
    myInProgress: 0,
    myDueSoon: 0,
    myDone: 0,
    attendanceHealth: '0%',
    statusCounts: { todo: 0, in_progress: 0, done: 0, cancelled: 0 },
  })
  const [recentTasks, setRecentTasks] = React.useState([])

  const isManageRole = MANAGE_ROLES.has(user?.role)

  React.useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true)
        setError('')

        const { from, to } = monthRange()

        if (isManageRole) {
          const [employeesTotal, employeesLeave, todoData, progressData, doneData, cancelledData, taskFeed, reportData] = await Promise.all([
            employeesApi.list({ per_page: 1 }),
            employeesApi.list({ employment_status: 'leave', per_page: 1 }),
            tasksApi.list({ status: 'todo', per_page: 1 }),
            tasksApi.list({ status: 'in_progress', per_page: 1 }),
            tasksApi.list({ status: 'done', per_page: 1 }),
            tasksApi.list({ status: 'cancelled', per_page: 1 }),
            tasksApi.list({ per_page: 8 }),
            attendanceApi.report({ from, to }),
          ])

          const todoCount = Number(todoData?.meta?.total || 0)
          const inProgressCount = Number(progressData?.meta?.total || 0)
          const doneCount = Number(doneData?.meta?.total || 0)
          const cancelledCount = Number(cancelledData?.meta?.total || 0)

          const reportRows = Array.isArray(reportData?.summary) ? reportData.summary : []
          const totalWorkDays = reportRows.reduce((sum, row) => sum + Number(row.work_days || 0), 0)
          const totalLateDays = reportRows.reduce((sum, row) => sum + Number(row.late_days || 0), 0)
          const attendanceHealth = totalWorkDays > 0 ? `${Math.max(0, Math.round(((totalWorkDays - totalLateDays) / totalWorkDays) * 100))}%` : '0%'

          setStats({
            totalEmployees: Number(employeesTotal?.meta?.total || 0),
            leaveEmployees: Number(employeesLeave?.meta?.total || 0),
            openTasks: todoCount + inProgressCount,
            doneTasks: doneCount,
            myTasks: 0,
            myInProgress: 0,
            myDueSoon: 0,
            myDone: 0,
            attendanceHealth,
            statusCounts: {
              todo: todoCount,
              in_progress: inProgressCount,
              done: doneCount,
              cancelled: cancelledCount,
            },
          })

          setRecentTasks(Array.isArray(taskFeed?.items) ? taskFeed.items : [])
          return
        }

        const [myTasksData, myLogs] = await Promise.all([
          tasksApi.list({ per_page: 100 }),
          attendanceApi.myLogs({ from, to }),
        ])

        const taskItems = Array.isArray(myTasksData?.items) ? myTasksData.items : []
        const inProgressCount = taskItems.filter((task) => task.status === 'in_progress').length
        const doneCount = taskItems.filter((task) => task.status === 'done').length
        const dueSoonCount = taskItems.filter((task) => isDueSoon(task.due_at)).length

        const logItems = Array.isArray(myLogs) ? myLogs : []
        const onTimeDays = logItems.filter((log) => Number(log.late_minutes || 0) === 0 && log.check_in_at && log.check_out_at).length
        const completeDays = logItems.filter((log) => log.check_in_at && log.check_out_at).length
        const attendanceHealth = completeDays > 0 ? `${Math.round((onTimeDays / completeDays) * 100)}%` : '0%'

        setStats({
          totalEmployees: 0,
          leaveEmployees: 0,
          openTasks: 0,
          doneTasks: 0,
          myTasks: taskItems.length,
          myInProgress: inProgressCount,
          myDueSoon: dueSoonCount,
          myDone: doneCount,
          attendanceHealth,
          statusCounts: {
            todo: taskItems.filter((task) => task.status === 'todo').length,
            in_progress: inProgressCount,
            done: doneCount,
            cancelled: taskItems.filter((task) => task.status === 'cancelled').length,
          },
        })
        setRecentTasks(taskItems.slice(0, 8))
      } catch (rawError) {
        const apiError = toApiError(rawError, 'Could not fetch dashboard data')
        setError(apiError.message)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [isManageRole])

  const chartMax = Math.max(1, ...Object.values(stats.statusCounts))

  const chartData = [
    { key: 'todo', label: 'To Do', value: stats.statusCounts.todo },
    { key: 'in_progress', label: 'In Progress', value: stats.statusCounts.in_progress },
    { key: 'done', label: 'Done', value: stats.statusCounts.done },
    { key: 'cancelled', label: 'Cancelled', value: stats.statusCounts.cancelled },
  ]

  const deadlineTasks = recentTasks
    .filter((task) => task.due_at)
    .sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime())
    .slice(0, 5)

  return (
    <main className="max-w-7xl mx-auto min-h-screen">
      <div className="p-8 space-y-8">
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-surface-container-lowest p-6 rounded-xl border-l-4 border-primary">
            <p className="text-sm font-medium text-on-surface-variant/70 mb-1 uppercase tracking-widest">
              {isManageRole ? 'Total Employees' : 'My Tasks'}
            </p>
            <h3 className="text-4xl font-black text-on-surface tracking-tighter">{loading ? '...' : isManageRole ? stats.totalEmployees : stats.myTasks}</h3>
          </div>

          <div className="bg-surface-container-lowest p-6 rounded-xl border-l-4 border-secondary-container">
            <p className="text-sm font-medium text-on-surface-variant/70 mb-1 uppercase tracking-widest">
              {isManageRole ? 'On Leave' : 'In Progress'}
            </p>
            <h3 className="text-4xl font-bold text-on-surface tracking-tight">{loading ? '...' : isManageRole ? stats.leaveEmployees : stats.myInProgress}</h3>
          </div>

          <div className="bg-surface-container-lowest p-6 rounded-xl border-l-4 border-tertiary-fixed">
            <p className="text-sm font-medium text-on-surface-variant/70 mb-1 uppercase tracking-widest">
              {isManageRole ? 'Open Tasks' : 'Due Soon'}
            </p>
            <h3 className="text-4xl font-bold text-on-surface tracking-tight">{loading ? '...' : isManageRole ? stats.openTasks : stats.myDueSoon}</h3>
          </div>

          <div className="bg-surface-container-lowest p-6 rounded-xl border-l-4 border-error-container">
            <p className="text-sm font-medium text-on-surface-variant/70 mb-1 uppercase tracking-widest">
              {isManageRole ? 'Completed Tasks' : 'My Done Tasks'}
            </p>
            <h3 className="text-4xl font-bold text-on-surface tracking-tight">{loading ? '...' : isManageRole ? stats.doneTasks : stats.myDone}</h3>
          </div>
        </section>

        {error ? (
          <section className="bg-error-container text-on-error-container rounded-xl px-5 py-4 text-sm font-semibold">
            {error}
          </section>
        ) : null}

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-xl">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h4 className="text-lg font-bold text-on-surface">Task Pipeline</h4>
                <p className="text-xs text-on-surface-variant/60">Real-time count by task status</p>
              </div>
            </div>

            <div className="h-64 flex items-end justify-between gap-4">
              {chartData.map((item) => {
                const height = `${Math.max(10, Math.round((item.value / chartMax) * 100))}%`
                return (
                  <div key={item.key} className="flex-1 flex flex-col items-center gap-3">
                    <div className="w-full bg-primary/20 rounded-t-lg relative" style={{ height }}>
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold">{item.value}</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant/50">{item.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-surface-container-lowest p-8 rounded-xl flex flex-col justify-between">
            <div>
              <h4 className="text-lg font-bold text-on-surface">Attendance Health</h4>
              <p className="text-xs text-on-surface-variant/60">On-time attendance score this month</p>
            </div>
            <div className="py-8 text-center">
              <p className="text-5xl font-black text-primary">{loading ? '...' : stats.attendanceHealth}</p>
            </div>
            <p className="text-xs text-on-surface-variant/70">Calculated from monthly attendance logs and late-day ratio.</p>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-xl">
            <h4 className="text-lg font-bold text-on-surface mb-6">Recent Tasks</h4>
            <div className="space-y-4">
              {loading ? <p className="text-sm text-on-surface-variant">Loading tasks...</p> : null}
              {!loading && recentTasks.length === 0 ? <p className="text-sm text-on-surface-variant">No recent tasks.</p> : null}
              {!loading
                ? recentTasks.map((task) => (
                    <div key={task.id} className="flex items-start justify-between gap-4 border-b border-outline-variant/10 pb-4 last:border-b-0">
                      <div>
                        <p className="text-sm font-semibold text-on-surface">{task.title}</p>
                        <p className="text-xs text-on-surface-variant mt-1">
                          {task.status} • {task.priority} priority
                        </p>
                      </div>
                      <span className="text-xs font-bold text-on-surface-variant/60">{formatDate(task.due_at)}</span>
                    </div>
                  ))
                : null}
            </div>
          </div>

          <div className="bg-surface-container-lowest p-8 rounded-xl">
            <h4 className="text-lg font-bold text-on-surface mb-6">Upcoming Deadlines</h4>
            <div className="space-y-3">
              {loading ? <p className="text-sm text-on-surface-variant">Loading deadlines...</p> : null}
              {!loading && deadlineTasks.length === 0 ? <p className="text-sm text-on-surface-variant">No upcoming deadlines.</p> : null}
              {!loading
                ? deadlineTasks.map((task) => (
                    <div key={task.id} className="bg-surface-container-low p-3 rounded-lg">
                      <p className="text-sm font-bold text-on-surface">{task.title}</p>
                      <p className="text-[11px] text-on-surface-variant mt-1">Due {formatDate(task.due_at)}</p>
                    </div>
                  ))
                : null}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
