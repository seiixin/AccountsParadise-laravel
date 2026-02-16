<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Buyer\BuyerController;
use App\Http\Controllers\Buyer\OrderController;
use App\Http\Controllers\Buyer\OrderPaymentProofController;
use App\Http\Controllers\Buyer\OrderDisputeController;
use App\Http\Controllers\Buyer\PurchaseController;
use App\Http\Controllers\Chat\ChatController;

Route::middleware(['auth', 'verified', 'role:buyer'])
    ->prefix('buyer')
    ->name('buyer.')
    ->group(function () {

    // Dashboard
    Route::get('/dashboard', [BuyerController::class, 'dashboard'])
        ->name('dashboard');

    // Orders
    Route::get('/orders', [OrderController::class, 'index'])
        ->name('orders.index');

    Route::get('/orders/{order}', [OrderController::class, 'show'])
        ->name('orders.show');

    Route::put('/orders/{order}/status', [OrderController::class, 'updateStatus'])
        ->name('orders.update-status');

    // Payment Proof (Buyer submits ONLY)
    Route::post('/order-payment-proofs', [OrderPaymentProofController::class, 'store'])
        ->name('payment-proofs.store');

    // Review payment proof (Admin/Midman ONLY — route exists but role should block buyer)
    Route::put('/order-payment-proofs/{id}/review', [OrderPaymentProofController::class, 'review'])
        ->name('payment-proofs.review');

    // Disputes (Buyer)
    Route::get('/disputes', [BuyerController::class, 'disputes'])
        ->name('disputes.index');
    Route::get('/order-disputes', [OrderDisputeController::class, 'index'])
        ->name('disputes.list');
    Route::post('/order-disputes', [OrderDisputeController::class, 'store'])
        ->name('disputes.store');

    Route::put('/order-disputes/{id}/resolve', [OrderDisputeController::class, 'resolve'])
        ->name('disputes.resolve');

    Route::post('/purchase', [PurchaseController::class, 'store'])
        ->name('purchase.store');

    // Chat
    Route::get('/inbox', [ChatController::class, 'inbox'])->name('chat.inbox');
    Route::get('/chat/{id}', [ChatController::class, 'show'])->whereNumber('id')->name('chat.show');
    Route::post('/chat/{id}/messages', [ChatController::class, 'send'])->whereNumber('id')->name('chat.send');
    Route::get('/chat/users', [ChatController::class, 'listUsers'])->name('chat.users');
    Route::post('/chat/start-with', [ChatController::class, 'startWith'])->name('chat.start-with');
    Route::post('/chat/start', [ChatController::class, 'startDirect'])->name('chat.start');
    Route::post('/chat/ensure-groups', [ChatController::class, 'ensureGroupRooms'])->name('chat.ensure-groups');
});
