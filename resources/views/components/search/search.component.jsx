import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from '@mui/material'
import React from 'react'

export default function Search({
  darkMode,
  searchKeyword,
  searchLoading,
  searchResults,
  relationByUserId,
  onOpenDirect,
  onSendFriendRequest,
  onAcceptFriendRequest,
  onRejectFriendRequest,
  onCancelFriendRequest,
  shouldWaitFullPhone,
}) {
  if (!searchKeyword.trim()) {
    return null
  }

  return (
    <>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.7 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: darkMode ? '#e7ebf8' : '#1d2432' }}>
          People
        </Typography>
        {searchLoading ? <CircularProgress size={14} /> : null}
      </Stack>

      <Stack spacing={0.7} sx={{ mb: 1.1 }}>
        {searchResults.map((person) => {
          const relation = relationByUserId[String(person.id)] || { type: 'none' }

          return (
            <Box
              key={`user-${person.id}`}
              sx={{
                p: 1,
                borderRadius: '14px',
                bgcolor: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.78)',
                border: darkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(225,230,240,0.7)',
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <Avatar src={person.avatar_url || undefined} sx={{ width: 35, height: 35 }}>
                  {(person.display_name || person.username || 'U').slice(0, 1)}
                </Avatar>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography noWrap sx={{ fontWeight: 600, color: darkMode ? '#f5f6fb' : '#151722', fontSize: 13 }}>
                    {person.display_name || person.username || `User #${person.id}`}
                  </Typography>
                  <Typography noWrap sx={{ fontSize: 12, color: darkMode ? '#9aa1b3' : '#7f8594' }}>
                    @{person.username || `id${person.id}`}
                  </Typography>
                </Box>

                {relation.type === 'friend' ? (
                  <Button size="small" onClick={() => onOpenDirect(person.id)} sx={{ textTransform: 'none', minWidth: 0, px: 0.8 }}>
                    Chat
                  </Button>
                ) : null}

                {relation.type === 'incoming' ? (
                  <Stack direction="row" spacing={0.35}>
                    <Button size="small" onClick={() => onAcceptFriendRequest(relation.requestId)} sx={{ textTransform: 'none', minWidth: 0, px: 0.65 }}>
                      Accept
                    </Button>
                    <Button size="small" onClick={() => onRejectFriendRequest(relation.requestId)} sx={{ textTransform: 'none', minWidth: 0, px: 0.65 }}>
                      Reject
                    </Button>
                  </Stack>
                ) : null}

                {relation.type === 'outgoing' ? (
                  <Button size="small" onClick={() => onCancelFriendRequest(relation.requestId)} sx={{ textTransform: 'none', minWidth: 0, px: 0.8 }}>
                    Pending
                  </Button>
                ) : null}

                {relation.type === 'none' ? (
                  <Button size="small" onClick={() => onSendFriendRequest(person.id)} sx={{ textTransform: 'none', minWidth: 0, px: 0.8 }}>
                    Add
                  </Button>
                ) : null}
              </Stack>
            </Box>
          )
        })}

        {!searchLoading && !shouldWaitFullPhone && searchResults.length === 0 ? (
          <Typography sx={{ color: darkMode ? '#8f97ab' : '#7a8090', fontSize: 12.5, px: 0.4 }}>
            So dien thoai chua duoc dang ky
          </Typography>
        ) : null}
      </Stack>

      <Divider sx={{ mb: 1 }} />
    </>
  )
}
