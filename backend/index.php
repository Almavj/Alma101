<?php
// Serve React SPA from ../dist when available, otherwise return API health JSON.

$project_root = realpath(__DIR__ . '/..');
$dist_path = $project_root . '/dist';
$spa_index = $dist_path . '/index.html';

$uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);

// If request targets /api/*, do not serve the SPA from here (let router or static server handle it)
if (strpos($uri, '/api/') === 0) {
    // Let PHP built-in server serve the corresponding file if it exists,
    // otherwise return a JSON 404 for API endpoints that reach this file.
    header('Content-Type: application/json; charset=utf-8');
    http_response_code(404);
    echo json_encode(['error' => 'API endpoint not found']);
    exit;
}

// If SPA exists and request is for HTML or root, serve it
$accept = $_SERVER['HTTP_ACCEPT'] ?? '';
$request_is_html = $uri === '/' || stripos($accept, 'text/html') !== false;

if ($request_is_html && file_exists($spa_index) && is_file($spa_index)) {
    header('Content-Type: text/html; charset=utf-8');
    readfile($spa_index);
    exit;
}

// Fallback: API health JSON
header('Content-Type: application/json; charset=utf-8');
http_response_code(200);
echo json_encode([
  'status' => 'ok',
  'service' => 'Alma101 API',
  'time' => time(),
  'port' => getenv('PORT') ?: null
], JSON_UNESCAPED_SLASHES|JSON_PRETTY_PRINT);