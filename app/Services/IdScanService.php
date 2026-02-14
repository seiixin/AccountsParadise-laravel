<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class IdScanService
{
    public function submit(string $publicPath, ?int $userId = null): array
    {
        $cfg = config('services.idscan');
        $base = (string) ($cfg['base_url'] ?? '');
        $key = (string) ($cfg['api_key'] ?? '');
        if ($base === '' || $key === '') {
            return [
                'status' => 'unconfigured',
                'request_id' => null,
                'provider' => 'idscan',
                'result' => ['message' => 'idscan not configured'],
            ];
        }

        $url = rtrim($base, '/') . '/api/v1/scan';
        $imageUrl = Storage::disk('public')->url($publicPath);

        $resp = Http::withToken($key)->post($url, [
            'image_url' => $imageUrl,
            'user_id' => $userId,
        ]);

        if ($resp->failed()) {
            return [
                'status' => 'error',
                'request_id' => null,
                'provider' => 'idscan',
                'result' => ['http_status' => $resp->status(), 'body' => $resp->json() ?? $resp->body()],
            ];
        }

        $data = $resp->json() ?? [];
        return [
            'status' => $data['status'] ?? 'submitted',
            'request_id' => $data['request_id'] ?? ($data['id'] ?? null),
            'provider' => 'idscan',
            'result' => $data,
        ];
    }
}
