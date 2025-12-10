<?php
$uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$project_root = realpath(__DIR__ . '/..');
$dist_path = $project_root . '/dist';

// 1. API ROUTES - FIRST PRIORITY
if (strpos($uri, '/api/') === 0) {
    $endpoint = substr($uri, 5); // Remove '/api/'
    
    // Clean endpoint (remove query string, trailing slash, get base name)
    $endpoint = strtok($endpoint, '?'); // Remove query string
    if (substr($endpoint, -1) === '/') {
        $endpoint = substr($endpoint, 0, -1); // Remove trailing slash
    }
    
    // Try to find the API file
    $api_file = __DIR__ . '/api/' . $endpoint . '.php';
    if (file_exists($api_file)) {
        include $api_file;
        exit;
    }
    
    // Also try if endpoint already has .php
    $api_file_alt = __DIR__ . '/api/' . $endpoint;
    if (file_exists($api_file_alt)) {
        include $api_file_alt;
        exit;
    }
    
    // API endpoint not found
    header('Content-Type: application/json; charset=utf-8');
    http_response_code(404);
    echo json_encode(['error' => 'API endpoint not found: ' . $endpoint]);
    exit;
}

// 2. STATIC FILES FROM DIST/ (CSS, JS, images, etc.)
if ($uri !== '/' && file_exists($dist_path . $uri) && is_file($dist_path . $uri)) {
    $file = $dist_path . $uri;
    $ext = pathinfo($file, PATHINFO_EXTENSION);
    
    $mime_types = [
        'html' => 'text/html',
        'css' => 'text/css',
        'js' => 'application/javascript',
        'json' => 'application/json',
        'png' => 'image/png',
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'gif' => 'image/gif',
        'svg' => 'image/svg+xml',
        'ico' => 'image/x-icon',
        'txt' => 'text/plain',
    ];
    
    if (isset($mime_types[$ext])) {
        header('Content-Type: ' . $mime_types[$ext]);
    }
    
    readfile($file);
    exit;
}

// 3. SPA INDEX.HTML (for all other routes)
$spa_index = $dist_path . '/index.html';
if (file_exists($spa_index)) {
    header('Content-Type: text/html; charset=utf-8');
    readfile($spa_index);
    exit;
}

// 4. FALLBACK: API HEALTH JSON
header('Content-Type: application/json; charset=utf-8');
http_response_code(200);
echo json_encode([
    'status' => 'ok',
    'service' => 'Alma101 API',
    'time' => time(),
    'port' => getenv('PORT') ?: null,
    'note' => 'Frontend not found in dist/ directory'
], JSON_UNESCAPED_SLASHES|JSON_PRETTY_PRINT);