<?php
/**
 * dashboard.php - Dashboard API for client dashboard
 * GET → Return dashboard statistics and recent activity
 */

ini_set('display_errors', 0);
error_reporting(E_ALL);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/debug.log');
ob_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

try {
    require_once __DIR__ . '/../config/db.php';
    $pdo = getPDO();

    // Get statistics
    $stats = [
        'projects' => (int)$pdo->query("SELECT COUNT(*) as count FROM projects")->fetch()['count'],
        'skills' => (int)$pdo->query("SELECT COUNT(*) as count FROM skills")->fetch()['count'],
        'messages' => (int)$pdo->query("SELECT COUNT(*) as count FROM contacts")->fetch()['count'],
        'database_size' => 'OK'
    ];

    // Get recent activity (last 10 items)
    $activity = [];

    // Recent projects
    $stmt = $pdo->query("SELECT 'Project Added' as action, CONCAT('Added project: ', title) as details, created_at as time FROM projects ORDER BY created_at DESC LIMIT 3");
    $projects = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($projects as $p) {
        $activity[] = [
            'action' => $p['action'],
            'details' => $p['details'],
            'time' => date('M j, H:i', strtotime($p['time']))
        ];
    }

    // Recent messages
    $stmt = $pdo->query("SELECT 'New Message' as action, CONCAT('From: ', name, ' - ', subject) as details, created_at as time FROM contacts ORDER BY created_at DESC LIMIT 3");
    $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($messages as $m) {
        $activity[] = [
            'action' => $m['action'],
            'details' => $m['details'],
            'time' => date('M j, H:i', strtotime($m['time']))
        ];
    }

    // Sort activity by time (most recent first)
    usort($activity, function($a, $b) {
        return strtotime($b['time']) - strtotime($a['time']);
    });

    // Take only the 10 most recent
    $activity = array_slice($activity, 0, 10);

    ob_end_clean();
    echo json_encode([
        'success' => true,
        'stats' => $stats,
        'activity' => $activity
    ]);

} catch (Throwable $e) {
    error_log('Dashboard API error: ' . $e->getMessage());
    ob_end_clean();
    echo json_encode([
        'success' => false,
        'message' => 'Dashboard error: ' . $e->getMessage()
    ]);
}
?>