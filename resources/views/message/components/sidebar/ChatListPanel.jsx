import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  InputBase,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material'
import React from 'react'

const getConversationTitle = (conversation) => {
  if (conversation?.title?.trim()) {
    return conversation.title
  }

  if (conversation?.conversation_type === 'direct') {
    return conversation?.direct_peer?.display_name
      || conversation?.direct_peer?.username
      || conversation?.last_message?.sender?.display_name
      || conversation?.last_message?.sender?.username
      || `Direct #${conversation.id}`
  }

  if (conversation?.conversation_type === 'group') {
    return `Group #${conversation.id}`
  }

  return `Conversation #${conversation?.id || '-'}`
}

export default function ChatListPanel({
  darkMode,
  user,
  conversations,
  activeConversationId,
  onSelectConversation,
  onRefreshConversations,
  searchKeyword,
  onSearchKeywordChange,
  searchLoading,
  searchResults,
  relationByUserId,
  onOpenDirect,
  onSendFriendRequest,
  onAcceptFriendRequest,
  onRejectFriendRequest,
  onCancelFriendRequest,
  onAvatarMenuSelect,
}) {
  const [menuAnchor, setMenuAnchor] = React.useState(null)
  const [listMode, setListMode] = React.useState('all')

  const filteredConversations = React.useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase()

    return conversations.filter((conversation) => {
      if (listMode === 'unread' && Number(conversation?.my_participant_settings?.unread_count_cache || 0) <= 0) {
        return false
      }

      if (!keyword) {
        return true
      }

      const title = getConversationTitle(conversation).toLowerCase()
      const lastMessage = (conversation?.last_message?.content || '').toLowerCase()

      return title.includes(keyword) || lastMessage.includes(keyword)
    })
  }, [conversations, listMode, searchKeyword])

  const phoneDigits = searchKeyword.trim().replace(/\D/g, '')
  const isPhoneLikeSearch = phoneDigits.length > 0 && phoneDigits.length === searchKeyword.trim().length
  const shouldWaitFullPhone = isPhoneLikeSearch && phoneDigits.length < 10

  const openMenu = Boolean(menuAnchor)

  const handleMenuSelect = (action) => {
    setMenuAnchor(null)
    onAvatarMenuSelect(action)
  }

  return (
    <Stack
      sx={{
        height: '100%',
        px: 2.2,
        py: 2.1,
        bgcolor: darkMode ? '#111218' : '#f8f9fc',
        borderRight: darkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(224,228,236,0.8)',
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.8 }}>
        <Typography sx={{ fontSize: 29, fontWeight: 650, letterSpacing: -0.9, color: darkMode ? '#fafbff' : '#11121a' }}>
          Messages
        </Typography>

        <Button onClick={(event) => setMenuAnchor(event.currentTarget)} sx={{ minWidth: 0, p: 0, borderRadius: '50%' }}>
          <Avatar src={user?.avatar_url || undefined} sx={{ width: 36, height: 36 }}>
            {(user?.display_name || user?.username || 'U').slice(0, 1)}
          </Avatar>
        </Button>
      </Stack>

      <Menu anchorEl={menuAnchor} open={openMenu} onClose={() => setMenuAnchor(null)}>
        <MenuItem onClick={() => handleMenuSelect('profile')}>Profile</MenuItem>
        <MenuItem onClick={() => handleMenuSelect('devices')}>Devices</MenuItem>
        <MenuItem onClick={() => handleMenuSelect('friend-requests')}>Friend Requests</MenuItem>
        <MenuItem onClick={() => handleMenuSelect('logout')}>Logout</MenuItem>
      </Menu>

      <Box sx={{ px: 1.6, py: 0.22, mb: 1.35, borderRadius: '13px', bgcolor: darkMode ? 'rgba(255,255,255,0.06)' : '#eef1f7' }}>
        <InputBase
          placeholder="Search people or chats"
          value={searchKeyword}
          onChange={(event) => onSearchKeywordChange(event.target.value)}
          sx={{
            width: '100%',
            px: 0.8,
            py: 0.85,
            color: darkMode ? '#f5f6fb' : '#131521',
            fontSize: 14,
          }}
        />
      </Box>

      <Stack direction="row" spacing={0.7} sx={{ mb: 1.2 }}>
        <Button
          size="small"
          onClick={() => setListMode('all')}
          sx={{
            px: 1.2,
            py: 0.5,
            borderRadius: '999px',
            bgcolor: listMode === 'all' ? '#2f80ff' : darkMode ? 'rgba(255,255,255,0.06)' : '#e9edf4',
            color: listMode === 'all' ? '#ffffff' : darkMode ? '#a8afc0' : '#6e7484',
            fontSize: 12,
            textTransform: 'none',
          }}
        >
          All
        </Button>
        <Button
          size="small"
          onClick={() => setListMode('unread')}
          sx={{
            px: 1.2,
            py: 0.5,
            borderRadius: '999px',
            bgcolor: listMode === 'unread' ? '#2f80ff' : darkMode ? 'rgba(255,255,255,0.06)' : '#e9edf4',
            color: listMode === 'unread' ? '#ffffff' : darkMode ? '#a8afc0' : '#6e7484',
            fontSize: 12,
            textTransform: 'none',
          }}
        >
          Unread
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button size="small" onClick={onRefreshConversations} sx={{ textTransform: 'none' }}>
          Refresh
        </Button>
      </Stack>

      <Box sx={{ overflowY: 'auto', pr: 0.15, pb: 0.4 }}>
        {searchKeyword.trim() ? (
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

              {/* {shouldWaitFullPhone ? (
                <Typography sx={{ color: darkMode ? '#8f97ab' : '#7a8090', fontSize: 12.5, px: 0.4 }}>
                  Enter full 10-digit phone number to search.
                </Typography>
              ) : null} */}

              {!searchLoading && !shouldWaitFullPhone && searchResults.length === 0 ? (
                <Typography sx={{ color: darkMode ? '#8f97ab' : '#7a8090', fontSize: 12.5, px: 0.4 }}>
                  Số điện thoại chưa được đăng ký
                </Typography>
              ) : null}
            </Stack>
              
            <Divider sx={{ mb: 1 }} />
          </>
        ) : null}

        <Typography sx={{ fontSize: 13, fontWeight: 700, color: darkMode ? '#e7ebf8' : '#1d2432', mb: 0.7 }}>
          Conversations
        </Typography>

        <Stack spacing={0.75}>
          {filteredConversations.map((item) => {
            const active = Number(activeConversationId) === Number(item.id)
            const unread = Number(item?.my_participant_settings?.unread_count_cache || 0)

            return (
              <Box
                key={item.id}
                onClick={() => onSelectConversation(item.id)}
                sx={{
                  p: 1.1,
                  borderRadius: '14px',
                  cursor: 'pointer',
                  bgcolor: active
                    ? darkMode
                      ? 'rgba(47,128,255,0.24)'
                      : 'rgba(47,128,255,0.14)'
                    : darkMode
                      ? 'rgba(255,255,255,0.04)'
                      : 'rgba(255,255,255,0.78)',
                  border: active
                    ? '1px solid rgba(47,128,255,0.55)'
                    : darkMode
                      ? '1px solid rgba(255,255,255,0.05)'
                      : '1px solid rgba(225,230,240,0.7)',
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Avatar sx={{ width: 40, height: 40, bgcolor: '#d3defa', color: '#2d3e6f', fontWeight: 600 }}>
                    {getConversationTitle(item).slice(0, 1)}
                  </Avatar>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={0.7}>
                      <Typography noWrap sx={{ fontWeight: 600, color: darkMode ? '#f5f6fb' : '#151722', fontSize: 13.5 }}>
                        {getConversationTitle(item)}
                      </Typography>
                      <Typography sx={{ fontSize: 11, color: darkMode ? '#8f96a8' : '#8890a0' }}>{item.last_message_at || ''}</Typography>
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={0.6}>
                      <Typography noWrap sx={{ fontSize: 12.5, color: darkMode ? '#9aa1b3' : '#7f8594', mt: 0.2, flex: 1 }}>
                        {item.last_message?.content || item.last_message?.message_type || 'No messages yet'}
                      </Typography>

                      {unread > 0 ? (
                        <Box
                          sx={{
                            minWidth: 18,
                            height: 18,
                            borderRadius: 999,
                            px: 0.6,
                            display: 'grid',
                            placeItems: 'center',
                            bgcolor: '#2f80ff',
                            color: '#fff',
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          {unread}
                        </Box>
                      ) : null}
                    </Stack>
                  </Box>
                </Stack>
              </Box>
            )
          })}

          {filteredConversations.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography sx={{ color: darkMode ? '#8f97ab' : '#7a8090', fontSize: 13 }}>
                No conversations yet.
              </Typography>
            </Box>
          ) : null}
        </Stack>
      </Box>
    </Stack>
  )
}
