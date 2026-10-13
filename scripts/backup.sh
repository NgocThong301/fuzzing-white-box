#!/bin/bash
#
# Database Backup Script
# Usage: ./scripts/backup.sh
#

set -e

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
DATE=$(date +%Y%m%d_%H%M%S)
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
CONTAINER_NAME="${CONTAINER_NAME:-textbook-postgres}"
DB_NAME="${POSTGRES_DB:-textbook_marketplace}"
DB_USER="${POSTGRES_USER:-textbook}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Main backup
log_info "Starting database backup..."
log_info "Timestamp: $TIMESTAMP"

BACKUP_FILE="$BACKUP_DIR/backup_${DATE}.sql"

# Perform backup
if docker compose exec -T "$CONTAINER_NAME" pg_dump -U "$DB_USER" -d "$DB_NAME" > "$BACKUP_FILE" 2>/dev/null; then
    FILESIZE=$(stat -f%z "$BACKUP_FILE" 2>/dev/null || stat -c%s "$BACKUP_FILE" 2>/dev/null)
    log_info "Backup completed successfully!"
    log_info "File: $BACKUP_FILE"
    log_info "Size: $FILESIZE bytes"
    
    # Compress backup
    gzip "$BACKUP_FILE"
    log_info "Compressed to: ${BACKUP_FILE}.gz"
    
    # Create metadata file
    echo "Backup created at: $TIMESTAMP" > "${BACKUP_FILE}.gz.meta"
    echo "Database: $DB_NAME" >> "${BACKUP_FILE}.gz.meta"
    echo "Size: $FILESIZE bytes" >> "${BACKUP_FILE}.gz.meta"
    
    # Cleanup old backups
    find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
    log_info "Cleaned up backups older than $RETENTION_DAYS days"
else
    log_error "Backup failed!"
    exit 1
fi

log_info "Backup script completed successfully!"
