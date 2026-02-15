<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Contact Us Message</title>
</head>
<body style="margin:0; padding:0; font-family: Arial, sans-serif; background:#f4f6f9;">

    <div style="max-width:600px; margin:40px auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.05);">

        <!-- Header -->
        <div style="background:#0b3d91; padding:20px; text-align:center;">
            <h1 style="color:#ffffff; margin:0; font-size:22px; letter-spacing:0.5px;">
                Contact Us
            </h1>
        </div>

        <!-- Body -->
        <div style="padding:30px; color:#333333; line-height:1.6;">

            <p style="margin-top:0;">
                You have received a new message from your website contact form.
            </p>

            <div style="background:#f8fafc; padding:15px; border-radius:6px; margin:20px 0;">
                <p style="margin:5px 0;"><strong>From:</strong> {{ $fromEmail }}</p>
                <p style="margin:5px 0;"><strong>Message:</strong></p>
                <p style="margin:5px 0; white-space:pre-line;">{{ $content }}</p>
            </div>

            <p style="line-height:1.6;">
                Thanks,<br>
                {{ config('app.name') }}
            </p>

        </div>

        <!-- Footer -->
        <div style="background:#f1f5f9; padding:15px; text-align:center; font-size:12px; color:#888888;">
            © {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
        </div>

    </div>

</body>
</html>
