<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>
        <meta name="csrf-token" content="{{ csrf_token() }}">

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
