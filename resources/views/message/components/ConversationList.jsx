import { Avatar, Box, Stack, Typography } from '@mui/material'
import React from 'react'
import { motion } from 'motion/react'

export default function ConversationList({ conversations, darkMode }) {
  const resolveName = (item) => {
    if (item?.title?.trim()) {
      return item.title
    }

    if (item?.conversation_type === 'direct') {
      return item?.direct_peer?.display_name
        || item?.direct_peer?.username
        || item?.name
        || `Direct #${item?.id || '-'}`
    }

    return item?.name || item?.title || `Conversation #${item?.id || '-'}`
  }

  return (
    <Stack spacing={1.2}>
      {conversations.map((item) => (
        <motion.div key={item.id} whileHover={{ y: -1 }} transition={{ duration: 0.18 }}>
          <Box
            sx={{
              p: 1.4,
              borderRadius: '16px',
              bgcolor: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.78)',
              border: darkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(225,230,240,0.7)',
              boxShadow: darkMode ? 'none' : '0 7px 20px rgba(30,40,58,0.06)',
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.2}>
              <Avatar sx={{ width: 44, height: 44, bgcolor: item.color, color: '#1f2430', fontWeight: 600 }}>
                {resolveName(item).slice(0, 1)}
              </Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                  <Typography sx={{ fontWeight: 600, color: darkMode ? '#f5f6fb' : '#151722' }}>{resolveName(item)}</Typography>
                  <Typography sx={{ fontSize: 12, color: darkMode ? '#8f96a8' : '#8890a0' }}>{item.time}</Typography>
                </Stack>
                <Typography noWrap sx={{ fontSize: 13, color: darkMode ? '#9aa1b3' : '#7f8594', mt: 0.3 }}>
                  {item.lastMessage}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </motion.div>
      ))}
    </Stack>
  )
}
