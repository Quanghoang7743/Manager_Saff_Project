<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserDeviceRequest;
use App\Http\Requests\UpdateUserDeviceRequest;
use App\Http\Resources\UserDeviceResource;
use App\Models\UserDevice;
use App\Services\UserDeviceService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserDeviceController extends Controller
{
    use ApiResponseTrait;

    public function __construct(private readonly UserDeviceService $userDeviceService) {}

    public function index(Request $request): JsonResponse
    {
        $devices = $request->user()
            ->devices()
            ->orderByDesc('last_active_at')
            ->orderByDesc('id')
            ->get();

        return $this->successResponse('Devices fetched successfully.', UserDeviceResource::collection($devices)->resolve($request));
    }

    public function store(StoreUserDeviceRequest $request): JsonResponse
    {
        [$device, $created] = $this->userDeviceService->registerOrUpdateDevice($request->user(), $request->validated());

        return $this->successResponse(
            $created ? 'Device registered successfully.' : 'Device updated successfully.',
            (new UserDeviceResource($device))->resolve($request),
            $created ? 201 : 200
        );
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $device = $this->findOwnedDevice($request, $id);

        if (! $device) {
            return $this->errorResponse('Device not found.', (object) [], 404);
        }

        return $this->successResponse('Device fetched successfully.', (new UserDeviceResource($device))->resolve($request));
    }

    public function update(UpdateUserDeviceRequest $request, int $id): JsonResponse
    {
        $device = $this->findOwnedDevice($request, $id);

        if (! $device) {
            return $this->errorResponse('Device not found.', (object) [], 404);
        }

        $device = $this->userDeviceService->updateDevice($device, $request->validated());

        return $this->successResponse('Device updated successfully.', (new UserDeviceResource($device))->resolve($request));
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $device = $this->findOwnedDevice($request, $id);

        if (! $device) {
            return $this->errorResponse('Device not found.', (object) [], 404);
        }

        $device->delete();

        return $this->successResponse('Device deleted successfully.', (object) []);
    }

    public function deactivate(Request $request, int $id): JsonResponse
    {
        $device = $this->findOwnedDevice($request, $id);

        if (! $device) {
            return $this->errorResponse('Device not found.', (object) [], 404);
        }

        $device->is_active = false;
        $device->save();

        return $this->successResponse('Device deactivated successfully.', (new UserDeviceResource($device->fresh()))->resolve($request));
    }

    public function activate(Request $request, int $id): JsonResponse
    {
        $device = $this->findOwnedDevice($request, $id);

        if (! $device) {
            return $this->errorResponse('Device not found.', (object) [], 404);
        }

        $device->is_active = true;
        $device->save();

        return $this->successResponse('Device activated successfully.', (new UserDeviceResource($device->fresh()))->resolve($request));
    }

    public function updateLastActive(Request $request, int $id): JsonResponse
    {
        $device = $this->findOwnedDevice($request, $id);

        if (! $device) {
            return $this->errorResponse('Device not found.', (object) [], 404);
        }

        $device->last_active_at = now();
        $device->save();

        return $this->successResponse('Device activity updated successfully.', (new UserDeviceResource($device->fresh()))->resolve($request));
    }

    private function findOwnedDevice(Request $request, int $id): ?UserDevice
    {
        return $request->user()
            ->devices()
            ->where('id', $id)
            ->first();
    }
}
