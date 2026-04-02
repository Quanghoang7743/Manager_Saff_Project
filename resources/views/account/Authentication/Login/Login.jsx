import { Alert, Box, Button, Link, Stack, TextField, Typography } from '@mui/material'
import React from 'react'
import { motion } from 'motion/react'
import { useAuth } from '../../../../js/context/AuthContext.jsx'

export default function Login() {
  const { login, logout, isAuthenticated, user, authError, clearAuthError, loading } = useAuth()
  const [phoneNumber, setPhoneNumber] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)

  const handleLogin = async (event) => {
    event.preventDefault()
    setSubmitting(true)

    const result = await login({
      phone_number: phoneNumber,
      password,
    })

    if (result.success) {
      window.location.href = '/main'
      return
    }

    setSubmitting(false)
  }

  React.useEffect(() => {
    if (!loading && isAuthenticated) {
      window.location.href = '/main'
    }
  }, [isAuthenticated, loading])

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        px: { xs: 2, md: 4 },
        py: { xs: 3, md: 5 },
        background:
          'radial-gradient(circle at 12% 10%, rgba(255,255,255,0.96), rgba(246,247,249,0.95) 46%, rgba(229,232,238,0.9) 100%)',
      }}
    >
      <motion.div
        key="login-desktop"
        initial={{ opacity: 0, y: 20, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      >
        <Box
          sx={{
            width: 'min(1100px, 94vw)',
            minHeight: { xs: 'auto', md: 720 },
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.05fr 0.95fr' },
            borderRadius: { xs: '28px', md: '34px' },
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.78)',
            boxShadow: '0 36px 90px rgba(16,20,30,0.15), inset 0 1px 0 rgba(255,255,255,0.82)',
            bgcolor: 'rgba(255,255,255,0.72)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <Box
            sx={{
              p: { xs: 4, md: 7 },
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              justifyContent: 'space-between',
              background:
                'linear-gradient(160deg, rgba(255,255,255,0.62), rgba(241,243,246,0.92))',
            }}
          >
            <Stack spacing={2.5} maxWidth={420}>
              <Box sx={{ width: 54, height: 54, borderRadius: '16px', bgcolor: '#111216' }} />
              <Typography variant="h3" sx={{ fontWeight: 600, letterSpacing: -1.2, lineHeight: 1.05 }}>
                Built for calm,
                <br />
                private conversations.
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 340 }}>
                Premium messaging with a clean, focused space for your daily communication.
              </Typography>
            </Stack>
          </Box>

          <Box
            sx={{
              p: { xs: 4, md: 7 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <motion.form
              onSubmit={handleLogin}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.42 }}
              style={{ width: '100%', maxWidth: 400 }}
            >
              <Stack spacing={2.1}>
                <Typography variant="h4" sx={{ fontWeight: 600, letterSpacing: -0.7 }}>
                  Login
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Welcome back. Please sign in to continue.
                </Typography>

                {authError ? <Alert severity="error">{authError}</Alert> : null}

                {isAuthenticated ? (
                  <Alert severity="success" onClose={clearAuthError}>
                    Signed in as {user?.display_name || user?.username || user?.phone_number}
                  </Alert>
                ) : null}

                <TextField
                  label="Phone Number"
                  placeholder="+84 000 000 000"
                  type="tel"
                  required
                  fullWidth
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '16px',
                      bgcolor: 'rgba(255,255,255,0.84)',
                      boxShadow: '0 9px 24px rgba(15,18,26,0.07)',
                    },
                  }}
                />

                <TextField
                  label="Password"
                  type="password"
                  required
                  fullWidth
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '16px',
                      bgcolor: 'rgba(255,255,255,0.84)',
                      boxShadow: '0 9px 24px rgba(15,18,26,0.07)',
                    },
                  }}
                />

                <motion.div whileTap={{ scale: 0.995 }} whileHover={{ y: -1 }}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disableElevation
                    disabled={loading || submitting}
                    sx={{
                      mt: 0.6,
                      py: 1.5,
                      borderRadius: '15px',
                      fontWeight: 700,
                      fontSize: 16,
                      textTransform: 'none',
                      bgcolor: '#111216',
                      '&:hover': { bgcolor: '#090a0d' },
                    }}
                  >
                    {submitting ? 'Signing in...' : 'Login'}
                  </Button>
                </motion.div>

                {isAuthenticated ? (
                  <Button
                    type="button"
                    onClick={logout}
                    fullWidth
                    variant="outlined"
                    sx={{ borderRadius: '15px', textTransform: 'none' }}
                  >
                    Logout
                  </Button>
                ) : null}

                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ pt: 1 }}>
                  Don&apos;t have an account?{' '}
                  <Link href="/signup" underline="none" sx={{ color: '#111216', fontWeight: 600 }}>
                    Sign up
                  </Link>
                </Typography>
              </Stack>
            </motion.form>
          </Box>
        </Box>
      </motion.div>
    </Box>
  )
}
