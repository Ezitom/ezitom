<?php
/**
 * skills.php - CRUD for skills/tech stack
 * GET    → fetch all skills grouped by category (supports ?id= filter for single skill) - public
 * POST   → add a new skill - admin only
 * PUT    → update skill - admin only
 * DELETE → remove a skill - admin only
 * Returns: JSON
 */

declare(strict_types=1);

// Prevent errors from bleeding into JSON output
ini_set('display_errors', '0');
error_reporting(0);

ob_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
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

    // ── GET - fetch all skills grouped by category ────────────────
    if ($method === 'GET') {
        $id = $_GET['id'] ?? null;

        if ($id) {
            // Fetch single skill
            $stmt = $pdo->prepare("SELECT * FROM skills WHERE id = :id LIMIT 1");
            $stmt->execute([':id' => (int)$id]);
            $skill = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($skill) {
                respond(true, 'Skill retrieved.', 200, ['data' => $skill]);
            } else {
                respond(false, 'Skill not found.', 404);
            }
        } else {
            // Fetch all skills grouped by category
            $stmt  = $pdo->query("SELECT * FROM skills ORDER BY category, proficiency DESC");
            $rows  = $stmt->fetchAll();

            $grouped = [];
            foreach ($rows as $skill) {
                $cat = $skill['category'];
                if (!isset($grouped[$cat])) {
                    $grouped[$cat] = [];
                }
                $grouped[$cat][] = [
                    'id'          => (int)$skill['id'],
                    'skill_name'  => $skill['skill_name'],
                    'proficiency' => (int)$skill['proficiency'],
                ];
            }

            respond(true, 'Skills fetched.', 200, ['data' => $grouped]);
        }
    }

    // ── POST - add new skill ──────────────────────────────────────
    if ($method === 'POST') {
        requireAdmin();

        $raw  = file_get_contents('php://input');
        $body = json_decode($raw, true) ?? $_POST;

        $skill_name  = trim($body['skill_name']  ?? '');
        $category    = trim($body['category']    ?? '');
        $proficiency = (int)($body['proficiency'] ?? 80);

        if (!$skill_name || !$category) {
            respond(false, 'Skill name and category are required.', 422);
        }

        $stmt = $pdo->prepare(
            "INSERT INTO skills (skill_name, category, proficiency)
             VALUES (:skill_name, :category, :proficiency)"
        );
        $stmt->execute([
            ':skill_name'  => htmlspecialchars($skill_name, ENT_QUOTES, 'UTF-8'),
            ':category'    => htmlspecialchars($category,   ENT_QUOTES, 'UTF-8'),
            ':proficiency' => $proficiency,
        ]);
        respond(true, 'Skill added.', 201, ['id' => (int)$pdo->lastInsertId()]);
    }

    // ── PUT - update skill ────────────────────────────────────────
    if ($method === 'PUT') {
        requireAdmin();

        $raw  = file_get_contents('php://input');
        $body = json_decode($raw, true) ?? $_POST;

        $id           = (int)($body['id'] ?? 0);
        $skill_name   = trim($body['skill_name'] ?? '');
        $category     = trim($body['category'] ?? '');
        $proficiency  = (int)($body['proficiency'] ?? 80);

        if (!$id || !$skill_name || !$category) {
            respond(false, 'ID, skill name and category are required.', 422);
        }

        $stmt = $pdo->prepare(
            "UPDATE skills SET skill_name = :skill_name, category = :category, proficiency = :proficiency
             WHERE id = :id"
        );
        $stmt->execute([
            ':id'          => $id,
            ':skill_name'  => htmlspecialchars($skill_name, ENT_QUOTES, 'UTF-8'),
            ':category'    => htmlspecialchars($category,   ENT_QUOTES, 'UTF-8'),
            ':proficiency' => $proficiency,
        ]);

        if ($stmt->rowCount() === 0) {
            respond(false, 'Skill not found or no changes made.', 404);
        }

        respond(true, 'Skill updated.');
    }

    // ── DELETE - remove skill ─────────────────────────────────────
    if ($method === 'DELETE') {
        requireAdmin();

        $raw  = file_get_contents('php://input');
        $body = json_decode($raw, true) ?? [];
        $id   = (int)($body['id'] ?? $_GET['id'] ?? 0);

        if (!$id) {
            respond(false, 'Skill ID is required.', 422);
        }

        $stmt = $pdo->prepare("DELETE FROM skills WHERE id = :id");
        $stmt->execute([':id' => $id]);

        if ($stmt->rowCount() === 0) {
            respond(false, 'Skill not found.', 404);
        }

        respond(true, 'Skill deleted.');
    }

    respond(false, 'Method not allowed.', 405);

} catch (Throwable $e) {
    error_log('Skills API error: ' . $e->getMessage());
    respond(false, 'Server error: ' . $e->getMessage(), 500);
}
