<?php

use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ConversationController;
use App\Http\Controllers\Api\ConversationParticipantController;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\FriendController;
use App\Http\Controllers\Api\MessageAttachmentController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\MessageReactionController;
use App\Http\Controllers\Api\PositionController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\UserDeviceController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function (): void {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/users/search', [UserController::class, 'search']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);

    Route::get('/employees', [EmployeeController::class, 'index']);
    Route::post('/employees', [EmployeeController::class, 'store']);
    Route::get('/employees/{id}', [EmployeeController::class, 'show']);
    Route::put('/employees/{id}', [EmployeeController::class, 'update']);

    Route::get('/departments', [DepartmentController::class, 'index']);
    Route::post('/departments', [DepartmentController::class, 'store']);
    Route::put('/departments/{id}', [DepartmentController::class, 'update']);
    Route::delete('/departments/{id}', [DepartmentController::class, 'destroy']);

    Route::get('/positions', [PositionController::class, 'index']);
    Route::post('/positions', [PositionController::class, 'store']);
    Route::put('/positions/{id}', [PositionController::class, 'update']);
    Route::delete('/positions/{id}', [PositionController::class, 'destroy']);

    Route::get('/tasks', [TaskController::class, 'index']);
    Route::post('/tasks', [TaskController::class, 'store']);
    Route::get('/tasks/{id}', [TaskController::class, 'show']);
    Route::put('/tasks/{id}', [TaskController::class, 'update']);
    Route::delete('/tasks/{id}', [TaskController::class, 'destroy']);
    Route::get('/tasks/{id}/comments', [TaskController::class, 'comments']);
    Route::post('/tasks/{id}/comments', [TaskController::class, 'addComment']);

    Route::get('/attendance/shifts', [AttendanceController::class, 'shifts']);
    Route::post('/attendance/shifts', [AttendanceController::class, 'createShift']);
    Route::put('/attendance/shifts/{id}', [AttendanceController::class, 'updateShift']);
    Route::delete('/attendance/shifts/{id}', [AttendanceController::class, 'deleteShift']);
    Route::post('/attendance/assignments', [AttendanceController::class, 'assignShift']);
    Route::get('/attendance/assignments/me', [AttendanceController::class, 'myAssignments']);
    Route::post('/attendance/check-in', [AttendanceController::class, 'checkIn']);
    Route::post('/attendance/check-out', [AttendanceController::class, 'checkOut']);
    Route::get('/attendance/logs/me', [AttendanceController::class, 'myLogs']);
    Route::get('/attendance/logs/team', [AttendanceController::class, 'teamLogs']);
    Route::get('/attendance/reports', [AttendanceController::class, 'report']);
    Route::post('/attendance/adjustments', [AttendanceController::class, 'requestAdjustment']);
    Route::patch('/attendance/adjustments/{id}/review', [AttendanceController::class, 'reviewAdjustment']);

    Route::post('/friends/resolve-by-phone', [FriendController::class, 'resolveByPhone']);
    Route::post('/friend-requests', [FriendController::class, 'sendRequest']);
    Route::get('/friend-requests/incoming', [FriendController::class, 'incoming']);
    Route::get('/friend-requests/outgoing', [FriendController::class, 'outgoing']);
    Route::patch('/friend-requests/{id}/accept', [FriendController::class, 'accept']);
    Route::patch('/friend-requests/{id}/reject', [FriendController::class, 'reject']);
    Route::delete('/friend-requests/{id}', [FriendController::class, 'cancel']);
    Route::get('/friends', [FriendController::class, 'list']);
    Route::delete('/friends/{userId}', [FriendController::class, 'unfriend']);

    Route::get('/devices', [UserDeviceController::class, 'index']);
    Route::post('/devices', [UserDeviceController::class, 'store']);
    Route::get('/devices/{id}', [UserDeviceController::class, 'show']);
    Route::put('/devices/{id}', [UserDeviceController::class, 'update']);
    Route::delete('/devices/{id}', [UserDeviceController::class, 'destroy']);
    Route::patch('/devices/{id}/deactivate', [UserDeviceController::class, 'deactivate']);
    Route::patch('/devices/{id}/activate', [UserDeviceController::class, 'activate']);
    Route::patch('/devices/{id}/last-active', [UserDeviceController::class, 'updateLastActive']);

    Route::get('/conversations', [ConversationController::class, 'index']);
    Route::post('/conversations/direct', [ConversationController::class, 'storeDirect']);
    Route::post('/conversations/group', [ConversationController::class, 'storeGroup']);
    Route::get('/conversations/{id}', [ConversationController::class, 'show']);
    Route::put('/conversations/{id}', [ConversationController::class, 'update']);
    Route::delete('/conversations/{id}', [ConversationController::class, 'destroy']);
    Route::patch('/conversations/{id}/archive', [ConversationController::class, 'archive']);
    Route::patch('/conversations/{id}/unarchive', [ConversationController::class, 'unarchive']);
    Route::post('/conversations/{id}/typing', [ConversationController::class, 'typing']);
    Route::patch('/conversations/{id}/participants/{userId}/pin', [ConversationController::class, 'pin']);
    Route::patch('/conversations/{id}/participants/{userId}/unpin', [ConversationController::class, 'unpin']);
    Route::patch('/conversations/{id}/participants/{userId}/mute', [ConversationController::class, 'mute']);
    Route::patch('/conversations/{id}/participants/{userId}/unmute', [ConversationController::class, 'unmute']);
    Route::patch('/conversations/{id}/participants/{userId}/hide', [ConversationController::class, 'hide']);
    Route::patch('/conversations/{id}/participants/{userId}/unhide', [ConversationController::class, 'unhide']);

    Route::get('/conversations/{id}/participants', [ConversationParticipantController::class, 'index']);
    Route::post('/conversations/{id}/participants', [ConversationParticipantController::class, 'store']);
    Route::delete('/conversations/{id}/participants/{userId}', [ConversationParticipantController::class, 'destroy']);
    Route::patch('/conversations/{id}/participants/{userId}/role', [ConversationParticipantController::class, 'updateRole']);
    Route::patch('/conversations/{id}/participants/{userId}/read', [ConversationParticipantController::class, 'markRead']);
    Route::patch('/conversations/{id}/participants/{userId}/delivered', [ConversationParticipantController::class, 'markDelivered']);

    Route::get('/conversations/{id}/messages', [MessageController::class, 'index']);
    Route::post('/conversations/{id}/messages', [MessageController::class, 'store']);
    Route::get('/messages/{id}', [MessageController::class, 'show']);
    Route::put('/messages/{id}', [MessageController::class, 'update']);
    Route::delete('/messages/{id}', [MessageController::class, 'destroy']);
    Route::patch('/messages/{id}/delete-for-everyone', [MessageController::class, 'deleteForEveryone']);
    Route::post('/messages/{id}/forward', [MessageController::class, 'forward']);

    Route::post('/messages/{id}/attachments', [MessageAttachmentController::class, 'store']);
    Route::delete('/attachments/{id}', [MessageAttachmentController::class, 'destroy']);

    Route::post('/messages/{id}/reactions', [MessageReactionController::class, 'store']);
    Route::delete('/messages/{id}/reactions', [MessageReactionController::class, 'destroy']);
    Route::get('/messages/{id}/reactions', [MessageReactionController::class, 'index']);
});
