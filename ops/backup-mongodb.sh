#!/usr/bin/env bash
set -euo pipefail
: "${MONGODB_URI:?Set MONGODB_URI before running the backup}"
BACKUP_ROOT="${BACKUP_ROOT:-./backups}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$BACKUP_ROOT"
mongodump --uri="$MONGODB_URI" --archive="$BACKUP_ROOT/manavta-$STAMP.archive.gz" --gzip
find "$BACKUP_ROOT" -type f -name 'manavta-*.archive.gz' -mtime +14 -delete
printf 'Backup complete: %s\n' "$BACKUP_ROOT/manavta-$STAMP.archive.gz"
