<?php

return [
    'default' => env('BROADCAST_DRIVER', 'null'),

    'connections' => [
        'reverb' => [
            'driver' => 'reverb',
            'key' => env('REVERB_APP_KEY', env('PUSHER_APP_KEY')),
            'secret' => env('REVERB_APP_SECRET', env('PUSHER_APP_SECRET')),
            'app_id' => env('REVERB_APP_ID', env('PUSHER_APP_ID')),
            'options' => [
                'host' => env('REVERB_HOST', env('PUSHER_HOST', '127.0.0.1')),
                'port' => (int) env('REVERB_PORT', env('PUSHER_PORT', 8080)),
                'scheme' => env('REVERB_SCHEME', env('PUSHER_SCHEME', 'http')),
            ],
        ],
        'pusher' => [
            'driver' => 'pusher',
            'key' => env('PUSHER_APP_KEY'),
            'secret' => env('PUSHER_APP_SECRET'),
            'app_id' => env('PUSHER_APP_ID'),
            'options' => [
                'cluster' => env('PUSHER_APP_CLUSTER', 'mt1'),
                'useTLS' => env('PUSHER_SCHEME', 'http') === 'https',
                'host' => env('PUSHER_HOST', '127.0.0.1'),
                'port' => (int) env('PUSHER_PORT', 6001),
                'scheme' => env('PUSHER_SCHEME', 'http'),
            ],
        ],

        'log' => [
            'driver' => 'log',
        ],

        'null' => [
            'driver' => 'null',
        ],
    ],
];
