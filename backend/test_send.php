<?php
require __DIR__ . '/vendor/autoload.php';
// The project does not autoload the Services namespace via composer PSR-4,
// so require the service file directly for CLI testing.
require __DIR__ . '/services/EmailService.php';
use Services\EmailService;
use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

$mailer = new Services\EmailService();

try {
    $ok = $mailer->sendContactEmail(
        $_ENV['SUPABASE_ADMIN_EMAIL'],
        'CLI Tester',
        'almadonald8@gmail.com',
        '<p>Test message from CLI is just for testing . just dont give up</p>'
    );
    echo "send returned: " . ($ok ? "true" : "false") . PHP_EOL;
} catch (Exception $e) {
    echo "Exception: " . $e->getMessage() . PHP_EOL;
}