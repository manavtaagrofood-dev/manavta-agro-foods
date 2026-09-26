$ErrorActionPreference='Stop'
if (-not $env:MONGODB_URI) { throw 'Set MONGODB_URI before running the backup' }
$root = if ($env:BACKUP_ROOT) { $env:BACKUP_ROOT } else { '.\backups' }
New-Item -ItemType Directory -Force -Path $root | Out-Null
$stamp=(Get-Date).ToUniversalTime().ToString('yyyyMMddTHHmmssZ')
$out=Join-Path $root "manavta-$stamp.archive.gz"
mongodump --uri="$env:MONGODB_URI" --archive="$out" --gzip
Write-Output "Backup complete: $out"
