<?php
require_once __DIR__ . '/../config/mysql.php';

class User {
    private $pdo;

    public function __construct() {
        $db = new MySQLDatabase();
        $this->pdo = $db->connect();
    }

    /**
     * Get user by email
     * Returns user data or false if not found
     */
    public function getUserByEmail(string $email) {
        try {
            $stmt = $this->pdo->prepare("SELECT * FROM users WHERE email = ?");
            $stmt->execute([$email]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Database error in getUserByEmail: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Create a new user
     * Returns the user ID on success, false on failure
     */
    public function create(array $data) {
        try {
            $stmt = $this->pdo->prepare("INSERT INTO users (email, password, username) VALUES (?, ?, ?)");
            $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
            $stmt->execute([
                $data['email'],
                $hashedPassword,
                $data['username'] ?? null
            ]);
            return $this->pdo->lastInsertId();
        } catch (PDOException $e) {
            error_log("Database error in create: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Login user
     * Returns user data if credentials are valid, false otherwise
     */
    public function login(string $email, string $password) {
        try {
            $user = $this->getUserByEmail($email);
            if ($user && password_verify($password, $user['password'])) {
                unset($user['password']); // Don't return the password hash
                return $user;
            }
            return false;
        } catch (PDOException $e) {
            error_log("Database error in login: " . $e->getMessage());
            return false;
        }
    }
}