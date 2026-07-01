<?php
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../middleware/security.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../services/EmailService.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Helper to read JSON body
function getJsonBody() {
    $data = json_decode(file_get_contents('php://input'), true);
    return is_array($data) ? $data : [];
}

$data = getJsonBody();
$email = trim($data['email'] ?? '');

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email address']);
    exit();
}

try {
    $db = new Database();
    $client = $db->getClient();

    // Use Supabase's recover endpoint to send a password reset email.
    $redirectTo = $data['redirect_to'] ?? ($_ENV['SITE_URL'] ?? 'https://yourdomain.com') . '/reset-password';

    $resp = $client->post('/auth/v1/recover', [
        'json' => [
            'email' => $email,
            'redirect_to' => $redirectTo
        ],
        // Use anon key for public auth actions
        'headers' => [
            'apikey' => $_ENV['SUPABASE_ANON_KEY'] ?? '',
            'Content-Type' => 'application/json'
        ]
    ]);

    $body = json_decode((string)$resp->getBody(), true);

    // Always return the same success message regardless of Supabase response
    // to prevent email enumeration. Log errors for debugging.
    if ($resp->getStatusCode() >= 200 && $resp->getStatusCode() < 300) {
        echo json_encode(['message' => 'If an account exists with this email, you will receive password reset instructions.']);
    } else {
        error_log('Reset error (' . $resp->getStatusCode() . '): ' . print_r($body, true));
        // Still return success to the user - don't reveal whether the email exists
        echo json_encode(['message' => 'If an account exists with this email, you will receive password reset instructions.']);
    }
    exit();

} catch (Exception $e) {
    error_log("Password reset error: " . $e->getMessage());
    // Still return success to the user
    http_response_code(200);
    echo json_encode(['message' => 'If an account exists with this email, you will receive password reset instructions.']);
    exit();
}

?>