import {
  Avatar,
  Box,
  Button,
  InputBase,
  Stack,
  Typography,
} from '@mui/material'
import React from 'react'
import Search from '../../../components/search/search.component'

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
}) {
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

        {/* <Button
          onClick={() => {
            window.location.href = '/setting'
          }}
          sx={{
            minWidth: 0,
            p: 0.45,
            borderRadius: '999px',
            border: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(216,223,236,0.95)',
            bgcolor: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.84)',
          }}
        >
          <Stack direction="row" spacing={0.8} alignItems="center">
            <Avatar src={user?.avatar_url || undefined} sx={{ width: 34, height: 34 }}>
              {(user?.display_name || user?.username || 'U').slice(0, 1)}
            </Avatar>
            <Box sx={{ display: { xs: 'none', md: 'block' }, textAlign: 'left', minWidth: 0, maxWidth: 112 }}>
              <Typography noWrap sx={{ fontSize: 12.5, fontWeight: 700, color: darkMode ? '#f8faff' : '#111827', lineHeight: 1.05 }}>
                {user?.display_name || user?.username || 'User'}
              </Typography>
              <Typography sx={{ fontSize: 11, color: darkMode ? '#94a3b8' : '#7c8798' }}>
                Cai dat
              </Typography>
            </Box>
            <Box sx={{ display: 'grid', placeItems: 'center', color: darkMode ? '#b7c2d6' : '#64748b', pr: { xs: 0.2, md: 0.5 } }}>
              <SettingsRoundedIcon sx={{ fontSize: 18 }} />
            </Box>
          </Stack>
        </Button> */}
      </Stack>

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
        <Search
          darkMode={darkMode}
          searchKeyword={searchKeyword}
          searchLoading={searchLoading}
          searchResults={searchResults}
          relationByUserId={relationByUserId}
          onOpenDirect={onOpenDirect}
          onSendFriendRequest={onSendFriendRequest}
          onAcceptFriendRequest={onAcceptFriendRequest}
          onRejectFriendRequest={onRejectFriendRequest}
          onCancelFriendRequest={onCancelFriendRequest}
          shouldWaitFullPhone={shouldWaitFullPhone}
        />

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
