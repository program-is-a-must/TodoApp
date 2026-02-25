<?php

return [

    /*
    |--------------------------------------------------------------------------
    | CORS — Cross-Origin Resource Sharing
    |--------------------------------------------------------------------------
    | This lets your React Native app (running on a phone/emulator)
    | talk to this Laravel API running on your computer.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    // Allow requests from any origin (your phone, emulator, etc.)
    'allowed_origins' => ['*'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];