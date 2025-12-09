# Backend Overview

This backend uses two data stacks:

- Supabase (REST + Auth) for content (blogs, tools, videos, writeups). Those models and API routes use the Supabase Guzzle client configured in `backend/config/database.php`.
- MySQL (PDO) for user accounts, authentication, and password resets. These endpoints use `backend/config/mysql.php`.

Goal of this file

Make it clear which parts of the backend should talk to Supabase vs MySQL and list environment variables required to run the backend locally or in production.

Environment variables

Create a `.env` file in the repository root with the following values (example):

```env
# MySQL
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=alma101
DB_USER=root
DB_PASS=

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_ADMIN_EMAIL=admin@yourdomain.com

# SMTP
SMTP_USER=you@example.com
SMTP_PASS=your-app-password
```

Quick notes

- The MySQL connection class is `MySQLDatabase` at `backend/config/mysql.php`. It now reads configuration from environment variables.
- Content models (for example `backend/models/Tool.php`, `backend/models/Blog.php`) expect the Supabase `Database` client from `backend/config/database.php`.
- Auth and user management endpoints (`register.php`, `login.php`, `reset-password.php`, `admin-reset-password.php`) use the MySQL database.
- See `backend/config/password_resets.sql` for the expected `password_resets` table schema.

Running the password_resets migration

Run the SQL file against your MySQL database:

```bash
mysql -u "$DB_USER" -p "$DB_NAME" < backend/config/password_resets.sql
```

If you'd like, I can add a small CLI script to run migrations automatically.

Security

- Keep Supabase keys and SMTP credentials out of source control.
- Move any additional credentials into environment variables.
