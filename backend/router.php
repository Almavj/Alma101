<?php
// router.php - Serve React frontend from dist/ and PHP API from backend/

$uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$project_root = realpath(__DIR__ . '/..');
$dist_path = $project_root . '/dist';

// 1) API routes first
if (strpos($uri, '/api/') === 0) {
    $endpoint = substr($uri, 5);
    $endpoint = strtok($endpoint, '?');
    $endpoint = rtrim($endpoint, '/');

    $api_file = __DIR__ . '/api/' . $endpoint . '.php';
    $api_file_alt = __DIR__ . '/api/' . $endpoint;

    if ($endpoint === '' && file_exists(__DIR__ . '/index.php')) {
        include __DIR__ . '/index.php';
        exit;
    }

    if (file_exists($api_file)) { include $api_file; exit; }
    if (file_exists($api_file_alt)) { include $api_file_alt; exit; }

    header('Content-Type: application/json; charset=utf-8');
    http_response_code(404);
    echo json_encode(['error' => 'API endpoint not found', 'endpoint' => $endpoint], JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES);
    exit;
}

// 2) Static files from dist
$dist_candidate = $dist_path . $uri;
if ($uri !== '/' && file_exists($dist_candidate) && is_file($dist_candidate)) {
    $file = $dist_candidate;
    $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
    $mime_types = [
        'html'=>'text/html; charset=utf-8','css'=>'text/css','js'=>'application/javascript',
        'json'=>'application/json','png'=>'image/png','jpg'=>'image/jpeg','jpeg'=>'image/jpeg',
        'gif'=>'image/gif','svg'=>'image/svg+xml','ico'=>'image/x-icon','txt'=>'text/plain',
        'webp'=>'image/webp','woff'=>'font/woff','woff2'=>'font/woff2','ttf'=>'font/ttf',
    ];
    header('Content-Type: ' . ($mime_types[$ext] ?? 'application/octet-stream'));
    readfile($file);
    exit;
}

// 3) SPA index
$spa_index = $dist_path . '/index.html';
if (file_exists($spa_index) && is_file($spa_index)) {
    header('Content-Type: text/html; charset=utf-8');
    readfile($spa_index);
    exit;
}

// 4) Fallback health
header('Content-Type: application/json; charset=utf-8');
http_response_code(200);
echo json_encode(['status'=>'ok','service'=>'Alma101 API','time'=>time(),'port'=>getenv('PORT') ?: null], JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES);
exit;
?>
