<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\DeleteMessageReactionRequest;
use App\Http\Requests\StoreMessageReactionRequest;
use App\Http\Resources\MessageReactionResource;
use App\Models\Message;
use App\Models\MessageReaction;
use App\Services\ReactionService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MessageReactionController extends Controller
{
    use ApiResponseTrait;

    public function __construct(private readonly ReactionService $reactionService) {}

    public function index(Request $request, int $id): JsonResponse
    {
        $message = Message::find($id);
        if (! $message) {
            return $this->errorResponse('Resource not found', [], 404);
        }

        try {
            $this->reactionService->ensureParticipant($message, $request->user());
        } catch (\DomainException $exception) {
            return $this->errorResponse($exception->getMessage(), [], 403);
        }

        $reactions = MessageReaction::with('user')
            ->where('message_id', $message->id)
            ->orderBy('reaction_code')
            ->get();

        $summary = MessageReaction::where('message_id', $message->id)
            ->selectRaw('reaction_code, COUNT(*) as total')
            ->groupBy('reaction_code')
            ->orderBy('reaction_code')
            ->get();

        return $this->successResponse('Reactions fetched successfully.', [
            'items' => MessageReactionResource::collection($reactions),
            'summary' => $summary,
        ]);
    }

    public function store(StoreMessageReactionRequest $request, int $id): JsonResponse
    {
        $message = Message::find($id);
        if (! $message) {
            return $this->errorResponse('Resource not found', [], 404);
        }

        try {
            $added = $this->reactionService->toggleReaction($message, $request->user(), $request->validated()['reaction_code']);
        } catch (\DomainException $exception) {
            return $this->errorResponse($exception->getMessage(), [], 403);
        }

        return $this->successResponse($added ? 'Reaction added successfully.' : 'Reaction removed successfully.', (object) []);
    }

    public function destroy(DeleteMessageReactionRequest $request, int $id): JsonResponse
    {
        $message = Message::find($id);
        if (! $message) {
            return $this->errorResponse('Resource not found', [], 404);
        }

        try {
            $this->reactionService->removeReaction($message, $request->user(), $request->validated()['reaction_code']);
        } catch (\DomainException $exception) {
            return $this->errorResponse($exception->getMessage(), [], 403);
        }

        return $this->successResponse('Reaction removed successfully.', (object) []);
    }
}
