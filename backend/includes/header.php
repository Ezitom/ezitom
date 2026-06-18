<?php
/**
 * header.php - Ezitom Admin Panel Shared Header
 * Expects $pageTitle to be set before including.
 */
$pageTitle = $pageTitle ?? 'Dashboard';
$username  = htmlspecialchars($_SESSION['admin_username'] ?? 'Admin', ENT_QUOTES, 'UTF-8');
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= htmlspecialchars($pageTitle, ENT_QUOTES, 'UTF-8') ?> - Ezitom Admin</title>
  <meta name="robots" content="noindex, nofollow">
  <!-- Favicon -->
  <link rel="icon" type="image/x-icon" href="../../assets/favicon/favicon.ico">
  <link rel="icon" type="image/png" sizes="32x32" href="../../assets/favicon/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="../../assets/favicon/favicon-16x16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="../../assets/favicon/apple-touch-icon.png">
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <!-- Font Awesome -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossorigin="anonymous" referrerpolicy="no-referrer">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:        #0f1117;
      --surface:   #1a1d27;
      --surface2:  #222636;
      --border:    #2e3247;
      --accent:    #00d4c8;
      --accent2:   #7c6bff;
      --text:      #e8eaf0;
      --text2:     #8b91a8;
      --danger:    #ff4f6a;
      --success:   #00c97a;
      --warning:   #ffb347;
      --radius:    8px;
      --sidebar-w: 250px;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    /* ── Top Bar ── */
    .topbar {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      height: 58px;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 1.5rem;
      box-shadow: 0 2px 12px rgba(0,0,0,.3);
    }
    .topbar-brand {
      font-size: 1.1rem; font-weight: 700; letter-spacing: .03em;
      color: var(--accent); text-decoration: none;
      display: flex; align-items: center; gap: .4rem;
    }
    .topbar-brand .brand-sub { color: var(--text2); font-weight: 400; font-size: .95rem; }
    .topbar-user {
      display: flex; align-items: center; gap: .75rem; font-size: .85rem;
      color: var(--text2);
    }
    .topbar-user strong { color: var(--text); }
    .logout-btn {
      background: transparent; border: 1px solid var(--border);
      color: var(--danger); padding: .32rem .85rem; border-radius: var(--radius);
      cursor: pointer; font-size: .8rem; text-decoration: none;
      transition: background .2s, border-color .2s; font-family: inherit;
    }
    .logout-btn:hover { background: rgba(255,79,106,.1); border-color: rgba(255,79,106,.4); }

    /* ── Layout ── */
    .layout {
      display: flex;
      margin-top: 58px;
      min-height: calc(100vh - 58px);
    }

    /* ── Sidebar ── */
    .sidebar {
      width: var(--sidebar-w);
      background: var(--surface);
      border-right: 1px solid var(--border);
      padding: 1.5rem 0;
      position: fixed; top: 58px; left: 0;
      height: calc(100vh - 58px);
      overflow-y: auto;
    }
    .sidebar-section {
      padding: .5rem 1.5rem .25rem;
      font-size: .68rem; font-weight: 600; text-transform: uppercase;
      letter-spacing: .1em; color: var(--text2); margin-top: .5rem;
    }
    .sidebar-nav { list-style: none; }
    .sidebar-nav a {
      display: flex; align-items: center; gap: .65rem;
      padding: .6rem 1.5rem;
      color: var(--text2); text-decoration: none;
      font-size: .88rem; border-left: 3px solid transparent;
      transition: all .15s;
    }
    .sidebar-nav a:hover,
    .sidebar-nav a.active {
      color: var(--text);
      background: var(--surface2);
      border-left-color: var(--accent);
    }
    .sidebar-nav .nav-icon { font-size: .85rem; width: 20px; text-align: center; color: inherit; }

    /* ── Main content ── */
    .main-content {
      margin-left: var(--sidebar-w);
      flex: 1;
      padding: 2rem 2.5rem;
      max-width: 1200px;
    }

    /* ── Page title ── */
    .page-header {
      margin-bottom: 1.75rem;
      display: flex; align-items: flex-start; justify-content: space-between;
      flex-wrap: wrap; gap: 1rem;
    }
    .page-header h1 { font-size: 1.45rem; font-weight: 600; }
    .page-header p   { color: var(--text2); font-size: .88rem; margin-top: .25rem; }

    /* ── Cards ── */
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .card-title {
      font-size: .95rem; font-weight: 600; margin-bottom: 1.2rem;
      padding-bottom: .75rem; border-bottom: 1px solid var(--border);
      display: flex; align-items: center; justify-content: space-between;
      gap: .5rem;
    }

    /* ── Buttons ── */
    .btn {
      display: inline-flex; align-items: center; gap: .4rem;
      padding: .5rem 1.1rem; border-radius: var(--radius);
      font-size: .85rem; font-weight: 500; cursor: pointer;
      border: none; text-decoration: none; transition: opacity .2s, transform .1s;
      font-family: inherit;
    }
    .btn:hover { opacity: .85; transform: translateY(-1px); }
    .btn:active { transform: translateY(0); }
    .btn-primary   { background: var(--accent);  color: #0f1117; }
    .btn-secondary { background: var(--surface2); color: var(--text); border: 1px solid var(--border); }
    .btn-danger    { background: var(--danger);   color: #fff; }
    .btn-sm { padding: .28rem .7rem; font-size: .78rem; }

    /* ── Forms ── */
    .form-group { margin-bottom: 1rem; }
    .form-label { display: block; font-size: .82rem; color: var(--text2); margin-bottom: .4rem; font-weight: 500; }
    .form-control {
      width: 100%; background: var(--surface2); border: 1px solid var(--border);
      color: var(--text); border-radius: var(--radius);
      padding: .55rem .85rem; font-size: .9rem; outline: none;
      transition: border-color .2s, box-shadow .2s;
      font-family: inherit;
    }
    .form-control:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(0,212,200,.1);
    }
    select.form-control { cursor: pointer; }
    textarea.form-control { min-height: 100px; resize: vertical; }

    /* ── Tables ── */
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: .88rem; }
    th {
      text-align: left; padding: .65rem 1rem;
      background: var(--surface2); color: var(--text2);
      font-size: .72rem; text-transform: uppercase; letter-spacing: .07em;
      border-bottom: 1px solid var(--border);
    }
    td {
      padding: .75rem 1rem; border-bottom: 1px solid var(--border);
      color: var(--text); vertical-align: middle;
    }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: rgba(34,38,54,.5); }

    /* ── Badges ── */
    .badge {
      display: inline-block; padding: .22rem .6rem;
      border-radius: 30px; font-size: .7rem; font-weight: 600;
      letter-spacing: .04em;
    }
    .badge-green  { background: rgba(0,201,122,.15);  color: var(--success); }
    .badge-blue   { background: rgba(0,212,200,.15);  color: var(--accent); }
    .badge-purple { background: rgba(124,107,255,.15);color: var(--accent2); }

    /* ── Alerts ── */
    .alert {
      padding: .8rem 1rem; border-radius: var(--radius);
      margin-bottom: 1.2rem; font-size: .88rem;
      display: flex; align-items: center; gap: .5rem;
    }
    .alert-success { background: rgba(0,201,122,.1); border: 1px solid rgba(0,201,122,.3); color: var(--success); }
    .alert-error   { background: rgba(255,79,106,.1); border: 1px solid rgba(255,79,106,.3); color: var(--danger); }

    /* ── Responsive ── */
    @media (max-width: 768px) {
      .sidebar { transform: translateX(-100%); }
      .main-content { margin-left: 0; padding: 1rem; }
    }
  </style>
</head>
<body>

<header class="topbar">
  <a href="index.php" class="topbar-brand">
    Ezitom <span class="brand-sub">Admin</span>
  </a>
  <div class="topbar-user">
    <span>Logged in as <strong><?= $username ?></strong></span>
    <a href="index.php?action=logout" class="logout-btn">Log Out</a>
  </div>
</header>

<div class="layout">
  <aside class="sidebar">
    <div class="sidebar-section">Content</div>
    <ul class="sidebar-nav">
      <li>
        <a href="index.php?tab=projects&cat=all" class="<?= ($tab==='projects' && ($catFilter==='all')) ? 'active' : '' ?>">
          <i class="nav-icon fas fa-folder-open"></i> All Projects
        </a>
      </li>
      <li>
        <a href="index.php?tab=projects&cat=Business" class="<?= ($tab==='projects' && ($catFilter==='Business')) ? 'active' : '' ?>">
          <i class="nav-icon fas fa-briefcase"></i> Business
        </a>
      </li>
      <li>
        <a href="index.php?tab=projects&cat=Wedding" class="<?= ($tab==='projects' && ($catFilter==='Wedding')) ? 'active' : '' ?>">
          <i class="nav-icon fas fa-heart"></i> Wedding
        </a>
      </li>
      <li>
        <a href="index.php?tab=skills" class="<?= ($_GET['tab'] ?? '') === 'skills' ? 'active' : '' ?>">
          <i class="nav-icon fas fa-bolt"></i> Skills
        </a>
      </li>
      <li>
        <a href="index.php?tab=contacts" class="<?= ($_GET['tab'] ?? '') === 'contacts' ? 'active' : '' ?>">
          <i class="nav-icon fas fa-envelope"></i> Messages
        </a>
      </li>
    </ul>
    <div class="sidebar-section" style="margin-top:1.5rem;">Account</div>
    <ul class="sidebar-nav">
      <li>
        <a href="../../index.html">
          <i class="nav-icon fas fa-globe"></i> View Portfolio
        </a>
      </li>
      <li>
        <a href="index.php?action=logout" style="color:var(--danger);">
          <i class="nav-icon fas fa-sign-out-alt"></i> Log Out
        </a>
      </li>
    </ul>
  </aside>

  <main class="main-content">
