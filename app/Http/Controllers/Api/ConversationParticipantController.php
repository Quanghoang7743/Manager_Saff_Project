<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AddConversationParticipantsRequest;
use App\Http\Requests\UpdateConversationParticipantRoleRequest;
use App\Http\Requests\UpdateDeliveredReceiptRequest;
use App\Http\Requests\UpdateReadReceiptRequest;
use App\Http\Resources\ConversationParticipantResource;
use App\Models\Conversation;
use App\Models\ConversationParticipant;
use App\Services\ConversationService;
use App\Services\ParticipantService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ConversationParticipantController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        private readonly ParticipantService $participantService,
        private readonly ConversationService $conversationService
    ) {}

    public function index(Request $request, int $id): JsonResponse
    {
        $conversation = Conversation::find($id);
        if (! $conversation || ! $this->participantService->getActiveParticipant($conversation, (int) $request->user()->id)) {
            return $this->errorResponse('Resource not found', [], 404);
        }

        $participants = ConversationParticipant::with('user')
            ->where('conversation_id', $conversation->id)
            ->whereNull('left_at')
            ->whereNull('removed_at')
            ->orderBy('user_id')
            ->get();

        return $this->successResponse('Participants fetched successfully.', ConversationParticipantResource::collection($participants));
    }

    public function store(AddConversationParticipantsRequest $request, int $id): JsonResponse
    {
        $conversation = Conversation::find($id);
        if (! $conversation) {
            return $this->errorResponse('Resource not found', [], 404);
        }

        if ($conversation->conversation_type === 'direct') {
            return $this->errorResponse('Direct conversation cannot add participants.', [], 422);
        }

        if (! $this->participantService->isOwnerOrAdmin($conversation, (int) $request->user()->id)) {
            return $this->errorResponse('You do not have permission to access this resource', [], 403);
        }

        $this->participantService->addParticipants($conversation, $request->validated()['participant_ids']);
        $this->conversationService->recalculateMemberCount($conversation);

        return $this->successResponse('Participants added successfully.', (object) []);
    }

    public function destroy(Request $request, int $id, int $userId): JsonResponse
    {
        $conversation = Conversation::find($id);
        if (! $conversation) {
            return $this->errorResponse('Resource not found', [], 404);
        }

        if ($conversation->conversation_type === 'direct') {
            return $this->errorResponse('Direct conversation cannot remove participants.', [], 422);
        }

        if (! $this->participantService->isOwnerOrAdmin($conversation, (int) $request->user()->id)) {
            return $this->errorResponse('You do not have permission to access this resource', [], 403);
        }

        $this->participantService->removeParticipant($conversation, $userId);
        $this->conversationService->recalculateMemberCount($conversation);

        return $this->successResponse('Participant removed successfully.', (object) []);
    }

    public function updateRole(UpdateConversationParticipantRoleRequest $request, int $id, int $userId): JsonResponse
    {
        $conversation = Conversation::find($id);
        if (! $conversation) {
            return $this->errorResponse('Resource not found', [], 404);
        }

        $authUserId = (int) $request->user()->id;
        $targetRole = $request->validated()['participant_role'];

        if (! $this->participantService->isOwner($conversation, $authUserId)) {
            return $this->errorResponse('You do not have permission to access this resource', [], 403);
        }

        $this->participantService->updateRole($conversation, $userId, $targetRole);

        return $this->successResponse('Participant role updated successfully.', (object) []);
    }

    public function markRead(UpdateReadReceiptRequest $request, int $id, int $userId): JsonResponse
    {
        if ((int) $request->user()->id !== $userId) {
            return $this->errorResponse('You do not have permission to access this resource', [], 403);
        }

        $conversation = Conversation::find($id);
        if (! $conversation) {
            return $this->errorResponse('Resource not found', [], 404);
        }

        try {
            $participant = $this->participantService->updateRead($conversation, $request->user(), $request->validated()['last_read_message_id'] ?? null);
        } catch (\DomainException $exception) {
            return $this->errorResponse('Validation error', null, 422, ['last_read_message_id' => [$exception->getMessage()]]);
        }

        return $this->successResponse('Read receipt updated successfully.', new ConversationParticipantResource($participant->load('user')));
    }

    public function markDelivered(UpdateDeliveredReceiptRequest $request, int $id, int $userId): JsonResponse
    {
        if ((int) $request->user()->id !== $userId) {
            return $this->errorResponse('You do not have permission to access this resource', [], 403);
        }

        $conversation = Conversation::find($id);
        if (! $conversation) {
            return $this->errorResponse('Resource not found', [], 404);
        }

        try {
            $participant = $this->participantService->updateDelivered($conversation, $request->user(), $request->validated()['last_delivered_message_id'] ?? null);
        } catch (\DomainException $exception) {
            return $this->errorResponse('Validation error', null, 422, ['last_delivered_message_id' => [$exception->getMessage()]]);
        }

        return $this->successResponse('Delivered receipt updated successfully.', new ConversationParticipantResource($participant->load('user')));
    }
}
