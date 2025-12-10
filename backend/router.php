<?php
// Used only with php -S ... router.php
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Serve existing files directly
$path = __DIR__ . $uri;
if ($uri !== '/' && file_exists($path) && is_file($path)) {
    return false;
}

// Map /api/name  -> /api/name.php if exists
if (preg_match('#^/api/([a-zA-Z0-9_\-]+)/?$#', $uri, $m)) {
    $candidate = __DIR__ . '/api/' . $m[1] . '.php';
    if (file_exists($candidate)) {
        include $candidate;
        return true;
    }
}

// Fallback to index
include __DIR__ . '/index.php';
