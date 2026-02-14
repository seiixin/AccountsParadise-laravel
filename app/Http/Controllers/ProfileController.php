<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse|JsonResponse
    {
        $user = $request->user();
        $validated = $request->validated();
        $user->fill($validated);

        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars/' . $user->id, 'public');
            $user->avatar_path = $path;
        } elseif ($request->filled('avatar_base64')) {
            $b64 = $request->string('avatar_base64')->toString();
            if (str_starts_with($b64, 'data:')) {
                $commaPos = strpos($b64, ',');
                if ($commaPos !== false) {
                    $b64 = substr($b64, $commaPos + 1);
                }
            }
            $bin = base64_decode($b64, true);
            if ($bin !== false) {
                $dir = 'avatars/' . $user->id;
                Storage::disk('public')->makeDirectory($dir);
                $path = $dir . '/avatar.png';
                Storage::disk('public')->put($path, $bin);
                $user->avatar_path = $path;
            }
        }

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Profile updated', 'user' => $user]);
        }
        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
