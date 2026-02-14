<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Midman\MidmanController;
use App\Http\Controllers\Midman\OrderDeliveryController;
use App\Http\Controllers\Midman\PayoutRequestController;
use App\Http\Controllers\Chat\ChatController;

Route::middleware(['auth', 'role:midman'])->prefix('midman')->name('midman.')->group(function () {
    Route::get('/dashboard', [MidmanController::class, 'dashboard'])->name('dashboard');

    Route::put('/order-deliveries/{id}/receive', [OrderDeliveryController::class, 'receive'])->name('deliveries.receive');
    Route::put('/order-deliveries/{id}/deliver', [OrderDeliveryController::class, 'deliver'])->name('deliveries.deliver');

    // Chat
    Route::get('/inbox', [ChatController::class, 'inbox'])->name('chat.inbox');
    Route::get('/chat/{id}', [ChatController::class, 'show'])->whereNumber('id')->name('chat.show');
    Route::post('/chat/{id}/messages', [ChatController::class, 'send'])->whereNumber('id')->name('chat.send');
    Route::get('/chat/users', [ChatController::class, 'listUsers'])->name('chat.users');
    Route::post('/chat/start-with', [ChatController::class, 'startWith'])->name('chat.start-with');
    Route::post('/chat/ensure-groups', [ChatController::class, 'ensureGroupRooms'])->name('chat.ensure-groups');
});

Route::middleware(['auth', 'role:admin'])->prefix('midman')->name('midman.')->group(function () {
    Route::put('/payout-requests/{id}/approve', [PayoutRequestController::class, 'approve'])->name('payouts.approve');
});
