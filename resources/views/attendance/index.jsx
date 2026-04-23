import React from 'react'
import { attendanceApi } from '../../js/api/attendanceApi.js'
import { departmentsApi } from '../../js/api/departmentsApi.js'
import { employeesApi } from '../../js/api/employeesApi.js'
import { toApiError } from '../../js/api/response.js'
import { useAuth } from '../../js/context/AuthContext.jsx'

const MANAGE_ROLES = new Set(['super_admin', 'hr_admin', 'manager'])

const statusMeta = {
  on_time: {
    label: 'On-time',
    className: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  },
  late: {
    label: 'Late',
    className: 'bg-secondary-container text-on-secondary-container',
  },
  absent: {
    label: 'Absent',
    className: 'bg-error-container text-on-error-container',
  },
  checked_in: {
    label: 'Checked-in',
    className: 'bg-primary-container text-on-primary-container',
  },
}

const getToday = () => new Date().toISOString().slice(0, 10)

const formatDisplayDate = (dateValue) => {
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) {
    return dateValue
  }

  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

const formatTime = (dateValue) => {
  if (!dateValue) {
    return '—'
  }

  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const deriveStatus = (log) => {
  if (!log?.check_in_at) {
    return 'absent'
  }

  if (!log?.check_out_at) {
    return 'checked_in'
  }

  if (Number(log?.late_minutes || 0) > 0) {
    return 'late'
  }

  return 'on_time'
}

const toHours = (minutes) => `${(Number(minutes || 0) / 60).toFixed(1)}h`

const toPercent = (value, total) => {
  if (!total) {
    return '0%'
  }

  return `${Math.round((value / total) * 100)}%`
}

const getInitial = (value) => (value || 'U').trim().slice(0, 1).toUpperCase()

export default function AttendancePage() {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = React.useState(getToday)
  const [selectedDepartment, setSelectedDepartment] = React.useState('all')
  const [selectedStatus, setSelectedStatus] = React.useState('all')
  const [logs, setLogs] = React.useState([])
  const [departments, setDepartments] = React.useState([])
  const [teamSummary, setTeamSummary] = React.useState([])
  const [notice, setNotice] = React.useState('')
  const [loading, setLoading] = React.useState(true)
  const [actionLoading, setActionLoading] = React.useState(false)

  const isManageRole = MANAGE_ROLES.has(user?.role)

  const loadAttendanceData = React.useCallback(async () => {
    try {
      setLoading(true)
      setNotice('')

      const [logsData, departmentsData, employeesData, reportData] = await Promise.all([
        isManageRole
          ? attendanceApi.teamLogs({ from: selectedDate, to: selectedDate })
          : attendanceApi.myLogs({ from: selectedDate, to: selectedDate }),
        isManageRole ? departmentsApi.list() : Promise.resolve([]),
        isManageRole ? employeesApi.list({ per_page: 100 }) : Promise.resolve({ items: [] }),
        isManageRole ? attendanceApi.report({ from: selectedDate, to: selectedDate }) : Promise.resolve(null),
      ])

      const employeeItems = Array.isArray(employeesData?.items) ? employeesData.items : []
      const departmentByUserId = employeeItems.reduce((lookup, employee) => {
        lookup[employee.id] = employee.department_id || null
        return lookup
      }, {})

      const logItems = Array.isArray(logsData) ? logsData : []
      const mappedLogs = logItems.map((log) => {
        const currentUser = log.user || user || {}
        const status = deriveStatus(log)

        return {
          id: log.id,
          userId: currentUser.id || log.user_id,
          displayName: currentUser.display_name || currentUser.username || 'Unknown User',
          avatarUrl: currentUser.avatar_url || '',
          departmentId: currentUser.department_id || departmentByUserId[log.user_id] || user?.department_id || null,
          shiftName: log.assignment?.shift?.name || 'Unassigned shift',
          checkInAt: log.check_in_at,
          checkOutAt: log.check_out_at,
          workMinutes: Number(log.work_minutes || 0),
          lateMinutes: Number(log.late_minutes || 0),
          status,
        }
      })

      setLogs(mappedLogs)
      setDepartments(Array.isArray(departmentsData) ? departmentsData : [])
      setTeamSummary(Array.isArray(reportData?.summary) ? reportData.summary : [])
    } catch (rawError) {
      const apiError = toApiError(rawError, 'Could not fetch attendance data')
      setNotice(apiError.message)
      setLogs([])
      setDepartments([])
      setTeamSummary([])
    } finally {
      setLoading(false)
    }
  }, [isManageRole, selectedDate, user])

  React.useEffect(() => {
    loadAttendanceData()
  }, [loadAttendanceData])

  const filteredLogs = React.useMemo(() => {
    return logs.filter((log) => {
      if (selectedStatus !== 'all' && log.status !== selectedStatus) {
        return false
      }

      if (selectedDepartment !== 'all' && String(log.departmentId || '') !== selectedDepartment) {
        return false
      }

      return true
    })
  }, [logs, selectedDepartment, selectedStatus])

  const stats = React.useMemo(() => {
    const onTime = filteredLogs.filter((item) => item.status === 'on_time').length
    const late = filteredLogs.filter((item) => item.status === 'late').length
    const absent = filteredLogs.filter((item) => item.status === 'absent').length

    return {
      onTime,
      late,
      absent,
      total: filteredLogs.length,
    }
  }, [filteredLogs])

  const handleManualClock = async () => {
    try {
      setActionLoading(true)
      setNotice('')
      let successMessage = ''
      const assignments = await attendanceApi.myAssignments({ from: selectedDate, to: selectedDate })
      const assignmentItems = Array.isArray(assignments) ? assignments : []
      const dayAssignments = assignmentItems.filter((item) => item.work_date === selectedDate)

      if (dayAssignments.length === 0) {
        setNotice('No shift assignment found for selected date.')
        return
      }

      const activeAssignment = dayAssignments.find((item) => item.log?.check_in_at && !item.log?.check_out_at)

      if (activeAssignment) {
        await attendanceApi.checkOut({ shift_assignment_id: activeAssignment.id })
        successMessage = 'Checked out successfully.'
      } else {
        const pendingAssignment = dayAssignments.find((item) => !item.log?.check_in_at) || dayAssignments[0]
        await attendanceApi.checkIn({ shift_assignment_id: pendingAssignment.id, check_in_method: 'manual' })
        successMessage = 'Checked in successfully.'
      }

      await loadAttendanceData()
      setNotice(successMessage)
    } catch (rawError) {
      const apiError = toApiError(rawError, 'Could not complete manual clock action')
      setNotice(apiError.message)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div>
      <main className="min-h-screen max-w-7xl mx-auto flex flex-col">
        <div className="p-8 flex-1">
          <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-on-surface tracking-tight">Daily Presence</h1>
              <p className="text-on-surface-variant text-sm mt-1">Review and manage clock-in activity for {formatDisplayDate(selectedDate)}.</p>
            </div>
            <button
              onClick={handleManualClock}
              disabled={actionLoading}
              className="bg-gradient-to-br from-[#003d9b] to-[#0052cc] text-white px-6 py-3 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg shadow-primary/20 scale-100 active:scale-95 transition-transform disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-lg" data-icon="timer">timer</span>
              {actionLoading ? 'Processing...' : 'Manual Clock-in/out'}
            </button>
          </div>

          {notice ? (
            <div className="mb-6 rounded-lg px-4 py-3 bg-surface-container-high text-sm font-semibold text-on-surface">
              {notice}
            </div>
          ) : null}

          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-8 space-y-6">
              <div className="bg-surface-container-lowest p-6 rounded-xl flex flex-wrap items-center gap-4">
                <div className="flex flex-col gap-1.5 flex-1 min-w-[160px]">
                  <label className="text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-wider px-1">Select Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(event) => setSelectedDate(event.target.value)}
                    className="bg-surface-container-high rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                <div className="flex flex-col gap-1.5 flex-1 min-w-[160px]">
                  <label className="text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-wider px-1">Department</label>
                  <select
                    value={selectedDepartment}
                    onChange={(event) => setSelectedDepartment(event.target.value)}
                    disabled={!isManageRole}
                    className="bg-surface-container-high border-none rounded-lg px-3 py-2 text-sm focus:ring-0 appearance-none cursor-pointer disabled:opacity-60"
                  >
                    <option value="all">All Departments</option>
                    {departments.map((department) => (
                      <option key={department.id} value={String(department.id)}>
                        {department.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5 flex-1 min-w-[160px]">
                  <label className="text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-wider px-1">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(event) => setSelectedStatus(event.target.value)}
                    className="bg-surface-container-high border-none rounded-lg px-3 py-2 text-sm focus:ring-0 appearance-none cursor-pointer"
                  >
                    <option value="all">All Statuses</option>
                    <option value="on_time">On-time</option>
                    <option value="late">Late</option>
                    <option value="checked_in">Checked-in</option>
                    <option value="absent">Absent</option>
                  </select>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-xl overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low">
                      <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Employee</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Clock-In</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Clock-Out</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest text-right">Total Hours</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container/50">
                    {loading ? (
                      <tr>
                        <td className="px-6 py-6 text-sm text-on-surface-variant" colSpan={5}>
                          Loading attendance data...
                        </td>
                      </tr>
                    ) : null}

                    {!loading && filteredLogs.length === 0 ? (
                      <tr>
                        <td className="px-6 py-6 text-sm text-on-surface-variant" colSpan={5}>
                          No attendance logs found for selected filters.
                        </td>
                      </tr>
                    ) : null}

                    {!loading
                      ? filteredLogs.map((row) => {
                          const currentStatus = statusMeta[row.status] || statusMeta.absent
                          return (
                            <tr key={row.id} className="hover:bg-surface-container-high transition-colors cursor-default">
                              <td className="px-6 py-5">
                                <div className="flex items-center gap-3">
                                  {row.avatarUrl ? (
                                    <img className="w-10 h-10 rounded-full object-cover" src={row.avatarUrl} alt={row.displayName} />
                                  ) : (
                                    <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-sm font-bold">
                                      {getInitial(row.displayName)}
                                    </div>
                                  )}
                                  <div>
                                    <p className="text-sm font-bold text-on-surface">{row.displayName}</p>
                                    <p className="text-[11px] text-on-surface-variant">{row.shiftName}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-5 text-sm font-medium">{formatTime(row.checkInAt)}</td>
                              <td className="px-6 py-5 text-sm font-medium">{formatTime(row.checkOutAt)}</td>
                              <td className="px-6 py-5 text-sm font-bold text-right text-primary">{toHours(row.workMinutes)}</td>
                              <td className="px-6 py-5">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${currentStatus.className}`}>
                                  {currentStatus.label}
                                </span>
                              </td>
                            </tr>
                          )
                        })
                      : null}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4 space-y-6">
              <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/10 space-y-4">
                <h3 className="text-sm font-extrabold uppercase tracking-widest">Attendance Breakdown</h3>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Perfect Attendance</span>
                  <span className="text-xs font-bold">{toPercent(stats.onTime, stats.total)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Late Entry</span>
                  <span className="text-xs font-bold">{toPercent(stats.late, stats.total)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Absences</span>
                  <span className="text-xs font-bold">{toPercent(stats.absent, stats.total)}</span>
                </div>
                <div className="pt-3 border-t border-surface-container text-xs text-on-surface-variant">
                  {stats.total} log(s) matched current filter.
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary-container to-primary rounded-xl p-6 text-white overflow-hidden relative">
                <div className="absolute -right-4 -bottom-4 opacity-10">
                  <span className="material-symbols-outlined text-[120px]" data-icon="analytics">analytics</span>
                </div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-on-primary-container mb-1">Team Snapshot</h4>
                <div className="text-3xl font-black mb-4">{teamSummary.length}</div>
                <p className="text-xs text-on-primary-container leading-relaxed">
                  {isManageRole ? 'Employees included in attendance report for selected date.' : 'Your attendance summary for selected date.'}
                </p>
                <div className="mt-6 flex items-center gap-2 text-xs font-bold">
                  <span className="material-symbols-outlined text-sm" data-icon="trending_up">trending_up</span>
                  Keep it up!
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
