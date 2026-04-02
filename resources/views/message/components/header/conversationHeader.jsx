import { Avatar, Box, Stack, Typography } from '@mui/material'
import React from 'react'

export default function ConversationHeader() {
    return (
        <>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.2, px: 0.4, py: 0.4, borderBottom: darkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(226,230,238,0.82)' }}>
                <Typography sx={{ color: '#4e89ff', fontSize: 14 }}>Messages</Typography>
                <Stack direction="row" spacing={1.1} alignItems="center">
                    <Avatar sx={{ width: 30, height: 30, bgcolor: '#d3defa', color: '#2d3e6f', fontSize: 12 }}>E</Avatar>
                    <Box>
                        <Typography sx={{ fontWeight: 600, color: darkMode ? '#f5f6fb' : '#141621', lineHeight: 1.1 }}>Ethan</Typography>
                        <Typography sx={{ color: darkMode ? '#8f97ab' : '#7a8090', fontSize: 12 }}>Online now</Typography>
                    </Box>
                </Stack>
                <Stack direction="row" spacing={1}>
                    <Box sx={{ width: 8, height: 8, borderRadius: 999, bgcolor: '#2f80ff' }} />
                    <Box sx={{ width: 8, height: 8, borderRadius: 999, bgcolor: darkMode ? '#5f6473' : '#c4cad8' }} />
                </Stack>
            </Stack>
        </>
    )
}
