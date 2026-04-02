import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import React from 'react'
import { useAuth } from '../../../js/context/AuthContext.jsx'
import { usersApi } from '../../../js/api/usersApi.js'
import { toApiError } from '../../../js/api/response.js'

const cardStyle = {
  borderRadius: 3,
  border: '1px solid #d7e0ec',
  boxShadow: '0 12px 34px rgba(15,23,42,0.07)',
}

const buildFormFromUser = (user) => ({
  display_name: user?.display_name || '',
  email: user?.email || '',
  phone_number: user?.phone_number || '',
  username: user?.username || '',
  avatar_url: user?.avatar_url || '',
  bio: user?.bio || '',
  birth_date: user?.birth_date || '',
  gender: user?.gender || '',
  presence_status: user?.presence_status || 'offline',
  password: '',
})

export default function ProfileSection({ notify }) {
  const { user, setUser, refreshProfile, logout } = useAuth()
  const [form, setForm] = React.useState(() => buildFormFromUser(user))
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    setForm(buildFormFromUser(user))
  }, [user])

  React.useEffect(() => {
    if (!user?.id) {
      return
    }

    let active = true

    usersApi
      .show(user.id)
      .then((data) => {
        if (!active) {
          return
        }

        if (data?.user) {
          setUser(data.user)
          setForm(buildFormFromUser(data.user))
        }
      })
      .catch(() => {
        // ignore profile warm-up errors
      })

    return () => {
      active = false
    }
  }, [setUser, user?.id])

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }))
  }

  const handleSaveProfile = async () => {
    if (!user?.id) {
      return
    }

    setSaving(true)

    try {
      const payload = {
        display_name: form.display_name,
        email: form.email || null,
        phone_number: form.phone_number || null,
        username: form.username || null,
        avatar_url: form.avatar_url || null,
        bio: form.bio || null,
        birth_date: form.birth_date || null,
        gender: form.gender || null,
        presence_status: form.presence_status || 'offline',
      }

      if (form.password.trim()) {
        payload.password = form.password.trim()
      }

      const response = await usersApi.update(user.id, payload)
      const updatedUser = response?.user || null

      if (updatedUser) {
        setUser(updatedUser)
      } else {
        await refreshProfile()
      }

      updateField('password', '')
      notify('Profile updated')
    } catch (error) {
      const apiError = toApiError(error, 'Could not update profile')
      notify(apiError.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user?.id) {
      return
    }

    if (!window.confirm('Delete your account? This action cannot be undone.')) {
      return
    }

    try {
      await usersApi.destroy(user.id)
      notify('Account deleted')
      await logout()
      window.location.href = '/login'
    } catch (error) {
      const apiError = toApiError(error, 'Could not delete account')
      notify(apiError.message)
    }
  }

  return (
    <Stack spacing={1.5}>
      <Card sx={cardStyle}>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }}>
            <Avatar src={form.avatar_url || undefined} sx={{ width: 72, height: 72 }}>
              {(form.display_name || form.username || 'U').slice(0, 1)}
            </Avatar>
            <Box>
              <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>
                {form.display_name || form.username || 'Profile'}
              </Typography>
              <Typography sx={{ color: '#64748b', fontSize: 13 }}>
                Manage your account details and privacy-related profile fields.
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Card sx={cardStyle}>
        <CardContent>
          <Typography sx={{ fontWeight: 700, color: '#0f172a', mb: 1.2 }}>Edit profile</Typography>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
            <TextField
              fullWidth
              size="small"
              label="display_name"
              value={form.display_name}
              onChange={(event) => updateField('display_name', event.target.value)}
            />
            <TextField
              fullWidth
              size="small"
              label="username"
              value={form.username}
              onChange={(event) => updateField('username', event.target.value)}
            />
            <TextField
              fullWidth
              size="small"
              label="email"
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
            />
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              size="small"
              label="phone_number"
              value={form.phone_number}
              onChange={(event) => updateField('phone_number', event.target.value)}
            />
            <TextField
              fullWidth
              size="small"
              label="avatar_url"
              value={form.avatar_url}
              onChange={(event) => updateField('avatar_url', event.target.value)}
            />
            <TextField
              fullWidth
              size="small"
              label="gender"
              value={form.gender}
              onChange={(event) => updateField('gender', event.target.value)}
            />
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="birth_date"
              InputLabelProps={{ shrink: true }}
              value={form.birth_date || ''}
              onChange={(event) => updateField('birth_date', event.target.value)}
            />
            <TextField
              fullWidth
              size="small"
              label="presence_status"
              value={form.presence_status}
              onChange={(event) => updateField('presence_status', event.target.value)}
              placeholder="online|offline|away|busy"
            />
            <TextField
              fullWidth
              size="small"
              type="password"
              label="new password"
              value={form.password}
              onChange={(event) => updateField('password', event.target.value)}
            />
          </Stack>

          <TextField
            fullWidth
            multiline
            minRows={3}
            sx={{ mt: 1 }}
            label="bio"
            value={form.bio}
            onChange={(event) => updateField('bio', event.target.value)}
          />

          <Stack direction="row" spacing={1} sx={{ mt: 1.2 }}>
            <Button
              variant="contained"
              onClick={handleSaveProfile}
              disabled={saving}
              sx={{ textTransform: 'none', bgcolor: '#0f172a', '&:hover': { bgcolor: '#0b1222' } }}
            >
              {saving ? 'Saving...' : 'Save profile'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => setForm(buildFormFromUser(user))}
              sx={{ textTransform: 'none' }}
            >
              Reset
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ ...cardStyle, borderColor: '#fecaca', bgcolor: '#fff7f7' }}>
        <CardContent>
          <Typography sx={{ fontWeight: 700, color: '#991b1b', mb: 0.8 }}>Danger zone</Typography>
          <Typography sx={{ color: '#7f1d1d', fontSize: 13 }}>
            Deleting account will revoke your token and mark your account as deleted.
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Button variant="outlined" color="error" onClick={handleDeleteAccount} sx={{ textTransform: 'none' }}>
            Delete account
          </Button>
        </CardContent>
      </Card>
    </Stack>
  )
}
