<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Mail;
use App\Mail\LoginAlert;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        // Email OR username auth handled inside LoginRequest
        $request->authenticate();

        // Session fixation protection
        $request->session()->regenerate();

        $ip = $request->ip() ?? 'Unknown';
        $agent = $request->header('User-Agent') ?? 'Unknown';
        $time = now()->toDateTimeString();
        Mail::to(Auth::user()->email)->send(new LoginAlert($ip, $agent, $time));

        $role = Auth::user()->role;

        return match ($role) {
            'admin'    => redirect()->route('admin.dashboard'),
            'merchant' => redirect()->route('merchant.dashboard'),
            'midman'   => redirect()->route('midman.dashboard'),
            'buyer'    => redirect()->route('buyer.dashboard'),
            default    => redirect()->route('dashboard'),
        };
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
