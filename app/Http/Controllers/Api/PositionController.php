<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Position;
use App\Support\RoleGuard;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PositionController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request): JsonResponse
    {
        $items = Position::query()->orderBy('name')->get();

        return $this->successResponse('Positions fetched.', $items);
    }

    public function store(Request $request): JsonResponse
    {
        if (! RoleGuard::canManageOrg($request->user())) {
            return $this->errorResponse('You do not have permission to access this resource', [], 403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'level' => ['nullable', 'string', 'max:40'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $position = Position::create($validated);

        return $this->successResponse('Position created.', $position, 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        if (! RoleGuard::canManageOrg($request->user())) {
            return $this->errorResponse('You do not have permission to access this resource', [], 403);
        }

        $position = Position::find($id);
        if (! $position) {
            return $this->errorResponse('Resource not found', [], 404);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:120'],
            'level' => ['sometimes', 'nullable', 'string', 'max:40'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $position->fill($validated)->save();

        return $this->successResponse('Position updated.', $position->fresh());
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        if (! RoleGuard::canManageOrg($request->user())) {
            return $this->errorResponse('You do not have permission to access this resource', [], 403);
        }

        $position = Position::find($id);
        if (! $position) {
            return $this->errorResponse('Resource not found', [], 404);
        }

        $position->delete();

        return $this->successResponse('Position deleted.', (object) []);
    }
}
