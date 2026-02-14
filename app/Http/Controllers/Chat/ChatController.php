<?php

namespace App\Http\Controllers\Chat;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ChatController extends Controller
{
    public function inbox(Request $request)
    {
        $userId = (int) auth()->id();
        $role = (string) auth()->user()->role;

        $q = DB::table('conversations')
            ->select(['conversations.id', 'conversations.type', 'conversations.title', 'conversations.created_at'])
            ->join('conversation_participants as cp', 'cp.conversation_id', '=', 'conversations.id')
            ->where('cp.user_id', $userId)
            ->orderByDesc('conversations.created_at');

        $items = $q->paginate((int) $request->input('per_page', 20));

        $pinned = [];
        if (in_array($role, ['buyer', 'merchant', 'midman', 'admin'], true)) {
            $pinned = DB::table('conversations')
                ->select(['id', 'type', 'title'])
                ->whereIn('type', ['midman_gc', 'admin_gc'])
                ->orderBy('type')
                ->get();
        }

        $direct = DB::table('conversations as c')
            ->select(['c.id', 'c.title', 'u.id as other_id', 'u.name as other_name', 'u.role as other_role', 'u.avatar_path as other_avatar_path'])
            ->join('conversation_participants as cp1', function ($j) use ($userId) {
                $j->on('cp1.conversation_id', '=', 'c.id')->where('cp1.user_id', '=', $userId);
            })
            ->join('conversation_participants as cp2', function ($j) use ($userId) {
                $j->on('cp2.conversation_id', '=', 'c.id')->where('cp2.user_id', '!=', $userId);
            })
            ->join('users as u', 'u.id', '=', 'cp2.user_id')
            ->where('c.type', 'direct')
            ->orderBy('c.updated_at', 'desc')
            ->get();

        $groups = [
            'direct_admins' => $direct->where('other_role', 'admin')->values(),
            'direct_midmen' => $direct->where('other_role', 'midman')->values(),
            'direct_merchants' => $direct->where('other_role', 'merchant')->values(),
            'direct_buyers' => $direct->where('other_role', 'buyer')->values(),
        ];

        if ($request->wantsJson()) {
            return response()->json([
                'pinned' => $pinned,
                'items' => $items,
                'groups' => $groups,
            ]);
        }
        return Inertia::render('Chat/Inbox');
    }

    public function show(Request $request, int $conversationId)
    {
        $userId = (int) auth()->id();
        $role = (string) auth()->user()->role;
        $conv = DB::table('conversations')->find($conversationId);
        abort_unless($conv, 404);
        if ($conv->type === 'direct') {
            $exists = DB::table('conversation_participants')
                ->where('conversation_id', $conversationId)
                ->where('user_id', $userId)
                ->exists();
            abort_unless($exists, 403);
        } else {
            abort_unless(in_array($role, ['buyer', 'merchant', 'midman', 'admin'], true), 403);
        }

        $participants = DB::table('conversation_participants as cp')
            ->select(['cp.user_id', 'u.name', 'u.role', 'u.avatar_path'])
            ->join('users as u', 'u.id', '=', 'cp.user_id')
            ->where('cp.conversation_id', $conversationId)
            ->get();

        $messages = DB::table('messages as m')
            ->select(['m.id', 'm.sender_id', 'u.name as sender_name', 'm.content', 'm.attachment_path', 'm.address_to_ids', 'm.created_at'])
            ->join('users as u', 'u.id', '=', 'm.sender_id')
            ->where('m.conversation_id', $conversationId)
            ->orderBy('m.created_at')
            ->paginate((int) $request->input('per_page', 100));
        $messages->setCollection($messages->getCollection()->map(function ($row) {
            if (!is_array($row->address_to_ids)) {
                $decoded = null;
                try {
                    $decoded = $row->address_to_ids ? json_decode($row->address_to_ids, true) : [];
                } catch (\Throwable $e) {
                    $decoded = [];
                }
                $row->address_to_ids = is_array($decoded) ? $decoded : [];
            }
            return $row;
        }));

        if ($request->wantsJson()) {
            return response()->json([
                'conversation' => $conv,
                'participants' => $participants,
                'messages' => $messages,
            ]);
        }
        return Inertia::render('Chat/Conversation', [
            'conversationId' => $conversationId,
        ]);
    }

    public function listUsers(Request $request): JsonResponse
    {
        $role = $request->string('role')->toString();
        abort_unless(in_array($role, ['admin', 'midman', 'merchant', 'buyer'], true), 422);
        $users = DB::table('users')
            ->select(['id', 'name', 'role', 'avatar_path'])
            ->where('role', $role)
            ->orderBy('name')
            ->limit((int) $request->input('limit', 50))
            ->get();
        return response()->json($users);
    }

    public function startWith(Request $request): JsonResponse
    {
        $me = (int) auth()->id();
        $targetId = (int) $request->input('target_user_id');
        abort_unless($targetId > 0, 422);
        abort_unless($targetId !== $me, 422);
        $target = DB::table('users')->select(['id', 'role', 'name'])->find($targetId);
        abort_unless($target, 404);

        $conv = DB::table('conversations')
            ->select(['conversations.id'])
            ->join('conversation_participants as cpa', 'cpa.conversation_id', '=', 'conversations.id')
            ->join('conversation_participants as cpb', 'cpb.conversation_id', '=', 'conversations.id')
            ->where('conversations.type', 'direct')
            ->where('cpa.user_id', $me)
            ->where('cpb.user_id', $targetId)
            ->first();

        if (!$conv) {
            $convId = DB::table('conversations')->insertGetId([
                'type' => 'direct',
                'title' => 'Direct',
                'created_by_id' => $me,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            DB::table('conversation_participants')->insert([
                ['conversation_id' => $convId, 'user_id' => $me, 'role' => auth()->user()->role, 'joined_at' => now(), 'created_at' => now(), 'updated_at' => now()],
                ['conversation_id' => $convId, 'user_id' => $targetId, 'role' => $target->role, 'joined_at' => now(), 'created_at' => now(), 'updated_at' => now()],
            ]);
            $conv = (object) ['id' => $convId];
        }

        return response()->json(['conversation_id' => $conv->id], 201);
    }
    public function send(Request $request, int $conversationId): JsonResponse
    {
        $userId = (int) auth()->id();
        $conv = DB::table('conversations')->find($conversationId);
        abort_unless($conv, 404);
        if ($conv->type === 'direct') {
            $exists = DB::table('conversation_participants')
                ->where('conversation_id', $conversationId)
                ->where('user_id', $userId)
                ->exists();
            abort_unless($exists, 403);
        } else {
            // Allow sending to GC even if not in participants
            abort_unless(in_array((string) auth()->user()->role, ['buyer', 'merchant', 'midman', 'admin'], true), 403);
        }

        $validated = $request->validate([
            'content' => ['nullable', 'string', 'required_without:attachment'],
            'address_to_ids' => ['nullable', 'array'],
            'attachment' => ['nullable', 'file', 'mimetypes:image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime', 'max:51200'],
        ]);

        $path = null;
        if ($request->file('attachment')) {
            $file = $request->file('attachment');
            $ext = strtolower($file->getClientOriginalExtension());
            $name = uniqid('att_') . '.' . $ext;
            $path = $file->storeAs('conversation/' . $conversationId, $name, 'public');
        }

        $id = DB::table('messages')->insertGetId([
            'conversation_id' => $conversationId,
            'sender_id' => $userId,
            'content' => $validated['content'] ?? '',
            'attachment_path' => $path,
            'address_to_ids' => isset($validated['address_to_ids']) ? json_encode($validated['address_to_ids']) : null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('conversations')->where('id', $conversationId)->update(['updated_at' => now()]);

        $sender = DB::table('users')->select(['id', 'name'])->find($userId);
        $payload = [
            'id' => $id,
            'sender_id' => $userId,
            'sender_name' => $sender?->name ?? 'Unknown',
            'content' => $validated['content'],
            'attachment_path' => $path,
            'address_to_ids' => $validated['address_to_ids'] ?? [],
            'created_at' => now()->toDateTimeString(),
        ];

        try {
            event(new \App\Events\ChatMessageSent((int) $conversationId, (string) $conv->type, $payload));
        } catch (\Throwable $e) {
            report($e);
        }

        return response()->json([
            'message_id' => $id,
            'status' => 'sent',
            'message' => $payload,
        ], 201);
    }

    public function startDirect(Request $request): JsonResponse
    {
        $buyerId = (int) auth()->id();
        $sellerId = (int) $request->input('seller_id');
        abort_unless($sellerId > 0, 422);

        $seller = DB::table('users')->select(['id', 'name', 'role'])->find($sellerId);
        abort_unless($seller && $seller->role === 'merchant', 404);

        $conv = DB::table('conversations')
            ->select(['conversations.id'])
            ->join('conversation_participants as cpa', 'cpa.conversation_id', '=', 'conversations.id')
            ->join('conversation_participants as cpb', 'cpb.conversation_id', '=', 'conversations.id')
            ->where('conversations.type', 'direct')
            ->where('cpa.user_id', $buyerId)
            ->where('cpb.user_id', $sellerId)
            ->first();

        if (!$conv) {
            $convId = DB::table('conversations')->insertGetId([
                'type' => 'direct',
                'title' => 'Buyer–Seller',
                'created_by_id' => $buyerId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            DB::table('conversation_participants')->insert([
                ['conversation_id' => $convId, 'user_id' => $buyerId, 'role' => 'buyer', 'joined_at' => now(), 'created_at' => now(), 'updated_at' => now()],
                ['conversation_id' => $convId, 'user_id' => $sellerId, 'role' => 'merchant', 'joined_at' => now(), 'created_at' => now(), 'updated_at' => now()],
            ]);
            $conv = (object) ['id' => $convId];
        }

        return response()->json(['conversation_id' => $conv->id], 201);
    }

    public function ensureGroupRooms(): JsonResponse
    {
        $me = (int) auth()->id();
        $myRole = (string) auth()->user()->role;
        $midmanId = DB::table('conversations')->where('type', 'midman_gc')->value('id');
        if (!$midmanId) {
            $midmanId = DB::table('conversations')->insertGetId([
                'type' => 'midman_gc',
                'title' => 'Midman GC',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        $adminId = DB::table('conversations')->where('type', 'admin_gc')->value('id');
        if (!$adminId) {
            $adminId = DB::table('conversations')->insertGetId([
                'type' => 'admin_gc',
                'title' => 'Admin GC',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        $midmen = DB::table('users')->select(['id'])->where('role', 'midman')->get();
        foreach ($midmen as $u) {
            DB::table('conversation_participants')->updateOrInsert(
                ['conversation_id' => $midmanId, 'user_id' => $u->id],
                ['role' => 'midman', 'joined_at' => now(), 'updated_at' => now(), 'created_at' => now()]
            );
        }
        $admins = DB::table('users')->select(['id'])->where('role', 'admin')->get();
        foreach ($admins as $u) {
            DB::table('conversation_participants')->updateOrInsert(
                ['conversation_id' => $adminId, 'user_id' => $u->id],
                ['role' => 'admin', 'joined_at' => now(), 'updated_at' => now(), 'created_at' => now()]
            );
        }

        // Auto-create private chats per admin at per midman for the current user
        if (in_array($myRole, ['buyer', 'merchant', 'midman', 'admin'], true)) {
            // With each admin
            foreach ($admins as $u) {
                if ($u->id === $me) {
                    continue;
                }
                $existing = DB::table('conversations')
                    ->select('conversations.id')
                    ->join('conversation_participants as cpa', 'cpa.conversation_id', '=', 'conversations.id')
                    ->join('conversation_participants as cpb', 'cpb.conversation_id', '=', 'conversations.id')
                    ->where('conversations.type', 'direct')
                    ->where('cpa.user_id', $me)
                    ->where('cpb.user_id', $u->id)
                    ->first();
                if (!$existing) {
                    $convId = DB::table('conversations')->insertGetId([
                        'type' => 'direct',
                        'title' => 'Direct',
                        'created_by_id' => $me,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    DB::table('conversation_participants')->insert([
                        ['conversation_id' => $convId, 'user_id' => $me, 'role' => $myRole, 'joined_at' => now(), 'created_at' => now(), 'updated_at' => now()],
                        ['conversation_id' => $convId, 'user_id' => $u->id, 'role' => 'admin', 'joined_at' => now(), 'created_at' => now(), 'updated_at' => now()],
                    ]);
                }
            }
            // With each midman
            foreach ($midmen as $u) {
                if ($u->id === $me) {
                    continue;
                }
                $existing = DB::table('conversations')
                    ->select('conversations.id')
                    ->join('conversation_participants as cpa', 'cpa.conversation_id', '=', 'conversations.id')
                    ->join('conversation_participants as cpb', 'cpb.conversation_id', '=', 'conversations.id')
                    ->where('conversations.type', 'direct')
                    ->where('cpa.user_id', $me)
                    ->where('cpb.user_id', $u->id)
                    ->first();
                if (!$existing) {
                    $convId = DB::table('conversations')->insertGetId([
                        'type' => 'direct',
                        'title' => 'Direct',
                        'created_by_id' => $me,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    DB::table('conversation_participants')->insert([
                        ['conversation_id' => $convId, 'user_id' => $me, 'role' => $myRole, 'joined_at' => now(), 'created_at' => now(), 'updated_at' => now()],
                        ['conversation_id' => $convId, 'user_id' => $u->id, 'role' => 'midman', 'joined_at' => now(), 'created_at' => now(), 'updated_at' => now()],
                    ]);
                }
            }
        }
        return response()->json(['midman_gc_id' => $midmanId, 'admin_gc_id' => $adminId]);
    }
}
