<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\LeadController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public Routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/public/enquiry', [LeadController::class, 'publicEnquiry']);

// Protected Routes (Sanctum Auth)
Route::middleware('auth:sanctum')->group(function () {
    // Auth Profile
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Dashboard Statistics
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

    // User Management (Admin / Internal lists)
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::patch('/users/{user}/toggle-status', [UserController::class, 'toggleStatus']);

    // Lead Operations
    Route::get('/leads', [LeadController::class, 'index']);
    Route::post('/leads', [LeadController::class, 'store']);
    Route::get('/leads/{lead}', [LeadController::class, 'show']);
    Route::put('/leads/{lead}', [LeadController::class, 'update']);
    Route::patch('/leads/{lead}', [LeadController::class, 'update']);
    Route::post('/leads/{lead}/assign', [LeadController::class, 'assign']);
    Route::patch('/leads/{lead}/status', [LeadController::class, 'updateStatus']);
    Route::post('/leads/{lead}/notes', [LeadController::class, 'addNote']);
    Route::get('/leads/{lead}/history', [LeadController::class, 'history']);
});
