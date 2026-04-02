import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import React from 'react'
import { devicesApi } from '../../../js/api/devicesApi.js'
import { toArray } from '../../../js/utils/dataShape.js'
import { buildDevicePayload } from '../../../js/utils/deviceIdentity.js'
import { toApiError } from '../../../js/api/response.js'

const cardStyle = {
  borderRadius: 3,
  border: '1px solid #d7e0ec',
  boxShadow: '0 12px 34px rgba(15,23,42,0.07)',
}

const initialForm = {
  device_uuid: '',
  device_type: 'web',
  device_name: '',
  push_token: '',
  app_version: '',
  os_version: '',
}

export default function DevicesSection({ notify }) {
  const [devices, setDevices] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [form, setForm] = React.useState(initialForm)

  const loadDevices = React.useCallback(async () => {
    setLoading(true)

    try {
      const payload = await devicesApi.list()
      setDevices(toArray(payload))
    } catch (error) {
      const apiError = toApiError(error, 'Could not fetch devices')
      notify(apiError.message)
    } finally {
      setLoading(false)
    }
  }, [notify])

  React.useEffect(() => {
    loadDevices()
  }, [loadDevices])

  const fillFromCurrentDevice = () => {
    const draft = buildDevicePayload()
    setForm((previous) => ({
      ...previous,
      ...draft,
      push_token: previous.push_token,
    }))
  }

  const handleSaveDevice = async () => {
    if (!form.device_uuid.trim()) {
      notify('device_uuid is required')
      return
    }

    setSaving(true)

    try {
      await devicesApi.create({
        ...form,
        touch_last_active: true,
        is_active: true,
      })
      notify('Device registered/updated')
      setForm(initialForm)
      loadDevices()
    } catch (error) {
      const apiError = toApiError(error, 'Could not register device')
      notify(apiError.message)
    } finally {
      setSaving(false)
    }
  }

  const runAction = async (action, successMessage, fallbackMessage) => {
    try {
      await action()
      notify(successMessage)
      loadDevices()
    } catch (error) {
      const apiError = toApiError(error, fallbackMessage)
      notify(apiError.message)
    }
  }

  return (
    <Stack spacing={1.5}>
      <Card sx={cardStyle}>
        <CardContent>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.3 }}>
            <Typography sx={{ fontWeight: 700, color: '#0f172a', fontSize: 18 }}>Register / update device</Typography>
            <Stack direction="row" spacing={0.8}>
              <Button variant="outlined" size="small" onClick={fillFromCurrentDevice} sx={{ textTransform: 'none' }}>
                Use current browser
              </Button>
              <Button variant="outlined" size="small" onClick={() => setForm(initialForm)} sx={{ textTransform: 'none' }}>
                Reset
              </Button>
            </Stack>
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
            <TextField
              fullWidth
              size="small"
              label="device_uuid"
              value={form.device_uuid}
              onChange={(event) => setForm((v) => ({ ...v, device_uuid: event.target.value }))}
            />
            <TextField
              fullWidth
              size="small"
              label="device_type (ios|android|web|desktop)"
              value={form.device_type}
              onChange={(event) => setForm((v) => ({ ...v, device_type: event.target.value }))}
            />
            <TextField
              fullWidth
              size="small"
              label="device_name"
              value={form.device_name}
              onChange={(event) => setForm((v) => ({ ...v, device_name: event.target.value }))}
            />
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              size="small"
              label="push_token"
              value={form.push_token}
              onChange={(event) => setForm((v) => ({ ...v, push_token: event.target.value }))}
            />
            <TextField
              fullWidth
              size="small"
              label="app_version"
              value={form.app_version}
              onChange={(event) => setForm((v) => ({ ...v, app_version: event.target.value }))}
            />
            <TextField
              fullWidth
              size="small"
              label="os_version"
              value={form.os_version}
              onChange={(event) => setForm((v) => ({ ...v, os_version: event.target.value }))}
            />
          </Stack>

          <Stack direction="row" spacing={1} sx={{ mt: 1.2 }}>
            <Button
              variant="contained"
              onClick={handleSaveDevice}
              disabled={saving}
              sx={{ textTransform: 'none', bgcolor: '#0f172a', '&:hover': { bgcolor: '#0b1222' } }}
            >
              {saving ? 'Saving...' : 'Save device'}
            </Button>
            <Button variant="outlined" onClick={loadDevices} sx={{ textTransform: 'none' }}>
              Refresh list
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card sx={cardStyle}>
        <CardContent>
          <Typography sx={{ fontWeight: 700, color: '#0f172a', mb: 1.2 }}>My devices ({devices.length})</Typography>
          <Divider sx={{ mb: 1 }} />

          {loading ? (
            <Stack alignItems="center" sx={{ py: 2.5 }}>
              <CircularProgress size={22} />
            </Stack>
          ) : null}

          <Stack spacing={0.8}>
            {devices.map((device) => (
              <Box
                key={device.id}
                sx={{
                  p: 1,
                  borderRadius: 2,
                  border: '1px solid #dbe4ef',
                  bgcolor: '#fff',
                }}
              >
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={0.8}>
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: '#0f172a', fontSize: 13.5 }}>
                      {device.device_name || device.device_uuid}
                    </Typography>
                    <Typography sx={{ color: '#64748b', fontSize: 12 }}>
                      {device.device_type} • app {device.app_version || '-'} • os {device.os_version || '-'}
                    </Typography>
                    <Typography sx={{ color: '#64748b', fontSize: 12 }}>
                      active: {device.is_active ? 'true' : 'false'} • last_active_at: {device.last_active_at || '-'}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={0.6} flexWrap="wrap">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        setForm({
                          device_uuid: device.device_uuid,
                          device_type: device.device_type,
                          device_name: device.device_name || '',
                          push_token: device.push_token || '',
                          app_version: device.app_version || '',
                          os_version: device.os_version || '',
                        })
                        notify('Device loaded into form')
                      }}
                      sx={{ textTransform: 'none' }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() =>
                        runAction(
                          async () => {
                            const detail = await devicesApi.show(device.id)
                            setForm({
                              device_uuid: detail.device_uuid,
                              device_type: detail.device_type,
                              device_name: detail.device_name || '',
                              push_token: detail.push_token || '',
                              app_version: detail.app_version || '',
                              os_version: detail.os_version || '',
                            })
                          },
                          'Device detail loaded into form',
                          'Could not fetch device detail',
                        )
                      }
                      sx={{ textTransform: 'none' }}
                    >
                      Detail
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() =>
                        runAction(() => devicesApi.touchLastActive(device.id), 'Last active updated', 'Could not touch last active')
                      }
                      sx={{ textTransform: 'none' }}
                    >
                      Last active
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() =>
                        runAction(
                          () => (device.is_active ? devicesApi.deactivate(device.id) : devicesApi.activate(device.id)),
                          device.is_active ? 'Device deactivated' : 'Device activated',
                          'Could not toggle device',
                        )
                      }
                      sx={{ textTransform: 'none' }}
                    >
                      {device.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => {
                        if (!window.confirm('Delete this device?')) {
                          return
                        }

                        runAction(() => devicesApi.destroy(device.id), 'Device deleted', 'Could not delete device')
                      }}
                      sx={{ textTransform: 'none' }}
                    >
                      Delete
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            ))}

            {!loading && devices.length === 0 ? (
              <Typography sx={{ color: '#64748b', fontSize: 13 }}>No devices found.</Typography>
            ) : null}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
