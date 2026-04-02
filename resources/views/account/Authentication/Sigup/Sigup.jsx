import {
  Alert,
  Box,
  Button,
  Link,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import React from 'react'
import { motion } from 'motion/react'
import { useAuth } from '../../../../js/context/AuthContext.jsx'

export default function Signup() {
  const { signup, authError, isAuthenticated, user, loading } = useAuth()
  const [formValues, setFormValues] = React.useState({
    username: '',
    phone_number: '',
    password: '',
    gender: '',
    birth_date: '',
  })
  const [submitting, setSubmitting] = React.useState(false)

  const setFieldValue = (fieldName, value) => {
    setFormValues((previous) => ({
      ...previous,
      [fieldName]: value,
    }))
  }

  const handleSignup = async (event) => {
    event.preventDefault()
    setSubmitting(true)

    const result = await signup({
      username: formValues.username,
      display_name: formValues.username,
      phone_number: formValues.phone_number,
      password: formValues.password,
      gender: formValues.gender || null,
      birth_date: formValues.birth_date || null,
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
          'radial-gradient(circle at 88% 10%, rgba(255,255,255,0.96), rgba(246,247,249,0.95) 46%, rgba(229,232,238,0.9) 100%)',
      }}
    >
      <motion.div
        key="signup-desktop"
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
            <Stack spacing={2.5} maxWidth={430}>
              <Box sx={{ width: 54, height: 54, borderRadius: '16px', bgcolor: '#111216' }} />
              <Typography variant="h3" sx={{ fontWeight: 600, letterSpacing: -1.2, lineHeight: 1.05 }}>
                Start secure messaging
                <br />
                with a premium feel.
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 360 }}>
                Create your account and keep everything aligned in one elegant communication space.
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Private, modern, and intentionally minimal.
            </Typography>
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
              onSubmit={handleSignup}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.42 }}
              style={{ width: '100%', maxWidth: 420 }}
            >
              <Stack spacing={2}>
                <Typography variant="h4" sx={{ fontWeight: 600, letterSpacing: -0.7 }}>
                  Create Account
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Set up your profile in a few quick steps.
                </Typography>

                {authError ? <Alert severity="error">{authError}</Alert> : null}

                {isAuthenticated ? (
                  <Alert severity="success">
                    Account created for {user?.display_name || user?.username || user?.phone_number}
                  </Alert>
                ) : null}

                <TextField
                  label="Username"
                  required
                  fullWidth
                  value={formValues.username}
                  onChange={(event) => setFieldValue('username', event.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '16px',
                      bgcolor: 'rgba(255,255,255,0.84)',
                      boxShadow: '0 9px 24px rgba(15,18,26,0.07)',
                    },
                  }}
                />

                <TextField
                  label="Phone Number"
                  placeholder="+84 000 000 000"
                  type="tel"
                  required
                  fullWidth
                  value={formValues.phone_number}
                  onChange={(event) => setFieldValue('phone_number', event.target.value)}
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
                  value={formValues.password}
                  onChange={(event) => setFieldValue('password', event.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '16px',
                      bgcolor: 'rgba(255,255,255,0.84)',
                      boxShadow: '0 9px 24px rgba(15,18,26,0.07)',
                    },
                  }}
                />

                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Gender
                  </Typography>
                  <ToggleButtonGroup
                    value={formValues.gender}
                    exclusive
                    onChange={(_, value) => setFieldValue('gender', value || '')}
                    fullWidth
                    sx={{
                      '& .MuiToggleButtonGroup-grouped': {
                        borderRadius: '14px',
                        border: '1px solid rgba(16,17,20,0.12)',
                        textTransform: 'none',
                        fontWeight: 500,
                        color: '#666977',
                        bgcolor: 'rgba(255,255,255,0.84)',
                        '&.Mui-selected': {
                          color: '#ffffff',
                          bgcolor: '#121318',
                        },
                      },
                      gap: '5px',
                    }}
                  >
                    <ToggleButton value="male">Male</ToggleButton>
                    <ToggleButton value="female">Female</ToggleButton>
                    <ToggleButton value="other">Other</ToggleButton>
                  </ToggleButtonGroup>
                </Box>

                <TextField
                  label="Birth Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={formValues.birth_date}
                  onChange={(event) => setFieldValue('birth_date', event.target.value)}
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
                    {submitting ? 'Creating account...' : 'Create Account'}
                  </Button>
                </motion.div>

                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ pt: 1 }}>
                  Already have an account?{' '}
                  <Link href="/login" underline="none" sx={{ color: '#111216', fontWeight: 600 }}>
                    Log in
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
