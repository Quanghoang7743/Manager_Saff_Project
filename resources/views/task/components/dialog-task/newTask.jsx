import React from 'react'
import { tasksApi } from '../../../../js/api/tasksApi.js'
import { employeesApi } from '../../../../js/api/employeesApi.js'
import { toApiError } from '../../../../js/api/response.js'
import { useAuth } from '../../../../js/context/AuthContext.jsx'

const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'urgent']

const displayName = (employee) => employee?.display_name || employee?.username || `User #${employee?.id}`

export default function NewTask() {
  const { user } = useAuth()
  const [title, setTitle] = React.useState('')
  const [category, setCategory] = React.useState('Recruitment')
  const [dueDate, setDueDate] = React.useState('')
  const [priority, setPriority] = React.useState('medium')
  const [assigneeId, setAssigneeId] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [assignees, setAssignees] = React.useState([])
  const [assigneeAccessDenied, setAssigneeAccessDenied] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    const fetchAssignees = async () => {
      try {
        setAssigneeAccessDenied(false)
        const data = await employeesApi.list({ per_page: 100 })
        const items = Array.isArray(data?.items) ? data.items : []

        let merged = items
        if (user && !items.some((item) => Number(item.id) === Number(user.id))) {
          merged = [
            ...items,
            {
              id: user.id,
              display_name: user.display_name,
              username: user.username,
            },
          ]
        }

        setAssignees(merged)
        setAssigneeId((prev) => prev || String(user?.id || merged?.[0]?.id || ''))
      } catch (rawError) {
        const apiError = toApiError(rawError, 'Could not fetch assignees')
        if (apiError.status === 403) {
          setAssigneeAccessDenied(true)
          if (user?.id) {
            setAssignees([
              {
                id: user.id,
                display_name: user.display_name,
                username: user.username,
              },
            ])
            setAssigneeId(String(user.id))
          }
          return
        }

        setError(apiError.message)
      }
    }

    fetchAssignees()
  }, [user])

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!title.trim()) {
      setError('Task title is required.')
      return
    }

    try {
      setSubmitting(true)
      setError('')

      await tasksApi.create({
        title: title.trim(),
        description: description.trim() || null,
        assignee_id: assigneeId ? Number(assigneeId) : undefined,
        priority,
        due_at: dueDate || null,
        status: 'todo',
      })

      window.location.href = '/tasks'
    } catch (rawError) {
      const apiError = toApiError(rawError, 'Could not create task')
      setError(apiError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="pt-10 pb-12 px-6 md:px-12 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <nav className="flex items-center gap-2 mb-8 text-sm font-medium text-on-surface-variant">
          <span>Tasks</span>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-on-surface">Create New Task</span>
        </nav>

        <div className="bg-surface-container-lowest rounded-xl p-6 md:p-10 shadow-[0px_12px_32px_rgba(25,28,30,0.04)]">
          <div className="flex justify-between items-start mb-10 gap-4">
            <div>
              <h3 className="text-2xl font-extrabold text-on-surface tracking-tight mb-2">Create New Task</h3>
              <p className="text-on-surface-variant max-w-md">Assign a new action item to one teammate and track progress in real time.</p>
            </div>
            <div className="p-4 bg-primary-fixed rounded-xl text-primary">
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>assignment_add</span>
            </div>
          </div>

          {error ? (
            <div className="mb-6 rounded-lg px-4 py-3 bg-error-container text-on-error-container text-sm font-semibold">
              {error}
            </div>
          ) : null}

          {assigneeAccessDenied ? (
            <div className="mb-6 rounded-lg px-4 py-3 bg-surface-container-high text-sm font-semibold text-on-surface">
              You do not have permission to load employee list. Task will be assigned to yourself.
            </div>
          ) : null}

          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-2">
                Task Title <span className="text-error">*</span>
              </label>
              <input
                className="w-full px-4 py-4 bg-surface-container-highest border-none rounded-lg focus:ring-2 focus:ring-primary transition-all text-lg font-medium placeholder:text-outline/50"
                placeholder="e.g. Q4 Recruitment Strategy Review"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Project / Category</label>
                <select
                  className="w-full px-4 py-3 bg-surface-container-highest border-none rounded-lg appearance-none"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                >
                  <option>Recruitment</option>
                  <option>Payroll</option>
                  <option>Onboarding</option>
                  <option>Internal Training</option>
                  <option>Employee Benefits</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Due Date</label>
                <input
                  className="w-full px-4 py-3 bg-surface-container-highest border-none rounded-lg"
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Priority Level</label>
                <select
                  className="w-full px-4 py-3 bg-surface-container-highest border-none rounded-lg"
                  value={priority}
                  onChange={(event) => setPriority(event.target.value)}
                >
                  {PRIORITY_OPTIONS.map((item) => (
                    <option key={item} value={item}>{item.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Assign To</label>
              <select
                className="w-full px-4 py-3 bg-surface-container-highest border-none rounded-lg"
                value={assigneeId}
                onChange={(event) => setAssigneeId(event.target.value)}
              >
                {assignees.map((employee) => (
                  <option key={employee.id} value={String(employee.id)}>
                    {displayName(employee)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Description</label>
              <textarea
                className="w-full p-4 bg-surface-container-highest border-none rounded-lg text-sm leading-relaxed placeholder:text-outline/50"
                placeholder="Provide details about the task, expectations, and any helpful context..."
                rows={6}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>

            <div className="pt-4 flex items-center justify-end gap-4">
              <button
                className="px-8 py-3 rounded-lg text-secondary font-bold text-sm hover:bg-surface-container-high transition-all"
                type="button"
                onClick={() => {
                  window.location.href = '/tasks'
                }}
              >
                Cancel
              </button>
              <button
                className="px-10 py-3 rounded-lg btn-gradient text-white font-bold text-sm shadow-lg shadow-primary/20 disabled:opacity-60"
                type="submit"
                disabled={submitting}
              >
                {submitting ? 'Creating...' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
