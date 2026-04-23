import React from 'react'
import { Avatar, Box, Button, Card, CardContent, IconButton, InputBase, Stack, Typography } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import AddIcon from '@mui/icons-material/Add'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded'
import BlockRoundedIcon from '@mui/icons-material/BlockRounded'
import { tasksApi } from '../../js/api/tasksApi.js'
import { toApiError } from '../../js/api/response.js'

const STATUS_ORDER = ['todo', 'in_progress', 'done', 'cancelled']

const STATUS_META = {
  todo: { title: 'To Do', progress: 15 },
  in_progress: { title: 'In Progress', progress: 65 },
  done: { title: 'Done', progress: 100 },
  cancelled: { title: 'Cancelled', progress: 100, muted: true },
}

const PRIORITY_META = {
  low: { label: 'Low Priority', bg: '#e0f2fe', color: '#0c4a6e' },
  medium: { label: 'Medium Priority', bg: '#e2e8f0', color: '#334155' },
  high: { label: 'High Priority', bg: '#ffedd5', color: '#9a3412' },
  urgent: { label: 'Urgent', bg: '#fee2e2', color: '#b91c1c' },
}

const formatDate = (value) => {
  if (!value) {
    return 'No deadline'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'No deadline'
  }

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const displayName = (user) => user?.display_name || user?.username || 'Unassigned'

const getInitial = (name) => (name || 'U').trim().slice(0, 1).toUpperCase()

const nextActionForStatus = (status) => {
  if (status === 'todo') {
    return { label: 'Start', icon: <PlayArrowRoundedIcon fontSize="small" />, next: 'in_progress' }
  }

  if (status === 'in_progress') {
    return { label: 'Mark done', icon: <CheckCircleRoundedIcon fontSize="small" />, next: 'done' }
  }

  return { label: 'Reopen', icon: <ReplayRoundedIcon fontSize="small" />, next: 'todo' }
}

export default function TaskPage() {
  const [query, setQuery] = React.useState('')
  const [tasks, setTasks] = React.useState([])
  const [total, setTotal] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [savingTaskId, setSavingTaskId] = React.useState(null)
  const [error, setError] = React.useState('')

  const fetchTasks = React.useCallback(async (searchValue = '') => {
    try {
      setLoading(true)
      setError('')
      const data = await tasksApi.list({
        q: searchValue || undefined,
        per_page: 100,
      })

      setTasks(Array.isArray(data?.items) ? data.items : [])
      setTotal(Number(data?.meta?.total || 0))
    } catch (rawError) {
      const apiError = toApiError(rawError, 'Could not fetch tasks')
      setError(apiError.message)
      setTasks([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchTasks(query.trim())
    }, 250)

    return () => {
      window.clearTimeout(timer)
    }
  }, [fetchTasks, query])

  const columns = React.useMemo(
    () =>
      STATUS_ORDER.map((status) => ({
        key: status,
        title: STATUS_META[status].title,
        muted: Boolean(STATUS_META[status].muted),
        cards: tasks.filter((task) => task.status === status),
      })),
    [tasks],
  )

  const handleStatusUpdate = async (taskId, nextStatus) => {
    try {
      setSavingTaskId(taskId)
      setError('')
      const updated = await tasksApi.update(taskId, { status: nextStatus })
      setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, ...updated } : task)))
    } catch (rawError) {
      const apiError = toApiError(rawError, 'Could not update task')
      setError(apiError.message)
    } finally {
      setSavingTaskId(null)
    }
  }

  const handleDelete = async (taskId) => {
    const shouldDelete = window.confirm('Delete this task?')
    if (!shouldDelete) {
      return
    }

    try {
      setSavingTaskId(taskId)
      setError('')
      await tasksApi.destroy(taskId)
      setTasks((prev) => prev.filter((task) => task.id !== taskId))
      setTotal((prev) => Math.max(0, prev - 1))
    } catch (rawError) {
      const apiError = toApiError(rawError, 'Could not delete task')
      setError(apiError.message)
    } finally {
      setSavingTaskId(null)
    }
  }

  return (
    <Box sx={{ minHeight: 'calc(100dvh - 64px)', bgcolor: '#f8f9fb' }}>
      <Box sx={{ position: 'sticky', top: 64, zIndex: 20, px: 3, py: 1.5, backdropFilter: 'blur(10px)', bgcolor: 'rgba(248,249,251,0.92)', borderBottom: '1px solid #e2e8f0' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1.5}>
          <Typography sx={{ fontSize: 32, fontWeight: 900, color: '#0f172a', lineHeight: 1.05 }}>Task Board</Typography>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Stack direction="row" alignItems="center" sx={{ px: 1.2, py: 0.4, bgcolor: '#eef2f7', borderRadius: 999 }}>
              <SearchIcon sx={{ color: '#64748b', fontSize: 18 }} />
              <InputBase
                placeholder="Search tasks..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                sx={{ ml: 0.8, width: 220, fontSize: 13 }}
              />
            </Stack>
            <Button
              variant="contained"
              onClick={() => {
                window.location.href = '/tasks/new'
              }}
              startIcon={<AddIcon />}
              sx={{ textTransform: 'none', px: 2.2, py: 1, borderRadius: 2, background: 'linear-gradient(135deg, #2563eb, #60a5fa)' }}
            >
              Create Task
            </Button>
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ px: 3, py: 2 }}>
        
        <Typography sx={{ mt: 0.6, fontSize: 13, color: '#64748b' }}>{total} total tasks</Typography>

        {error ? (
          <Box sx={{ mt: 2, px: 1.5, py: 1, borderRadius: 1.5, bgcolor: '#fee2e2', color: '#991b1b', fontSize: 13, fontWeight: 600 }}>
            {error}
          </Box>
        ) : null}

        <Box sx={{ mt: 2.5, overflowX: 'auto' }}>
          <Stack direction="row" spacing={2.2} sx={{ minWidth: 'max-content', pb: 2 }}>
            {columns.map((column) => (
              <Box key={column.key} sx={{ width: 320, opacity: column.muted ? 0.75 : 1, filter: column.muted ? 'grayscale(0.2)' : 'none' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 0.6, mb: 1 }}>
                  <Stack direction="row" spacing={0.8} alignItems="center">
                    <Typography sx={{ fontWeight: 800, color: '#0f172a' }}>{column.title}</Typography>
                    <Box sx={{ px: 0.9, py: 0.2, bgcolor: '#e2e8f0', borderRadius: 999, fontSize: 10, fontWeight: 700, color: '#475569' }}>{column.cards.length}</Box>
                  </Stack>
                  <IconButton size="small">
                    <MoreHorizIcon fontSize="small" />
                  </IconButton>
                </Stack>

                <Stack spacing={1.2}>
                  {loading ? (
                    <Card sx={{ p: 1.2 }}>
                      <Typography sx={{ fontSize: 13, color: '#64748b' }}>Loading...</Typography>
                    </Card>
                  ) : null}

                  {!loading && column.cards.length === 0 ? (
                    <Card sx={{ p: 1.2 }}>
                      <Typography sx={{ fontSize: 13, color: '#64748b' }}>No tasks</Typography>
                    </Card>
                  ) : null}

                  {column.cards.map((task) => {
                    const priority = PRIORITY_META[task.priority] || PRIORITY_META.medium
                    const action = nextActionForStatus(task.status)
                    const assigneeName = displayName(task.assignee)
                    const progress = STATUS_META[task.status]?.progress || 0

                    return (
                      <Card key={task.id} sx={{ p: 0.8, boxShadow: '0 8px 20px -8px rgba(0,0,0,0.12)' }}>
                        <CardContent sx={{ p: '12px !important' }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                            <Box sx={{ px: 1, py: 0.4, bgcolor: priority.bg, color: priority.color, borderRadius: 1, fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}>
                              {priority.label}
                            </Box>
                            <IconButton size="small" onClick={() => handleDelete(task.id)} disabled={savingTaskId === task.id}>
                              <DeleteOutlineIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
                            </IconButton>
                          </Stack>

                          <Typography sx={{ fontSize: 14, fontWeight: 700, color: progress === 100 ? '#64748b' : '#0f172a', textDecoration: task.status === 'done' ? 'line-through' : 'none' }}>
                            {task.title}
                          </Typography>

                          <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1.3 }}>
                            <Box sx={{ flex: 1, height: 6, bgcolor: '#e2e8f0', borderRadius: 999, overflow: 'hidden' }}>
                              <Box sx={{ width: `${progress}%`, height: '100%', bgcolor: progress === 100 ? '#94a3b8' : '#3b82f6' }} />
                            </Box>
                            <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#64748b' }}>{progress}%</Typography>
                          </Stack>

                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1.3 }}>
                            <Stack direction="row" spacing={0.6} alignItems="center" sx={{ color: '#64748b' }}>
                              <CalendarTodayIcon sx={{ fontSize: 14 }} />
                              <Typography sx={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>{formatDate(task.due_at)}</Typography>
                            </Stack>

                            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: '#64748b' }}>
                              <Avatar src={task.assignee?.avatar_url || undefined} sx={{ width: 20, height: 20, fontSize: 10 }}>
                                {getInitial(assigneeName)}
                              </Avatar>
                              <Typography sx={{ fontSize: 10, fontWeight: 700, maxWidth: 92 }} noWrap>
                                {assigneeName}
                              </Typography>
                            </Stack>
                          </Stack>

                          <Stack direction="row" spacing={0.8} sx={{ mt: 1.3 }}>
                            <Button
                              size="small"
                              variant="contained"
                              disabled={savingTaskId === task.id}
                              onClick={() => handleStatusUpdate(task.id, action.next)}
                              startIcon={action.icon}
                              sx={{ textTransform: 'none', fontSize: 11, py: 0.3, px: 1.1 }}
                            >
                              {action.label}
                            </Button>

                            {task.status !== 'cancelled' ? (
                              <Button
                                size="small"
                                variant="text"
                                disabled={savingTaskId === task.id}
                                onClick={() => handleStatusUpdate(task.id, 'cancelled')}
                                startIcon={<BlockRoundedIcon sx={{ fontSize: 14 }} />}
                                sx={{ textTransform: 'none', color: '#64748b', fontSize: 11, py: 0.3, px: 0.9 }}
                              >
                                Cancel
                              </Button>
                            ) : null}
                          </Stack>
                        </CardContent>
                      </Card>
                    )
                  })}
                </Stack>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>
    </Box>
  )
}
