#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -ne 2 ]; then
  echo 'Usage: verify-restore.sh /absolute/path/production.env /absolute/path/backup.dump' >&2
  exit 2
fi

repo_dir="$(cd "$(dirname "$0")/.." && pwd -P)"
env_file="$1"
backup_file="$2"
test -s "$backup_file"
restore_db="konterkuota_restore_check_$(date -u +%s)"

dc() {
  docker compose --env-file "$env_file" -f "$repo_dir/infra/compose.production.yaml" "$@"
}

dc exec -T -e RESTORE_DB="$restore_db" db \
  sh -c 'createdb -U "$POSTGRES_USER" "$RESTORE_DB"'

cleanup() {
  dc exec -T -e RESTORE_DB="$restore_db" db \
    sh -c 'dropdb --if-exists --force -U "$POSTGRES_USER" "$RESTORE_DB"' > /dev/null
}
trap cleanup EXIT

dc exec -T -e RESTORE_DB="$restore_db" db \
  sh -c 'pg_restore -U "$POSTGRES_USER" -d "$RESTORE_DB" --no-owner --no-privileges --exit-on-error' \
  < "$backup_file"

fk_count="$(dc exec -T -e RESTORE_DB="$restore_db" db \
  sh -c 'psql -U "$POSTGRES_USER" -d "$RESTORE_DB" -At -c "SELECT count(*) FROM pg_constraint WHERE contype = '\''f'\''"' \
  | tr -d '\r')"
test "$fk_count" -gt 0
echo "Restore uji berhasil; $fk_count relasi foreign key tersedia."
