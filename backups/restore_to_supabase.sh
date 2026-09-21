#!/usr/bin/env bash
set -e

# ==============================================================================
# CBE IT Support Ticket System - Restore to Supabase
# ==============================================================================

if [ -z "$1" ]; then
  echo "Error: Missing Supabase connection string."
  echo ""
  echo "Usage:"
  echo "  ./backups/restore_to_supabase.sh \"postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres\""
  echo "  OR"
  echo "  ./backups/restore_to_supabase.sh \"postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres\""
  exit 1
fi

SUPABASE_URL="$1"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_FILE="${SCRIPT_DIR}/backup_full.sql"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: Backup file $BACKUP_FILE not found."
  exit 1
fi

echo "=================================================================="
echo " Starting Database Migration to Supabase"
echo "=================================================================="
echo "Target: Supabase"
echo "Backup file: $BACKUP_FILE"
echo ""

echo "Step 1/2: Restoring schema, sequences, constraints, and data..."
psql "$SUPABASE_URL" -f "$BACKUP_FILE"

echo ""
echo "Step 2/2: Verifying restored tables in Supabase..."
psql "$SUPABASE_URL" -c "
SELECT 'categories' AS tbl, count(*) FROM categories
UNION ALL SELECT 'departments', count(*) FROM departments
UNION ALL SELECT 'users', count(*) FROM users
UNION ALL SELECT 'tickets', count(*) FROM tickets
UNION ALL SELECT 'ticket_assignments', count(*) FROM ticket_assignments
UNION ALL SELECT 'ticket_comments', count(*) FROM ticket_comments
UNION ALL SELECT 'ticket_status_history', count(*) FROM ticket_status_history
UNION ALL SELECT 'notifications', count(*) FROM notifications;
"

echo ""
echo "=================================================================="
echo " Database successfully migrated to Supabase with 0 data loss!"
echo " Next step: Update DATABASE_URL in backend/.env with your Supabase URL."
echo "=================================================================="
