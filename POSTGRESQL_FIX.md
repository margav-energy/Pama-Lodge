# Quick Fix Guide for PostgreSQL Connection

## Solution 1: Connect using IPv4 (Easiest - No password needed!)

Since your IPv4 connection is set to "trust", you can connect without a password:

```bash
psql -U postgres -h 127.0.0.1
```

This forces PostgreSQL to use IPv4 (127.0.0.1) which has "trust" authentication, so no password is required!

## Solution 2: Change IPv6 to trust (Permanent fix)

If you want to connect without specifying the host, you can change the IPv6 line to "trust":

1. Edit `pg_hba.conf` (the file you just showed me)
2. Find this line:
   ```
   host    all             all             ::1/128                 scram-sha-256
   ```
3. Change it to:
   ```
   host    all             all             ::1/128                 trust
   ```
4. Save the file
5. Reload PostgreSQL configuration:
   - Open Services (`Win + R`, type `services.msc`)
   - Find PostgreSQL service
   - Right-click → Restart
   
   OR run this command:
   ```bash
   pg_ctl reload
   ```

After this, `psql -U postgres` will work without a password.

## Now Create the Database

Once connected (using Solution 1), run these commands:

```sql
CREATE DATABASE pama_lodge;
CREATE USER pama_user WITH PASSWORD 'YourPassword123';
GRANT ALL PRIVILEGES ON DATABASE pama_lodge TO pama_user;
\c pama_lodge
GRANT ALL ON SCHEMA public TO pama_user;
\q
```

## Update your .env file

Create `backend/.env`:
```env
SECRET_KEY=django-insecure-change-this-in-production-12345
DEBUG=True
DB_NAME=pama_lodge
DB_USER=pama_user
DB_PASSWORD=YourPassword123
DB_HOST=localhost
DB_PORT=5432
```

