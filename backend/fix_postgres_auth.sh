#!/bin/bash
# Fix PostgreSQL Authentication - Run with sudo
# This script modifies pg_hba.conf to use trust authentication

PG_HBA_FILE="/Library/PostgreSQL/16/data/pg_hba.conf"
BACKUP_FILE="/Library/PostgreSQL/16/data/pg_hba.conf.backup.$(date +%Y%m%d_%H%M%S)"

echo "=========================================="
echo "PostgreSQL Authentication Fix"
echo "=========================================="
echo ""
echo "This script will:"
echo "1. Backup your current pg_hba.conf"
echo "2. Modify it to use 'trust' authentication for local connections"
echo "3. Reload PostgreSQL configuration"
echo ""
echo "File location: $PG_HBA_FILE"
echo ""

# Check if file exists
if [ ! -f "$PG_HBA_FILE" ]; then
    echo "ERROR: Cannot find pg_hba.conf at $PG_HBA_FILE"
    exit 1
fi

# Backup the file
echo "Creating backup..."
sudo cp "$PG_HBA_FILE" "$BACKUP_FILE"
echo "Backup created: $BACKUP_FILE"
echo ""

# Show current settings
echo "Current authentication settings:"
sudo grep -E "^local|^host" "$PG_HBA_FILE" | grep -v "^#" | head -10
echo ""

# Modify the file - change scram-sha-256 and md5 to trust for local connections
echo "Modifying pg_hba.conf..."
sudo sed -i '' 's/^\(local[[:space:]]*all[[:space:]]*all[[:space:]]*\)scram-sha-256/\1trust/' "$PG_HBA_FILE"
sudo sed -i '' 's/^\(local[[:space:]]*all[[:space:]]*all[[:space:]]*\)md5/\1trust/' "$PG_HBA_FILE"
sudo sed -i '' 's/^\(host[[:space:]]*all[[:space:]]*all[[:space:]]*127\.0\.0\.1\/32[[:space:]]*\)scram-sha-256/\1trust/' "$PG_HBA_FILE"
sudo sed -i '' 's/^\(host[[:space:]]*all[[:space:]]*all[[:space:]]*127\.0\.0\.1\/32[[:space:]]*\)md5/\1trust/' "$PG_HBA_FILE"
sudo sed -i '' 's/^\(host[[:space:]]*all[[:space:]]*all[[:space:]]*::1\/128[[:space:]]*\)scram-sha-256/\1trust/' "$PG_HBA_FILE"
sudo sed -i '' 's/^\(host[[:space:]]*all[[:space:]]*all[[:space:]]*::1\/128[[:space:]]*\)md5/\1trust/' "$PG_HBA_FILE"

echo "Modified settings:"
sudo grep -E "^local|^host" "$PG_HBA_FILE" | grep -v "^#" | head -10
echo ""

# Reload PostgreSQL
echo "Reloading PostgreSQL configuration..."
sudo -u postgres /Library/PostgreSQL/16/bin/pg_ctl -D /Library/PostgreSQL/16/data reload 2>&1 || echo "Note: Reload may require manual restart"

echo ""
echo "=========================================="
echo "Done!"
echo "=========================================="
echo ""
echo "Now try connecting without a password:"
echo "  psql -U postgres -d postgres"
echo ""
echo "If it still asks for a password, you may need to restart PostgreSQL:"
echo "  sudo launchctl unload /Library/LaunchDaemons/com.edb.postgresql-16.plist"
echo "  sudo launchctl load /Library/LaunchDaemons/com.edb.postgresql-16.plist"
echo ""

