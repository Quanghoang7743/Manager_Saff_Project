import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  InputBase,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import React from 'react'
import { useAuth } from '../../../js/context/AuthContext.jsx'
import { conversationsApi } from '../../../js/api/conversationsApi.js'
import { messagesApi } from '../../../js/api/messagesApi.js'
import { asConversationCollection, toArray } from '../../../js/utils/dataShape.js'
import { createClientMessageId } from '../../../js/utils/chatIds.js'
import { subscribeConversationChannel, joinConversationPresence } from '../../../js/realtime/conversationRealtime.js'
import { toApiError } from '../../../js/api/response.js'
import { subscribeUserChannel } from '../../../js/realtime/userRealtime.js'

const MESSAGE_PAGE_SIZE = 30

const uniqueById = (items) => {
  const map = new Map()

  items.forEach((item) => {
    map.set(item.id, item)
  })

  return Array.from(map.values())
}

const getConversationTitle = (conversation) => {
  if (!conversation) {
    return 'Conversation'
  }

  if (conversation.title?.trim()) {
    return conversation.title
  }

  if (conversation.conversation_type === 'direct') {
    const fallback = conversation.last_message?.sender?.display_name
      || conversation.last_message?.sender?.username
      || `Direct #${conversation.id}`

    return fallback
  }

  return `Group #${conversation.id}`
}

const toMysqlDatetime = (date) => {
  const pad = (value) => value.toString().padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export default function ChatSection({ notify, directTargetUserId, onConsumedDirectTarget }) {
  const { user } = useAuth()

  const [loadingConversations, setLoadingConversations] = React.useState(false)
  const [loadingMessages, setLoadingMessages] = React.useState(false)
  const [loadingParticipants, setLoadingParticipants] = React.useState(false)

  const [filters, setFilters] = React.useState({
    type: 'all',
    archived: false,
    pinned: false,
    hidden: false,
  })

  const [conversations, setConversations] = React.useState([])
  const [conversationsMeta, setConversationsMeta] = React.useState({
    current_page: 1,
    last_page: 1,
    per_page: 0,
    total: 0,
  })
  const [activeConversationId, setActiveConversationId] = React.useState(null)

  const [messagesByConversation, setMessagesByConversation] = React.useState({})
  const [participantsByConversation, setParticipantsByConversation] = React.useState({})
  const [presenceUsers, setPresenceUsers] = React.useState([])
  const [typingUsers, setTypingUsers] = React.useState({})

  const [composerText, setComposerText] = React.useState('')
  const [composerType, setComposerType] = React.useState('text')
  const [composerAttachment, setComposerAttachment] = React.useState(null)
  const [sending, setSending] = React.useState(false)

  const [directUserIdInput, setDirectUserIdInput] = React.useState('')
  const [groupForm, setGroupForm] = React.useState({
    title: '',
    description: '',
    participantIds: '',
  })
  const [newParticipantIdsInput, setNewParticipantIdsInput] = React.useState('')

  const activeConversationIdRef = React.useRef(null)
  const messagesByConversationRef = React.useRef({})
  const refreshTimerRef = React.useRef(null)
  const typingDebounceRef = React.useRef(null)
  const typingStopRef = React.useRef(null)
  const remoteTypingTimeoutRef = React.useRef({})
  const receiptsRef = React.useRef({})

  React.useEffect(() => {
    activeConversationIdRef.current = activeConversationId
  }, [activeConversationId])

  React.useEffect(() => {
    messagesByConversationRef.current = messagesByConversation
  }, [messagesByConversation])

  const currentConversation = React.useMemo(
    () => conversations.find((conversation) => Number(conversation.id) === Number(activeConversationId)) || null,
    [activeConversationId, conversations],
  )

  const currentMessagesState = messagesByConversation[activeConversationId] || {
    items: [],
    hasMore: false,
  }

  const currentMessagesDesc = currentMessagesState.items || []

  const currentMessagesAsc = React.useMemo(() => {
    return [...currentMessagesDesc].sort((a, b) => {
      const aid = Number(a.id)
      const bid = Number(b.id)
      if (Number.isFinite(aid) && Number.isFinite(bid)) {
        return aid - bid
      }

      return String(a.id).localeCompare(String(b.id))
    })
  }, [currentMessagesDesc])

  const currentParticipants = participantsByConversation[activeConversationId] || []

  const role = currentConversation?.my_participant_settings?.participant_role || 'member'
  const isOwner = role === 'owner'
  const isOwnerOrAdmin = role === 'owner' || role === 'admin'

  const upsertMessageInConversation = React.useCallback((conversationId, patch) => {
    setMessagesByConversation((previous) => {
      const key = String(conversationId)
      const current = previous[key] || { items: [], hasMore: false }
      const nextItems = uniqueById([
        patch,
        ...current.items.filter((item) => String(item.id) !== String(patch.id)),
      ])

      return {
        ...previous,
        [key]: {
          ...current,
          items: nextItems,
        },
      }
    })
  }, [])

  const patchMessageInConversation = React.useCallback((conversationId, messageId, patch) => {
    setMessagesByConversation((previous) => {
      const key = String(conversationId)
      const current = previous[key]
      if (!current) {
        return previous
      }

      return {
        ...previous,
        [key]: {
          ...current,
          items: current.items.map((item) => {
            if (String(item.id) !== String(messageId)) {
              return item
            }

            return {
              ...item,
              ...patch,
            }
          }),
        },
      }
    })
  }, [])

  const fetchConversations = React.useCallback(async () => {
    setLoadingConversations(true)

    try {
      const params = {
        per_page: 40,
      }

      if (filters.type !== 'all') {
        params.type = filters.type
      }

      if (filters.archived) {
        params.archived = true
      }

      if (filters.pinned) {
        params.pinned = true
      }

      if (filters.hidden) {
        params.hidden = true
      }

      const payload = await conversationsApi.list(params)
      const normalized = asConversationCollection(payload)
      const items = normalized.items

      setConversations(items)
      setConversationsMeta(normalized.meta)

      if (items.length === 0) {
        setActiveConversationId(null)
        return
      }

      setActiveConversationId((previous) => {
        if (!previous) {
          return items[0].id
        }

        const stillExists = items.some((item) => Number(item.id) === Number(previous))
        return stillExists ? previous : items[0].id
      })
    } catch (error) {
      const apiError = toApiError(error, 'Could not fetch conversations')
      notify(apiError.message)
    } finally {
      setLoadingConversations(false)
    }
  }, [filters.archived, filters.hidden, filters.pinned, filters.type, notify])

  const scheduleConversationRefresh = React.useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current)
    }

    refreshTimerRef.current = setTimeout(() => {
      refreshTimerRef.current = null
      fetchConversations()
    }, 300)
  }, [fetchConversations])

  const fetchConversationMessages = React.useCallback(async (conversationId, append = false) => {
    if (!conversationId) {
      return
    }

    setLoadingMessages(true)

    try {
      const key = String(conversationId)
      const current = messagesByConversationRef.current[key] || { items: [] }
      const currentItems = current.items || []

      const params = {
        limit: MESSAGE_PAGE_SIZE,
      }

      if (append) {
        const numericIds = currentItems
          .map((message) => Number(message.id))
          .filter((id) => Number.isFinite(id))

        if (numericIds.length > 0) {
          params.cursor_id = Math.min(...numericIds)
        }
      }

      const payload = await messagesApi.list(conversationId, params)
      const incoming = toArray(payload)

      setMessagesByConversation((previous) => {
        const currentState = previous[key] || { items: [], hasMore: false }
        const merged = append
          ? uniqueById([...currentState.items, ...incoming])
          : uniqueById(incoming)

        return {
          ...previous,
          [key]: {
            ...currentState,
            items: merged,
            hasMore: incoming.length >= MESSAGE_PAGE_SIZE,
          },
        }
      })
    } catch (error) {
      const apiError = toApiError(error, 'Could not fetch messages')
      notify(apiError.message)
    } finally {
      setLoadingMessages(false)
    }
  }, [notify])

  const fetchParticipants = React.useCallback(async (conversationId) => {
    if (!conversationId) {
      return
    }

    setLoadingParticipants(true)

    try {
      const payload = await conversationsApi.listParticipants(conversationId)
      const participants = toArray(payload)

      setParticipantsByConversation((previous) => ({
        ...previous,
        [String(conversationId)]: participants,
      }))
    } catch (error) {
      const apiError = toApiError(error, 'Could not fetch participants')
      notify(apiError.message)
    } finally {
      setLoadingParticipants(false)
    }
  }, [notify])

  const fetchConversationDetail = React.useCallback(async (conversationId) => {
    if (!conversationId) {
      return
    }

    try {
      const conversation = await conversationsApi.show(conversationId)

      setConversations((previous) => {
        const existed = previous.some((item) => Number(item.id) === Number(conversation.id))
        if (!existed) {
          return [conversation, ...previous]
        }

        return previous.map((item) => (Number(item.id) === Number(conversation.id) ? conversation : item))
      })
    } catch (_error) {
      // ignore detail sync errors
    }
  }, [])

  React.useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  React.useEffect(() => {
    if (!activeConversationId) {
      return
    }

    fetchConversationDetail(activeConversationId)
    fetchConversationMessages(activeConversationId, false)
    fetchParticipants(activeConversationId)
    setTypingUsers({})
  }, [activeConversationId, fetchConversationDetail, fetchConversationMessages, fetchParticipants])

  React.useEffect(() => {
    if (!directTargetUserId) {
      return
    }

    const targetUserId = Number(directTargetUserId)
    if (!Number.isFinite(targetUserId)) {
      onConsumedDirectTarget?.()
      return
    }

    const run = async () => {
      try {
        const payload = await conversationsApi.createDirect(targetUserId)
        const conversation = payload
        notify('Direct conversation opened')
        setConversations((previous) => {
          const next = uniqueById([conversation, ...previous.filter((item) => Number(item.id) !== Number(conversation.id))])
          return next
        })
        setActiveConversationId(conversation.id)
      } catch (error) {
        const apiError = toApiError(error, 'Could not open direct conversation')
        notify(apiError.message)
      } finally {
        onConsumedDirectTarget?.()
      }
    }

    run()
  }, [directTargetUserId, notify, onConsumedDirectTarget])

  React.useEffect(() => {
    const ids = conversations.map((conversation) => conversation.id)
    if (!user?.id || ids.length === 0) {
      return undefined
    }

    const removeFns = ids.map((conversationId) => {
      return subscribeConversationChannel(conversationId, {
        onMessageCreated: (payload) => {
          if (!payload?.message || !payload?.conversation_id) {
            return
          }

          upsertMessageInConversation(payload.conversation_id, payload.message)
          scheduleConversationRefresh()
        },
        onMessageUpdated: (payload) => {
          if (!payload?.message || !payload?.conversation_id) {
            return
          }

          patchMessageInConversation(payload.conversation_id, payload.message.id, payload.message)
          scheduleConversationRefresh()
        },
        onMessageDeletedForEveryone: (payload) => {
          if (!payload?.conversation_id || !payload?.message_id) {
            return
          }

          patchMessageInConversation(payload.conversation_id, payload.message_id, {
            deleted_for_everyone_at: payload.deleted_for_everyone_at,
            content: null,
            content_json: null,
          })
          scheduleConversationRefresh()
        },
        onReactionChanged: (payload) => {
          if (!payload?.conversation_id || !payload?.message_id) {
            return
          }

          patchMessageInConversation(payload.conversation_id, payload.message_id, {
            reaction_summary: payload.summary || [],
          })
        },
        onReadUpdated: (payload) => {
          if (!payload?.conversation_id || !payload?.user_id) {
            return
          }

          setParticipantsByConversation((previous) => {
            const key = String(payload.conversation_id)
            const current = previous[key]
            if (!current) {
              return previous
            }

            return {
              ...previous,
              [key]: current.map((participant) => {
                if (Number(participant?.user?.id) !== Number(payload.user_id)) {
                  return participant
                }

                return {
                  ...participant,
                  last_read_message_id: payload.last_read_message_id,
                  last_read_at: payload.last_read_at,
                  unread_count_cache: payload.unread_count_cache,
                }
              }),
            }
          })

          scheduleConversationRefresh()
        },
        onDeliveredUpdated: (payload) => {
          if (!payload?.conversation_id || !payload?.user_id) {
            return
          }

          setParticipantsByConversation((previous) => {
            const key = String(payload.conversation_id)
            const current = previous[key]
            if (!current) {
              return previous
            }

            return {
              ...previous,
              [key]: current.map((participant) => {
                if (Number(participant?.user?.id) !== Number(payload.user_id)) {
                  return participant
                }

                return {
                  ...participant,
                  last_delivered_message_id: payload.last_delivered_message_id,
                  last_delivered_at: payload.last_delivered_at,
                }
              }),
            }
          })
        },
        onTypingUpdated: (payload) => {
          if (!payload?.conversation_id || !payload?.user || Number(payload.user.id) === Number(user?.id)) {
            return
          }

          if (Number(payload.conversation_id) !== Number(activeConversationIdRef.current)) {
            return
          }

          const actorId = Number(payload.user.id)
          const key = String(actorId)

          setTypingUsers((previous) => {
            if (!payload.is_typing) {
              const next = { ...previous }
              delete next[key]
              return next
            }

            return {
              ...previous,
              [key]: payload.user,
            }
          })

          if (remoteTypingTimeoutRef.current[key]) {
            clearTimeout(remoteTypingTimeoutRef.current[key])
          }

          remoteTypingTimeoutRef.current[key] = setTimeout(() => {
            setTypingUsers((previous) => {
              const next = { ...previous }
              delete next[key]
              return next
            })
          }, 2400)
        },
      })
    })

    return () => {
      removeFns.forEach((remove) => remove())
    }
  }, [conversations, patchMessageInConversation, scheduleConversationRefresh, upsertMessageInConversation, user?.id])

  React.useEffect(() => {
    if (!user?.id) {
      return undefined
    }

    return subscribeUserChannel(user.id, {
      onConversationSettingsUpdated: () => {
        scheduleConversationRefresh()
      },
    })
  }, [scheduleConversationRefresh, user?.id])

  React.useEffect(() => {
    if (!activeConversationId) {
      setPresenceUsers([])
      return undefined
    }

    return joinConversationPresence(activeConversationId, {
      onHere: (members) => setPresenceUsers(members || []),
      onJoining: (member) => setPresenceUsers((previous) => uniqueById([...(previous || []), member])),
      onLeaving: (member) => {
        setPresenceUsers((previous) => previous.filter((item) => Number(item.id) !== Number(member.id)))
      },
      onError: () => {
        setPresenceUsers([])
      },
    })
  }, [activeConversationId])

  const latestMessageId = React.useMemo(() => {
    const numericIds = currentMessagesDesc
      .map((message) => Number(message.id))
      .filter((id) => Number.isFinite(id))

    if (numericIds.length === 0) {
      return null
    }

    return Math.max(...numericIds)
  }, [currentMessagesDesc])

  React.useEffect(() => {
    if (!activeConversationId || !user?.id || !latestMessageId) {
      return
    }

    const key = String(activeConversationId)
    const marker = receiptsRef.current[key] || { read: null, delivered: null }

    if (marker.delivered !== latestMessageId) {
      marker.delivered = latestMessageId
      conversationsApi.markDelivered(activeConversationId, user.id, latestMessageId).catch(() => {})
    }

    if (marker.read !== latestMessageId) {
      marker.read = latestMessageId
      conversationsApi.markRead(activeConversationId, user.id, latestMessageId).catch(() => {})
    }

    receiptsRef.current[key] = marker
  }, [activeConversationId, latestMessageId, user?.id])

  React.useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current)
      }
      if (typingDebounceRef.current) {
        clearTimeout(typingDebounceRef.current)
      }
      if (typingStopRef.current) {
        clearTimeout(typingStopRef.current)
      }

      Object.values(remoteTypingTimeoutRef.current).forEach((timerId) => clearTimeout(timerId))
      remoteTypingTimeoutRef.current = {}
    }
  }, [])

  const setTypingStatus = React.useCallback(async (isTyping) => {
    if (!activeConversationId) {
      return
    }

    try {
      await conversationsApi.typing(activeConversationId, isTyping)
    } catch (_error) {
      // ignore typing errors
    }
  }, [activeConversationId])

  const signalTyping = React.useCallback(() => {
    if (!activeConversationId) {
      return
    }

    if (typingDebounceRef.current) {
      clearTimeout(typingDebounceRef.current)
    }

    if (typingStopRef.current) {
      clearTimeout(typingStopRef.current)
    }

    typingDebounceRef.current = setTimeout(() => {
      setTypingStatus(true)
    }, 240)

    typingStopRef.current = setTimeout(() => {
      setTypingStatus(false)
    }, 1600)
  }, [activeConversationId, setTypingStatus])

  const handleCreateDirectConversation = async () => {
    const targetUserId = Number(directUserIdInput)
    if (!Number.isFinite(targetUserId)) {
      notify('Target user id is invalid')
      return
    }

    try {
      const conversation = await conversationsApi.createDirect(targetUserId)
      notify('Direct conversation ready')
      setDirectUserIdInput('')
      setConversations((previous) => uniqueById([conversation, ...previous]))
      setActiveConversationId(conversation.id)
      fetchConversations()
    } catch (error) {
      const apiError = toApiError(error, 'Could not create direct conversation')
      notify(apiError.message)
    }
  }

  const handleCreateGroupConversation = async () => {
    const title = groupForm.title.trim()
    if (!title) {
      notify('Group title is required')
      return
    }

    const participantIds = groupForm.participantIds
      .split(',')
      .map((value) => Number(value.trim()))
      .filter((value) => Number.isFinite(value))

    try {
      const conversation = await conversationsApi.createGroup({
        title,
        description: groupForm.description || null,
        participant_ids: participantIds,
      })

      notify('Group conversation created')
      setGroupForm({ title: '', description: '', participantIds: '' })
      setConversations((previous) => uniqueById([conversation, ...previous]))
      setActiveConversationId(conversation.id)
      fetchConversations()
    } catch (error) {
      const apiError = toApiError(error, 'Could not create group conversation')
      notify(apiError.message)
    }
  }

  const handleSendMessage = async () => {
    if (!activeConversationId) {
      return
    }

    const content = composerText.trim()
    if (!content && !composerAttachment) {
      return
    }

    setSending(true)

    const clientMessageId = createClientMessageId()
    const tempId = `temp-${clientMessageId}`
    const optimisticMessage = {
      id: tempId,
      conversation_id: activeConversationId,
      sender: {
        id: user?.id,
        display_name: user?.display_name,
        username: user?.username,
        avatar_url: user?.avatar_url,
      },
      sender_id: user?.id,
      client_message_id: clientMessageId,
      message_type: composerType,
      content,
      content_json: null,
      sent_at: new Date().toISOString(),
      message_status: 'sending',
      has_attachments: Boolean(composerAttachment),
      attachments: composerAttachment ? [composerAttachment] : [],
      reactions: [],
    }

    upsertMessageInConversation(activeConversationId, optimisticMessage)

    try {
      const message = await messagesApi.send(activeConversationId, {
        client_message_id: clientMessageId,
        message_type: composerType,
        content: content || null,
        attachments: composerAttachment ? [composerAttachment] : undefined,
      })

      setComposerText('')
      setComposerType('text')
      setComposerAttachment(null)
      setTypingStatus(false)

      setMessagesByConversation((previous) => {
        const key = String(activeConversationId)
        const current = previous[key] || { items: [], hasMore: false }

        return {
          ...previous,
          [key]: {
            ...current,
            items: uniqueById([
              message,
              ...current.items.filter((item) => String(item.id) !== tempId),
            ]),
          },
        }
      })

      scheduleConversationRefresh()
    } catch (error) {
      setMessagesByConversation((previous) => {
        const key = String(activeConversationId)
        const current = previous[key]
        if (!current) {
          return previous
        }

        return {
          ...previous,
          [key]: {
            ...current,
            items: current.items.filter((item) => String(item.id) !== tempId),
          },
        }
      })

      const apiError = toApiError(error, 'Could not send message')
      notify(apiError.message)
    } finally {
      setSending(false)
    }
  }

  const handleLoadOlderMessages = () => {
    if (!activeConversationId || !currentMessagesState.hasMore || loadingMessages) {
      return
    }

    fetchConversationMessages(activeConversationId, true)
  }

  const handleEditMessage = async (message) => {
    const next = window.prompt('Edit message content', message.content || '')
    if (next === null) {
      return
    }

    try {
      const updated = await messagesApi.update(message.id, { content: next })
      upsertMessageInConversation(activeConversationId, updated)
      notify('Message updated')
    } catch (error) {
      const apiError = toApiError(error, 'Could not update message')
      notify(apiError.message)
    }
  }

  const handleDeleteMessage = async (message) => {
    try {
      await messagesApi.destroy(message.id)
      patchMessageInConversation(activeConversationId, message.id, {
        sender_deleted_at: new Date().toISOString(),
      })
      notify('Message deleted for your view')
    } catch (error) {
      const apiError = toApiError(error, 'Could not delete message')
      notify(apiError.message)
    }
  }

  const handleDeleteForEveryone = async (message) => {
    if (!window.confirm('Delete this message for everyone?')) {
      return
    }

    try {
      await messagesApi.deleteForEveryone(message.id)
      patchMessageInConversation(activeConversationId, message.id, {
        deleted_for_everyone_at: new Date().toISOString(),
        content: null,
        content_json: null,
      })
      notify('Message deleted for everyone')
    } catch (error) {
      const apiError = toApiError(error, 'Could not delete for everyone')
      notify(apiError.message)
    }
  }

  const handleForwardMessage = async (message) => {
    const destinationId = Number(window.prompt('Forward to conversation id', ''))
    if (!Number.isFinite(destinationId)) {
      return
    }

    const content = window.prompt('Optional override content (leave empty to keep original)', '')

    try {
      await messagesApi.forward(message.id, {
        conversation_id: destinationId,
        content: content || undefined,
      })
      notify('Message forwarded')
      scheduleConversationRefresh()
    } catch (error) {
      const apiError = toApiError(error, 'Could not forward message')
      notify(apiError.message)
    }
  }

  const handleReactMessage = async (message, reactionCode = '👍') => {
    try {
      await messagesApi.addReaction(message.id, reactionCode)
    } catch (error) {
      const apiError = toApiError(error, 'Could not react to message')
      notify(apiError.message)
    }
  }

  const handleUnreactMessage = async (message) => {
    const code = window.prompt('Reaction code to remove', '👍')
    if (!code) {
      return
    }

    try {
      await messagesApi.removeReaction(message.id, code)
    } catch (error) {
      const apiError = toApiError(error, 'Could not remove reaction')
      notify(apiError.message)
    }
  }

  const handleInspectReactions = async (message) => {
    try {
      const payload = await messagesApi.listReactions(message.id)
      const summary = toArray(payload?.summary || payload)
      if (!summary.length) {
        notify('No reactions')
        return
      }

      const summaryText = summary.map((item) => `${item.reaction_code}: ${item.total}`).join(', ')
      notify(`Reactions - ${summaryText}`)
    } catch (error) {
      const apiError = toApiError(error, 'Could not fetch reactions')
      notify(apiError.message)
    }
  }

  const handleInspectMessage = async (message) => {
    try {
      const payload = await messagesApi.show(message.id)
      const details = payload || {}
      notify(`Message #${details.id} status: ${details.message_status || 'unknown'}`)
    } catch (error) {
      const apiError = toApiError(error, 'Could not fetch message detail')
      notify(apiError.message)
    }
  }

  const handleAddAttachmentToMessage = async (message) => {
    const fileName = window.prompt('Attachment file name', 'file.txt')
    if (!fileName) {
      return
    }

    const storageKey = window.prompt('Storage key', `uploads/${Date.now()}-${fileName}`)
    if (!storageKey) {
      return
    }

    try {
      await messagesApi.addAttachment(message.id, {
        attachment_type: 'file',
        file_name: fileName,
        file_ext: fileName.includes('.') ? fileName.split('.').pop() : 'txt',
        mime_type: 'application/octet-stream',
        file_size: 1024,
        storage_provider: 'local',
        storage_bucket: null,
        storage_key: storageKey,
        file_url: null,
        thumbnail_url: null,
      })
      notify('Attachment metadata added')
      fetchConversationMessages(activeConversationId, false)
    } catch (error) {
      const apiError = toApiError(error, 'Could not add attachment')
      notify(apiError.message)
    }
  }

  const handleRemoveAttachment = async (attachmentId) => {
    if (!attachmentId) {
      return
    }

    try {
      await messagesApi.removeAttachment(attachmentId)
      notify('Attachment removed')
      fetchConversationMessages(activeConversationId, false)
    } catch (error) {
      const apiError = toApiError(error, 'Could not remove attachment')
      notify(apiError.message)
    }
  }

  const handleAttachToComposer = () => {
    const fileName = window.prompt('Attachment file name', 'note.txt')
    if (!fileName) {
      return
    }

    const attachmentType = window.prompt('Attachment type: image|video|audio|file', 'file') || 'file'
    const storageKey = window.prompt('Storage key', `uploads/${Date.now()}-${fileName}`)
    if (!storageKey) {
      return
    }

    setComposerAttachment({
      attachment_type: attachmentType,
      file_name: fileName,
      file_ext: fileName.includes('.') ? fileName.split('.').pop() : null,
      mime_type: 'application/octet-stream',
      file_size: 1024,
      storage_provider: 'local',
      storage_bucket: null,
      storage_key: storageKey,
      file_url: null,
      thumbnail_url: null,
    })
  }

  const handleConversationAction = async (action) => {
    if (!currentConversation || !user?.id) {
      return
    }

    try {
      switch (action) {
        case 'archive': {
          if (currentConversation?.my_participant_settings?.is_archived) {
            await conversationsApi.unarchive(currentConversation.id)
            notify('Conversation unarchived')
          } else {
            await conversationsApi.archive(currentConversation.id)
            notify('Conversation archived')
          }
          break
        }
        case 'pin': {
          if (currentConversation?.my_participant_settings?.is_pinned) {
            await conversationsApi.unpin(currentConversation.id, user.id)
            notify('Conversation unpinned')
          } else {
            await conversationsApi.pin(currentConversation.id, user.id)
            notify('Conversation pinned')
          }
          break
        }
        case 'hide': {
          if (currentConversation?.my_participant_settings?.is_hidden) {
            await conversationsApi.unhide(currentConversation.id, user.id)
            notify('Conversation unhidden')
          } else {
            await conversationsApi.hide(currentConversation.id, user.id)
            notify('Conversation hidden')
          }
          break
        }
        case 'mute': {
          if (currentConversation?.my_participant_settings?.is_muted) {
            await conversationsApi.unmute(currentConversation.id, user.id)
            notify('Conversation unmuted')
          } else {
            const minutes = Number(window.prompt('Mute for minutes', '60'))
            if (!Number.isFinite(minutes) || minutes <= 0) {
              return
            }

            const mutedUntil = toMysqlDatetime(new Date(Date.now() + minutes * 60 * 1000))
            await conversationsApi.mute(currentConversation.id, user.id, mutedUntil)
            notify('Conversation muted')
          }
          break
        }
        case 'delete': {
          if (!window.confirm('Delete this conversation?')) {
            return
          }

          await conversationsApi.destroy(currentConversation.id)
          notify('Conversation deleted')
          break
        }
        case 'update-group': {
          const title = window.prompt('New conversation title', currentConversation.title || '')
          if (title === null) {
            return
          }

          const description = window.prompt('Description', currentConversation.description || '')
          await conversationsApi.update(currentConversation.id, {
            title,
            description,
          })
          notify('Conversation updated')
          break
        }
        default:
          return
      }

      fetchConversations()
      if (activeConversationId) {
        fetchParticipants(activeConversationId)
      }
    } catch (error) {
      const apiError = toApiError(error, 'Could not update conversation')
      notify(apiError.message)
    }
  }

  const handleAddParticipants = async () => {
    if (!activeConversationId || !newParticipantIdsInput.trim()) {
      return
    }

    const ids = newParticipantIdsInput
      .split(',')
      .map((value) => Number(value.trim()))
      .filter((value) => Number.isFinite(value))

    if (ids.length === 0) {
      notify('Invalid participant ids')
      return
    }

    try {
      await conversationsApi.addParticipants(activeConversationId, ids)
      setNewParticipantIdsInput('')
      notify('Participants added')
      fetchParticipants(activeConversationId)
      fetchConversations()
    } catch (error) {
      const apiError = toApiError(error, 'Could not add participants')
      notify(apiError.message)
    }
  }

  const handleRemoveParticipant = async (targetUserId) => {
    if (!activeConversationId) {
      return
    }

    try {
      await conversationsApi.removeParticipant(activeConversationId, targetUserId)
      notify('Participant removed')
      fetchParticipants(activeConversationId)
      fetchConversations()
    } catch (error) {
      const apiError = toApiError(error, 'Could not remove participant')
      notify(apiError.message)
    }
  }

  const handleUpdateParticipantRole = async (targetUserId) => {
    if (!activeConversationId) {
      return
    }

    const roleInput = window.prompt('Role: owner | admin | member', 'member')
    if (!roleInput) {
      return
    }

    try {
      await conversationsApi.updateParticipantRole(activeConversationId, targetUserId, roleInput)
      notify('Participant role updated')
      fetchParticipants(activeConversationId)
    } catch (error) {
      const apiError = toApiError(error, 'Could not update role')
      notify(apiError.message)
    }
  }

  const filterChipStyle = (active) => ({
    borderRadius: 999,
    bgcolor: active ? '#0f172a' : '#ffffff',
    color: active ? '#ffffff' : '#334155',
    border: `1px solid ${active ? '#0f172a' : '#d5deea'}`,
    fontWeight: 600,
    '&:hover': {
      bgcolor: active ? '#0b1222' : '#f8fafc',
    },
  })

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={1.5}
      sx={{
        height: { xs: 'auto', md: 'calc(100dvh - 116px)' },
      }}
    >
      <Card
        sx={{
          width: { xs: '100%', md: 360 },
          borderRadius: 3,
          border: '1px solid #d7e0ec',
          boxShadow: '0 12px 34px rgba(15,23,42,0.07)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: { xs: 520, md: '100%' },
        }}
      >
        <CardContent sx={{ pb: 1.5 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5}>
            <Typography sx={{ fontWeight: 700, fontSize: 18, color: '#0f172a' }}>Conversations</Typography>
            <Button variant="outlined" size="small" onClick={fetchConversations} sx={{ textTransform: 'none' }}>
              Refresh
            </Button>
          </Stack>

          <Stack direction="row" spacing={0.8} sx={{ mt: 1.5, flexWrap: 'wrap' }}>
            <Chip label="All" onClick={() => setFilters((v) => ({ ...v, type: 'all' }))} sx={filterChipStyle(filters.type === 'all')} />
            <Chip label="Direct" onClick={() => setFilters((v) => ({ ...v, type: 'direct' }))} sx={filterChipStyle(filters.type === 'direct')} />
            <Chip label="Group" onClick={() => setFilters((v) => ({ ...v, type: 'group' }))} sx={filterChipStyle(filters.type === 'group')} />
          </Stack>

          <Stack direction="row" spacing={0.8} sx={{ mt: 1, flexWrap: 'wrap' }}>
            <Chip
              label={filters.archived ? 'Archived: On' : 'Archived'}
              onClick={() => setFilters((v) => ({ ...v, archived: !v.archived }))}
              sx={filterChipStyle(filters.archived)}
            />
            <Chip
              label={filters.pinned ? 'Pinned: On' : 'Pinned'}
              onClick={() => setFilters((v) => ({ ...v, pinned: !v.pinned }))}
              sx={filterChipStyle(filters.pinned)}
            />
            <Chip
              label={filters.hidden ? 'Hidden: On' : 'Hidden'}
              onClick={() => setFilters((v) => ({ ...v, hidden: !v.hidden }))}
              sx={filterChipStyle(filters.hidden)}
            />
          </Stack>

          <Divider sx={{ my: 1.5 }} />

          <Stack spacing={1.2}>
            <Stack direction="row" spacing={1}>
              <TextField
                size="small"
                fullWidth
                value={directUserIdInput}
                onChange={(event) => setDirectUserIdInput(event.target.value)}
                placeholder="Direct target user id"
              />
              <Button variant="contained" onClick={handleCreateDirectConversation} sx={{ textTransform: 'none' }}>
                Direct
              </Button>
            </Stack>

            <TextField
              size="small"
              fullWidth
              value={groupForm.title}
              onChange={(event) => setGroupForm((v) => ({ ...v, title: event.target.value }))}
              placeholder="Group title"
            />
            <TextField
              size="small"
              fullWidth
              value={groupForm.description}
              onChange={(event) => setGroupForm((v) => ({ ...v, description: event.target.value }))}
              placeholder="Group description"
            />
            <Stack direction="row" spacing={1}>
              <TextField
                size="small"
                fullWidth
                value={groupForm.participantIds}
                onChange={(event) => setGroupForm((v) => ({ ...v, participantIds: event.target.value }))}
                placeholder="Participant ids: 2,3,4"
              />
              <Button variant="outlined" onClick={handleCreateGroupConversation} sx={{ textTransform: 'none' }}>
                Group
              </Button>
            </Stack>
          </Stack>
        </CardContent>

        <Divider />

        <Box sx={{ flex: 1, overflowY: 'auto', p: 1.1 }}>
          {loadingConversations ? (
            <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
              <CircularProgress size={24} />
            </Stack>
          ) : null}

          {!loadingConversations && conversations.length === 0 ? (
            <Typography sx={{ color: '#64748b', fontSize: 14, textAlign: 'center', py: 4 }}>
              No conversations found.
            </Typography>
          ) : null}

          <Stack spacing={0.8}>
            {conversations.map((conversation) => {
              const isActive = Number(conversation.id) === Number(activeConversationId)
              const unread = conversation?.my_participant_settings?.unread_count_cache || 0

              return (
                <Box
                  key={conversation.id}
                  onClick={() => setActiveConversationId(conversation.id)}
                  sx={{
                    p: 1.2,
                    borderRadius: 2,
                    cursor: 'pointer',
                    border: `1px solid ${isActive ? '#0f172a' : '#dbe4ef'}`,
                    bgcolor: isActive ? '#f8fbff' : '#ffffff',
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar src={conversation.avatar_url || undefined} sx={{ width: 34, height: 34 }}>
                      {getConversationTitle(conversation).slice(0, 1)}
                    </Avatar>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography noWrap sx={{ fontWeight: 600, color: '#0f172a', fontSize: 14 }}>
                        {getConversationTitle(conversation)}
                      </Typography>
                      <Typography noWrap sx={{ color: '#64748b', fontSize: 12 }}>
                        {conversation.last_message?.content || conversation.last_message?.message_type || 'No message yet'}
                      </Typography>
                    </Box>
                    {unread > 0 ? (
                      <Chip
                        label={unread}
                        size="small"
                        sx={{
                          bgcolor: '#2563eb',
                          color: '#fff',
                          fontWeight: 700,
                          minWidth: 24,
                        }}
                      />
                    ) : null}
                  </Stack>
                </Box>
              )
            })}
          </Stack>
        </Box>
      </Card>

      <Card
        sx={{
          flex: 1,
          borderRadius: 3,
          border: '1px solid #d7e0ec',
          boxShadow: '0 12px 34px rgba(15,23,42,0.07)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: { xs: 560, md: '100%' },
          overflow: 'hidden',
        }}
      >
        {currentConversation ? (
          <>
            <CardContent sx={{ pb: 1.3 }}>
              <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1.2}>
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <Avatar src={currentConversation.avatar_url || undefined} sx={{ width: 38, height: 38 }}>
                    {getConversationTitle(currentConversation).slice(0, 1)}
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
                      {getConversationTitle(currentConversation)}
                    </Typography>
                    <Typography sx={{ color: '#64748b', fontSize: 12 }}>
                      {currentConversation.conversation_type} • online {presenceUsers.length}
                    </Typography>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={0.8} flexWrap="wrap">
                  <Button size="small" variant="outlined" onClick={() => handleConversationAction('archive')} sx={{ textTransform: 'none' }}>
                    {currentConversation?.my_participant_settings?.is_archived ? 'Unarchive' : 'Archive'}
                  </Button>
                  <Button size="small" variant="outlined" onClick={() => handleConversationAction('pin')} sx={{ textTransform: 'none' }}>
                    {currentConversation?.my_participant_settings?.is_pinned ? 'Unpin' : 'Pin'}
                  </Button>
                  <Button size="small" variant="outlined" onClick={() => handleConversationAction('hide')} sx={{ textTransform: 'none' }}>
                    {currentConversation?.my_participant_settings?.is_hidden ? 'Unhide' : 'Hide'}
                  </Button>
                  <Button size="small" variant="outlined" onClick={() => handleConversationAction('mute')} sx={{ textTransform: 'none' }}>
                    {currentConversation?.my_participant_settings?.is_muted ? 'Unmute' : 'Mute'}
                  </Button>
                  {currentConversation.conversation_type === 'group' && isOwnerOrAdmin ? (
                    <Button size="small" variant="outlined" onClick={() => handleConversationAction('update-group')} sx={{ textTransform: 'none' }}>
                      Edit Group
                    </Button>
                  ) : null}
                  {isOwnerOrAdmin ? (
                    <Button size="small" color="error" variant="outlined" onClick={() => handleConversationAction('delete')} sx={{ textTransform: 'none' }}>
                      Delete
                    </Button>
                  ) : null}
                </Stack>
              </Stack>
            </CardContent>

            <Divider />

            <Box sx={{ flex: 1, overflowY: 'auto', p: 1.5, bgcolor: '#f7fafc' }}>
              <Stack spacing={1.1}>
                <Button
                  variant="text"
                  onClick={handleLoadOlderMessages}
                  disabled={loadingMessages || !currentMessagesState.hasMore}
                  sx={{ textTransform: 'none', alignSelf: 'center' }}
                >
                  {loadingMessages ? 'Loading...' : currentMessagesState.hasMore ? 'Load older messages' : 'No older messages'}
                </Button>

                {currentMessagesAsc.map((message) => {
                  const mine = Number(message?.sender?.id || message?.sender_id) === Number(user?.id)
                  const senderName = message?.sender?.display_name
                    || message?.sender?.username
                    || (mine ? 'You' : `User #${message?.sender_id || 'unknown'}`)
                  const deletedForEveryone = Boolean(message.deleted_for_everyone_at)

                  return (
                    <Stack key={message.id} alignItems={mine ? 'flex-end' : 'flex-start'}>
                      <Box
                        sx={{
                          maxWidth: { xs: '95%', md: '78%' },
                          p: 1.2,
                          borderRadius: 2,
                          border: `1px solid ${mine ? '#2563eb' : '#d2dce8'}`,
                          bgcolor: mine ? '#2563eb' : '#ffffff',
                          color: mine ? '#ffffff' : '#0f172a',
                        }}
                      >
                        <Typography sx={{ fontSize: 12, fontWeight: 700, opacity: mine ? 0.9 : 0.7, mb: 0.4 }}>
                          {senderName}
                        </Typography>

                        <Typography sx={{ fontSize: 14, whiteSpace: 'pre-wrap' }}>
                          {deletedForEveryone ? '[Deleted for everyone]' : message.content || '[No content]'}
                        </Typography>

                        {Array.isArray(message.attachments) && message.attachments.length > 0 ? (
                          <Stack spacing={0.4} sx={{ mt: 0.8 }}>
                            {message.attachments.map((attachment) => (
                              <Box
                                key={attachment.id || attachment.storage_key}
                                sx={{
                                  borderRadius: 1.5,
                                  px: 0.9,
                                  py: 0.55,
                                  bgcolor: mine ? 'rgba(255,255,255,0.15)' : '#f1f5f9',
                                  border: mine ? '1px solid rgba(255,255,255,0.25)' : '1px solid #d7e0ec',
                                }}
                              >
                                <Stack direction="row" justifyContent="space-between" spacing={1}>
                                  <Box>
                                    <Typography sx={{ fontSize: 12, fontWeight: 600 }}>
                                      {attachment.file_name || attachment.storage_key}
                                    </Typography>
                                    <Typography sx={{ fontSize: 11, opacity: 0.8 }}>
                                      {attachment.attachment_type} • {attachment.mime_type || 'unknown'}
                                    </Typography>
                                  </Box>
                                  {attachment.id ? (
                                    <Button
                                      size="small"
                                      onClick={() => handleRemoveAttachment(attachment.id)}
                                      sx={{
                                        textTransform: 'none',
                                        color: mine ? '#dbeafe' : '#ef4444',
                                        minWidth: 0,
                                        px: 0.6,
                                      }}
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
                          <Stack direction="row" spacing={0.6} sx={{ mt: 0.8, flexWrap: 'wrap' }}>
                            {message.reaction_summary.map((reaction) => (
                              <Chip
                                key={`${reaction.reaction_code}-${reaction.total}`}
                                label={`${reaction.reaction_code} ${reaction.total}`}
                                size="small"
                                sx={{
                                  bgcolor: mine ? 'rgba(255,255,255,0.2)' : '#e5eef9',
                                  color: mine ? '#fff' : '#1e293b',
                                }}
                              />
                            ))}
                          </Stack>
                        ) : null}

                        <Stack direction="row" spacing={0.4} sx={{ mt: 0.75, flexWrap: 'wrap' }}>
                          <Button
                            size="small"
                            onClick={() => handleReactMessage(message, '👍')}
                            sx={{
                              textTransform: 'none',
                              color: mine ? '#dbeafe' : '#2563eb',
                              minWidth: 0,
                              px: 0.6,
                            }}
                          >
                            👍
                          </Button>
                          <Button
                            size="small"
                            onClick={() => {
                              const code = window.prompt('Reaction code', '❤️')
                              if (!code) return
                              handleReactMessage(message, code)
                            }}
                            sx={{ textTransform: 'none', color: mine ? '#dbeafe' : '#2563eb', minWidth: 0, px: 0.6 }}
                          >
                            React
                          </Button>
                          <Button
                            size="small"
                            onClick={() => handleUnreactMessage(message)}
                            sx={{ textTransform: 'none', color: mine ? '#dbeafe' : '#2563eb', minWidth: 0, px: 0.6 }}
                          >
                            Unreact
                          </Button>
                          <Button
                            size="small"
                            onClick={() => handleInspectReactions(message)}
                            sx={{ textTransform: 'none', color: mine ? '#dbeafe' : '#2563eb', minWidth: 0, px: 0.6 }}
                          >
                            Reactions
                          </Button>
                          <Button
                            size="small"
                            onClick={() => handleForwardMessage(message)}
                            sx={{ textTransform: 'none', color: mine ? '#dbeafe' : '#2563eb', minWidth: 0, px: 0.6 }}
                          >
                            Forward
                          </Button>
                          <Button
                            size="small"
                            onClick={() => handleInspectMessage(message)}
                            sx={{ textTransform: 'none', color: mine ? '#dbeafe' : '#2563eb', minWidth: 0, px: 0.6 }}
                          >
                            Detail
                          </Button>
                          <Button
                            size="small"
                            onClick={() => handleAddAttachmentToMessage(message)}
                            sx={{ textTransform: 'none', color: mine ? '#dbeafe' : '#2563eb', minWidth: 0, px: 0.6 }}
                          >
                            Attach
                          </Button>
                          {mine ? (
                            <>
                              <Button
                                size="small"
                                onClick={() => handleEditMessage(message)}
                                sx={{ textTransform: 'none', color: mine ? '#dbeafe' : '#2563eb', minWidth: 0, px: 0.6 }}
                              >
                                Edit
                              </Button>
                              <Button
                                size="small"
                                onClick={() => handleDeleteMessage(message)}
                                sx={{ textTransform: 'none', color: mine ? '#dbeafe' : '#ef4444', minWidth: 0, px: 0.6 }}
                              >
                                Delete
                              </Button>
                              <Button
                                size="small"
                                onClick={() => handleDeleteForEveryone(message)}
                                sx={{ textTransform: 'none', color: mine ? '#dbeafe' : '#ef4444', minWidth: 0, px: 0.6 }}
                              >
                                Del all
                              </Button>
                            </>
                          ) : null}
                        </Stack>

                        <Typography sx={{ fontSize: 11, opacity: mine ? 0.8 : 0.6, mt: 0.4, textAlign: 'right' }}>
                          {message.sent_at || ''}
                        </Typography>
                      </Box>
                    </Stack>
                  )
                })}

                {Object.keys(typingUsers).length > 0 ? (
                  <Typography sx={{ fontSize: 12, color: '#64748b', fontStyle: 'italic', px: 0.8 }}>
                    {Object.values(typingUsers)
                      .map((item) => item.display_name || item.username || `User #${item.id}`)
                      .join(', ')}{' '}
                    typing...
                  </Typography>
                ) : null}
              </Stack>
            </Box>

            <Divider />

            <CardContent sx={{ py: 1.2 }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ xs: 'stretch', md: 'center' }}>
                <Select
                  size="small"
                  value={composerType}
                  onChange={(event) => setComposerType(event.target.value)}
                  sx={{ minWidth: 120 }}
                >
                  <MenuItem value="text">text</MenuItem>
                  <MenuItem value="image">image</MenuItem>
                  <MenuItem value="video">video</MenuItem>
                  <MenuItem value="audio">audio</MenuItem>
                  <MenuItem value="file">file</MenuItem>
                  <MenuItem value="location">location</MenuItem>
                  <MenuItem value="contact">contact</MenuItem>
                </Select>

                <InputBase
                  value={composerText}
                  onChange={(event) => {
                    setComposerText(event.target.value)
                    signalTyping()
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  placeholder="Type your message..."
                  sx={{
                    flex: 1,
                    px: 1.2,
                    py: 1,
                    borderRadius: 2,
                    border: '1px solid #d7e0ec',
                    bgcolor: '#fff',
                  }}
                />

                <Button variant="outlined" onClick={handleAttachToComposer} sx={{ textTransform: 'none' }}>
                  {composerAttachment ? 'Attachment ✓' : 'Attach'}
                </Button>

                <Button
                  variant="contained"
                  onClick={handleSendMessage}
                  disabled={sending}
                  sx={{
                    textTransform: 'none',
                    minWidth: 100,
                    fontWeight: 700,
                    bgcolor: '#0f172a',
                    '&:hover': { bgcolor: '#0b1222' },
                  }}
                >
                  {sending ? 'Sending...' : 'Send'}
                </Button>
              </Stack>

              {composerAttachment ? (
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                  <Chip label={`Attachment: ${composerAttachment.file_name}`} />
                  <Button size="small" onClick={() => setComposerAttachment(null)} sx={{ textTransform: 'none' }}>
                    Remove
                  </Button>
                </Stack>
              ) : null}
            </CardContent>

            <Divider />

            <Box sx={{ p: 1.25, bgcolor: '#fbfdff', maxHeight: 220, overflowY: 'auto' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography sx={{ fontWeight: 700, color: '#0f172a', fontSize: 14 }}>
                  Participants ({currentParticipants.length})
                </Typography>
                {loadingParticipants ? <CircularProgress size={16} /> : null}
              </Stack>

              {currentConversation.conversation_type === 'group' && isOwnerOrAdmin ? (
                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                  <TextField
                    size="small"
                    fullWidth
                    value={newParticipantIdsInput}
                    onChange={(event) => setNewParticipantIdsInput(event.target.value)}
                    placeholder="Add user ids: 2,7,9"
                  />
                  <Button variant="outlined" onClick={handleAddParticipants} sx={{ textTransform: 'none' }}>
                    Add
                  </Button>
                </Stack>
              ) : null}

              <Stack spacing={0.7}>
                {currentParticipants.map((participant) => {
                  const participantUser = participant.user || {}
                  const participantUserId = participantUser.id

                  return (
                    <Stack
                      key={`${participant.conversation_id}-${participantUserId}`}
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ p: 0.8, borderRadius: 1.5, border: '1px solid #e2e8f0', bgcolor: '#fff' }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                        <Avatar src={participantUser.avatar_url || undefined} sx={{ width: 28, height: 28 }}>
                          {(participantUser.display_name || participantUser.username || 'U').slice(0, 1)}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography noWrap sx={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                            {participantUser.display_name || participantUser.username || `User #${participantUserId}`}
                          </Typography>
                          <Typography sx={{ fontSize: 12, color: '#64748b' }}>
                            {participant.participant_role} • unread {participant.unread_count_cache}
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack direction="row" spacing={0.4}>
                        {isOwner ? (
                          <Button
                            size="small"
                            onClick={() => handleUpdateParticipantRole(participantUserId)}
                            sx={{ textTransform: 'none', minWidth: 0, px: 0.8 }}
                          >
                            Role
                          </Button>
                        ) : null}
                        {currentConversation.conversation_type === 'group' && isOwnerOrAdmin && Number(participantUserId) !== Number(user?.id) ? (
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleRemoveParticipant(participantUserId)}
                            sx={{ textTransform: 'none', minWidth: 0, px: 0.8 }}
                          >
                            Remove
                          </Button>
                        ) : null}
                      </Stack>
                    </Stack>
                  )
                })}
              </Stack>
            </Box>
          </>
        ) : (
          <Stack alignItems="center" justifyContent="center" sx={{ flex: 1 }}>
            <Typography sx={{ color: '#64748b' }}>Select a conversation to start chatting.</Typography>
          </Stack>
        )}
      </Card>
    </Stack>
  )
}
