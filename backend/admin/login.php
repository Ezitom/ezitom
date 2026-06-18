<?php
/**
 * login.php - Ezitom Admin Login Page
 */

// If already logged in, redirect to dashboard
if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params(['lifetime' => 0, 'path' => '/', 'secure' => false, 'httponly' => true, 'samesite' => 'Lax']);
    session_start();
}
if (!empty($_SESSION['admin_id'])) {
    header('Location: index.php');
    exit;
}

$error = '';

// Handle form submission (POST to self)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_once __DIR__ . '/../config/db.php';

    $inputUser = trim($_POST['username'] ?? '');
    $inputPass = trim($_POST['password'] ?? '');

    if (!$inputUser || !$inputPass) {
        $error = 'Please enter both username and password.';
    } else {
        // Brute-force protection
        if (!isset($_SESSION['login_attempts']))     $_SESSION['login_attempts']    = 0;
        if (!isset($_SESSION['login_attempt_time'])) $_SESSION['login_attempt_time'] = time();

        if (time() - $_SESSION['login_attempt_time'] > 900) {
            $_SESSION['login_attempts']    = 0;
            $_SESSION['login_attempt_time'] = time();
        }

        if ($_SESSION['login_attempts'] >= 10) {
            $error = 'Too many failed attempts. Please wait 15 minutes.';
        } else {
            try {
                $pdo  = getPDO();
                $stmt = $pdo->prepare("SELECT * FROM admin_users WHERE username = :u LIMIT 1");
                $stmt->execute([':u' => $inputUser]);
                $user = $stmt->fetch();

                if ($user && password_verify($inputPass, $user['password_hash'])) {
                    session_regenerate_id(true);
                    $_SESSION['admin_id']       = (int)$user['id'];
                    $_SESSION['admin_username'] = $user['username'];
                    $_SESSION['login_attempts'] = 0;
                    header('Location: index.php');
                    exit;
                } else {
                    $_SESSION['login_attempts']++;
                    $error = 'Invalid username or password.';
                }
            } catch (PDOException $e) {
                $error = 'Database error. Please try again.';
                error_log('Login error: ' . $e->getMessage());
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Login - Ezitom Portfolio</title>
  <meta name="description" content="Ezitom Portfolio Admin Panel Login">
  <meta name="robots" content="noindex, nofollow">
  <!-- Favicon -->
  <link rel="icon" type="image/x-icon" href="../../assets/favicon/favicon.ico">
  <link rel="icon" type="image/png" sizes="32x32" href="../../assets/favicon/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="../../assets/favicon/favicon-16x16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="../../assets/favicon/apple-touch-icon.png">
  <!-- Font Awesome -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossorigin="anonymous" referrerpolicy="no-referrer">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #0f1117; --surface: #1a1d27; --border: #2e3247;
      --accent: #00d4c8; --text: #e8eaf0; --text2: #8b91a8;
      --danger: #ff4f6a; --radius: 10px;
    }
    body {
      background: var(--bg); color: var(--text);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      min-height: 100vh; display: flex;
      align-items: center; justify-content: center;
      padding: 1.5rem;
    }
    /* Subtle animated background */
    body::before {
      content: '';
      position: fixed; inset: 0; z-index: -1;
      background:
        radial-gradient(ellipse 60% 50% at 20% 30%, rgba(0,212,200,.06) 0%, transparent 60%),
        radial-gradient(ellipse 50% 60% at 80% 70%, rgba(124,107,255,.05) 0%, transparent 60%);
    }
    .login-wrap { width: 100%; max-width: 420px; }
    .login-logo { text-align: center; margin-bottom: 2.5rem; }
    .login-logo .brand {
      display: inline-flex; align-items: center; gap: .5rem;
      font-size: 1.7rem; font-weight: 700; color: var(--accent);
    }
    .login-logo .brand .dot { color: var(--text2); }
    .login-logo p { color: var(--text2); font-size: .88rem; margin-top: .4rem; }
    .card {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: var(--radius); padding: 2.2rem;
      box-shadow: 0 8px 40px rgba(0,0,0,.4);
    }
    .card-header {
      margin-bottom: 1.8rem;
    }
    .card-header h2 { font-size: 1.25rem; font-weight: 600; color: var(--text); }
    .card-header p  { color: var(--text2); font-size: .85rem; margin-top: .3rem; }
    .form-group { margin-bottom: 1.3rem; }
    .form-label {
      display: block; font-size: .82rem; color: var(--text2);
      margin-bottom: .5rem; font-weight: 500;
    }
    .form-control {
      width: 100%; background: #0f1117; border: 1px solid var(--border);
      color: var(--text); border-radius: var(--radius);
      padding: .7rem 1rem; font-size: .95rem; outline: none;
      transition: border-color .2s, box-shadow .2s;
      font-family: inherit;
    }
    .form-control:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(0,212,200,.12);
    }
    .btn {
      width: 100%; padding: .8rem; background: var(--accent);
      color: #0f1117; border: none; border-radius: var(--radius);
      font-size: 1rem; font-weight: 700; cursor: pointer;
      transition: opacity .2s, transform .1s; font-family: inherit;
    }
    .btn:hover { opacity: .88; transform: translateY(-1px); }
    .btn:active { transform: translateY(0); }
    .error-msg {
      background: rgba(255,79,106,.1); border: 1px solid rgba(255,79,106,.3);
      color: var(--danger); padding: .75rem 1rem; border-radius: var(--radius);
      font-size: .87rem; margin-bottom: 1.3rem;
      display: flex; align-items: center; gap: .5rem;
    }
    .back-link {
      display: block; text-align: center; margin-top: 1.8rem;
      color: var(--text2); font-size: .83rem; text-decoration: none;
      transition: color .2s;
    }
    .back-link:hover { color: var(--accent); }

  </style>
</head>
<body>
  <div class="login-wrap">
    <div class="login-logo">
      <div class="brand">Ezi<span class="dot">tom</span></div>
      <p>Portfolio Admin Panel</p>
    </div>
    <div class="card">
      <div class="card-header">
        <h2>Sign in to Dashboard</h2>
        <p>Enter your admin credentials to continue</p>
      </div>

      <?php if ($error): ?>
        <div class="error-msg"><i class="fas fa-exclamation-triangle"></i> <?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></div>
      <?php endif; ?>

      <form method="POST" action="login.php" autocomplete="on">
        <div class="form-group">
          <label class="form-label" for="username">Username</label>
          <input
            type="text" id="username" name="username"
            class="form-control"
            value="<?= htmlspecialchars($_POST['username'] ?? '', ENT_QUOTES, 'UTF-8') ?>"
            autocomplete="username"
            placeholder="e.g. ezitom_admin"
            required
          >
        </div>
        <div class="form-group">
          <label class="form-label" for="password">Password</label>
          <input
            type="password" id="password" name="password"
            class="form-control"
            autocomplete="current-password"
            placeholder="••••••••••••••••••••"
            required
          >
        </div>
        <button type="submit" class="btn" id="login-btn">Sign In →</button>
      </form>


    </div>
    <a href="../../index.html" class="back-link">← Back to portfolio</a>
  </div>
  <script>
    // Show loading state on submit
    document.querySelector('form').addEventListener('submit', function() {
      const btn = document.getElementById('login-btn');
      btn.textContent = 'Signing in…';
      btn.disabled = true;
    });
  </script>
</body>
</html>
