<?php
/**
 * db.php - Database Configuration for XAMPP (Local)
 * Database: ezitom_db
 * Auto-creates the database if it does not exist.
 */

// ── ERROR HANDLING ──────────────────────────────────────────
ini_set('display_errors', 0);
error_reporting(0);

// ── DATABASE CREDENTIALS (XAMPP DEFAULT) ─────────────────────
$host     = 'localhost';
$dbname   = 'ezitom_db';
$username = 'ezitom_user';
$password = 'E@z1T0m#X9$kLpQ2^mWv';

/**
 * Returns a singleton PDO instance.
 * Automatically creates the `ezitom_db` database if it doesn't exist.
 */
function getPDO(): PDO {
    static $pdo = null;
    if ($pdo !== null) return $pdo;

    global $host, $dbname, $username, $password;

    // Step 1: Connect WITHOUT a database selected (to allow DB creation)
    try {
        $rootDsn = "mysql:host=$host;charset=utf8mb4";
        $rootOptions = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        $rootPdo = new PDO($rootDsn, $username, $password, $rootOptions);

        // Auto-create database if missing
        $rootPdo->exec(
            "CREATE DATABASE IF NOT EXISTS `$dbname`
             CHARACTER SET utf8mb4
             COLLATE utf8mb4_unicode_ci"
        );
        $rootPdo->exec("USE `$dbname`");

        $pdo = $rootPdo;

    } catch (PDOException $e) {
        error_log('Ezitom DB connection failed: ' . $e->getMessage());
        die(
            "<div style='font-family:sans-serif;padding:2rem;max-width:600px;margin:3rem auto;" .
            "background:#1a1d27;border:1px solid #ff4f6a;border-radius:8px;color:#ff4f6a;'>" .
            "<h2 style='margin-top:0;display:flex;align-items:center;gap:.5rem'>" .
            "<svg xmlns='http://www.w3.org/2000/svg' width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z'/><line x1='12' y1='9' x2='12' y2='13'/><line x1='12' y1='17' x2='12.01' y2='17'/></svg>" .
            " Database Connection Failed</h2>" .
            "<p>Could not connect to MySQL. Please ensure:</p>" .
            "<ul><li>XAMPP MySQL module is <strong>running</strong></li>" .
            "<li>Host: <code>localhost</code>, User: <code>root</code>, Password: <em>(blank)</em></li></ul>" .
            "<p style='color:#8b91a8;font-size:.85rem'>Error: " . htmlspecialchars($e->getMessage(), ENT_QUOTES, 'UTF-8') . "</p>" .
            "</div>"
        );
    }

    return $pdo;
}
