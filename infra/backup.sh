#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -ne 2 ]; then
  echo 'Usage: backup.sh /absolute/path/production.env /absolute/path/backups' >&2
  exit 2
fi

repo_dir="$(cd "$(dirname "$0")/.." && pwd -P)"
env_file="$1"
mkdir -p "$2"
backup_dir="$(cd "$2" && pwd -P)"
umask 077
backup_base="$backup_dir/konterkuota_$(date -u +%Y%m%dT%H%M%SZ)"
backup_file="${backup_base}.dump"
temp_file="${backup_file}.tmp"
uploads_file="${backup_base}.uploads.tar"
uploads_temp="${uploads_file}.tmp"
test ! -e "$backup_file"
test ! -e "$temp_file"
test ! -e "$uploads_file"
test ! -e "$uploads_temp"
trap 'rm -f "$temp_file" "$uploads_temp"' EXIT

docker compose --env-file "$env_file" -f "$repo_dir/infra/compose.production.yaml" \
  exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > "$temp_file"
test -s "$temp_file"
docker run --rm -v "$backup_dir:/backups:ro" postgres:17-alpine \
  pg_restore --list "/backups/$(basename "$temp_file")" > /dev/null
docker compose --env-file "$env_file" -f "$repo_dir/infra/compose.production.yaml" \
  exec -T backend tar -C /app/uploads -cf - . > "$uploads_temp"
test -s "$uploads_temp"
tar -tf "$uploads_temp" > /dev/null
mv "$temp_file" "$backup_file"
mv "$uploads_temp" "$uploads_file"
echo "Backup valid: $backup_file dan $uploads_file"
