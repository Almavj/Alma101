<?php
// router.php - Serve React frontend from dist/ and PHP API from backend/

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// 1. API routes (priority)
if (preg_match('#^/api/([a-zA-Z0-9_\-]+)/?$#', $uri, $m)) {
    $api_file = __DIR__ . '/api/' . $m[1] . '.php';
    if (file_exists($api_file)) {
        include $api_file;
        return true;
    }

    header('Content-Type: application/json; charset=utf-8');
    http_response_code(404);
    echo json_encode(['error' => 'API endpoint not found']);
    return true;
}

// 2. Serve static files from dist/ directory
$project_root = realpath(__DIR__ . '/..');
$dist_path = $project_root . '/dist';

// Normalize and prevent directory traversal
$uri_path = rawurldecode($uri);
$dist_file_candidate = $dist_path . $uri_path;
$dist_file = realpath($dist_file_candidate);

// Ensure file is inside dist and is a file
if ($dist_file !== false && strpos($dist_file, $dist_path) === 0 && is_file($dist_file)) {
    $ext = strtolower(pathinfo($dist_file, PATHINFO_EXTENSION));
    $mime_types = [
        'html' => 'text/html; charset=utf-8',
        'css'  => 'text/css',
        'js'   => 'application/javascript',
        'mjs'  => 'application/javascript',
        'json' => 'application/json',
        'png'  => 'image/png',
        'jpg'  => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'gif'  => 'image/gif',
        'svg'  => 'image/svg+xml',
        'ico'  => 'image/x-icon',
        'txt'  => 'text/plain',
        'webp' => 'image/webp',
        'woff' => 'font/woff',
        'woff2'=> 'font/woff2',
        'ttf'  => 'font/ttf',
    ];

    if (isset($mime_types[$ext])) {
        header('Content-Type: ' . $mime_types[$ext]);
    } else {
        header('Content-Type: application/octet-stream');
    }

    // Let PHP handle range requests (simple)
    readfile($dist_file);
    return true;
}

// 3. For SPA (Single Page Application) - all other routes go to index.html in dist
$spa_index = $dist_path . '/index.html';
if (file_exists($spa_index) && is_file($spa_index)) {
    header('Content-Type: text/html; charset=utf-8');
    readfile($spa_index);
    return true;
}

// 4. Fallback to API health check
include __DIR__ . '/index.php';
