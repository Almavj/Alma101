<?php
// DEBUG router - remove after testing
$uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);

header('Content-Type: application/json');
echo json_encode([
    'debug' => true,
    'uri' => $uri,
    'cwd' => getcwd(),
    '__DIR__' => __DIR__,
    'project_root' => realpath(__DIR__ . '/..'),
    'dist_exists' => file_exists(realpath(__DIR__ . '/..') . '/dist'),
    'dist_contents' => file_exists(realpath(__DIR__ . '/..') . '/dist') ? 
        scandir(realpath(__DIR__ . '/..') . '/dist') : 'not found',
    'api_login_exists' => file_exists(__DIR__ . '/api/login.php'),
    'env' => [
        'PORT' => getenv('PORT'),
        'RAILWAY_ENVIRONMENT' => getenv('RAILWAY_ENVIRONMENT'),
    ]
]);