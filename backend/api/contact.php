<?php
// No blank lines or spaces before this tag

ini_set('display_errors', 0);
error_reporting(E_ALL);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/debug.log');
ob_start(); // Buffer any accidental output

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    require_once __DIR__ . '/../config/db.php';
    $pdo = getPDO();
    $method = $_SERVER['REQUEST_METHOD'];

    // ── DELETE - Admin only ──────────────────────────────────
    if ($method === 'DELETE') {
        if (session_status() === PHP_SESSION_NONE) session_start();
        if (empty($_SESSION['admin_id'])) {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'message' => 'Unauthorised.']);
            exit;
        }

        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true);
        $id = (int)($data['id'] ?? 0);

        if (!$id) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Message ID required.']);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM contacts WHERE id = ?");
        $stmt->execute([$id]);

        ob_end_clean();
        echo json_encode(['status' => 'success', 'success' => true, 'message' => 'Message deleted.']);
        exit;
    }

    // ── POST - Public form submission ────────────────────────
    if ($method === 'POST') {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true) ?? $_POST;

        if (empty($data['name']) || empty($data['email']) || empty($data['message'])) {
            http_response_code(400);
            ob_end_clean();
            echo json_encode(['status' => 'error', 'message' => 'All fields are required.']);
            exit;
        }

        $name    = htmlspecialchars(strip_tags(trim((string)$data['name'])));
        $email   = filter_var(trim((string)$data['email']), FILTER_SANITIZE_EMAIL);
        $subject = htmlspecialchars(strip_tags(trim((string)($data['subject'] ?? 'No Subject'))));
        $message = htmlspecialchars(strip_tags(trim((string)$data['message'])));

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            ob_end_clean();
            echo json_encode(['status' => 'error', 'message' => 'Invalid email address.']);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO contacts (name, email, subject, message, created_at) VALUES (?, ?, ?, ?, NOW())");
        $stmt->execute([$name, $email, $subject, $message]);

        ob_end_clean();
        echo json_encode(['status' => 'success', 'message' => 'Your message has been sent successfully!']);
        exit;
    }

    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed.']);

} catch (Throwable $e) {
    error_log('Contact form error: ' . $e->getMessage());
    http_response_code(500);
    if (ob_get_length()) ob_end_clean();
    echo json_encode(['status' => 'error', 'message' => 'Server error.']);
}
exit;
