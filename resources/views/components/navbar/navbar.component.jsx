import React from 'react'
import { AppBar, Avatar, Box, Button, Divider, IconButton, Stack, Tab, Tabs, Toolbar, Typography } from '@mui/material'
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded'
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded'
import { useAuth } from '../../../js/context/AuthContext.jsx'

const ADMIN_ROLES = new Set(['admin', 'super_admin', 'hr_admin', 'manager'])

const BASE_TABS = [
  { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
  { key: 'message', label: 'Message', href: '/main' },
  { key: 'attendance', label: 'Điểm danh', href: '/attendance' },
  { key: 'task', label: 'Task', href: '/tasks' },
]

const EMPLOYEE_TAB = { key: 'employees', label: 'Nhân viên', href: '/employees' }

const inferActiveTab = (tabs) => {
  const path = window.location.pathname.toLowerCase()
  const matched = tabs.find((tab) => path === tab.href || path.startsWith(`${tab.href}/`))

  if (matched) {
    return matched.key
  }

  if (path === '/' || path === '/main') {
    return 'message'
  }

  return 'dashboard'
}

export default function NavbarComponent({ role, activeTab, onChangeTab, onNavigate }) {
  const auth = useAuth()
  const user = auth?.user
  const tabs = React.useMemo(() => {
    if (ADMIN_ROLES.has(role)) {
      return [...BASE_TABS.slice(0, 3), EMPLOYEE_TAB, BASE_TABS[3]]
    }

    return BASE_TABS
  }, [role])

  const controlledValue = activeTab || inferActiveTab(tabs)

  const handleTabChange = (_event, nextTabKey) => {
    const selected = tabs.find((tab) => tab.key === nextTabKey)
    if (!selected) {
      return
    }

    onChangeTab?.(nextTabKey)

    if (onNavigate) {
      onNavigate(selected)
      return
    }

    if (window.location.pathname !== selected.href) {
      window.location.href = selected.href
    }
  }

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #dbe4ef',
        color: '#0f172a',
      }}
    >
      <Toolbar sx={{ minHeight: 64, px: { xs: 1.5, md: 3 }, gap: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>

          <Typography sx={{ fontWeight: 700, color: '#0f172a', letterSpacing: -0.3 }}>
            HRM Company
          </Typography>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Tabs
              value={controlledValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 40,
                '& .MuiTabs-indicator': { height: 3, borderRadius: 99 },
                '& .MuiTab-root': {
                  minHeight: 40,
                  textTransform: 'none',
                  fontWeight: 600,
                  color: '#475569',
                },
                '& .Mui-selected': {
                  color: '#0f172a !important',
                },
              }}
            >
              {tabs.map((tab) => (
                <Tab key={tab.key} value={tab.key} label={tab.label} />
              ))}
            </Tabs>
          </Box>
        </Box>

        <Stack direction="row" alignItems="center" spacing={0.7}>
          <IconButton size="small"><NotificationsRoundedIcon fontSize="small" /></IconButton>
          {/* <IconButton size="small"><SettingsRoundedIcon fontSize="small" /></IconButton> */}
          <Divider orientation="vertical" flexItem sx={{ mx: 0.4 }} />
          <Button
            onClick={() => {
              window.location.href = '/setting'
            }}
          >
            <Stack direction="row" spacing={0.8} alignItems="center">
              <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{user?.display_name || 'User'}</Typography>
                <Typography sx={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.4 }}>{user?.role || 'employee'}</Typography>
              </Box>
              <Avatar src={user?.avatar_url || undefined} sx={{ width: 36, height: 36 }}>
                {(user?.display_name || user?.username || 'U').slice(0, 1)}
              </Avatar>
            </Stack>
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  )
}
