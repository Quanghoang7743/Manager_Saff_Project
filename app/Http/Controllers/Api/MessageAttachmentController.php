<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMessageAttachmentRequest;
use App\Http\Resources\MessageAttachmentResource;
use App\Models\Message;
use App\Models\MessageAttachment;
use App\Services\MessageService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MessageAttachmentController extends Controller
{
    use ApiResponseTrait;

    public function __construct(private readonly MessageService $messageService) {}

    public function store(StoreMessageAttachmentRequest $request, int $id): JsonResponse
    {
        $message = Message::with('conversation')->find($id);
        if (! $message) {
            return $this->errorResponse('Resource not found', [], 404);
        }

        try {
            $attachment = $this->messageService->addAttachment($message, $request->user(), $request->validated());
        } catch (\DomainException $exception) {
            return $this->errorResponse($exception->getMessage(), [], 403);
        }

        return $this->successResponse('Attachment added successfully.', new MessageAttachmentResource($attachment), 201);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $attachment = MessageAttachment::with('message.conversation')->find($id);
        if (! $attachment) {
            return $this->errorResponse('Resource not found', [], 404);
        }

        try {
            $this->messageService->removeAttachment($attachment, $request->user());
        } catch (\DomainException $exception) {
            return $this->errorResponse($exception->getMessage(), [], 403);
        }

        return $this->successResponse('Attachment deleted successfully.', (object) []);
    }
}
