<?php
// Simple debug endpoint to inspect incoming request headers and server vars.
// Useful to verify Authorization header presence when the frontend calls backend APIs.
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET,POST,OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$out = [];

// getallheaders may not exist in some SAPIs; try multiple sources
if (function_exists('getallheaders')) {
    $out['getallheaders'] = getallheaders();
} else {
    $out['getallheaders'] = null;
}

if (function_exists('apache_request_headers')) {
    $out['apache_request_headers'] = apache_request_headers();
} else {
    $out['apache_request_headers'] = null;
}

$out['server_HTTP_AUTHORIZATION'] = isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : null;
$out['server_REDIRECT_HTTP_AUTHORIZATION'] = isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION']) ? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] : null;
$out['server_AUTH_TYPE'] = isset($_SERVER['AUTH_TYPE']) ? $_SERVER['AUTH_TYPE'] : null;

// Also echo raw php://input for visibility
$raw = @file_get_contents('php://input');
$out['raw_body'] = $raw ?: null;

echo json_encode($out, JSON_PRETTY_PRINT);
