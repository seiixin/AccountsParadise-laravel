<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * Usage:
     *  ->middleware('role:admin')
     *  ->middleware('role:admin,buyer')
     */
    public function handle(Request $request, Closure $next, ...$roles)
    {
        // 1. User must be authenticated
        if (! Auth::check()) {
            return response()->json([
                'message' => 'Unauthenticated'
            ], Response::HTTP_UNAUTHORIZED);
        }

        $user = Auth::user();

        // 2. Normalize role comparison (prevents Buyer vs buyer issues)
        $userRole = strtolower(trim($user->role));
        $allowedRoles = array_map(
            fn ($role) => strtolower(trim($role)),
            $roles
        );

        // 3. Role authorization check
        if (! in_array($userRole, $allowedRoles, true)) {
            return response()->json([
                'message' => 'Unauthorized',
                'role' => $userRole,
                'allowed_roles' => $allowedRoles
            ], Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}
