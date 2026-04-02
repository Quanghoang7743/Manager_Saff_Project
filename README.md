# MessApp Backend + Realtime Chat (4 Phases)

This project now includes a full REST chat backend and realtime WebSocket sync using Laravel Sanctum + Laravel Reverb.

## What was implemented

## Phase 1 - Realtime message delivery
- Added Reverb broadcasting stack and private channel auth with Sanctum bearer token.
- Added `message.created` event broadcast when sending a message.
- Added channel authorization so only active conversation participants can subscribe.

## Phase 2 - Realtime message mutations
- Added realtime events for:
  - message edit (`message.updated`)
  - delete for everyone (`message.deleted_for_everyone`)
  - reaction toggle (`message.reaction.changed`)
- Added attachment change sync through `message.updated` payload.

## Phase 3 - Realtime read/delivered receipts
- Added realtime events for:
  - read receipt (`conversation.read.updated`)
  - delivered receipt (`conversation.delivered.updated`)
- Receipt APIs now update DB and broadcast in the same request flow.

## Phase 4 - Presence, typing, multi-device sync
- Added presence channel `conversation-presence.{conversationId}`.
- Added typing endpoint and event `conversation.typing.updated`.
- Added participant settings sync event `conversation.participant.settings.updated` on `user.{id}` channel for archive/pin/mute/hide updates across devices.

---

## Core files added

### Realtime events
- `app/Events/MessageCreated.php`
- `app/Events/MessageUpdated.php`
- `app/Events/MessageDeletedForEveryone.php`
- `app/Events/MessageReactionChanged.php`
- `app/Events/ConversationReadUpdated.php`
- `app/Events/ConversationDeliveredUpdated.php`
- `app/Events/ConversationTypingUpdated.php`
- `app/Events/ConversationParticipantSettingsUpdated.php`

### Realtime auth / routing
- `routes/channels.php`
- `bootstrap/app.php` (broadcast auth moved to `api` + `auth:sanctum`)
- `routes/api.php` (added typing endpoint)

### Service integration
- `app/Services/MessageService.php`
- `app/Services/ParticipantService.php`
- `app/Services/ReactionService.php`

### Controllers / requests
- `app/Http/Controllers/Api/ConversationController.php`
- `app/Http/Controllers/Api/ConversationParticipantController.php`
- `app/Http/Controllers/Api/MessageReactionController.php`
- `app/Http/Requests/UpdateTypingRequest.php`

### Frontend realtime utilities
- `resources/js/realtime/echoClient.js`
- `resources/js/realtime/conversationRealtime.js`
- `resources/js/realtime/useConversationRealtime.js`
- `resources/js/context/AuthContext.jsx` (auto init/disconnect Echo on login/logout)

### Config / dependencies
- `config/broadcasting.php`
- `config/reverb.php`
- `.env.example`
- `composer.json` / `composer.lock`
- `package.json` / `package-lock.json`

---

## End-to-end runtime flow (2 users chat)

## 1) Login + socket auth
1. User A/B login via Sanctum.
2. Frontend stores token and calls `initEcho(token)`.
3. Echo authenticates private/presence channels via:
   - `POST /api/broadcasting/auth`
   - middleware: `api`, `auth:sanctum`.

## 2) Subscribe channels
1. Both users subscribe:
   - `private-conversation.{conversationId}`
   - `presence-conversation-presence.{conversationId}`
2. Channel auth checks `conversation_participants` where `left_at` and `removed_at` are null.

## 3) Send message
1. User A calls `POST /api/conversations/{id}/messages`.
2. Backend transaction:
   - validates active participant
   - idempotent by `(sender_id, client_message_id)`
   - inserts message (+ attachments)
   - updates `conversations.last_message_id/last_message_at`
   - increments `unread_count_cache` for others
3. Backend broadcasts `message.created`.
4. User B receives event instantly and appends message.

## 4) Edit / delete / react
- Edit -> `PUT /api/messages/{id}` -> broadcast `message.updated`
- Delete for everyone -> `PATCH /api/messages/{id}/delete-for-everyone` -> broadcast `message.deleted_for_everyone`
- React -> `POST /api/messages/{id}/reactions` (toggle) -> broadcast `message.reaction.changed`

## 5) Delivery and read receipts
- Delivered -> `PATCH /api/conversations/{id}/participants/{userId}/delivered` -> broadcast `conversation.delivered.updated`
- Read -> `PATCH /api/conversations/{id}/participants/{userId}/read` -> broadcast `conversation.read.updated`

## 6) Typing + presence
- Typing -> `POST /api/conversations/{id}/typing` -> broadcast `conversation.typing.updated`
- Presence callbacks:
  - `here` for online members
  - `joining` when user enters
  - `leaving` when user disconnects

## 7) Cross-device participant settings sync
- Archive/pin/mute/hide updates trigger `conversation.participant.settings.updated` on `private-user.{id}`.
- Useful when one user logs in on multiple devices.

---

## Realtime channel map

- `conversation.{conversationId}`
  - `message.created`
  - `message.updated`
  - `message.deleted_for_everyone`
  - `message.reaction.changed`
  - `conversation.read.updated`
  - `conversation.delivered.updated`
  - `conversation.typing.updated`

- `conversation-presence.{conversationId}`
  - presence members (`here`, `joining`, `leaving`)

- `user.{userId}`
  - `conversation.participant.settings.updated`

---

## Local setup

## 1) Environment
Set `.env` values (already included in `.env.example`):

```env
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=messapp
REVERB_APP_KEY=messapp-app-key
REVERB_APP_SECRET=messapp-app-secret
REVERB_HOST=127.0.0.1
REVERB_PORT=8080
REVERB_SCHEME=http
REVERB_SERVER_HOST=0.0.0.0
REVERB_SERVER_PORT=8080

VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
VITE_REVERB_HOST="${REVERB_HOST}"
VITE_REVERB_PORT="${REVERB_PORT}"
VITE_REVERB_SCHEME="${REVERB_SCHEME}"
```

## 2) Install dependencies

```bash
composer install
npm install
```

## 3) Run app

```bash
composer run dev
```

This starts:
- Laravel API server
- queue listener
- log tailer
- Vite frontend
- Reverb WebSocket server

---

## Frontend usage example

```js
import { subscribeConversationChannel, joinConversationPresence } from './realtime/conversationRealtime'

const leaveConversation = subscribeConversationChannel(conversationId, {
  onMessageCreated: (payload) => console.log(payload),
  onMessageUpdated: (payload) => console.log(payload),
  onReadUpdated: (payload) => console.log(payload),
  onTypingUpdated: (payload) => console.log(payload),
})

const leavePresence = joinConversationPresence(conversationId, {
  onHere: (users) => console.log('online', users),
  onJoining: (user) => console.log('join', user),
  onLeaving: (user) => console.log('leave', user),
})

// cleanup
leaveConversation()
leavePresence()
```

---

## Notes
- All protected HTTP and broadcast-auth routes use Sanctum.
- No cross-user access: channel auth validates participant ownership.
- Realtime events are emitted after DB writes are complete in service layer flow.

---

## Friend by phone number

This release adds a friend system with phone-number lookup, friend requests, acceptance flow, unfriend, and realtime sync on `private-user.{id}`.

## Added files for friend module

### Migrations
- `database/migrations/2026_03_26_000007_create_user_privacy_settings_table.php`
- `database/migrations/2026_03_26_000008_create_user_blocks_table.php`
- `database/migrations/2026_03_26_000009_create_friend_requests_table.php`
- `database/migrations/2026_03_26_000010_create_friendships_table.php`

### Models
- `app/Models/UserPrivacySetting.php`
- `app/Models/UserBlock.php`
- `app/Models/FriendRequest.php`
- `app/Models/Friendship.php`

### Service / Support
- `app/Services/FriendService.php`
- `app/Support/PhoneNormalizer.php`

### API layer
- `app/Http/Controllers/Api/FriendController.php`
- `app/Http/Requests/ResolveFriendByPhoneRequest.php`
- `app/Http/Requests/StoreFriendRequestRequest.php`
- `app/Http/Resources/FriendRequestResource.php`
- `app/Http/Resources/FriendResource.php`

### Events (realtime)
- `app/Events/FriendRequestReceived.php`
- `app/Events/FriendRequestAccepted.php`
- `app/Events/FriendRequestRejected.php`
- `app/Events/FriendRemoved.php`

### Updated files
- `app/Models/User.php` (friend/privacy/block relationships)
- `app/Services/AuthService.php` (create default privacy row on register)
- `routes/api.php` (friend APIs)
- `config/friends.php` (friend module config)

## Friend APIs

- `POST /api/friends/resolve-by-phone`
- `POST /api/friend-requests`
- `GET /api/friend-requests/incoming`
- `GET /api/friend-requests/outgoing`
- `PATCH /api/friend-requests/{id}/accept`
- `PATCH /api/friend-requests/{id}/reject`
- `DELETE /api/friend-requests/{id}`
- `GET /api/friends`
- `DELETE /api/friends/{userId}`

All routes are protected by `auth:sanctum`.

## Friend flow

## 1) Resolve by phone
1. Client sends `phone_number` to `resolve-by-phone`.
2. Backend normalizes number in `PhoneNormalizer`.
3. Backend finds verified, active user and checks:
   - target `allow_find_by_phone = true`
   - no block in either direction
4. Return target user summary if allowed.

## 2) Send request
1. Client sends `target_user_id` or `target_phone`.
2. Backend validates business rules:
   - not self
   - not already friends
   - no block relation
   - target accepts friend requests
   - no duplicate pending request
3. Create `friend_requests` row with status `pending`.
4. Broadcast `friend.request.received` to `private-user.{addressee_id}`.

## 3) Accept / reject / cancel
- Accept:
  - lock request row in transaction
  - set request status `accepted`
  - upsert `friendships` pair `(user_low_id, user_high_id)`
  - broadcast `friend.request.accepted` to both users
- Reject:
  - set request status `rejected`
  - broadcast `friend.request.rejected` to requester
- Cancel:
  - requester sets status `cancelled`

## 4) Friend list / unfriend
- `GET /api/friends` returns paginated friend list.
- `DELETE /api/friends/{userId}` deletes friendship pair.
- Broadcast `friend.removed` to both users for cross-device sync.

## Realtime events on user channel

Channel: `private-user.{id}`

- `friend.request.received`
- `friend.request.accepted`
- `friend.request.rejected`
- `friend.removed`

## Configuration

Friend module config in `config/friends.php`:
- default country code for phone normalization
- pagination defaults for incoming/outgoing/friends list

Optional env values:

```env
FRIENDS_DEFAULT_COUNTRY_CODE=84
FRIENDS_INCOMING_PER_PAGE=20
FRIENDS_OUTGOING_PER_PAGE=20
FRIENDS_LIST_PER_PAGE=30
```

---

## Frontend completion status (Phases 1 -> 8)

Frontend is now connected to backend APIs and realtime channels for core messaging and friend workflows.

### Frontend foundation (Phase 1)
- API layer:
  - `resources/js/api/httpClient.js`
  - `resources/js/api/response.js`
  - `resources/js/api/authApi.js`
  - `resources/js/api/usersApi.js`
  - `resources/js/api/devicesApi.js`
  - `resources/js/api/conversationsApi.js`
  - `resources/js/api/messagesApi.js`
  - `resources/js/api/friendsApi.js`
- Utilities:
  - `resources/js/utils/deviceIdentity.js`
  - `resources/js/utils/dataShape.js`
  - `resources/js/utils/chatIds.js`
- Auth context refactor:
  - `resources/js/context/AuthContext.jsx`

### App shell + real chat (Phase 2 -> 3)
- Main shell:
  - `resources/views/Main.jsx`
  - `resources/views/app/AppShell.jsx`
- Sections:
  - `resources/views/app/sections/ChatSection.jsx`
  - `resources/views/app/sections/FriendsSection.jsx`
  - `resources/views/app/sections/DevicesSection.jsx`
  - `resources/views/app/sections/ProfileSection.jsx`

### Message actions + friends + realtime (Phase 4 -> 7)
- Realtime helpers:
  - `resources/js/realtime/echoClient.js`
  - `resources/js/realtime/conversationRealtime.js`
  - `resources/js/realtime/useConversationRealtime.js`
  - `resources/js/realtime/userRealtime.js`
- Implemented in UI:
  - send/edit/delete/delete-for-everyone/forward
  - attachment metadata create/remove
  - reaction add/remove/list summary
  - participant list/add/remove/role
  - read/delivered receipt updates
  - typing update + presence sync
  - friend resolve/request/accept/reject/cancel/list/unfriend
  - device register/update/toggle/delete
  - profile update/delete

### Polish and verification (Phase 8)
- Loading states and empty states added across sections.
- Built successfully with:
  - `npm run build`
