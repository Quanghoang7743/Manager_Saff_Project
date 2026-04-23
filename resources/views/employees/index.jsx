import React from 'react'
import { departmentsApi } from '../../js/api/departmentsApi.js'
import { employeesApi } from '../../js/api/employeesApi.js'
import { toApiError } from '../../js/api/response.js'

const EMPLOYMENT_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'probation', label: 'Probation' },
  { value: 'leave', label: 'On Leave' },
  { value: 'resigned', label: 'Resigned' },
]

const STATUS_STYLES = {
  active: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  probation: 'bg-primary-container text-on-primary-container',
  leave: 'bg-secondary-container text-on-secondary-container',
  resigned: 'bg-error-container text-on-error-container',
}

const formatDate = (value) => {
  if (!value) {
    return 'N/A'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'N/A'
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const getInitial = (value) => (value || 'U').trim().slice(0, 1).toUpperCase()

const prettyEmploymentStatus = (status) => {
  if (!status) {
    return 'UNKNOWN'
  }

  return status.replace('_', ' ').toUpperCase()
}

const pageItems = (currentPage, lastPage) => {
  if (lastPage <= 1) {
    return [1]
  }

  const pages = new Set([1, lastPage, currentPage - 1, currentPage, currentPage + 1])

  return Array.from(pages)
    .filter((item) => item >= 1 && item <= lastPage)
    .sort((a, b) => a - b)
}

export default function EmployeesPage() {
  const [searchInput, setSearchInput] = React.useState('')
  const [debouncedQuery, setDebouncedQuery] = React.useState('')
  const [departmentId, setDepartmentId] = React.useState('all')
  const [employmentStatus, setEmploymentStatus] = React.useState('all')
  const [employees, setEmployees] = React.useState([])
  const [departments, setDepartments] = React.useState([])
  const [meta, setMeta] = React.useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  })
  const [page, setPage] = React.useState(1)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [forbidden, setForbidden] = React.useState(false)

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(searchInput.trim())
      setPage(1)
    }, 300)

    return () => {
      window.clearTimeout(timer)
    }
  }, [searchInput])

  React.useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const items = await departmentsApi.list()
        setDepartments(Array.isArray(items) ? items : [])
      } catch (_error) {
        setDepartments([])
      }
    }

    fetchDepartments()
  }, [])

  React.useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true)
        setError('')
        setForbidden(false)

        const data = await employeesApi.list({
          q: debouncedQuery || undefined,
          department_id: departmentId !== 'all' ? Number(departmentId) : undefined,
          employment_status: employmentStatus !== 'all' ? employmentStatus : undefined,
          page,
          per_page: 10,
        })

        setEmployees(Array.isArray(data?.items) ? data.items : [])
        setMeta({
          current_page: Number(data?.meta?.current_page || 1),
          last_page: Number(data?.meta?.last_page || 1),
          per_page: Number(data?.meta?.per_page || 10),
          total: Number(data?.meta?.total || 0),
        })
      } catch (rawError) {
        const apiError = toApiError(rawError, 'Could not fetch employees')
        if (apiError.status === 403) {
          setForbidden(true)
        }

        setError(apiError.message)
        setEmployees([])
        setMeta({ current_page: 1, last_page: 1, per_page: 10, total: 0 })
      } finally {
        setLoading(false)
      }
    }

    fetchEmployees()
  }, [debouncedQuery, departmentId, employmentStatus, page])

  const departmentNameById = React.useMemo(() => {
    return departments.reduce((lookup, department) => {
      lookup[department.id] = department.name
      return lookup
    }, {})
  }, [departments])

  const startRow = meta.total === 0 ? 0 : (meta.current_page - 1) * meta.per_page + 1
  const endRow = meta.total === 0 ? 0 : Math.min(meta.current_page * meta.per_page, meta.total)
  const pages = pageItems(meta.current_page, meta.last_page)

  return (
    <main className="min-h-screen max-w-7xl mx-auto p-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-on-surface tracking-tight leading-none mb-2">Employee Directory</h2>
          <p className="text-on-surface-variant font-medium">Manage and view personnel records with live API data.</p>
        </div>
        <button
          className="inline-flex items-center bg-gradient-to-br from-primary to-primary-container text-on-primary px-6 py-3 rounded-lg font-semibold shadow-lg shadow-primary/20"
          onClick={() => {
            window.alert('Create employee form will be added next.')
          }}
        >
          <span className="material-symbols-outlined mr-2" data-icon="person_add">person_add</span>
          Add New Employee
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="md:col-span-2 bg-surface-container-low rounded-xl p-4">
          <label className="text-xs font-bold text-primary tracking-widest uppercase">Search</label>
          <input
            className="mt-2 w-full bg-surface-container-highest border-none rounded-lg px-3 py-2 text-sm outline-none"
            placeholder="Search employees, code, email..."
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </div>

        <div className="bg-surface-container-low rounded-xl p-4">
          <label className="text-xs font-bold text-primary tracking-widest uppercase">Department</label>
          <select
            className="mt-2 w-full bg-surface-container-highest border-none rounded-lg px-3 py-2 text-sm outline-none"
            value={departmentId}
            onChange={(event) => {
              setDepartmentId(event.target.value)
              setPage(1)
            }}
          >
            <option value="all">All Departments</option>
            {departments.map((department) => (
              <option key={department.id} value={String(department.id)}>
                {department.name}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-surface-container-low rounded-xl p-4">
          <label className="text-xs font-bold text-primary tracking-widest uppercase">Employment</label>
          <select
            className="mt-2 w-full bg-surface-container-highest border-none rounded-lg px-3 py-2 text-sm outline-none"
            value={employmentStatus}
            onChange={(event) => {
              setEmploymentStatus(event.target.value)
              setPage(1)
            }}
          >
            {EMPLOYMENT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-6">
        <button
          className="inline-flex items-center px-4 py-2 rounded-lg bg-surface-container-low text-sm font-semibold"
          onClick={() => {
            setSearchInput('')
            setDebouncedQuery('')
            setDepartmentId('all')
            setEmploymentStatus('all')
            setPage(1)
          }}
        >
          <span className="material-symbols-outlined mr-2" data-icon="restart_alt">restart_alt</span>
          Reset Filters
        </button>
      </div>

      {error ? (
        <div className="mb-6 rounded-lg px-4 py-3 bg-error-container text-on-error-container text-sm font-semibold">
          {forbidden ? 'You do not have permission to access employee directory.' : error}
        </div>
      ) : null}

      <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-left">
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-on-surface-variant">Employee</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-on-surface-variant">Department</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-on-surface-variant text-center">Status</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-on-surface-variant">Email</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-on-surface-variant">Joined</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-on-surface-variant text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {loading ? (
                <tr>
                  <td className="px-6 py-6 text-sm text-on-surface-variant" colSpan={6}>
                    Loading employees...
                  </td>
                </tr>
              ) : null}

              {!loading && employees.length === 0 ? (
                <tr>
                  <td className="px-6 py-6 text-sm text-on-surface-variant" colSpan={6}>
                    No employees found for current filters.
                  </td>
                </tr>
              ) : null}

              {!loading
                ? employees.map((employee) => {
                    const statusClass = STATUS_STYLES[employee.employment_status] || 'bg-surface-container-high text-on-surface'
                    const departmentName = departmentNameById[employee.department_id] || 'Unassigned'
                    const title = employee.employee_code || `Position #${employee.position_id || 'N/A'}`

                    return (
                      <tr key={employee.id} className="group hover:bg-surface-container-high transition-colors">
                        <td className="px-6 py-5">
                          <div className="flex items-center">
                            {employee.avatar_url ? (
                              <img alt="Employee Avatar" className="h-10 w-10 rounded-lg object-cover" src={employee.avatar_url} />
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm">
                                {getInitial(employee.display_name || employee.username)}
                              </div>
                            )}
                            <div className="ml-4">
                              <div className="font-bold text-on-surface">{employee.display_name || employee.username || 'Unknown'}</div>
                              <div className="text-xs text-on-surface-variant font-medium">{title}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-sm font-semibold px-3 py-1 bg-primary/5 text-primary rounded-full">{departmentName}</span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${statusClass}`}>
                            {prettyEmploymentStatus(employee.employment_status)}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-sm font-medium text-on-surface-variant">{employee.email || 'N/A'}</td>
                        <td className="px-6 py-5 text-sm font-medium text-on-surface-variant">{formatDate(employee.hired_at)}</td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex justify-end space-x-1">
                            <button className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors" title="View Profile">
                              <span className="material-symbols-outlined text-xl" data-icon="visibility">visibility</span>
                            </button>
                            <button className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors" title="Edit">
                              <span className="material-symbols-outlined text-xl" data-icon="edit">edit</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                : null}
            </tbody>
          </table>
        </div>

        <div className="bg-surface-container-low px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm font-medium text-on-surface-variant">
            Showing <span className="text-on-surface font-bold">{startRow}-{endRow}</span> of <span className="text-on-surface font-bold">{meta.total}</span> employees
          </div>

          <div className="flex items-center space-x-2">
            <button
              className="flex items-center justify-center h-10 w-10 rounded-lg bg-surface-container-highest text-on-surface-variant hover:bg-primary hover:text-on-primary transition-all disabled:opacity-50"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={meta.current_page <= 1}
            >
              <span className="material-symbols-outlined" data-icon="chevron_left">chevron_left</span>
            </button>

            {pages.map((pageNumber, index) => {
              const previousPage = pages[index - 1]
              const shouldShowGap = previousPage && pageNumber - previousPage > 1

              return (
                <React.Fragment key={pageNumber}>
                  {shouldShowGap ? <span className="px-1 text-on-surface-variant">...</span> : null}
                  <button
                    className={`h-10 w-10 rounded-lg transition-colors font-semibold ${
                      pageNumber === meta.current_page
                        ? 'bg-primary text-on-primary shadow-md shadow-primary/20'
                        : 'hover:bg-surface-container-highest'
                    }`}
                    onClick={() => setPage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                </React.Fragment>
              )
            })}

            <button
              className="flex items-center justify-center h-10 w-10 rounded-lg bg-surface-container-highest text-on-surface-variant hover:bg-primary hover:text-on-primary transition-all disabled:opacity-50"
              onClick={() => setPage((prev) => Math.min(meta.last_page, prev + 1))}
              disabled={meta.current_page >= meta.last_page}
            >
              <span className="material-symbols-outlined" data-icon="chevron_right">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
