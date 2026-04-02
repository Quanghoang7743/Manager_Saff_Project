import { Box, Button, InputBase, Stack } from '@mui/material'
import React from 'react'
import useAttachSelectedStore from '../../../zustand-store/attach-select-store'
import AttachMenu from './components/attach-menu-component/attach.component'
import { AnimatePresence, motion } from 'motion/react'

const MESSAGE_TYPES = ['text', 'image', 'video', 'audio', 'file', 'location', 'contact']

export default function ChatInput({
  darkMode,
  value,
  onChange,
  onSubmit,
  onAttach,
  attachment,
  onClearAttachment,
  messageType,
  onMessageTypeChange,
  sending,
}) {
  const openAttachMenu = useAttachSelectedStore((state) => state.openAttachMenu)

  const handleOpenAttach = (event) => {
    openAttachMenu(event.currentTarget)
  }


  return (
    <Box
      sx={{
        p: 1,
        borderRadius: '16px',
        bgcolor: darkMode ? 'rgba(30,33,41,0.88)' : 'rgba(246,248,252,0.95)',
        border: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(224,229,238,0.9)',
      }}
    >
      <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'stretch', md: 'center' }} spacing={0.8}>
        {/* <Select
          size="small"
          value={messageType}
          onChange={(event) => onMessageTypeChange(event.target.value)}
          sx={{ minWidth: 120, bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : '#ffffff' }}
        >
          {MESSAGE_TYPES.map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </Select> */}

        <Button onClick={handleOpenAttach}
          sx={{
            bgcolor: "transparent",
            minWidth: 0,
            p: 0.5
          }}
        >
          <svg width="28px" height="28px" viewBox="0 -0.5 25 25" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M15.17 11.053L11.18 15.315C10.8416 15.6932 10.3599 15.9119 9.85236 15.9178C9.34487 15.9237 8.85821 15.7162 8.51104 15.346C7.74412 14.5454 7.757 13.2788 8.54004 12.494L13.899 6.763C14.4902 6.10491 15.3315 5.72677 16.2161 5.72163C17.1006 5.71649 17.9463 6.08482 18.545 6.736C19.8222 8.14736 19.8131 10.2995 18.524 11.7L12.842 17.771C12.0334 18.5827 10.9265 19.0261 9.78113 18.9971C8.63575 18.9682 7.55268 18.4695 6.78604 17.618C5.0337 15.6414 5.07705 12.6549 6.88604 10.73L12.253 5" stroke="#212121" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
        </Button>






        <InputBase
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              onSubmit()
            }
          }}
          placeholder="Type a message"
          sx={{
            flex: 1,
            // px: 1.2,
            py: 0.9,
            borderRadius: '12px',
            // bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : '#ffffff',
            // color: darkMode ? '#f5f6fb' : '#131521',
            fontSize: 14,
            // border: darkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(223,229,238,0.95)',
          }}
        />

        {/* <Button onClick={handleOpenAttach} variant="outlined" sx={{ textTransform: 'none', borderRadius: 999 }}>
          {attachment ? 'Attachment added' : 'Attach'}
        </Button> */}
        <Button sx={{
          minWidth: 0,
          p: 0.8
        }}>
          <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M9 16C9.85038 16.6303 10.8846 17 12 17C13.1154 17 14.1496 16.6303 15 16" stroke="#212121" stroke-width="1.5" stroke-linecap="round"></path> <path d="M16 10.5C16 11.3284 15.5523 12 15 12C14.4477 12 14 11.3284 14 10.5C14 9.67157 14.4477 9 15 9C15.5523 9 16 9.67157 16 10.5Z" fill="#212121"></path> <ellipse cx="9" cy="10.5" rx="1" ry="1.5" fill="#212121"></ellipse> <path d="M7 3.33782C8.47087 2.48697 10.1786 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 10.1786 2.48697 8.47087 3.33782 7" stroke="#212121" stroke-width="1.5" stroke-linecap="round"></path> </g></svg>
        </Button>
        <AnimatePresence>

          {!value?.trim() ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <Button
                sx={{
                  minWidth: 0,
                  p: 0.8
                }}
              >
                <svg width="30px" height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M6 11L6 13" stroke="#212121" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M9 9L9 15" stroke="#212121" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M15 9L15 15" stroke="#212121" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M18 11L18 13" stroke="#212121" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M12 11L12 13" stroke="#212121" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              {value?.trim() && (
                <Button
                  onClick={onSubmit}
                  disabled={sending}
                  sx={{
                    textTransform: 'none',
                    borderRadius: 999,
                    // bgcolor: '#2f80ff',
                    '&:hover': { bgcolor: '#1f6ee6' },
                    minWidth: 0,
                    p: 0.8,
                  }}
                >
                  <svg width="30px" height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M6.99811 10.2467L7.43298 11.0077C7.70983 11.4922 7.84825 11.7344 7.84825 12C7.84825 12.2656 7.70983 12.5078 7.43299 12.9923L7.43298 12.9923L6.99811 13.7533C5.75981 15.9203 5.14066 17.0039 5.62348 17.5412C6.1063 18.0785 7.24961 17.5783 9.53623 16.5779L15.8119 13.8323C17.6074 13.0468 18.5051 12.654 18.5051 12C18.5051 11.346 17.6074 10.9532 15.8119 10.1677L9.53624 7.4221C7.24962 6.42171 6.1063 5.92151 5.62348 6.45883C5.14066 6.99615 5.75981 8.07966 6.99811 10.2467Z" fill="#2e7eff"></path> </g></svg>
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>



      </Stack>

      {attachment ? (
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.8, px: 0.4 }}>
          <Box
            sx={{
              px: 1,
              py: 0.4,
              borderRadius: '999px',
              bgcolor: darkMode ? 'rgba(255,255,255,0.08)' : '#e8eef9',
              color: darkMode ? '#dce1f1' : '#355080',
              fontSize: 12,
            }}
          >
            {attachment.file_name}
          </Box>
          <Button size="small" onClick={onClearAttachment} sx={{ textTransform: 'none' }}>
            Remove
          </Button>
        </Stack>
      ) : null}
      <AttachMenu onAttach={onAttach} />
    </Box>
  )
}
