import { Box, CircularProgress, Stack, Typography } from '@mui/material'
import React from 'react'
import { useAuth } from '../js/context/AuthContext.jsx'
import NavbarComponent from './components/navbar/navbar.component.jsx'
import MessagePage from './message/page.jsx'
import DashboardPage from './dashboard/index.jsx'
import TaskPage from './task/index.jsx'

const resolveTabFromPath = (path) => {
  if (path === '/dashboard') return 'dashboard'
  if (path === '/attendance') return 'attendance'
  if (path === '/employees') return 'employees'
  if (path === '/tasks') return 'task'

  return 'message'
}


export default function Main() {
  const { user, isAuthenticated, loading } = useAuth()
  const activeTab = resolveTabFromPath(window.location.pathname)

  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = '/login'
    }
  }, [isAuthenticated, loading])

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100dvh',
          display: 'grid',
          placeItems: 'center',
          background:
            'radial-gradient(circle at 18% 8%, rgba(255,255,255,0.97), rgba(243,246,251,0.95) 46%, rgba(227,233,241,0.9) 100%)',
        }}
      >
        <Stack spacing={1.1} alignItems="center">
          <CircularProgress size={28} />
          <Typography sx={{ color: '#475569', fontSize: 13 }}>HRM...</Typography>
        </Stack>
      </Box>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const renderContent = () => {
    if (activeTab === 'dashboard') {
      return <DashboardPage />
    }

    if (activeTab === 'attendance') {
      return <Box sx={{ p: 2, color: '#334155' }}>Điểm danh - đang triển khai giao diện.</Box>
    }

    if (activeTab === 'task') {
      return <TaskPage />
    }

    return <MessagePage />
  }

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: '#eef2f7' }}>
      <NavbarComponent role={user?.role} activeTab={activeTab} />
      {renderContent()}
    </Box>
  )
}
