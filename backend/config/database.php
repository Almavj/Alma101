<?php
$vendorAutoload = __DIR__ . '/../vendor/autoload.php';
if (!file_exists($vendorAutoload)) {
    error_log('[startup] vendor autoload not found: ' . $vendorAutoload);
    http_response_code(500);
    echo json_encode(['error' => 'server_misconfigured', 'detail' => 'vendor/autoload.php missing']);
    exit(1);
}

require $vendorAutoload;

use GuzzleHttp\Client;
use Dotenv\Dotenv;

$dotenvPath = __DIR__ . '/..';
$envFile = $dotenvPath . '/.env';

// Only load .env if it exists. Platforms like Railway inject env vars directly.
if (file_exists($envFile)) {
    $dotenv = Dotenv::createImmutable($dotenvPath);
    $dotenv->safeLoad();
} else {
    error_log('[config] .env not found; skipping Dotenv load. Relying on environment variables.');
}

// Validate required env vars and provide a helpful message if missing
$required = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_ANON_KEY'];
$missing = [];
foreach ($required as $key) {
    $val = getenv($key) ?: ($_ENV[$key] ?? null);
    // Treat obvious placeholder/example values as "missing" so a real secret must be provided
    $isPlaceholder = false;
    if ($key === 'SUPABASE_SERVICE_ROLE_KEY' && is_string($val)) {
        $lower = strtolower($val);
        if (strpos($lower, 'replace_with') !== false || strpos($lower, 'your_service_role') !== false || strpos($lower, 'your-service-role') !== false) {
            $isPlaceholder = true;
        }
    }
    if (empty($val) || $isPlaceholder) $missing[] = $key;
}
if (!empty($missing)) {
    $msg = "Missing required environment variables: " . implode(', ', $missing) . ".\nPlease create a .env file at the project root (see .env.example) and restart the server.";
    // Log and throw a readable error to help local developers
    error_log('[config] ' . $msg);
    throw new \RuntimeException($msg);
}

class Database {
    private $client;
    private $baseUrl;
    private $serviceRoleKey;

    public function __construct() {
        $this->baseUrl = rtrim($_ENV['SUPABASE_URL'], '/');
        $this->serviceRoleKey = $_ENV['SUPABASE_SERVICE_ROLE_KEY'];

        $this->client = new Client([
            'base_uri' => $this->baseUrl,
            'headers' => [
                'apikey' => $this->serviceRoleKey,
                'Authorization' => 'Bearer ' . $this->serviceRoleKey,
                'Content-Type' => 'application/json'
            ],
            'http_errors' => false,
            'timeout' => 10
        ]);
    }

    /**
     * Return configured Guzzle client
     * Server-side code should use this client to call Supabase REST and Auth endpoints.
     */
    public function connect(): Client {
        return $this->client;
    }

    /**
     * Backwards-compatible accessor used elsewhere in the codebase.
     *
     * @return Client
     */
    public function getClient(): Client
    {
        return $this->connect();
    }

    public function getBaseUrl(): string {
        return $this->baseUrl;
    }
}

// Simple PDO Database helper — reads env vars (DB_CONNECTION, DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD)
// Falls back to a local sqlite file if DB_CONNECTION=sqlite
class DatabasePdo {
    private $pdo;

    public function __construct() {
        $this->loadEnv(__DIR__ . '/../../.env');

        $driver = getenv('DB_CONNECTION') ?: 'mysql';
        $host   = getenv('DB_HOST') ?: '127.0.0.1';
        $port   = getenv('DB_PORT') ?: '3306';
        $name   = getenv('DB_DATABASE') ?: getenv('DB_NAME') ?: 'alma101';
        $user   = getenv('DB_USERNAME') ?: getenv('DB_USER') ?: 'root';
        $pass   = getenv('DB_PASSWORD') ?: '';

        try {
            if ($driver === 'sqlite') {
                $dbPath = $name ?: __DIR__ . '/../../database.sqlite';
                $dsn = "sqlite:$dbPath";
                $this->pdo = new PDO($dsn);
            } else {
                $dsn = sprintf('%s:host=%s;port=%s;dbname=%s;charset=utf8mb4', $driver, $host, $port, $name);
                $opts = [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ];
                $this->pdo = new PDO($dsn, $user, $pass, $opts);
            }
        } catch (PDOException $e) {
            // In production you might log this instead of echoing
            error_log('Database connection failed: ' . $e->getMessage());
            throw $e;
        }
    }

    public function getConnection() {
        return $this->pdo;
    }

    private function loadEnv(string $path) {
        if (!file_exists($path)) return;
        foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
            $line = trim($line);
            if ($line === '' || $line[0] === '#') continue;
            if (strpos($line, '=') === false) continue;
            list($k, $v) = explode('=', $line, 2);
            $k = trim($k);
            $v = trim($v);
            // strip quotes
            $v = trim($v, " \t\n\r\0\x0B\"'");
            putenv("$k=$v");
            $_ENV[$k] = $v;
            $_SERVER[$k] = $v;
        }
    }
}