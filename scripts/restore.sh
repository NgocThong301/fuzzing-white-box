#!/bin/bash
#
# Database Restore Script
# Usage: ./scripts/restore.sh backup_file.sql.gz
#

set -e

if [ -z "$1" ]; then
    echo "Usage: $0 <backup_file.sql.gz>"
    echo "Available backups:"
    ls -la ./backups/backup_*.sql.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE="$1"
CONTAINER_NAME="${CONTAINER_NAME:-textbook-postgres}"
DB_NAME="${POSTGRES_DB:-textbook_marketplace}"
DB_USER="${POSTGRES_USER:-textbook}"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "⚠️  WARNING: This will overwrite the current database!"
echo "Database: $DB_NAME"
read -p "Continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

echo "Restoring database..."

if [[ "$BACKUP_FILE" == *.gz ]]; then
    gunzip -c "$BACKUP_FILE" | docker compose exec -T "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME"
else
    cat "$BACKUP_FILE" | docker compose exec -T "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME"
fi

echo "✅ Restore completed successfully!"
