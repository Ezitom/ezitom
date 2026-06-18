<?php
/**
 * messages.php - CRUD for contact messages
 * GET    → fetch all messages (supports ?id= filter for single message)
 * DELETE → remove a message - admin only
 * Returns: JSON
 */

declare(strict_types=1);

// Prevent errors from bleeding into JSON output
ini_set('display_errors', '0');
error_reporting(0);

ob_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// ── Helper ────────────────────────────────────────────────────
function respond(bool $success, string $message, int $code = 200, array $extra = []): void {
    if (ob_get_length()) ob_clean();
    http_response_code($code);
    echo json_encode(array_merge(['success' => $success, 'message' => $message], $extra));
    exit;
}

function requireAdmin(): void {
    if (session_status() === PHP_SESSION_NONE) session_start();
    if (empty($_SESSION['admin_id'])) {
        respond(false, 'Unauthorised. Admin login required.', 401);
    }
}

try {
    require_once __DIR__ . '/../config/db.php';

    // ── OPTIONS preflight ─────────────────────────────────────────
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204); exit;
    }

    $method = $_SERVER['REQUEST_METHOD'];
    $pdo    = getPDO();

    // ── GET - fetch messages ──────────────────────────────────────
    if ($method === 'GET') {
        $id = $_GET['id'] ?? null;

        if ($id) {
            // Fetch single message
            $stmt = $pdo->prepare("SELECT * FROM contacts WHERE id = :id LIMIT 1");
            $stmt->execute([':id' => (int)$id]);
            $message = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($message) {
                respond(true, 'Message retrieved.', 200, ['data' => $message]);
            } else {
                respond(false, 'Message not found.', 404);
            }
        } else {
            // Fetch all messages
            $stmt = $pdo->query("SELECT id, name, email, subject, message, created_at FROM contacts ORDER BY created_at DESC");
            $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

            respond(true, 'Messages retrieved.', 200, ['data' => $messages]);
        }
    }

    // ── DELETE - remove message ───────────────────────────────────
    elseif ($method === 'DELETE') {
        requireAdmin();

        $raw  = file_get_contents('php://input');
        $body = json_decode($raw, true) ?? [];
        $id   = (int)($body['id'] ?? $_GET['id'] ?? 0);

        if (!$id) {
            respond(false, 'Message ID is required.', 422);
        }

        $stmt = $pdo->prepare("DELETE FROM contacts WHERE id = :id");
        $stmt->execute([':id' => $id]);

        if ($stmt->rowCount() === 0) {
            respond(false, 'Message not found.', 404);
        }

        respond(true, 'Message deleted.');
    }

    respond(false, 'Method not allowed.', 405);

} catch (Throwable $e) {
    error_log('Messages API error: ' . $e->getMessage());
    respond(false, 'Server error: ' . $e->getMessage(), 500);
}
