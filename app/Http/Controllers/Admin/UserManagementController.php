<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

final class UserManagementController extends Controller
{
    public function index(Request $request)
    {
        $q = User::query()
            ->select([
                'id',
                'name',
                'username',
                'email',
                'role',
                'created_at',
            ]);

        if ($request->filled('role')) {
            $q->where('role', $request->string('role')->toString());
        }

        if ($request->filled('q')) {
            $term = $request->string('q')->toString();
            $q->where(function ($sub) use ($term) {
                $sub->where('name', 'like', '%' . $term . '%')
                    ->orWhere('username', 'like', '%' . $term . '%')
                    ->orWhere('email', 'like', '%' . $term . '%');
            });
        }

        $q->orderByDesc('created_at');

        $users = $q->paginate((int) $request->input('per_page', 20));

        if ($request->wantsJson()) {
            return response()->json($users);
        }

        return Inertia::render('Admin/Users', [
            'initial' => $users,
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $user = User::query()
            ->select([
                'id',
                'name',
                'username',
                'email',
                'role',
                'created_at',
            ])
            ->findOrFail($id);

        return response()->json(['data' => $user]);
    }

public function update(UpdateUserRequest $request, int $id): JsonResponse
{
    $validated = $request->validated();

    /** @var User $user */
    $user = DB::transaction(function () use ($validated, $id) {

        $user = User::lockForUpdate()->findOrFail($id);

        $user->name = $validated['name'];
        $user->username = $validated['username'];
        $user->email = $validated['email'];
        $user->role = $validated['role'];
        $user->save();

        // ✅ correct reload (NO arguments)
        return $user->refresh();
    });

    return response()->json([
        'message' => 'User updated.',
        'data' => [
            'id' => $user->id,
            'name' => $user->name,
            'username' => $user->username,
            'email' => $user->email,
            'role' => $user->role,
            'updated_at' => $user->updated_at,
        ],
    ]);
}

    public function destroy(int $id): JsonResponse
    {
        DB::transaction(function () use ($id) {
            $user = User::lockForUpdate()->findOrFail($id);
            $user->delete();
        });

        return response()->json([
            'message' => 'User deleted.',
            'data' => [
                'id' => $id,
            ],
        ]);
    }
}
