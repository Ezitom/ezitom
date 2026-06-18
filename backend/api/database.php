<?php
/**
 * database.php - Database management API for client dashboard
 * GET → Return database information and table counts
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

    // Get table counts
    $tables = [
        'projects' => (int)$pdo->query("SELECT COUNT(*) as count FROM projects")->fetch()['count'],
        'skills' => (int)$pdo->query("SELECT COUNT(*) as count FROM skills")->fetch()['count'],
        'contacts' => (int)$pdo->query("SELECT COUNT(*) as count FROM contacts")->fetch()['count'],
        'admin_users' => (int)$pdo->query("SELECT COUNT(*) as count FROM admin_users")->fetch()['count']
    ];

    // Get database info
    $dbInfo = $pdo->query("SELECT DATABASE() as db_name, VERSION() as mysql_version, USER() as user")->fetch(PDO::FETCH_ASSOC);

    $info = [
        'database_name' => $dbInfo['db_name'] ?? 'ezitom_db',
        'server' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
        'php_version' => PHP_VERSION,
        'mysql_version' => $dbInfo['mysql_version'] ?? 'Unknown',
        'tables' => $tables,
        'total_records' => array_sum($tables)
    ];

    ob_end_clean();
    echo json_encode([
        'success' => true,
        'info' => $info
    ]);

} catch (Throwable $e) {
    error_log('Database API error: ' . $e->getMessage());
    ob_end_clean();
    echo json_encode([
        'success' => false,
        'message' => 'Database API error: ' . $e->getMessage()
    ]);
}
?>