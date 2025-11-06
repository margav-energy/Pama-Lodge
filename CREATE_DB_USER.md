# Create PostgreSQL User and Database

## Step 1: Connect to PostgreSQL

Run this command:
```bash
psql -U postgres -h 127.0.0.1
```

## Step 2: Create User and Database

Once connected (you'll see `postgres=#`), run these commands:

```sql
-- Create the database
CREATE DATABASE pama_lodge;

-- Create a user with password
CREATE USER pama_user WITH PASSWORD 'pama123';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE pama_lodge TO pama_user;

-- Connect to the database
\c pama_lodge

-- Grant schema privileges (important for PostgreSQL 15+)
GRANT ALL ON SCHEMA public TO pama_user;

-- Exit
\q
```

## Step 3: Update .env file

After creating the user, update `backend/.env`:
- DB_USER=pama_user
- DB_PASSWORD=pama123

## Alternative: Use postgres user

If you prefer to use the default postgres user, you need to set a password for it:

```sql
ALTER USER postgres WITH PASSWORD 'postgres123';
```

Then update `.env`:
- DB_USER=postgres
- DB_PASSWORD=postgres123

