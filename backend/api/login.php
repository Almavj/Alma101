<?php
header("Access-Control-Allow-Origin: http://localhost:8080");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Max-Age: 3600");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

header("Content-Type: application/json; charset=UTF-8");

// Your existing login code continues here...
$data = json_decode(file_get_contents("php://input"));

if (empty($data->email) || empty($data->password)) {
    http_response_code(400);
    echo json_encode(["message" => "Unable to login. Data is incomplete."]);
    exit();
}

try {
    $supabaseUrl = 'https://vmwuglqrafyzrriygzyn.supabase.co';
    $anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtd3VnbHFyYWZ5enJyaXlnenluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MzA3MjQsImV4cCI6MjA3NzMwNjcyNH0.wi4LXdNT8F7vn79angET-DVRqk8q8RcXPoaZNPXmQ8w';
    
    // Use the working format: grant_type in URL, JSON body
    $ch = curl_init();
    
    curl_setopt_array($ch, [
        CURLOPT_URL => $supabaseUrl . '/auth/v1/token?grant_type=password',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode([
            'email' => $data->email,
            'password' => $data->password,
        ]),
        CURLOPT_HTTPHEADER => [
            'apikey: ' . $anonKey,
            'Content-Type: application/json',
        ],
    ]);
    
    $response = curl_exec($ch);
    $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    $body = json_decode($response, true);
    
    if ($statusCode >= 200 && $statusCode < 300 && isset($body['access_token'])) {
        // Login successful
        http_response_code(200);
        echo json_encode([
            'message' => 'Login successful.',
            'user' => [
                'id' => $body['user']['id'] ?? null,
                'email' => $body['user']['email'] ?? null,
                'access_token' => $body['access_token'] ?? null,
                'refresh_token' => $body['refresh_token'] ?? null,
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode([
            "message" => "Login failed.", 
            'error' => $body,
            'status_code' => $statusCode
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "Login failed.", 
        'error' => $e->getMessage()
    ]);
}
?>