
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Merchant\CategoryController as MerchantCategoryController;

/*
|--------------------------------------------------------------------------
| Admin Category Routes
|--------------------------------------------------------------------------
*/
Route::prefix('admin')->middleware(['auth','role:admin'])->group(function () {
    Route::get('/categories', [AdminCategoryController::class, 'index']);
    Route::get('/categories/{id}', [AdminCategoryController::class, 'show']);
    Route::put('/categories/{id}/approve', [AdminCategoryController::class, 'approve']);
    Route::put('/categories/{id}/update', [AdminCategoryController::class, 'update']);
    Route::delete('/categories/{id}/delete', [AdminCategoryController::class, 'destroy']);
});

/*
|--------------------------------------------------------------------------
| Merchant Category Routes
|--------------------------------------------------------------------------
*/
Route::prefix('merchant')->middleware(['auth','role:merchant'])->group(function () {
    Route::get('/categories', [MerchantCategoryController::class, 'index']);
    Route::post('/categories/create', [MerchantCategoryController::class, 'store']);
    Route::get('/categories/{id}', [MerchantCategoryController::class, 'show']);
    Route::put('/categories/{id}/update', [MerchantCategoryController::class, 'update']);
});
