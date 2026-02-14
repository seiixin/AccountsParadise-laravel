<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\PayoutRequestController;
use App\Http\Controllers\Admin\OrderDisputeController;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Admin\ListingController as AdminListingController;
use App\Http\Controllers\Chat\ChatController;

Route::prefix('admin')
    ->middleware(['auth', 'role:admin'])
    ->name('admin.')
    ->group(function () {
        Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('dashboard');

        // Orders
        Route::get('/orders', [AdminOrderController::class, 'index']);
        Route::get('/orders/{id}', [AdminOrderController::class, 'show'])->whereNumber('id');
        Route::put('/orders/{id}/status', [AdminOrderController::class, 'updateStatus'])->whereNumber('id');
        Route::post('/orders/{id}/dispute', [AdminOrderController::class, 'resolveDispute'])->whereNumber('id');
        Route::delete('/orders/{id}/delete', [AdminOrderController::class, 'destroy'])
        ->name('orders.delete');

        // Payout Requests
        Route::get('/payout-requests', [PayoutRequestController::class, 'index']);
        Route::get('/payout-requests/{id}', [PayoutRequestController::class, 'show'])->whereNumber('id');
        Route::put('/payout-requests/{id}/approve', [PayoutRequestController::class, 'approve'])->whereNumber('id');

        // Order Disputes
        Route::get('/order-disputes', [OrderDisputeController::class, 'index']);
        Route::put('/order-disputes/{id}/resolve', [OrderDisputeController::class, 'resolve'])->whereNumber('id');

        // User Management
        Route::get('/users', [UserManagementController::class, 'index']);
        Route::get('/users/{id}', [UserManagementController::class, 'show'])->whereNumber('id');
        Route::put('/users/{id}/edit', [UserManagementController::class, 'update'])->whereNumber('id');
        Route::delete('/users/{id}/delete', [UserManagementController::class, 'destroy'])->whereNumber('id');

        // Listings
        Route::get('/listings', [AdminListingController::class, 'index'])->name('listings.index');
        Route::get('/listings/{id}', [AdminListingController::class, 'show'])->whereNumber('id')->name('listings.show');

        // Chat
        Route::get('/inbox', [ChatController::class, 'inbox'])->name('chat.inbox');
        Route::get('/chat/{id}', [ChatController::class, 'show'])->whereNumber('id')->name('chat.show');
        Route::post('/chat/{id}/messages', [ChatController::class, 'send'])->whereNumber('id')->name('chat.send');
        Route::get('/chat/users', [ChatController::class, 'listUsers'])->name('chat.users');
        Route::post('/chat/start-with', [ChatController::class, 'startWith'])->name('chat.start-with');
        Route::post('/chat/ensure-groups', [ChatController::class, 'ensureGroupRooms'])->name('chat.ensure-groups');
    });
