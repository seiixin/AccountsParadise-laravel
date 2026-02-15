<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Login Alert</title>
</head>
<body style="margin:0; padding:0; font-family: Arial, sans-serif; background:#f4f6f9;">
    
    <div style="max-width:600px; margin:40px auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.05);">

        <!-- Header -->
        <div style="background:#0b3d91; padding:20px; text-align:center;">
            <h1 style="color:#ffffff; margin:0; font-size:22px; letter-spacing:0.5px;">
                Accounts Paradise
            </h1>
        </div>

        <!-- Body Content -->
        <div style="padding:30px; color:#333333;">

            <h2 style="margin-top:0; color:#111111;">New Login Detected</h2>

            <p style="line-height:1.6;">
                We detected a new login to your account. If this was you, no further action is required.
            </p>

            <div style="background:#f8fafc; padding:15px; border-radius:6px; margin:20px 0;">
                <p style="margin:5px 0;"><strong>IP Address:</strong> {{ $ip }}</p>
                <p style="margin:5px 0;"><strong>Device / Browser:</strong> {{ $agent }}</p>
                <p style="margin:5px 0;"><strong>Date & Time:</strong> {{ $time }}</p>
            </div>

            <p style="line-height:1.6;">
                If you do not recognize this activity, we strongly recommend securing your account immediately.
            </p>

            <div style="text-align:center; margin:30px 0;">
                <a href="{{ url('/password/reset') }}" 
                   style="display:inline-block; padding:12px 25px; background:#e3342f; color:#ffffff; text-decoration:none; border-radius:5px; font-weight:bold;">
                   Reset Password
                </a>
            </div>

            <p style="font-size:13px; color:#777777; line-height:1.6;">
                If you need assistance, please contact our support team.
            </p>

        </div>

        <!-- Footer -->
        <div style="background:#f1f5f9; padding:15px; text-align:center; font-size:12px; color:#888888;">
            © {{ date('Y') }} Accounts Paradise. All rights reserved.
        </div>

    </div>

</body>
</html>
