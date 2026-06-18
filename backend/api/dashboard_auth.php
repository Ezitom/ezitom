<?php
/**
 * dashboard_auth.php - Client Dashboard Authentication API
 * POST → authenticate dashboard login
 * Returns: JSON
 */

ini_set('display_errors', 0);
error_reporting(E_ALL);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/debug.log');
ob_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

try {
    // Dashboard password (hashed for security)
    // Password: Tommy301131
    $dashboard_password_hash = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // password_hash('Tommy301131', PASSWORD_DEFAULT);

    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'POST') {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true) ?? $_POST;

        $action = $data['action'] ?? '';
        $password = $data['password'] ?? '';

        if ($action === 'login') {
            if (empty($password)) {
                ob_end_clean();
                echo json_encode(['success' => false, 'message' => 'Password is required']);
                exit;
            }

            // Verify password
            if (password_verify($password, $dashboard_password_hash)) {
                ob_end_clean();
                echo json_encode(['success' => true, 'message' => 'Login successful']);
            } else {
                ob_end_clean();
                echo json_encode(['success' => false, 'message' => 'Invalid password']);
            }
        } else {
            ob_end_clean();
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
        }
    } else {
        ob_end_clean();
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    }

} catch (Throwable $e) {
    error_log('Dashboard Auth API error: ' . $e->getMessage());
    ob_end_clean();
    echo json_encode([
        'success' => false,
        'message' => 'Authentication error: ' . $e->getMessage()
    ]);
}
?>