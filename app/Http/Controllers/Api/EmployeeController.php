<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Support\RoleGuard;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class EmployeeController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request): JsonResponse
    {
        $auth = $request->user();
        if (! RoleGuard::canManageEmployees($auth)) {
            return $this->errorResponse('You do not have permission to access this resource', [], 403);
        }

        $query = User::query()->where('account_status', '!=', 'deleted');

        if ($auth->hasRole('manager')) {
            $query->where('manager_user_id', $auth->id);
        }

        if ($request->filled('q')) {
            $term = trim((string) $request->query('q'));
            $query->where(function ($builder) use ($term): void {
                $builder->where('display_name', 'like', '%'.$term.'%')
                    ->orWhere('employee_code', 'like', '%'.$term.'%')
                    ->orWhere('phone_number', 'like', '%'.$term.'%')
                    ->orWhere('email', 'like', '%'.$term.'%');
            });
        }

        foreach (['role', 'department_id', 'position_id', 'employment_status', 'manager_user_id'] as $field) {
            if ($request->filled($field)) {
                $query->where($field, $request->query($field));
            }
        }

        $perPage = max(1, min((int) $request->query('per_page', 20), 100));
        $items = $query->orderBy('display_name')->paginate($perPage);

        return $this->successResponse('Employees fetched.', [
            'items' => UserResource::collection($items->items()),
            'meta' => [
                'current_page' => $items->currentPage(),
                'last_page' => $items->lastPage(),
                'per_page' => $items->perPage(),
                'total' => $items->total(),
            ],
        ]);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $auth = $request->user();
        $employee = User::find($id);
        if (! $employee) {
            return $this->errorResponse('Resource not found', [], 404);
        }

        if (! RoleGuard::canViewTeamMember($auth, $employee)) {
            return $this->errorResponse('You do not have permission to access this resource', [], 403);
        }

        return $this->successResponse('Employee fetched.', ['employee' => new UserResource($employee)]);
    }

    public function store(Request $request): JsonResponse
    {
        $auth = $request->user();
        if (! RoleGuard::canManageEmployees($auth)) {
            return $this->errorResponse('You do not have permission to access this resource', [], 403);
        }

        $validated = $request->validate([
            'display_name' => ['required', 'string', 'max:100'],
            'email' => ['nullable', 'email', 'max:255', 'unique:users,email'],
            'phone_number' => ['nullable', 'string', 'max:20', 'unique:users,phone_number'],
            'username' => ['nullable', 'string', 'max:50', 'unique:users,username'],
            'password' => ['required', 'string', 'min:6'],
            'avatar_url' => ['nullable', 'url', 'max:500'],
            'employee_code' => ['nullable', 'string', 'max:30', 'unique:users,employee_code'],
            'department_id' => ['nullable', 'integer', 'exists:departments,id'],
            'position_id' => ['nullable', 'integer', 'exists:positions,id'],
            'manager_user_id' => ['nullable', 'integer', 'exists:users,id'],
            'role' => ['nullable', Rule::in(['super_admin', 'hr_admin', 'manager', 'employee'])],
            'employment_status' => ['nullable', Rule::in(['probation', 'active', 'leave', 'resigned'])],
            'work_type' => ['nullable', Rule::in(['onsite', 'hybrid', 'remote'])],
            'hired_at' => ['nullable', 'date'],
        ]);

        $role = $validated['role'] ?? 'employee';
        if ($auth->hasRole('manager')) {
            $role = 'employee';
            $validated['manager_user_id'] = $auth->id;
        }

        $employee = User::create([
            'display_name' => $validated['display_name'],
            'email' => $validated['email'] ?? null,
            'phone_number' => $validated['phone_number'] ?? null,
            'username' => $validated['username'] ?? null,
            'password_hash' => Hash::make($validated['password']),
            'avatar_url' => $validated['avatar_url'] ?? null,
            'account_status' => 'active',
            'presence_status' => 'offline',
            'role' => $role,
            'employee_code' => $validated['employee_code'] ?? null,
            'department_id' => $validated['department_id'] ?? null,
            'position_id' => $validated['position_id'] ?? null,
            'manager_user_id' => $validated['manager_user_id'] ?? null,
            'employment_status' => $validated['employment_status'] ?? 'active',
            'work_type' => $validated['work_type'] ?? 'onsite',
            'hired_at' => $validated['hired_at'] ?? null,
            'is_phone_verified' => false,
            'is_email_verified' => false,
        ]);

        return $this->successResponse('Employee created.', ['employee' => new UserResource($employee)], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $auth = $request->user();
        $employee = User::find($id);
        if (! $employee) {
            return $this->errorResponse('Resource not found', [], 404);
        }

        if (! RoleGuard::canManageEmployees($auth) || ! RoleGuard::canViewTeamMember($auth, $employee)) {
            return $this->errorResponse('You do not have permission to access this resource', [], 403);
        }

        $validated = $request->validate([
            'display_name' => ['sometimes', 'required', 'string', 'max:100'],
            'email' => ['sometimes', 'nullable', 'email', 'max:255', Rule::unique('users', 'email')->ignore($employee->id)],
            'phone_number' => ['sometimes', 'nullable', 'string', 'max:20', Rule::unique('users', 'phone_number')->ignore($employee->id)],
            'username' => ['sometimes', 'nullable', 'string', 'max:50', Rule::unique('users', 'username')->ignore($employee->id)],
            'password' => ['sometimes', 'nullable', 'string', 'min:6'],
            'avatar_url' => ['sometimes', 'nullable', 'url', 'max:500'],
            'employee_code' => ['sometimes', 'nullable', 'string', 'max:30', Rule::unique('users', 'employee_code')->ignore($employee->id)],
            'department_id' => ['sometimes', 'nullable', 'integer', 'exists:departments,id'],
            'position_id' => ['sometimes', 'nullable', 'integer', 'exists:positions,id'],
            'manager_user_id' => ['sometimes', 'nullable', 'integer', 'exists:users,id'],
            'role' => ['sometimes', Rule::in(['super_admin', 'hr_admin', 'manager', 'employee'])],
            'employment_status' => ['sometimes', Rule::in(['probation', 'active', 'leave', 'resigned'])],
            'work_type' => ['sometimes', Rule::in(['onsite', 'hybrid', 'remote'])],
            'hired_at' => ['sometimes', 'nullable', 'date'],
            'account_status' => ['sometimes', Rule::in(['active', 'suspended', 'deleted'])],
        ]);

        if ($auth->hasRole('manager')) {
            unset($validated['role'], $validated['account_status']);
            $validated['manager_user_id'] = $auth->id;
        }

        if (! empty($validated['password'])) {
            $validated['password_hash'] = Hash::make($validated['password']);
        }
        unset($validated['password']);

        $employee->fill($validated)->save();

        return $this->successResponse('Employee updated.', ['employee' => new UserResource($employee->fresh())]);
    }
}
