<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Support\RoleGuard;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DepartmentController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request): JsonResponse
    {
        $items = Department::query()
            ->with('manager:id,display_name,username,avatar_url')
            ->orderBy('name')
            ->get();

        return $this->successResponse('Departments fetched.', $items);
    }

    public function store(Request $request): JsonResponse
    {
        if (! RoleGuard::canManageOrg($request->user())) {
            return $this->errorResponse('You do not have permission to access this resource', [], 403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'code' => ['required', 'string', 'max:30', 'unique:departments,code'],
            'manager_user_id' => ['nullable', 'integer', 'exists:users,id'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $department = Department::create($validated);

        return $this->successResponse('Department created.', $department->load('manager:id,display_name,username,avatar_url'), 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        if (! RoleGuard::canManageOrg($request->user())) {
            return $this->errorResponse('You do not have permission to access this resource', [], 403);
        }

        $department = Department::find($id);
        if (! $department) {
            return $this->errorResponse('Resource not found', [], 404);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:120'],
            'code' => ['sometimes', 'required', 'string', 'max:30', Rule::unique('departments', 'code')->ignore($department->id)],
            'manager_user_id' => ['sometimes', 'nullable', 'integer', 'exists:users,id'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $department->fill($validated)->save();

        return $this->successResponse('Department updated.', $department->fresh()->load('manager:id,display_name,username,avatar_url'));
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        if (! RoleGuard::canManageOrg($request->user())) {
            return $this->errorResponse('You do not have permission to access this resource', [], 403);
        }

        $department = Department::find($id);
        if (! $department) {
            return $this->errorResponse('Resource not found', [], 404);
        }

        $department->delete();

        return $this->successResponse('Department deleted.', (object) []);
    }
}
