<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $title ?? config('app.name') }}</title>
    <style>
        body { margin:0; padding:0; background:#ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { padding: 16px 20px; background:#0a0a0a; color:#fff; display:flex; align-items:center; gap:12px; }
        .header img { height:32px; width:32px; border-radius:6px; }
        .content { padding: 24px 20px; color:#0a0a0a; }
        .footer { padding: 16px 20px; color:#6b7280; font-size:12px; }
        .btn { display:inline-block; background:#3b82f6; color:#fff !important; padding:10px 16px; border-radius:9999px; text-decoration:none; font-weight:600; }
        a { color:#2563eb; }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <img src="{{ url('/AccountsParadiseLogo.png') }}" alt="{{ config('app.name') }}">
        <div style="font-weight:700">{{ config('app.name') }}</div>
    </div>
    <div class="content">
        {{ $slot }}
    </div>
    <div class="footer">
        © {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
    </div>
</div>
</body>
</html>
