<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Verify Your Email</title>
</head>
<body style="margin:0; padding:0; font-family: Arial, sans-serif; background:#f4f6f9;">

    <div style="max-width:600px; margin:40px auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.05);">

        <!-- Header -->
        <div style="background:#0b3d91; padding:20px; text-align:center;">
            <h1 style="color:#ffffff; margin:0; font-size:22px; letter-spacing:0.5px;">
                {{ $appName ?? config('app.name') }}
            </h1>
        </div>

        <!-- Body -->
        <div style="padding:30px; color:#333333; line-height:1.6;">

            <p style="margin-top:0;">
                Hi {{ $name ?? 'User' }},
            </p>

            <p style="line-height:1.6;">
                Please verify your email address to complete your registration and access all features.
            </p>

            <div style="text-align:center; margin:24px 0;">
                <a href="{{ $url }}" style="display:inline-block; background:#0b3d91; color:#ffffff; text-decoration:none; padding:12px 20px; border-radius:6px; font-weight:bold;">
                    Verify Email
                </a>
            </div>

            <p style="color:#666666; font-size:13px;">
                If the button above does not work, copy and paste this link into your browser:
                <br />
                <span style="word-break:break-all;">{{ $url }}</span>
            </p>

            <p style="line-height:1.6;">
                Thanks,<br>
                {{ $appName ?? config('app.name') }}
            </p>

        </div>

        <!-- Footer -->
        <div style="background:#f1f5f9; padding:15px; text-align:center; font-size:12px; color:#888888;">
            © {{ date('Y') }} {{ $appName ?? config('app.name') }}. All rights reserved.
        </div>

    </div>

</body>
</html>
