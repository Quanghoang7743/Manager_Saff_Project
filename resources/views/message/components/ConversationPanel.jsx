import { Avatar, Box, Button, Chip, Stack, Typography } from '@mui/material'
import React from 'react'
import ConversationComposerBlock from './chatInput/ConversationComposerBlock.jsx'

const getConversationTitle = (conversation) => {
  if (!conversation) {
    return 'No conversation selected'
  }

  if (conversation.title?.trim()) {
    return conversation.title
  }

  if (conversation.conversation_type === 'direct') {
    return conversation.direct_peer?.display_name
      || conversation.direct_peer?.username
      || conversation.last_message?.sender?.display_name
      || conversation.last_message?.sender?.username
      || `Direct #${conversation.id}`
  }

  return `Group #${conversation.id}`
}

export default function ConversationPanel({
  darkMode,
  conversation,
  messages,
  loadingMessages,
  hasMore,
  onLoadOlder,
  typingUsers,
  presenceUsers,
  onEditMessage,
  onDeleteMessage,
  onDeleteForEveryone,
  onForwardMessage,
  onReactMessage,
  onUnreactMessage,
  onInspectReactions,
  onInspectMessage,
  onAddAttachmentToMessage,
  onRemoveAttachment,
  composerText,
  onComposerTextChange,
  onSendMessage,
  onAttachToComposer,
  composerAttachment,
  onClearComposerAttachment,
  composerType,
  onComposerTypeChange,
  sending,
  user,
  participants,
  isOwner,
  isOwnerOrAdmin,
  newParticipantIdsInput,
  onNewParticipantIdsInputChange,
  onAddParticipants,
  onRemoveParticipant,
  onUpdateParticipantRole,
  onArchiveToggle,
  onPinToggle,
  onMuteToggle,
  onHideToggle,
  onUpdateGroup,
  onDeleteConversation,
}) {
  const hasConversation = Boolean(conversation)
  const scrollerRef = React.useRef(null)

  React.useEffect(() => {
    if (!hasConversation || !scrollerRef.current) {
      return
    }

    scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight
  }, [hasConversation, messages.length])

  return (
    <Stack sx={{ height: '100%', minHeight: 0, overflow: 'hidden', px: { xs: 2, md: 3 }, py: 2, bgcolor: darkMode ? '#101116' : '#ffffff' }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        justifyContent="space-between"
        spacing={1}
        sx={{ mb: 1.6, borderBottom: darkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(226,230,238,0.82)', pb: 1.1 }}
      >
        <Stack direction="row" spacing={1.1} alignItems="center">
          <Avatar sx={{ width: 34, height: 34, bgcolor: '#d3defa', color: '#2d3e6f', fontSize: 12 }}>
            {getConversationTitle(conversation).slice(0, 1)}
          </Avatar>
          <Box>
            <Typography sx={{ fontWeight: 600, color: darkMode ? '#f5f6fb' : '#141621', lineHeight: 1.1 }}>
              {getConversationTitle(conversation)}
            </Typography>
            <Typography sx={{ color: darkMode ? '#8f97ab' : '#7a8090', fontSize: 12 }}>
              {/* {hasConversation ? `${conversation?.conversation_type || 'chat'} • online ${presenceUsers.length}` : 'Select a conversation from the list'} */}
              Đang online
            </Typography>
          </Box>
        </Stack>

        {/* {hasConversation ? (
          <Stack direction="row" spacing={0.6} flexWrap="wrap">
            <Button size="small" variant="outlined" onClick={onArchiveToggle} sx={{ textTransform: 'none' }}>
              {conversation?.my_participant_settings?.is_archived ? 'Unarchive' : 'Archive'}
            </Button>
            <Button size="small" variant="outlined" onClick={onPinToggle} sx={{ textTransform: 'none' }}>
              {conversation?.my_participant_settings?.is_pinned ? 'Unpin' : 'Pin'}
            </Button>
            <Button size="small" variant="outlined" onClick={onMuteToggle} sx={{ textTransform: 'none' }}>
              {conversation?.my_participant_settings?.is_muted ? 'Unmute' : 'Mute'}
            </Button>
            <Button size="small" variant="outlined" onClick={onHideToggle} sx={{ textTransform: 'none' }}>
              {conversation?.my_participant_settings?.is_hidden ? 'Unhide' : 'Hide'}
            </Button>
            {conversation?.conversation_type === 'group' && isOwnerOrAdmin ? (
              <Button size="small" variant="outlined" onClick={onUpdateGroup} sx={{ textTransform: 'none' }}>
                Edit
              </Button>
            ) : null}
            {isOwnerOrAdmin ? (
              <Button size="small" variant="outlined" color="error" onClick={onDeleteConversation} sx={{ textTransform: 'none' }}>
                Delete
              </Button>
            ) : null}
          </Stack>
        ) : null} */}
        {hasConversation ? (
          <Stack direction={"row"} spacing={1} alignItems={"center"}>
            <Button
              sx={{
                minWidth: 0,
                p: 1
              }}
            >
              <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M16.1007 13.359L15.5719 12.8272H15.5719L16.1007 13.359ZM16.5562 12.9062L17.085 13.438H17.085L16.5562 12.9062ZM18.9728 12.5894L18.6146 13.2483L18.9728 12.5894ZM20.8833 13.628L20.5251 14.2869L20.8833 13.628ZM21.4217 16.883L21.9505 17.4148L21.4217 16.883ZM20.0011 18.2954L19.4723 17.7636L20.0011 18.2954ZM18.6763 18.9651L18.7459 19.7119H18.7459L18.6763 18.9651ZM8.81536 14.7266L9.34418 14.1947L8.81536 14.7266ZM4.00289 5.74561L3.2541 5.78816L3.2541 5.78816L4.00289 5.74561ZM10.4775 7.19738L11.0063 7.72922H11.0063L10.4775 7.19738ZM10.6342 4.54348L11.2346 4.09401L10.6342 4.54348ZM9.37326 2.85908L8.77286 3.30855V3.30855L9.37326 2.85908ZM6.26145 2.57483L6.79027 3.10667H6.79027L6.26145 2.57483ZM4.69185 4.13552L4.16303 3.60368H4.16303L4.69185 4.13552ZM12.0631 11.4972L12.5919 10.9654L12.0631 11.4972ZM16.6295 13.8909L17.085 13.438L16.0273 12.3743L15.5719 12.8272L16.6295 13.8909ZM18.6146 13.2483L20.5251 14.2869L21.2415 12.9691L19.331 11.9305L18.6146 13.2483ZM20.8929 16.3511L19.4723 17.7636L20.5299 18.8273L21.9505 17.4148L20.8929 16.3511ZM18.6067 18.2184C17.1568 18.3535 13.4056 18.2331 9.34418 14.1947L8.28654 15.2584C12.7186 19.6653 16.9369 19.8805 18.7459 19.7119L18.6067 18.2184ZM9.34418 14.1947C5.4728 10.3453 4.83151 7.10765 4.75168 5.70305L3.2541 5.78816C3.35456 7.55599 4.14863 11.144 8.28654 15.2584L9.34418 14.1947ZM10.7195 8.01441L11.0063 7.72922L9.9487 6.66555L9.66189 6.95073L10.7195 8.01441ZM11.2346 4.09401L9.97365 2.40961L8.77286 3.30855L10.0338 4.99296L11.2346 4.09401ZM5.73263 2.04299L4.16303 3.60368L5.22067 4.66736L6.79027 3.10667L5.73263 2.04299ZM10.1907 7.48257C9.66189 6.95073 9.66117 6.95144 9.66045 6.95216C9.66021 6.9524 9.65949 6.95313 9.659 6.95362C9.65802 6.95461 9.65702 6.95561 9.65601 6.95664C9.65398 6.95871 9.65188 6.96086 9.64972 6.9631C9.64539 6.96759 9.64081 6.97245 9.63599 6.97769C9.62634 6.98816 9.61575 7.00014 9.60441 7.01367C9.58174 7.04072 9.55605 7.07403 9.52905 7.11388C9.47492 7.19377 9.41594 7.2994 9.36589 7.43224C9.26376 7.70329 9.20901 8.0606 9.27765 8.50305C9.41189 9.36833 10.0078 10.5113 11.5343 12.0291L12.5919 10.9654C11.1634 9.54499 10.8231 8.68059 10.7599 8.27309C10.7298 8.07916 10.761 7.98371 10.7696 7.96111C10.7748 7.94713 10.7773 7.9457 10.7709 7.95525C10.7677 7.95992 10.7624 7.96723 10.7541 7.97708C10.75 7.98201 10.7451 7.98759 10.7394 7.99381C10.7365 7.99692 10.7335 8.00019 10.7301 8.00362C10.7285 8.00534 10.7268 8.00709 10.725 8.00889C10.7241 8.00979 10.7232 8.0107 10.7223 8.01162C10.7219 8.01208 10.7212 8.01278 10.7209 8.01301C10.7202 8.01371 10.7195 8.01441 10.1907 7.48257ZM11.5343 12.0291C13.0613 13.5474 14.2096 14.1383 15.0763 14.2713C15.5192 14.3392 15.8763 14.285 16.1472 14.1841C16.28 14.1346 16.3858 14.0763 16.4658 14.0227C16.5058 13.9959 16.5392 13.9704 16.5663 13.9479C16.5799 13.9367 16.5919 13.9262 16.6024 13.9166C16.6077 13.9118 16.6126 13.9073 16.6171 13.903C16.6194 13.9008 16.6215 13.8987 16.6236 13.8967C16.6246 13.8957 16.6256 13.8947 16.6266 13.8937C16.6271 13.8932 16.6279 13.8925 16.6281 13.8923C16.6288 13.8916 16.6295 13.8909 16.1007 13.359C15.5719 12.8272 15.5726 12.8265 15.5733 12.8258C15.5735 12.8256 15.5742 12.8249 15.5747 12.8244C15.5756 12.8235 15.5765 12.8226 15.5774 12.8217C15.5793 12.82 15.581 12.8183 15.5827 12.8166C15.5862 12.8133 15.5895 12.8103 15.5926 12.8074C15.5988 12.8018 15.6044 12.7969 15.6094 12.7929C15.6192 12.7847 15.6265 12.7795 15.631 12.7764C15.6403 12.7702 15.6384 12.773 15.6236 12.7785C15.5991 12.7876 15.501 12.8189 15.3038 12.7886C14.8905 12.7253 14.02 12.3853 12.5919 10.9654L11.5343 12.0291ZM9.97365 2.40961C8.95434 1.04802 6.94996 0.83257 5.73263 2.04299L6.79027 3.10667C7.32195 2.578 8.26623 2.63181 8.77286 3.30855L9.97365 2.40961ZM4.75168 5.70305C4.73201 5.35694 4.89075 4.9954 5.22067 4.66736L4.16303 3.60368C3.62571 4.13795 3.20329 4.89425 3.2541 5.78816L4.75168 5.70305ZM19.4723 17.7636C19.1975 18.0369 18.9029 18.1908 18.6067 18.2184L18.7459 19.7119C19.4805 19.6434 20.0824 19.2723 20.5299 18.8273L19.4723 17.7636ZM11.0063 7.72922C11.9908 6.7503 12.064 5.2019 11.2346 4.09401L10.0338 4.99295C10.4373 5.53193 10.3773 6.23938 9.9487 6.66555L11.0063 7.72922ZM20.5251 14.2869C21.3429 14.7315 21.4703 15.7769 20.8929 16.3511L21.9505 17.4148C23.2908 16.0821 22.8775 13.8584 21.2415 12.9691L20.5251 14.2869ZM17.085 13.438C17.469 13.0562 18.0871 12.9616 18.6146 13.2483L19.331 11.9305C18.2474 11.3414 16.9026 11.5041 16.0273 12.3743L17.085 13.438Z" fill="#212121"></path> </g></svg>
            </Button>

            <Button
              sx={{
                minWidth: 0,
                p: 0
              }}
            >
              <svg fill="#000000" width="35px" height="35px" viewBox="-5.5 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>video-camera</title> <path d="M18.76 23.3c-0.2 0-0.36-0.080-0.52-0.2l-3.84-3.040c0 1.16-0.96 2.080-2.080 2.080h-10.24c-1.16 0-2.080-0.96-2.080-2.080v-8.12c0-1.16 0.96-2.080 2.080-2.080h10.2c1.16 0 2.080 0.96 2.080 2.080v0l3.84-3.040c0.16-0.12 0.32-0.2 0.52-0.2 1.2 0 2.2 1 2.2 2.2v10.2c0.040 1.24-0.96 2.2-2.16 2.2zM13.56 17.5c0.2 0 0.36 0.080 0.52 0.2l4.92 3.88c0.16-0.080 0.28-0.24 0.28-0.44v-10.2c0-0.2-0.12-0.36-0.28-0.44l-4.92 3.88c-0.24 0.2-0.6 0.24-0.88 0.080s-0.48-0.44-0.48-0.76v-1.76c0-0.24-0.2-0.4-0.4-0.4h-10.24c-0.24 0-0.4 0.2-0.4 0.4v8.16c0 0.24 0.2 0.4 0.4 0.4h10.2c0.24 0 0.4-0.2 0.4-0.4v-1.76c0-0.32 0.2-0.6 0.48-0.76 0.16-0.040 0.28-0.080 0.4-0.080z"></path> </g></svg>
            </Button>
          </Stack>

        ) : null}
      </Stack>

      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Stack ref={scrollerRef} spacing={1} sx={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', pb: 1.4, pr: 0.3 }}>
          {hasConversation ? (
            <Button
              size="small"
              variant="text"
              onClick={onLoadOlder}
              disabled={!hasMore || loadingMessages}
              sx={{ textTransform: 'none', alignSelf: 'center' }}
            >
              {loadingMessages ? 'Loading...' : hasMore ? 'Load older messages' : 'No older messages'}
            </Button>
          ) : null}

          {messages.map((message) => {
            const mine = Number(message?.sender?.id || message?.sender_id) === Number(user?.id)
            const senderName = message?.sender?.display_name
              || message?.sender?.username
              || (mine ? 'You' : `User #${message?.sender_id || 'unknown'}`)
            const deletedForEveryone = Boolean(message.deleted_for_everyone_at)

            return (
              <Box key={message.id} sx={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                <Box
                  sx={{
                    maxWidth: { xs: '95%', md: '76%' },
                    px: 1.2,
                    py: 0.95,
                    borderRadius: '16px',
                    border: `1px solid ${mine ? '#2f80ff' : '#dbe3f0'}`,
                    bgcolor: mine ? '#2f80ff' : '#ffffff',
                    color: mine ? '#ffffff' : '#1c1f2a',
                  }}
                >
                  {/* <Typography sx={{ fontSize: 11.5, fontWeight: 700, opacity: mine ? 0.9 : 0.7, mb: 0.35 }}>{senderName}</Typography> */}
                  <Typography sx={{ fontSize: 14, whiteSpace: 'pre-wrap' }}>
                    {deletedForEveryone ? '[Deleted for everyone]' : message.content || '[No content]'}
                  </Typography>

                  {Array.isArray(message.attachments) && message.attachments.length > 0 ? (
                    <Stack spacing={0.45} sx={{ mt: 0.8 }}>
                      {message.attachments.map((attachment) => (
                        <Box
                          key={attachment.id || attachment.storage_key}
                          sx={{
                            p: 0.55,
                            borderRadius: '10px',
                            bgcolor: mine ? 'rgba(255,255,255,0.16)' : '#f1f5f9',
                            border: mine ? '1px solid rgba(255,255,255,0.25)' : '1px solid #d7e0ec',
                          }}
                        >
                          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={0.8}>
                            <Box>
                              <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{attachment.file_name || attachment.storage_key}</Typography>
                              <Typography sx={{ fontSize: 11, opacity: 0.8 }}>{attachment.attachment_type} • {attachment.mime_type || 'unknown'}</Typography>
                            </Box>
                            {attachment.id ? (
                              <Button
                                size="small"
                                onClick={() => onRemoveAttachment(attachment.id)}
                                sx={{ textTransform: 'none', color: mine ? '#dbeafe' : '#ef4444', minWidth: 0, px: 0.6 }}
                              >
                                Remove
                              </Button>
                            ) : null}
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  ) : null}

                  {Array.isArray(message.reaction_summary) && message.reaction_summary.length > 0 ? (
                    <Stack direction="row" spacing={0.45} sx={{ mt: 0.7, flexWrap: 'wrap' }}>
                      {message.reaction_summary.map((reaction) => (
                        <Chip
                          key={`${message.id}-${reaction.reaction_code}`}
                          label={`${reaction.reaction_code} ${reaction.total}`}
                          size="small"
                          sx={{
                            bgcolor: mine ? 'rgba(255,255,255,0.22)' : '#e5eef9',
                            color: mine ? '#fff' : '#1e293b',
                          }}
                        />
                      ))}
                    </Stack>
                  ) : null}

                  {/* <Stack direction="row" spacing={0.35} sx={{ mt: 0.7, flexWrap: 'wrap' }}>
                  <Button size="small" onClick={() => onReactMessage(message, '👍')} sx={{ textTransform: 'none', color: mine ? '#dbeafe' : '#2563eb', minWidth: 0, px: 0.5 }}>
                    👍
                  </Button>
                  <Button size="small" onClick={() => onReactMessage(message)} sx={{ textTransform: 'none', color: mine ? '#dbeafe' : '#2563eb', minWidth: 0, px: 0.5 }}>
                    React
                  </Button>
                  <Button size="small" onClick={() => onUnreactMessage(message)} sx={{ textTransform: 'none', color: mine ? '#dbeafe' : '#2563eb', minWidth: 0, px: 0.5 }}>
                    Unreact
                  </Button>
                  <Button size="small" onClick={() => onInspectReactions(message)} sx={{ textTransform: 'none', color: mine ? '#dbeafe' : '#2563eb', minWidth: 0, px: 0.5 }}>
                    Reactions
                  </Button>
                  <Button size="small" onClick={() => onForwardMessage(message)} sx={{ textTransform: 'none', color: mine ? '#dbeafe' : '#2563eb', minWidth: 0, px: 0.5 }}>
                    Forward
                  </Button>
                  <Button size="small" onClick={() => onInspectMessage(message)} sx={{ textTransform: 'none', color: mine ? '#dbeafe' : '#2563eb', minWidth: 0, px: 0.5 }}>
                    Detail
                  </Button>
                  <Button size="small" onClick={() => onAddAttachmentToMessage(message)} sx={{ textTransform: 'none', color: mine ? '#dbeafe' : '#2563eb', minWidth: 0, px: 0.5 }}>
                    Attach
                  </Button>
                  {mine ? (
                    <>
                      <Button size="small" onClick={() => onEditMessage(message)} sx={{ textTransform: 'none', color: mine ? '#dbeafe' : '#2563eb', minWidth: 0, px: 0.5 }}>
                        Edit
                      </Button>
                      <Button size="small" onClick={() => onDeleteMessage(message)} sx={{ textTransform: 'none', color: mine ? '#dbeafe' : '#ef4444', minWidth: 0, px: 0.5 }}>
                        Delete
                      </Button>
                      <Button size="small" onClick={() => onDeleteForEveryone(message)} sx={{ textTransform: 'none', color: mine ? '#dbeafe' : '#ef4444', minWidth: 0, px: 0.5 }}>
                        Del all
                      </Button>
                    </>
                  ) : null}
                </Stack> */}

                  <Typography sx={{ fontSize: 10.8, opacity: mine ? 0.8 : 0.6, mt: 0.25, textAlign: 'right' }}>{message.sent_at || ''}</Typography>
                </Box>
              </Box>
            )
          })}

          {Object.keys(typingUsers).length > 0 ? (
            <Typography sx={{ color: darkMode ? '#8f97ab' : '#7a8090', fontSize: 12, fontStyle: 'italic' }}>
              {Object.values(typingUsers).map((item) => item.display_name || item.username || `User #${item.id}`).join(', ')} typing...
            </Typography>
          ) : null}

          {!hasConversation ? (
            <Box sx={{ flex: 1, display: 'grid', placeItems: 'center' }}>
              <Typography sx={{ color: darkMode ? '#8f97ab' : '#7a8090', fontSize: 14 }}>
                Select a conversation to start chatting.
              </Typography>
            </Box>
          ) : null}
        </Stack>

        {hasConversation ? (
          <ConversationComposerBlock
            darkMode={darkMode}
            conversation={conversation}
            participants={participants}
            isOwner={isOwner}
            isOwnerOrAdmin={isOwnerOrAdmin}
            user={user}
            newParticipantIdsInput={newParticipantIdsInput}
            onNewParticipantIdsInputChange={onNewParticipantIdsInputChange}
            onAddParticipants={onAddParticipants}
            onRemoveParticipant={onRemoveParticipant}
            onUpdateParticipantRole={onUpdateParticipantRole}
            composerText={composerText}
            onComposerTextChange={onComposerTextChange}
            onSendMessage={onSendMessage}
            onAttachToComposer={onAttachToComposer}
            composerAttachment={composerAttachment}
            onClearComposerAttachment={onClearComposerAttachment}
            composerType={composerType}
            onComposerTypeChange={onComposerTypeChange}
            sending={sending}
          />
        ) : null}
      </Box>
    </Stack>
  )
}
