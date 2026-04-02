import {
  AppBar,
  Avatar,
  Box,
  Button,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  Toolbar,
  Typography,
} from '@mui/material'
import React from 'react'
import { useAuth } from '../../js/context/AuthContext.jsx'
import ChatSection from './sections/ChatSection.jsx'
import DevicesSection from './sections/DevicesSection.jsx'
import FriendsSection from './sections/FriendsSection.jsx'
import ProfileSection from './sections/ProfileSection.jsx'

const TABS = {
  chat: 'chat',
  friends: 'friends',
  devices: 'devices',
  profile: 'profile',
}

const getInitialTab = () => {
  const hash = window.location.hash.replace('#', '')

  if (Object.values(TABS).includes(hash)) {
    return hash
  }

  return TABS.chat
}

export default function AppShell() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = React.useState(getInitialTab)
  const [directTargetUserId, setDirectTargetUserId] = React.useState(null)
  const [toast, setToast] = React.useState({ open: false, message: '' })

  const notify = React.useCallback((message) => {
    if (!message) {
      return
    }

    setToast({ open: true, message })
  }, [])

  React.useEffect(() => {
    window.location.hash = activeTab
  }, [activeTab])

  const handleOpenDirectChat = React.useCallback((userId) => {
    setDirectTargetUserId(userId)
    setActiveTab(TABS.chat)
  }, [])

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: '#eef2f7' }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(14px)',
          borderBottom: '1px solid rgba(208,215,225,0.75)',
          color: '#0f172a',
        }}
      >
        <Toolbar sx={{ minHeight: 72, px: { xs: 1.5, md: 3 } }}>
          <Stack direction="row" alignItems="center" spacing={1.25} sx={{ flexShrink: 0, mr: 2 }}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 2,
                bgcolor: '#0f172a',
                boxShadow: '0 10px 22px rgba(15,23,42,0.22)',
              }}
            />
            <Typography sx={{ fontWeight: 700, letterSpacing: -0.5, color: '#0f172a' }}>
              MessApp
            </Typography>
          </Stack>

          <Tabs
            value={activeTab}
            onChange={(_, value) => setActiveTab(value)}
            variant="scrollable"
            sx={{
              minHeight: 40,
              '& .MuiTab-root': {
                minHeight: 40,
                textTransform: 'none',
                fontWeight: 600,
                color: '#475569',
              },
            }}
          >
            <Tab value={TABS.chat} label="Chat" />
            <Tab value={TABS.friends} label="Friends" />
            <Tab value={TABS.devices} label="Devices" />
            <Tab value={TABS.profile} label="Profile" />
          </Tabs>

          <Box sx={{ flex: 1 }} />

          <Stack direction="row" alignItems="center" spacing={1}>
            <Avatar src={user?.avatar_url || undefined} sx={{ width: 34, height: 34 }}>
              {user?.display_name?.slice(0, 1) || user?.username?.slice(0, 1) || 'U'}
            </Avatar>
            <Stack sx={{ display: { xs: 'none', md: 'flex' } }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#0f172a', lineHeight: 1.2 }}>
                {user?.display_name || user?.username || 'User'}
              </Typography>
              <Typography sx={{ fontSize: 12, color: '#64748b', lineHeight: 1.2 }}>
                {user?.phone_number || user?.email || 'authenticated'}
              </Typography>
            </Stack>
            <Button
              onClick={logout}
              variant="outlined"
              sx={{ textTransform: 'none', borderRadius: 999, fontWeight: 600 }}
            >
              Logout
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: { xs: 1.25, md: 2.5 } }}>
        {activeTab === TABS.chat ? (
          <ChatSection
            notify={notify}
            directTargetUserId={directTargetUserId}
            onConsumedDirectTarget={() => setDirectTargetUserId(null)}
          />
        ) : null}

        {activeTab === TABS.friends ? <FriendsSection notify={notify} onOpenDirectChat={handleOpenDirectChat} /> : null}

        {activeTab === TABS.devices ? <DevicesSection notify={notify} /> : null}

        {activeTab === TABS.profile ? <ProfileSection notify={notify} /> : null}
      </Box>

      <Snackbar
        open={toast.open}
        autoHideDuration={2600}
        onClose={() => setToast({ open: false, message: '' })}
        message={toast.message}
      />
    </Box>
  )
}
