import { Menu, MenuItem, ListItemIcon, ListItemText, Box } from '@mui/material'
import React from 'react'
import useAttachSelectedStore, { ATTACH_ACTIONS } from '../../../../../zustand-store/attach-select-store'

const ATTACH_MENU_ITEMS = [
  { key: 'image', label: 'Image or Video'},
  { key: 'file', label: 'File'},
  { key: 'location', label: 'Location'},
]

export default function AttachMenu({ onAttach, darkMode = false }) {
  const action = useAttachSelectedStore((state) => state.action)
  const anchorEl = useAttachSelectedStore((state) => state.anchorEl)
  const selectAttachType = useAttachSelectedStore((state) => state.selectAttachType)
  const closeAttachMenu = useAttachSelectedStore((state) => state.closeAttachMenu)

  const isOpenAttachSelect = action === ATTACH_ACTIONS.SELECT_ATTACH && Boolean(anchorEl)

  const handleCloseAttachSelect = () => {
    closeAttachMenu()
  }

  const handleSelectAttachType = (attachType) => {
    selectAttachType(attachType)
    if (typeof onAttach === 'function') {
      onAttach(attachType)
    }
    closeAttachMenu()
  }

  return (
    <Menu
      anchorEl={anchorEl}
      open={isOpenAttachSelect}
      onClose={handleCloseAttachSelect}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      slotProps={{
        paper: {
          elevation: 0,
          sx: {
            mt: -1,
            ml: 4,
            minWidth: 220,
            overflow: 'hidden',
            borderRadius: '18px',
            marginLeft: -5,
            p: 0.8,
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            bgcolor: darkMode ? 'rgba(24, 26, 32, 0.92)' : 'rgba(255, 255, 255, 0.9)',
            border: darkMode
              ? '1px solid rgba(255,255,255,0.08)'
              : '1px solid rgba(15, 23, 42, 0.08)',
            boxShadow: darkMode
              ? '0 14px 40px rgba(0,0,0,0.35)'
              : '0 14px 40px rgba(15, 23, 42, 0.12)',
          },
        },
      }}
    >
      {ATTACH_MENU_ITEMS.map((item) => (
        <MenuItem
          key={item.key}
          onClick={() => handleSelectAttachType(item.key)}
          sx={{
            minHeight: 48,
            px: 1.2,
            py: 0.8,
            borderRadius: '14px',
            transition: 'all 0.2s ease',
            color: darkMode ? '#eef2ff' : '#0f172a',
            '&:hover': {
              bgcolor: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(47, 128, 255, 0.08)',
              transform: 'translateX(2px)',
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: 1.2,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box
              sx={{
                width: 34,
                height: 34,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '10px',
                color: darkMode ? '#dbeafe' : '#2563eb',
                bgcolor: darkMode ? 'rgba(59,130,246,0.16)' : 'rgba(37,99,235,0.10)',
              }}
            >
              {item.icon}
            </Box>
          </ListItemIcon>

          <ListItemText
            primary={item.label}
            primaryTypographyProps={{
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: '0.01em',
            }}
          />
        </MenuItem>
      ))}
    </Menu>
  )
}