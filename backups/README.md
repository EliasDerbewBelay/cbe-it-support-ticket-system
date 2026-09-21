# Database Backup & Supabase Migration Guide

This directory contains full backups of the local PostgreSQL database (`cbe-it-support-system-db`) for the **CBE IT Support Ticket Management System**.

## 1. Backup Files Inventory

| File / Folder | Purpose | Format |
|---|---|---|
| [`backup_full.sql`](./backup_full.sql) | **Complete Backup**: All enums, sequences, tables, constraints, indexes, triggers, and all data. | Plain SQL (`pg_dump`) |
| [`backup_data_only.sql`](./backup_data_only.sql) | **Data Only**: All rows formatted as `INSERT INTO` statements + sequence sets. Can be pasted directly into Supabase SQL Editor. | SQL Inserts |
| [`backup_schema_only.sql`](./backup_schema_only.sql) | **Schema Only**: Table definitions, enums, triggers, and constraints without data. | Plain SQL |
| [`json/`](./json/) | **JSON Export**: Human-readable JSON export for every single table (`users.json`, `tickets.json`, etc.). | JSON |

### Backed-up Record Counts
- `categories`: 10 records
- `departments`: 9 records
- `users`: 10 records
- `tickets`: 5 records
- `ticket_assignments`: 4 records
- `ticket_comments`: 4 records
- `ticket_status_history`: 17 records
- `notifications`: 23 records
- `ticket_number_seq`: Current sequence value preserved at `16`.

---

## 2. Step-by-Step: How to Find Your Supabase Connection String

Follow these exact steps in the Supabase Dashboard:

1. **Log in or Open Project**: Go to [https://supabase.com/dashboard](https://supabase.com/dashboard) and select your project.
2. **Open Project Settings**: In the left sidebar navigation, click on the **Settings** gear icon (⚙️) at the bottom.
3. **Go to Database Settings**: Under Project Settings, click on **Database**.
4. **Locate Connection Strings**:
   - Scroll down to the section titled **Connection parameters** or **Connection string**.
   - Select the **URI** tab.
   - You will see two connection modes:
     - **Session mode (Port 5432)** or **Direct connection (Port 5432)** (Recommended for backend Node/Express servers):
       ```text
       postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[YOUR-REGION].pooler.supabase.com:5432/postgres
       ```
       or Direct:
       ```text
       postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
       ```
5. **Replace Password**:
   - Replace `[YOUR-PASSWORD]` with the database password you created when setting up the Supabase project.
   - If your password contains special characters (like `@`, `#`, `%`, `&`), ensure it is URL-encoded (e.g., `@` becomes `%40`).

---

## 3. How to Restore the Backup into Supabase

You can choose either of the following two methods:

### Option A: Using the Automated Script (1-step CLI)
Run the provided migration script from your terminal:
```bash
./backups/restore_to_supabase.sh "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```
*(The script will restore all schemas, sequences, and records, and then automatically verify the row count in Supabase).*

### Option B: Using Supabase Web Dashboard (SQL Editor)
1. Open your project on [Supabase Dashboard](https://supabase.com/dashboard).
2. In the left navigation, click on **SQL Editor** (the `>_` icon).
3. Click **+ New query**.
4. Open [`backups/backup_full.sql`](./backup_full.sql) in your text editor, copy the entire content, and paste it into the Supabase SQL Editor.
5. Click **Run** (or `Ctrl+Enter`).
6. All tables and existing records will be created in Supabase.

---

## 4. Update Your Backend Configuration

Once the data is restored to Supabase:
1. Open [`backend/.env`](../backend/.env).
2. Update the `DATABASE_URL` variable with your Supabase connection string:
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
   ```
3. Restart the backend server:
   ```bash
   cd backend
   npm run dev
   ```
4. Verify by browsing the system or visiting the Admin pages.
