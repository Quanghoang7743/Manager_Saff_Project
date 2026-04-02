import { Box, Stack } from '@mui/material'
import React from 'react'
import { motion } from 'motion/react'

export default function TypingIndicator({ darkMode }) {
  return (
    <Box
      sx={{
        width: 'fit-content',
        px: 1.6,
        py: 1.1,
        borderRadius: '16px',
        bgcolor: darkMode ? 'rgba(70,70,76,0.9)' : '#edf0f5',
      }}
    >
      <Stack direction="row" spacing={0.6}>
        {[0, 1, 2].map((dot) => (
          <motion.span
            key={dot}
            animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.9, delay: dot * 0.12, repeat: Infinity }}
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              display: 'inline-block',
              background: darkMode ? '#f4f4f6' : '#818490',
            }}
          />
        ))}
      </Stack>
    </Box>
  )
}
