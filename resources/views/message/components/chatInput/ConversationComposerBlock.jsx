import { Avatar, Box, Button, Stack, TextField, Typography } from '@mui/material'
import React from 'react'
import ChatInput from './ChatInput.jsx'

export default function ConversationComposerBlock({
  darkMode,
  conversation,
  participants,
  isOwner,
  isOwnerOrAdmin,
  user,
  newParticipantIdsInput,
  onNewParticipantIdsInputChange,
  onAddParticipants,
  onRemoveParticipant,
  onUpdateParticipantRole,
  composerText,
  onComposerTextChange,
  onSendMessage,
  onAttachToComposer,
  composerAttachment,
  onClearComposerAttachment,
  composerType,
  onComposerTypeChange,
  sending,
}) {
  return (
    <Box
      sx={{
        flexShrink: 0,
        pt: 1,
        // borderTop: darkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(226,230,238,0.82)',
      }}
    >
      {/* <Box sx={{ mb: 1 }}>
        <Typography sx={{ fontWeight: 600, color: darkMode ? '#f5f6fb' : '#141621', fontSize: 13.5, mb: 0.6 }}>
          Participants ({participants.length})
        </Typography>

        {conversation?.conversation_type === 'group' && isOwnerOrAdmin ? (
          <Stack direction="row" spacing={0.8} sx={{ mb: 0.8 }}>
            <TextField
              size="small"
              fullWidth
              value={newParticipantIdsInput}
              onChange={(event) => onNewParticipantIdsInputChange(event.target.value)}
              placeholder="Add user ids: 2,7,9"
            />
            <Button size="small" variant="outlined" onClick={onAddParticipants} sx={{ textTransform: 'none' }}>
              Add
            </Button>
          </Stack>
        ) : null}

        <Stack direction="row" spacing={0.8} sx={{ overflowX: 'auto', pb: 0.4 }}>
          {participants.map((participant) => (
            <Box key={`${participant.conversation_id}-${participant.user?.id}`} sx={{ px: 0.85, py: 0.6, borderRadius: '12px', border: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e1e7f0', bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : '#f9fbff' }}>
              <Stack direction="row" spacing={0.6} alignItems="center">
                <Avatar src={participant.user?.avatar_url || undefined} sx={{ width: 24, height: 24, fontSize: 12 }}>
                  {(participant.user?.display_name || participant.user?.username || 'U').slice(0, 1)}
                </Avatar>
                <Box>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, lineHeight: 1.2 }}>
                    {participant.user?.display_name || participant.user?.username || `User #${participant.user?.id}`}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: darkMode ? '#99a2b8' : '#738198' }}>
                    {participant.participant_role}
                  </Typography>
                </Box>

                {conversation?.conversation_type === 'group' && isOwnerOrAdmin && Number(participant.user?.id) !== Number(user?.id) ? (
                  <Button size="small" color="error" onClick={() => onRemoveParticipant(participant.user?.id)} sx={{ textTransform: 'none', minWidth: 0, px: 0.45 }}>
                    Remove
                  </Button>
                ) : null}
                {isOwner && Number(participant.user?.id) !== Number(user?.id) ? (
                  <Button size="small" onClick={() => onUpdateParticipantRole(participant.user?.id)} sx={{ textTransform: 'none', minWidth: 0, px: 0.45 }}>
                    Role
                  </Button>
                ) : null}
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box> */}

      <ChatInput
        darkMode={darkMode}
        value={composerText}
        onChange={onComposerTextChange}
        onSubmit={onSendMessage}
        onAttach={onAttachToComposer}
        attachment={composerAttachment}
        onClearAttachment={onClearComposerAttachment}
        messageType={composerType}
        onMessageTypeChange={onComposerTypeChange}
        sending={sending}
      />
    </Box>
  )
}
