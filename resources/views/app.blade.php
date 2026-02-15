<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <meta name="description" content="Trusted Philippine gaming marketplace para sa accounts, boosting, at top-up. Lokal para sa Pilipinas — bili at benta nang ligtas at legit.">
        <meta name="keywords" content="Philippines, gaming marketplace, buy accounts, boosting, top-up, legit">
        <meta name="theme-color" content="#0a0a0a">

        <meta property="og:type" content="website">
        <meta property="og:site_name" content="{{ config('app.name') }}">
        <meta property="og:title" content="{{ config('app.name') }}">
        <meta property="og:description" content="Trusted Philippine gaming marketplace para sa accounts, boosting, at top-up. Lokal para sa Pilipinas — bili at benta nang ligtas at legit.">
        <meta property="og:image" content="/HomeBanner.png">
        <meta property="og:url" content="{{ url()->current() }}">

        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="{{ config('app.name') }}">
        <meta name="twitter:description" content="Trusted Philippine gaming marketplace para sa accounts, boosting, at top-up. Lokal para sa Pilipinas — bili at benta nang ligtas at legit.">
        <meta name="twitter:image" content="/HomeBanner.png">

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx'])
        @inertiaHead
        <link rel="icon" href="/AccountsParadiseLogo.ico" type="image/x-icon">
        <link rel="icon" href="/AccountsParadiseLogo.ico" sizes="32x32">
        <link rel="icon" href="/AccountsParadiseLogo.ico" sizes="64x64">
        <link rel="apple-touch-icon" href="/AccountsParadiseLogo.png" sizes="180x180">
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
