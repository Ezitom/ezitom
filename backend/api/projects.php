<?php
/**
 * projects.php - CRUD for portfolio projects
 * GET    → fetch all (supports ?category= filter) - public
 * POST   → add new project - admin only
 * PUT    → update existing project - admin only
 * DELETE → delete project - admin only
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

    // ── GET - fetch projects ──────────────────────────────────────
    if ($method === 'GET') {
        $id = $_GET['id'] ?? null;
        $category = $_GET['category'] ?? null;

        if ($id) {
            // Fetch single project
            $stmt = $pdo->prepare("SELECT * FROM projects WHERE id = :id LIMIT 1");
            $stmt->execute([':id' => (int)$id]);
            $project = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($project) {
                $project['tech_stack'] = json_decode($project['tech_stack'], true) ?? [];
                respond(true, 'Project retrieved.', 200, ['data' => $project]);
            } else {
                respond(false, 'Project not found.', 404);
            }
        } elseif ($category && $category !== 'all') {
            $stmt = $pdo->prepare(
                "SELECT * FROM projects WHERE category = :cat ORDER BY created_at DESC"
            );
            $stmt->execute([':cat' => $category]);
        } else {
            $stmt = $pdo->query("SELECT * FROM projects ORDER BY created_at DESC");
        }

        if (!$id) {
            $projects = $stmt->fetchAll();

            foreach ($projects as &$p) {
                $p['tech_stack'] = json_decode($p['tech_stack'], true) ?? [];
            }
            unset($p);

            respond(true, 'Projects fetched.', 200, ['data' => $projects]);
        }
    }

    // ── POST - add new project ────────────────────────────────────
    if ($method === 'POST') {
        requireAdmin();

        $raw  = file_get_contents('php://input');
        $body = json_decode($raw, true) ?? $_POST;

        $title       = trim($body['title']       ?? '');
        $description = trim($body['description'] ?? '');
        $tech_stack  = $body['tech_stack']       ?? [];
        $image_url   = trim($body['image_url']   ?? '');
        $live_url    = trim($body['live_url']    ?? '');
        $category    = trim($body['category']    ?? 'Business');

        if (!$title || !$description) {
            respond(false, 'Title and description are required.', 422);
        }

        $stmt = $pdo->prepare(
            "INSERT INTO projects (title, description, tech_stack, image_url, live_url, category)
             VALUES (:title, :description, :tech_stack, :image_url, :live_url, :category)"
        );
        $stmt->execute([
            ':title'       => htmlspecialchars($title,       ENT_QUOTES, 'UTF-8'),
            ':description' => htmlspecialchars($description, ENT_QUOTES, 'UTF-8'),
            ':tech_stack'  => json_encode(is_array($tech_stack) ? $tech_stack : [$tech_stack]),
            ':image_url'   => htmlspecialchars($image_url,   ENT_QUOTES, 'UTF-8'),
            ':live_url'    => htmlspecialchars($live_url,    ENT_QUOTES, 'UTF-8'),
            ':category'    => $category,
        ]);

        respond(true, 'Project added.', 201, ['id' => (int)$pdo->lastInsertId()]);
    }

    // ── PUT - update project ──────────────────────────────────────
    if ($method === 'PUT') {
        requireAdmin();

        $raw  = file_get_contents('php://input');
        $body = json_decode($raw, true) ?? [];

        $id          = (int)($body['id']          ?? 0);
        $title       = trim($body['title']        ?? '');
        $description = trim($body['description']  ?? '');
        $tech_stack  = $body['tech_stack']        ?? [];
        $image_url   = trim($body['image_url']    ?? '');
        $live_url    = trim($body['live_url']     ?? '');
        $category    = trim($body['category']     ?? 'Business');

        if (!$id || !$title || !$description) {
            respond(false, 'ID, title, and description are required.', 422);
        }

        $stmt = $pdo->prepare(
            "UPDATE projects
             SET title=:title, description=:description, tech_stack=:tech_stack,
                 image_url=:image_url, live_url=:live_url, category=:category
             WHERE id=:id"
        );
        $stmt->execute([
            ':title'       => htmlspecialchars($title,       ENT_QUOTES, 'UTF-8'),
            ':description' => htmlspecialchars($description, ENT_QUOTES, 'UTF-8'),
            ':tech_stack'  => json_encode(is_array($tech_stack) ? $tech_stack : [$tech_stack]),
            ':image_url'   => htmlspecialchars($image_url,   ENT_QUOTES, 'UTF-8'),
            ':live_url'    => htmlspecialchars($live_url,    ENT_QUOTES, 'UTF-8'),
            ':category'    => $category,
            ':id'          => $id,
        ]);

        respond(true, 'Project updated.');
    }

    // ── DELETE - remove project ───────────────────────────────────
    if ($method === 'DELETE') {
        requireAdmin();

        $raw  = file_get_contents('php://input');
        $body = json_decode($raw, true) ?? [];
        $id   = (int)($body['id'] ?? $_GET['id'] ?? 0);

        if (!$id) {
            respond(false, 'Project ID is required.', 422);
        }

        $stmt = $pdo->prepare("DELETE FROM projects WHERE id = :id");
        $stmt->execute([':id' => $id]);

        if ($stmt->rowCount() === 0) {
            respond(false, 'Project not found.', 404);
        }

        respond(true, 'Project deleted.');
    }

    respond(false, 'Method not allowed.', 405);

} catch (Throwable $e) {
    error_log('Projects API error: ' . $e->getMessage());
    respond(false, 'Server error: ' . $e->getMessage(), 500);
}
