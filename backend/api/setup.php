<?php
/**
 * setup.php - Database initialization API
 * GET  → Check database status
 * POST → Initialize database with tables and sample data
 */

ini_set('display_errors', 0);
error_reporting(E_ALL);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/debug.log');
ob_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    require_once __DIR__ . '/../config/db.php';
    $pdo = getPDO();
    
    // ── GET - Check database status ──────────────────────────
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        try {
            $projectCount = $pdo->query("SELECT COUNT(*) as count FROM projects")->fetch()['count'] ?? 0;
            $skillCount = $pdo->query("SELECT COUNT(*) as count FROM skills")->fetch()['count'] ?? 0;
            
            ob_end_clean();
            echo json_encode([
                'ready' => $projectCount > 0 && $skillCount > 0,
                'projects' => (int)$projectCount,
                'skills' => (int)$skillCount
            ]);
            exit;
        } catch (Throwable $e) {
            ob_end_clean();
            echo json_encode(['ready' => false, 'projects' => 0, 'skills' => 0]);
            exit;
        }
    }
    
    // ── POST - Initialize database ───────────────────────────
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Read setup.sql
        $sqlFile = __DIR__ . '/../config/setup.sql';
        if (!file_exists($sqlFile)) {
            throw new Exception('setup.sql not found.');
        }
        
        $sql = file_get_contents($sqlFile);
        
        // Execute SQL statements
        $statements = explode(';', $sql);
        $executed = 0;
        
        foreach ($statements as $statement) {
            $statement = trim($statement);
            
            // Skip empty lines and comments
            if (empty($statement) || strpos($statement, '--') === 0) {
                continue;
            }
            
            try {
                $pdo->exec($statement);
                $executed++;
            } catch (PDOException $e) {
                // Log but continue (some statements may fail if data already exists)
                error_log('Setup SQL warning: ' . $e->getMessage());
            }
        }
        
        // Verify setup
        $projectCount = $pdo->query("SELECT COUNT(*) as count FROM projects")->fetch()['count'] ?? 0;
        $skillCount = $pdo->query("SELECT COUNT(*) as count FROM skills")->fetch()['count'] ?? 0;
        $adminCount = $pdo->query("SELECT COUNT(*) as count FROM admin_users")->fetch()['count'] ?? 0;
        
        ob_end_clean();
        echo json_encode([
            'success' => true,
            'message' => 'Database initialized successfully!',
            'details' => [
                'statements_executed' => $executed,
                'projects' => (int)$projectCount,
                'skills' => (int)$skillCount,
                'admin_users' => (int)$adminCount
            ]
        ]);
        exit;
    }
    
    http_response_code(405);
    ob_end_clean();
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
    
} catch (Throwable $e) {
    error_log('Setup error: ' . $e->getMessage());
    http_response_code(500);
    ob_end_clean();
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage(),
        'error' => $e->getTraceAsString()
    ]);
    exit;
}
