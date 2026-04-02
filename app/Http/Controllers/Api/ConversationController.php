<?php

namespace App\Http\Controllers\Api;

use App\Events\ConversationParticipantSettingsUpdated;
use App\Events\ConversationTypingUpdated;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDirectConversationRequest;
use App\Http\Requests\StoreGroupConversationRequest;
use App\Http\Requests\UpdateConversationParticipantMuteRequest;
use App\Http\Requests\UpdateConversationRequest;
use App\Http\Requests\UpdateTypingRequest;
use App\Http\Resources\ConversationResource;
use App\Models\Conversation;
use App\Services\ConversationService;
use App\Services\ParticipantService;
use App\Support\BroadcastDispatcher;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ConversationController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        private readonly ConversationService $conversationService,
        private readonly ParticipantService $participantService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = [
            'type' => $request->query('type'),
            'archived' => $request->has('archived') ? $request->boolean('archived') : null,
            'pinned' => $request->has('pinned') ? $request->boolean('pinned') : null,
            'hidden' => $request->has('hidden') ? $request->boolean('hidden') : null,
        ];

        $filters = array_filter($filters, fn ($v) => $v !== null);
        $perPage = max(1, min((int) $request->query('per_page', 20), 100));

        $conversations = $this->conversationService->listForUser($request->user(), $filters, $perPage);

        return $this->successResponse('Conversations fetched successfully.', ConversationResource::collection($conversations));
    }

    public function storeDirect(StoreDirectConversationRequest $request): JsonResponse
    {
        try {
            [$conversation, $created] = $this->conversationService->createDirect($request->user(), (int) $request->target_user_id);
        } catch (\DomainException $exception) {
            return $this->errorResponse($exception->getMessage(), [], 422);
        }

        return $this->successResponse(
            $created ? 'Direct conversation created successfully.' : 'Direct conversation already exists.',
            new ConversationResource($conversation),
            $created ? 201 : 200
        );
    }

    public function storeGroup(StoreGroupConversationRequest $request): JsonResponse
    {
        $conversation = $this->conversationService->createGroup($request->user(), $request->validated());

        return $this->successResponse('Group conversation created successfully.', new ConversationResource($conversation), 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $conversation = Conversation::with(['creator', 'owner', 'lastMessage', 'participants.user'])->find($id);

        if (! $conversation || ! $this->participantService->getActiveParticipant($conversation, (int) $request->user()->id)) {
            return $this->errorResponse('Resource not found', [], 404);
        }

        return $this->successResponse('Conversation fetched successfully.', new ConversationResource($conversation));
    }

    public function update(UpdateConversationRequest $request, int $id): JsonResponse
    {
        $conversation = Conversation::find($id);
        if (! $conversation) {
            return $this->errorResponse('Resource not found', [], 404);
        }

        if ($conversation->conversation_type !== 'group') {
            return $this->errorResponse('Direct conversation cannot be updated.', [], 422);
        }

        if (! $this->participantService->isOwnerOrAdmin($conversation, (int) $request->user()->id)) {
            return $this->errorResponse('You do not have permission to access this resource', [], 403);
        }

        $conversation->fill($request->validated());
        $conversation->save();

        return $this->successResponse('Conversation updated successfully.', new ConversationResource($conversation->fresh(['creator', 'owner', 'lastMessage', 'participants.user'])));
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $conversation = Conversation::find($id);
        if (! $conversation) {
            return $this->errorResponse('Resource not found', [], 404);
        }

        if (! $this->participantService->isOwnerOrAdmin($conversation, (int) $request->user()->id)) {
            return $this->errorResponse('You do not have permission to access this resource', [], 403);
        }

        $this->conversationService->markDeleted($conversation);

        return $this->successResponse('Conversation deleted successfully.', (object) []);
    }

    public function archive(Request $request, int $id): JsonResponse
    {
        return $this->updateParticipantFlag($request, $id, (int) $request->user()->id, ['is_archived' => true], 'Conversation archived successfully.');
    }

    public function unarchive(Request $request, int $id): JsonResponse
    {
        return $this->updateParticipantFlag($request, $id, (int) $request->user()->id, ['is_archived' => false], 'Conversation unarchived successfully.');
    }

    public function pin(Request $request, int $id, int $userId): JsonResponse
    {
        return $this->updateUserSetting($request, $id, $userId, ['is_pinned' => true], 'Conversation pinned successfully.');
    }

    public function unpin(Request $request, int $id, int $userId): JsonResponse
    {
        return $this->updateUserSetting($request, $id, $userId, ['is_pinned' => false], 'Conversation unpinned successfully.');
    }

    public function mute(UpdateConversationParticipantMuteRequest $request, int $id, int $userId): JsonResponse
    {
        return $this->updateUserSetting(
            $request,
            $id,
            $userId,
            ['is_muted' => true, 'muted_until' => $request->validated()['muted_until'] ?? null],
            'Conversation muted successfully.'
        );
    }

    public function unmute(Request $request, int $id, int $userId): JsonResponse
    {
        return $this->updateUserSetting($request, $id, $userId, ['is_muted' => false, 'muted_until' => null], 'Conversation unmuted successfully.');
    }

    public function hide(Request $request, int $id, int $userId): JsonResponse
    {
        return $this->updateUserSetting($request, $id, $userId, ['is_hidden' => true], 'Conversation hidden successfully.');
    }

    public function unhide(Request $request, int $id, int $userId): JsonResponse
    {
        return $this->updateUserSetting($request, $id, $userId, ['is_hidden' => false], 'Conversation unhidden successfully.');
    }

    public function typing(UpdateTypingRequest $request, int $id): JsonResponse
    {
        $conversation = Conversation::find($id);
        if (! $conversation) {
            return $this->errorResponse('Resource not found', [], 404);
        }

        if (! $this->participantService->getActiveParticipant($conversation, (int) $request->user()->id)) {
            return $this->errorResponse('You do not have permission to access this resource', [], 403);
        }

        BroadcastDispatcher::dispatch(new ConversationTypingUpdated(
            conversationId: $conversation->id,
            userId: (int) $request->user()->id,
            displayName: (string) $request->user()->display_name,
            avatarUrl: $request->user()->avatar_url,
            isTyping: (bool) ($request->validated()['is_typing'] ?? true),
        ));

        return $this->successResponse('Typing status updated successfully.', [
            'conversation_id' => $conversation->id,
            'is_typing' => (bool) ($request->validated()['is_typing'] ?? true),
        ]);
    }

    private function updateUserSetting(Request $request, int $conversationId, int $targetUserId, array $data, string $message): JsonResponse
    {
        $conversation = Conversation::find($conversationId);
        if (! $conversation) {
            return $this->errorResponse('Resource not found', [], 404);
        }

        $authUserId = (int) $request->user()->id;
        if ($targetUserId !== $authUserId && ! $this->participantService->isOwnerOrAdmin($conversation, $authUserId)) {
            return $this->errorResponse('You do not have permission to access this resource', [], 403);
        }

        return $this->updateParticipantFlag($request, $conversationId, $targetUserId, $data, $message);
    }

    private function updateParticipantFlag(Request $request, int $conversationId, int $targetUserId, array $data, string $message): JsonResponse
    {
        $conversation = Conversation::find($conversationId);
        if (! $conversation) {
            return $this->errorResponse('Resource not found', [], 404);
        }

        $participant = $this->participantService->getActiveParticipant($conversation, $targetUserId);
        if (! $participant) {
            return $this->errorResponse('Resource not found', [], 404);
        }

        $participant->fill($data);
        $participant->save();

        BroadcastDispatcher::dispatch(new ConversationParticipantSettingsUpdated(
            conversationId: $conversationId,
            userId: $targetUserId,
            changes: $data,
        ));

        return $this->successResponse($message, [
            'conversation_id' => $conversationId,
            'user_id' => $targetUserId,
        ]);
    }
}
