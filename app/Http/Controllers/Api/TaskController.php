<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\TaskComment;
use App\Support\RoleGuard;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TaskController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request): JsonResponse
    {
        $auth = $request->user();

        $query = Task::query()->with(['creator:id,display_name,username,avatar_url', 'assignee:id,display_name,username,avatar_url']);

        if (! RoleGuard::canManageTasks($auth)) {
            $query->where(function ($builder) use ($auth): void {
                $builder->where('creator_id', $auth->id)->orWhere('assignee_id', $auth->id);
            });
        }

        foreach (['status', 'priority', 'assignee_id', 'creator_id'] as $field) {
            if ($request->filled($field)) {
                $query->where($field, $request->query($field));
            }
        }

        if ($request->filled('q')) {
            $term = trim((string) $request->query('q'));
            $query->where(function ($builder) use ($term): void {
                $builder->where('title', 'like', '%'.$term.'%')->orWhere('description', 'like', '%'.$term.'%');
            });
        }

        $items = $query->orderByRaw("CASE WHEN status = 'in_progress' THEN 0 WHEN status = 'todo' THEN 1 ELSE 2 END")
            ->orderBy('due_at')
            ->orderByDesc('id')
            ->paginate(max(1, min((int) $request->query('per_page', 20), 100)));

        return $this->successResponse('Tasks fetched.', [
            'items' => $items->items(),
            'meta' => [
                'current_page' => $items->currentPage(),
                'last_page' => $items->lastPage(),
                'per_page' => $items->perPage(),
                'total' => $items->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $auth = $request->user();

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'assignee_id' => ['nullable', 'integer', 'exists:users,id'],
            'priority' => ['nullable', Rule::in(['low', 'medium', 'high', 'urgent'])],
            'status' => ['nullable', Rule::in(['todo', 'in_progress', 'done', 'cancelled'])],
            'due_at' => ['nullable', 'date'],
        ]);

        if (! RoleGuard::canManageTasks($auth) && isset($validated['assignee_id']) && (int) $validated['assignee_id'] !== (int) $auth->id) {
            return $this->errorResponse('You can only assign tasks to yourself.', [], 403);
        }

        $task = Task::create([
            ...$validated,
            'creator_id' => $auth->id,
            'assignee_id' => $validated['assignee_id'] ?? $auth->id,
            'priority' => $validated['priority'] ?? 'medium',
            'status' => $validated['status'] ?? 'todo',
        ]);

        return $this->successResponse('Task created.', $task->load(['creator:id,display_name,username,avatar_url', 'assignee:id,display_name,username,avatar_url']), 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $auth = $request->user();
        $task = Task::with([
            'creator:id,display_name,username,avatar_url',
            'assignee:id,display_name,username,avatar_url',
            'comments.user:id,display_name,username,avatar_url',
        ])->find($id);
        if (! $task) {
            return $this->errorResponse('Resource not found', [], 404);
        }

        if (! RoleGuard::canManageTasks($auth) && (int) $task->creator_id !== (int) $auth->id && (int) $task->assignee_id !== (int) $auth->id) {
            return $this->errorResponse('You do not have permission to access this resource', [], 403);
        }

        return $this->successResponse('Task fetched.', $task);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $auth = $request->user();
        $task = Task::find($id);
        if (! $task) {
            return $this->errorResponse('Resource not found', [], 404);
        }

        $canAccess = RoleGuard::canManageTasks($auth)
            || (int) $task->creator_id === (int) $auth->id
            || (int) $task->assignee_id === (int) $auth->id;
        if (! $canAccess) {
            return $this->errorResponse('You do not have permission to access this resource', [], 403);
        }

        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'assignee_id' => ['sometimes', 'nullable', 'integer', 'exists:users,id'],
            'priority' => ['sometimes', Rule::in(['low', 'medium', 'high', 'urgent'])],
            'status' => ['sometimes', Rule::in(['todo', 'in_progress', 'done', 'cancelled'])],
            'due_at' => ['sometimes', 'nullable', 'date'],
        ]);

        if (! RoleGuard::canManageTasks($auth) && isset($validated['assignee_id']) && (int) $validated['assignee_id'] !== (int) $auth->id) {
            return $this->errorResponse('You can only assign tasks to yourself.', [], 403);
        }

        if (($validated['status'] ?? null) === 'done') {
            $validated['completed_at'] = now();
        }

        $task->fill($validated)->save();

        return $this->successResponse('Task updated.', $task->fresh()->load(['creator:id,display_name,username,avatar_url', 'assignee:id,display_name,username,avatar_url']));
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $auth = $request->user();
        $task = Task::find($id);
        if (! $task) {
            return $this->errorResponse('Resource not found', [], 404);
        }

        if (! RoleGuard::canManageTasks($auth) && (int) $task->creator_id !== (int) $auth->id) {
            return $this->errorResponse('You do not have permission to access this resource', [], 403);
        }

        $task->delete();

        return $this->successResponse('Task deleted.', (object) []);
    }

    public function comments(Request $request, int $taskId): JsonResponse
    {
        $auth = $request->user();
        $task = Task::find($taskId);
        if (! $task) {
            return $this->errorResponse('Resource not found', [], 404);
        }

        if (! RoleGuard::canManageTasks($auth) && (int) $task->creator_id !== (int) $auth->id && (int) $task->assignee_id !== (int) $auth->id) {
            return $this->errorResponse('You do not have permission to access this resource', [], 403);
        }

        $comments = TaskComment::query()
            ->where('task_id', $taskId)
            ->with('user:id,display_name,username,avatar_url')
            ->orderBy('id')
            ->get();

        return $this->successResponse('Task comments fetched.', $comments);
    }

    public function addComment(Request $request, int $taskId): JsonResponse
    {
        $auth = $request->user();
        $task = Task::find($taskId);
        if (! $task) {
            return $this->errorResponse('Resource not found', [], 404);
        }

        if (! RoleGuard::canManageTasks($auth) && (int) $task->creator_id !== (int) $auth->id && (int) $task->assignee_id !== (int) $auth->id) {
            return $this->errorResponse('You do not have permission to access this resource', [], 403);
        }

        $validated = $request->validate([
            'content' => ['required', 'string'],
        ]);

        $comment = TaskComment::create([
            'task_id' => $task->id,
            'user_id' => $auth->id,
            'content' => $validated['content'],
        ]);

        return $this->successResponse('Task comment added.', $comment->load('user:id,display_name,username,avatar_url'), 201);
    }
}
