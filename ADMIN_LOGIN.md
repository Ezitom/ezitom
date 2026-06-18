# 📊 Ezitom Admin Dashboard Access

## Admin Credentials

```
URL: http://localhost/ezitom/backend/admin/login.php

Username: ezitom_admin
Password: E@z1T0m#X9$kLpQ2^mWv
Database: ezitom_db
```

> ⚠️ **First run:** Visit `backend/setup.php` to initialize the database and create the admin user.

---

## Admin Dashboard Features

Once logged in, you can:

### 1️⃣ **Projects Tab**
- View all portfolio projects
- Add new projects with images
- Edit existing projects
- Delete projects (AJAX - no page reload)
- Manage project categories
- Add technology stack tags

### 2️⃣ **Skills Tab**
- View all technical skills
- Add new skills with proficiency levels (0-100%)
- Organize by category
- Delete skills

### 3️⃣ **Messages Tab**
- View all contact form submissions
- Read visitor messages
- Delete old messages
- Track message timestamp and sender info

---

## How to Add/Edit Project Images

### In Admin Dashboard:
1. Go to **Projects** tab
2. Click **Add New Project** or **Edit**
3. Fill in project details:
   - **Title** (required)
   - **Description** (required)
   - **Image URL**: `images/projects/filename.png`
   - **Live URL**: Link to live site
   - **Category**: General, Business, or Events & Wedding
   - **Tech Stack**: Comma-separated (e.g., "React, Node.js, MongoDB")

### Image URL Examples:
```
images/projects/Business website.png
images/projects/tolu-dami-wedding.svg
images/projects/greenroots-store.svg
images/projects/devnotes-blog.svg
images/projects/harbour-events.svg
images/projects/opentrack-cli.svg
```

---

## Security Notes

- **Password is Bcrypt hashed** (cost=12) - never stored in plain text
- **Session management** - automatically logs out after browser close
- **Brute-force protection** - 10 attempts then 15-minute lockout
- **XSS protection** - all output is HTML-escaped
- **Admin password**: minimum 20 characters, mixed case, numbers, symbols

## Reset Admin Password (if needed)

Run this in `setup.php` or run from CLI:
```php
<?php
$newPassword = 'YourNewStrongPassword!';
$hash = password_hash($newPassword, PASSWORD_BCRYPT, ['cost' => 12]);
echo $hash; // Paste this in the UPDATE below
?>
```

Then update the database in phpMyAdmin:
```sql
UPDATE admin_users 
SET password_hash = '$2y$12$...(paste hash here)...' 
WHERE username = 'ezitom_admin';
```

---

## Setup Steps

1. **Start XAMPP:**
   - Open XAMPP Control Panel
   - Start **Apache** & **MySQL**

2. **Initialize Database:**
   - Visit: `http://localhost/[folder]/backend/setup.php`
   - Setup auto-creates `ezitom_db` and all tables
   - Admin user is inserted with bcrypt-hashed password

3. **Login to Admin:**
   - Visit: `http://localhost/[folder]/backend/admin/login.php`
   - Username: `ezitom_admin`
   - Password: `E@z1T0m#X9$kLpQ2^mWv`

4. **Manage Content:**
   - Add/edit/delete projects, skills, and messages
   - All changes reflect instantly on the frontend

5. **View Frontend:**
   - Visit: `http://localhost/ezitom/projects.html`
   - Projects display dynamically from database

---

✅ **Admin dashboard is fully operational!**
