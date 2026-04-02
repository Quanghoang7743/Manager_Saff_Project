<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SearchUsersRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Http\Resources\UserSummaryResource;
use App\Models\User;
use App\Services\UserService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    use ApiResponseTrait;

    public function __construct(private readonly UserService $userService) {}

    public function search(SearchUsersRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $perPage = (int) ($validated['per_page'] ?? 20);

        $paginator = $this->userService->searchForUser(
            $request->user(),
            (string) $validated['q'],
            $perPage,
        );

        return $this->successResponse('Users fetched.', [
            'items' => UserSummaryResource::collection($paginator->items()),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        return $this->successResponse('User fetched.', [
            'user' => new UserResource($user),
        ]);
    }

    public function update(UpdateUserRequest $request, int $id): JsonResponse
    {
        $authUser = $request->user();

        if ((int) $authUser->id !== $id) {
            return $this->errorResponse('You can only update your own profile.', [], 403);
        }

        $user = User::findOrFail($id);
        $updatedUser = $this->userService->update($user, $request->validated());

        return $this->successResponse('User updated successfully.', [
            'user' => new UserResource($updatedUser),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $authUser = $request->user();

        if ((int) $authUser->id !== $id) {
            return $this->errorResponse('You can only delete your own account.', [], 403);
        }

        $user = User::findOrFail($id);
        $this->userService->softDelete($user);

        return $this->successResponse('User deleted successfully.', []);
    }
}
