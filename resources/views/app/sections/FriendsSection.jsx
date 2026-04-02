import {
  Avatar,
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
import { useAuth } from '../../../js/context/AuthContext.jsx'
import { friendsApi } from '../../../js/api/friendsApi.js'
import { asFriendCollection, toArray } from '../../../js/utils/dataShape.js'
import { toApiError } from '../../../js/api/response.js'
import { subscribeUserChannel } from '../../../js/realtime/userRealtime.js'

const sectionCardStyle = {
  borderRadius: 3,
  border: '1px solid #d7e0ec',
  boxShadow: '0 12px 34px rgba(15,23,42,0.07)',
}

const UserRow = ({ user, subtitle, actions = null }) => (
  <Stack
    direction="row"
    alignItems="center"
    justifyContent="space-between"
    spacing={1}
    sx={{ p: 1, borderRadius: 2, border: '1px solid #dbe4ef', bgcolor: '#fff' }}
  >
    <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
      <Avatar src={user?.avatar_url || undefined} sx={{ width: 34, height: 34 }}>
        {(user?.display_name || user?.username || 'U').slice(0, 1)}
      </Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Typography noWrap sx={{ fontWeight: 600, color: '#0f172a', fontSize: 13.5 }}>
          {user?.display_name || user?.username || `User #${user?.id}`}
        </Typography>
        <Typography noWrap sx={{ color: '#64748b', fontSize: 12 }}>
          {subtitle}
        </Typography>
      </Box>
    </Stack>

    {actions}
  </Stack>
)

export default function FriendsSection({ notify, onOpenDirectChat }) {
  const { user } = useAuth()

  const [phoneInput, setPhoneInput] = React.useState('')
  const [requestMessage, setRequestMessage] = React.useState('')
  const [resolvedUser, setResolvedUser] = React.useState(null)
  const [loadingResolve, setLoadingResolve] = React.useState(false)

  const [friends, setFriends] = React.useState([])
  const [friendsMeta, setFriendsMeta] = React.useState(null)
  const [incoming, setIncoming] = React.useState([])
  const [outgoing, setOutgoing] = React.useState([])
  const [loadingLists, setLoadingLists] = React.useState(false)

  const refreshAll = React.useCallback(async () => {
    setLoadingLists(true)

    try {
      const [friendsPayload, incomingPayload, outgoingPayload] = await Promise.all([
        friendsApi.list({ per_page: 50 }),
        friendsApi.incoming({ per_page: 50 }),
        friendsApi.outgoing({ per_page: 50 }),
      ])

      const friendCollection = asFriendCollection(friendsPayload)
      setFriends(friendCollection.items)
      setFriendsMeta(friendCollection.meta)
      setIncoming(toArray(incomingPayload?.items || incomingPayload))
      setOutgoing(toArray(outgoingPayload?.items || outgoingPayload))
    } catch (error) {
      const apiError = toApiError(error, 'Could not fetch friend data')
      notify(apiError.message)
    } finally {
      setLoadingLists(false)
    }
  }, [notify])

  React.useEffect(() => {
    refreshAll()
  }, [refreshAll])

  React.useEffect(() => {
    if (!user?.id) {
      return undefined
    }

    return subscribeUserChannel(user.id, {
      onFriendRequestReceived: () => refreshAll(),
      onFriendRequestAccepted: () => refreshAll(),
      onFriendRequestRejected: () => refreshAll(),
      onFriendRemoved: () => refreshAll(),
    })
  }, [refreshAll, user?.id])

  const handleResolveByPhone = async () => {
    if (!phoneInput.trim()) {
      notify('Please input a phone number')
      return
    }

    setLoadingResolve(true)

    try {
      const payload = await friendsApi.resolveByPhone(phoneInput.trim())
      setResolvedUser(payload?.user || null)
      notify('User found by phone')
    } catch (error) {
      const apiError = toApiError(error, 'Could not find user by phone')
      setResolvedUser(null)
      notify(apiError.message)
    } finally {
      setLoadingResolve(false)
    }
  }

  const handleSendRequest = async () => {
    if (!resolvedUser?.id) {
      notify('Resolve a user first')
      return
    }

    try {
      const payload = await friendsApi.sendRequest({
        target_user_id: resolvedUser.id,
        target_phone: phoneInput.trim() || undefined,
        message: requestMessage.trim() || undefined,
      })

      notify(payload?.auto_accepted ? 'Friend request auto-accepted' : 'Friend request sent')
      setRequestMessage('')
      refreshAll()
    } catch (error) {
      const apiError = toApiError(error, 'Could not send friend request')
      notify(apiError.message)
    }
  }

  const withRequestAction = async (action, requestId, doneMessage) => {
    try {
      await action(requestId)
      notify(doneMessage)
      refreshAll()
    } catch (error) {
      const apiError = toApiError(error, doneMessage)
      notify(apiError.message)
    }
  }

  const handleUnfriend = async (friendUserId) => {
    if (!window.confirm('Remove this friend?')) {
      return
    }

    try {
      await friendsApi.unfriend(friendUserId)
      notify('Friend removed')
      refreshAll()
    } catch (error) {
      const apiError = toApiError(error, 'Could not remove friend')
      notify(apiError.message)
    }
  }

  return (
    <Stack spacing={1.5}>
      <Card sx={sectionCardStyle}>
        <CardContent>
          <Typography sx={{ fontWeight: 700, fontSize: 18, color: '#0f172a' }}>Find friend by phone</Typography>
          <Typography sx={{ color: '#64748b', fontSize: 13, mt: 0.4 }}>
            Resolve a verified user by phone number and send friend request.
          </Typography>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ mt: 1.4 }}>
            <TextField
              fullWidth
              size="small"
              value={phoneInput}
              onChange={(event) => setPhoneInput(event.target.value)}
              placeholder="+84901112222"
            />
            <Button
              variant="outlined"
              onClick={handleResolveByPhone}
              disabled={loadingResolve}
              sx={{ textTransform: 'none', minWidth: 130 }}
            >
              {loadingResolve ? 'Resolving...' : 'Resolve'}
            </Button>
          </Stack>

          {resolvedUser ? (
            <Stack spacing={1} sx={{ mt: 1.2 }}>
              <UserRow
                user={resolvedUser}
                subtitle={resolvedUser?.presence_status || 'resolved user'}
                actions={
                  <Button size="small" variant="contained" onClick={handleSendRequest} sx={{ textTransform: 'none' }}>
                    Send request
                  </Button>
                }
              />
              <TextField
                fullWidth
                size="small"
                value={requestMessage}
                onChange={(event) => setRequestMessage(event.target.value)}
                placeholder="Optional greeting message"
              />
            </Stack>
          ) : null}
        </CardContent>
      </Card>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5}>
        <Card sx={{ ...sectionCardStyle, flex: 1, minHeight: 320 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.1 }}>
              <Typography sx={{ fontWeight: 700, color: '#0f172a' }}>Incoming requests</Typography>
              <Button variant="text" size="small" onClick={refreshAll} sx={{ textTransform: 'none' }}>
                Refresh
              </Button>
            </Stack>

            {loadingLists ? (
              <Stack alignItems="center" sx={{ py: 3 }}>
                <CircularProgress size={22} />
              </Stack>
            ) : null}

            <Stack spacing={0.8}>
              {incoming.map((item) => (
                <UserRow
                  key={item.id}
                  user={item.requester}
                  subtitle={`status: ${item.status}`}
                  actions={
                    <Stack direction="row" spacing={0.4}>
                      {item.status === 'pending' ? (
                        <>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => withRequestAction(friendsApi.accept, item.id, 'Request accepted')}
                            sx={{ textTransform: 'none', minWidth: 0, px: 0.9 }}
                          >
                            Accept
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => withRequestAction(friendsApi.reject, item.id, 'Request rejected')}
                            sx={{ textTransform: 'none', minWidth: 0, px: 0.9 }}
                          >
                            Reject
                          </Button>
                        </>
                      ) : null}
                    </Stack>
                  }
                />
              ))}

              {!loadingLists && incoming.length === 0 ? (
                <Typography sx={{ color: '#64748b', fontSize: 13 }}>No incoming requests.</Typography>
              ) : null}
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ ...sectionCardStyle, flex: 1, minHeight: 320 }}>
          <CardContent>
            <Typography sx={{ fontWeight: 700, color: '#0f172a', mb: 1.1 }}>Outgoing requests</Typography>

            {loadingLists ? (
              <Stack alignItems="center" sx={{ py: 3 }}>
                <CircularProgress size={22} />
              </Stack>
            ) : null}

            <Stack spacing={0.8}>
              {outgoing.map((item) => (
                <UserRow
                  key={item.id}
                  user={item.addressee}
                  subtitle={`status: ${item.status}`}
                  actions={
                    item.status === 'pending' ? (
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => withRequestAction(friendsApi.cancel, item.id, 'Request cancelled')}
                        sx={{ textTransform: 'none', minWidth: 0, px: 0.9 }}
                      >
                        Cancel
                      </Button>
                    ) : null
                  }
                />
              ))}

              {!loadingLists && outgoing.length === 0 ? (
                <Typography sx={{ color: '#64748b', fontSize: 13 }}>No outgoing requests.</Typography>
              ) : null}
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      <Card sx={sectionCardStyle}>
        <CardContent>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.2 }}>
            <Typography sx={{ fontWeight: 700, color: '#0f172a' }}>
              Friends {friendsMeta?.total ? `(${friendsMeta.total})` : ''}
            </Typography>
            <Button variant="text" size="small" onClick={refreshAll} sx={{ textTransform: 'none' }}>
              Refresh
            </Button>
          </Stack>

          <Divider sx={{ mb: 1 }} />

          {loadingLists ? (
            <Stack alignItems="center" sx={{ py: 2.2 }}>
              <CircularProgress size={22} />
            </Stack>
          ) : null}

          <Stack spacing={0.8}>
            {friends.map((row) => (
              <UserRow
                key={`${row.friendship_id}-${row.friend?.id}`}
                user={row.friend}
                subtitle={`friendship #${row.friendship_id}`}
                actions={
                  <Stack direction="row" spacing={0.4}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => onOpenDirectChat?.(row.friend?.id)}
                      sx={{ textTransform: 'none', minWidth: 0, px: 0.9 }}
                    >
                      Chat
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => handleUnfriend(row.friend?.id)}
                      sx={{ textTransform: 'none', minWidth: 0, px: 0.9 }}
                    >
                      Remove
                    </Button>
                  </Stack>
                }
              />
            ))}

            {!loadingLists && friends.length === 0 ? (
              <Typography sx={{ color: '#64748b', fontSize: 13 }}>No friends yet.</Typography>
            ) : null}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
