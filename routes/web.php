<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Broadcast;
use Inertia\Inertia;
use App\Http\Controllers\PublicSite\StoreController;
use App\Http\Controllers\PublicSite\GamesController;
use App\Http\Controllers\PublicSite\ListingController;

Route::get('/', [StoreController::class, 'index'])->name('store');
Route::get('/store', [StoreController::class, 'index'])->name('store.index');
Route::get('/games', [GamesController::class, 'index'])->name('games.index');
Route::get('/contact', fn () => Inertia::render('Contact'))->name('contact');
Route::get('/listings/{id}', [ListingController::class, 'show'])->whereNumber('id')->name('listings.show');

Route::get('/dashboard', function () {
    $user = auth()->user();
    if (!$user) {
        return redirect()->route('login');
    }
    switch ($user->role) {
        case 'buyer':
            return redirect('/buyer/dashboard');
        case 'merchant':
            return redirect('/merchant/dashboard');
        case 'admin':
            return redirect('/admin/dashboard');
        case 'midman':
            return redirect('/midman/dashboard');
        default:
            return redirect('/buyer/dashboard');
    }
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
require __DIR__.'/admin.php';
require __DIR__.'/merchant.php';
require __DIR__.'/buyer.php';
require __DIR__.'/midman.php';
require __DIR__.'/category.php';

Broadcast::routes(['middleware' => ['auth']]);

Route::get('/docs', function () {
    return response()->make(<<<HTML
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>AccountsParadise API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.onload = () => {
        SwaggerUIBundle({
          url: '/swagger.json',
          dom_id: '#swagger'
        });
      };
    </script>
  </body>
</html>
HTML, 200, ['Content-Type' => 'text/html']);
});

Route::get('/swagger.json', function () {
    return response()->file(public_path('swagger.json'));
});
