<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Merchant\MerchantController;
use App\Http\Controllers\Merchant\OrderController;
use App\Http\Controllers\Merchant\ListingController;
use App\Http\Controllers\Merchant\OrderDeliveryController;
use App\Http\Controllers\Merchant\PayoutRequestController;
use App\Http\Controllers\Chat\ChatController;

Route::middleware(['auth', 'verified', 'role:merchant'])->prefix('merchant')->name('merchant.')->group(function () {
    Route::get('/dashboard', [MerchantController::class, 'dashboard'])->name('dashboard');

    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{id}', [OrderController::class, 'show'])->name('orders.show');
    Route::put('/orders/{id}/update-status', [OrderController::class, 'updateStatus'])->name('orders.update-status');

    Route::post('/listings/create', [ListingController::class, 'store'])->name('listings.store');
    Route::get('/listings', [ListingController::class, 'index'])->name('listings.index');
    Route::get('/listings/{id}', [ListingController::class, 'show'])->name('listings.show');
    Route::get('/listings/{id}/edit', [ListingController::class, 'edit'])->name('listings.edit');
    Route::put('/listings/{id}/update', [ListingController::class, 'update'])->name('listings.update');
    Route::post('/listings/{id}/update', [ListingController::class, 'update'])->name('listings.update.post');
    Route::delete('/listings/{id}/delete', [ListingController::class, 'destroy'])->name('listings.delete');
    Route::post('/listings/{id}/images', [ListingController::class, 'addImage'])->name('listings.images.add');
    Route::delete('/listings/{id}/images/{imageId}', [ListingController::class, 'deleteImage'])->name('listings.images.delete');
    Route::put('/listings/{id}/cover/{imageId}', [ListingController::class, 'setCover'])->name('listings.cover.set');
    Route::put('/listings/{id}/images/{imageId}/replace', [ListingController::class, 'replaceImage'])->name('listings.images.replace');
    Route::post('/listings/{id}/cover/replace', [ListingController::class, 'replaceCover'])->name('listings.cover.replace');
    Route::delete('/listings/{id}/cover', [ListingController::class, 'deleteCover'])->name('listings.cover.delete');

    Route::post('/order-deliveries', [OrderDeliveryController::class, 'store'])->name('deliveries.store');
    Route::put('/order-deliveries/{id}/status', [OrderDeliveryController::class, 'updateStatus'])->name('deliveries.update-status');

    Route::get('/payout-requests', [PayoutRequestController::class, 'index'])->name('payouts.index');
    Route::post('/payout-requests', [PayoutRequestController::class, 'store'])->name('payouts.store');
    Route::get('/payout-requests/{id}', [PayoutRequestController::class, 'show'])->name('payouts.show');
    Route::put('/payout-requests/{id}/approve', [PayoutRequestController::class, 'approve'])->name('payouts.approve');

    // Chat
    Route::get('/inbox', [ChatController::class, 'inbox'])->name('chat.inbox');
    Route::get('/chat/{id}', [ChatController::class, 'show'])->whereNumber('id')->name('chat.show');
    Route::post('/chat/{id}/messages', [ChatController::class, 'send'])->whereNumber('id')->name('chat.send');
    Route::get('/chat/users', [ChatController::class, 'listUsers'])->name('chat.users');
    Route::post('/chat/start-with', [ChatController::class, 'startWith'])->name('chat.start-with');
    Route::post('/chat/ensure-groups', [ChatController::class, 'ensureGroupRooms'])->name('chat.ensure-groups');
});
