import { Box, CircularProgress, Stack, Typography } from '@mui/material'
import React from 'react'
import { useAuth } from '../js/context/AuthContext.jsx'
import Mesage from './message/mesage.jsx'

export default function Main() {
  const { isAuthenticated, loading } = useAuth()

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
          <Typography sx={{ color: '#475569', fontSize: 13 }}>Loading workspace...</Typography>
        </Stack>
      </Box>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <Mesage />
}
