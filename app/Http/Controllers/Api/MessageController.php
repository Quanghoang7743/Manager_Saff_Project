<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ForwardMessageRequest;
use App\Http\Requests\StoreMessageRequest;
use App\Http\Requests\UpdateMessageRequest;
use App\Http\Resources\MessageResource;
use App\Models\Conversation;
use App\Models\Message;
use App\Services\MessageService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    use ApiResponseTrait;

    public function __construct(private readonly MessageService $messageService) {}

    public function index(Request $request, int $id): JsonResponse
    {
        $conversation = Conversation::find($id);
        if (! $conversation) {
            return $this->errorResponse('Resource not found', [], 404);
        }

        try {
            $messages = $this->messageService->listForConversation(
                $conversation,
                $request->user(),
                $request->filled('cursor_id') ? (int) $request->query('cursor_id') : null,
                max(1, min((int) $request->query('limit', 30), 100))
            );
        } catch (\DomainException $exception) {
            return $this->errorResponse($exception->getMessage(), [], 403);
        }

        return $this->successResponse('Messages fetched successfully.', MessageResource::collection($messages));
    }

    public function store(StoreMessageRequest $request, int $id): JsonResponse
    {
        $conversation = Conversation::find($id);
        if (! $conversation) {
            return $this->errorResponse('Resource not found', [], 404);
        }

        try {
            $message = $this->messageService->sendMessage($conversation, $request->user(), $request->validated());
        } catch (\DomainException $exception) {
            return $this->errorResponse('Validation error', null, 422, ['message' => [$exception->getMessage()]]);
        }

        return $this->successResponse('Message sent successfully.', new MessageResource($message), 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $message = Message::with(['sender', 'attachments', 'reactions.user'])->withCount('reactions')->find($id);
        if (! $message) {
            return $this->errorResponse('Resource not found', [], 404);
        }

        try {
            $this->messageService->listForConversation($message->conversation, $request->user(), null, 1);
        } catch (\DomainException $exception) {
            return $this->errorResponse($exception->getMessage(), [], 403);
        }

        return $this->successResponse('Message fetched successfully.', new MessageResource($message));
    }

    public function update(UpdateMessageRequest $request, int $id): JsonResponse
    {
        $message = Message::find($id);
        if (! $message) {
            return $this->errorResponse('Resource not found', [], 404);
        }

        try {
            $updated = $this->messageService->updateMessage($message, $request->user(), $request->validated());
        } catch (\DomainException $exception) {
            return $this->errorResponse($exception->getMessage(), [], 403);
        }

        return $this->successResponse('Message updated successfully.', new MessageResource($updated));
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $message = Message::find($id);
        if (! $message) {
            return $this->errorResponse('Resource not found', [], 404);
        }

        $this->messageService->deleteForSender($message, $request->user());

        return $this->successResponse('Message deleted successfully.', (object) []);
    }

    public function deleteForEveryone(Request $request, int $id): JsonResponse
    {
        $message = Message::find($id);
        if (! $message) {
            return $this->errorResponse('Resource not found', [], 404);
        }

        try {
            $this->messageService->deleteForEveryone($message, $request->user());
        } catch (\DomainException $exception) {
            return $this->errorResponse($exception->getMessage(), [], 403);
        }

        return $this->successResponse('Message deleted for everyone successfully.', (object) []);
    }

    public function forward(ForwardMessageRequest $request, int $id): JsonResponse
    {
        $source = Message::find($id);
        if (! $source) {
            return $this->errorResponse('Resource not found', [], 404);
        }

        try {
            $forwarded = $this->messageService->forwardMessage($source, $request->user(), $request->validated());
        } catch (\DomainException $exception) {
            return $this->errorResponse($exception->getMessage(), [], 403);
        }

        return $this->successResponse('Message forwarded successfully.', new MessageResource($forwarded), 201);
    }
}
