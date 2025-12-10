<?php
// router.php - Serve React frontend from dist/ and PHP API from backend/

$uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);

// Debug: check common locations for dist/ so we can find where frontend was built
$possible_dirs = [
    '/app/dist',
    '/dist',
    __DIR__ . '/../dist',
    __DIR__ . '/dist',
    getcwd() . '/../dist',
    '/app/backend/dist',
    __DIR__ . '/../public', // sometimes build placed in public/
    getcwd() . '/dist',
];

$checked = [];
$found_dist = null;
foreach ($possible_dirs as $dir) {
    $exists = file_exists($dir) ? 'EXISTS' : 'NOT FOUND';
    error_log("router.php: Checking $dir: $exists");
    $checked[$dir] = ($exists === 'EXISTS');
    if ($found_dist === null && $checked[$dir]) {
        $found_dist = realpath($dir);
    }
}

// Prefer project ../dist if present, otherwise the first found possible dir
$project_root = realpath(__DIR__ . '/..');
$default_dist = $project_root ? $project_root . '/dist' : (__DIR__ . '/dist');

if ($found_dist) {
    $dist_path = $found_dist;
} elseif (file_exists($default_dist)) {
    $dist_path = realpath($default_dist);
} else {
    // fallback to default path even if it doesn't exist (used in checks below)
    $dist_path = $default_dist;
}

error_log("router.php: using dist_path = " . $dist_path);

// 1. API routes (priority)
if (strpos($uri, '/api/') === 0) {
    $endpoint = substr($uri, 5); // remove '/api/'
    $endpoint = strtok($endpoint, '?');
    $endpoint = rtrim($endpoint, '/');

    // Try with .php and without
    $api_file = __DIR__ . '/api/' . $endpoint . '.php';
    $api_file_alt = __DIR__ . '/api/' . $endpoint;

    if ($endpoint === '' || $endpoint === '/index.php') {
        // if someone hits /api/ or /api, show health or index
        if (file_exists(__DIR__ . '/index.php')) {
            include __DIR__ . '/index.php';
            exit;
        }
    }

    if (file_exists($api_file)) {
        include $api_file;
        exit;
    } elseif (file_exists($api_file_alt)) {
        include $api_file_alt;
        exit;
    }

    header('Content-Type: application/json; charset=utf-8');
    http_response_code(404);
    echo json_encode(['error' => 'API endpoint not found', 'endpoint' => $endpoint], JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES);
    exit;
}

// 2. Static file serving from dist (if file exists)
$dist_candidate = $dist_path . $uri;
if ($uri !== '/' && file_exists($dist_candidate) && is_file($dist_candidate)) {
    $file = $dist_candidate;
    $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
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
    header('Content-Type: ' . ($mime_types[$ext] ?? 'application/octet-stream'));
    readfile($file);
    exit;
}

// 3. Serve SPA index.html from dist if available
$spa_index = $dist_path . '/index.html';
if (file_exists($spa_index) && is_file($spa_index)) {
    header('Content-Type: text/html; charset=utf-8');
    readfile($spa_index);
    exit;
}

// 4. Final fallback: return API health JSON plus debug info about dist search
header('Content-Type: application/json; charset=utf-8');
http_response_code(200);
echo json_encode([
    'status' => 'ok',
    'service' => 'Alma101 API',
    'time' => time(),
    'port' => getenv('PORT') ?: null,
    'note' => 'Frontend not found in dist/ directory',
    'checked_paths' => $checked,
    'resolved_dist_path' => $dist_path,
    'cwd' => getcwd(),
], JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES);
