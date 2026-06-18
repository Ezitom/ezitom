<?php
/**
 * auth.php - Admin authentication
 * POST with action=login  → validate credentials, start session
 * POST with action=logout → destroy session
 * GET  with action=check  → check if session is active
 * Returns: JSON
 */

declare(strict_types=1);
header('Content-Type: application/json');

require_once __DIR__ . '/../config/db.php';

// ── Helper ────────────────────────────────────────────────────
function respond(bool $success, string $message, int $code = 200, array $extra = []): void {
    http_response_code($code);
    echo json_encode(array_merge(['success' => $success, 'message' => $message], $extra));
    exit;
}

// ── Session setup ─────────────────────────────────────────────
if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params([
        'lifetime' => 0,          // session cookie (expires on browser close)
        'path'     => '/',
        'domain'   => '',
        'secure'   => false,      // set true in production with HTTPS
        'httponly' => true,       // JS cannot read session cookie
        'samesite' => 'Lax',
    ]);
    session_start();
}

// ── OPTIONS preflight ─────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204); exit;
}

$method = $_SERVER['REQUEST_METHOD'];

// ── GET: check session ────────────────────────────────────────
if ($method === 'GET') {
    $action = $_GET['action'] ?? '';
    if ($action === 'check') {
        if (!empty($_SESSION['admin_id'])) {
            respond(true, 'Authenticated.', 200, ['username' => $_SESSION['admin_username'] ?? '']);
        } else {
            respond(false, 'Not authenticated.', 401);
        }
    }
    respond(false, 'Unknown action.', 400);
}

if ($method !== 'POST') {
    respond(false, 'Method not allowed.', 405);
}

// ── Parse POST body ───────────────────────────────────────────
$raw    = file_get_contents('php://input');
$body   = json_decode($raw, true) ?? $_POST;
$action = trim($body['action'] ?? '');

// ── LOGOUT ────────────────────────────────────────────────────
if ($action === 'logout') {
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $p['path'], $p['domain'], $p['secure'], $p['httponly']);
    }
    session_destroy();
    respond(true, 'Logged out successfully.');
}

// ── LOGIN ─────────────────────────────────────────────────────
if ($action === 'login') {
    $username = trim($body['username'] ?? '');
    $password = $body['password'] ?? '';

    if (!$username || !$password) {
        respond(false, 'Username and password are required.', 422);
    }

    // Basic brute-force mitigation: check attempt count in session
    if (!isset($_SESSION['login_attempts'])) {
        $_SESSION['login_attempts']    = 0;
        $_SESSION['login_attempt_time'] = time();
    }

    // Reset counter after 15 minutes
    if (time() - $_SESSION['login_attempt_time'] > 900) {
        $_SESSION['login_attempts']    = 0;
        $_SESSION['login_attempt_time'] = time();
    }

    if ($_SESSION['login_attempts'] >= 5) {
        respond(false, 'Too many failed attempts. Please wait 15 minutes.', 429);
    }

    try {
        $pdo  = getPDO();
        $stmt = $pdo->prepare("SELECT * FROM admin_users WHERE username = :username LIMIT 1");
        $stmt->execute([':username' => $username]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            $_SESSION['login_attempts']++;
            respond(false, 'Invalid username or password.', 401);
        }

        // Successful login - regenerate session ID to prevent fixation
        session_regenerate_id(true);
        $_SESSION['admin_id']       = (int)$user['id'];
        $_SESSION['admin_username'] = $user['username'];
        $_SESSION['login_attempts'] = 0;

        respond(true, 'Login successful.', 200, ['username' => $user['username']]);

    } catch (PDOException $e) {
        error_log('Auth DB error: ' . $e->getMessage());
        respond(false, 'Server error.', 500);
    }
}

respond(false, 'Unknown action. Use action=login or action=logout.', 400);
