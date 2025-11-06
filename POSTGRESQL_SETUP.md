# PostgreSQL Setup Guide for Pama Lodge

## Step 1: Install PostgreSQL (if not already installed)

### Windows:
1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer
3. During installation, remember the password you set for the `postgres` superuser
4. Make sure to install pgAdmin (optional but helpful GUI tool)

### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

### Mac:
```bash
brew install postgresql
brew services start postgresql
```

## Step 2: Access PostgreSQL

### Windows:
- Open "SQL Shell (psql)" from Start Menu, or
- Open Command Prompt and navigate to PostgreSQL bin directory:
  ```
  cd "C:\Program Files\PostgreSQL\15\bin"
  psql -U postgres
  ```
  (Replace 15 with your PostgreSQL version number)

### Linux/Mac:
```bash
sudo -u postgres psql
```

## Step 3: Create Database and User

Once you're in the PostgreSQL prompt (psql), run these commands:

```sql
-- Create a new database for Pama Lodge
CREATE DATABASE pama_lodge;

-- Create a new user (you can name it anything, e.g., 'pama_user' or use 'postgres')
-- Option 1: Create a dedicated user (RECOMMENDED)
CREATE USER pama_user WITH PASSWORD 'your_secure_password_here';

-- Grant privileges to the user
GRANT ALL PRIVILEGES ON DATABASE pama_lodge TO pama_user;

-- Connect to the database
\c pama_lodge

-- Grant schema privileges (PostgreSQL 15+)
GRANT ALL ON SCHEMA public TO pama_user;

-- Exit psql
\q
```

### Alternative: Use the default postgres user

If you prefer to use the default `postgres` user (simpler but less secure):

```sql
-- Just create the database
CREATE DATABASE pama_lodge;

-- Exit
\q
```

## Step 4: Update .env File

After creating the database and user, create or update your `backend/.env` file:

### If you created a dedicated user:
```env
SECRET_KEY=your-secret-key-here-change-this-in-production
DEBUG=True
DB_NAME=pama_lodge
DB_USER=pama_user
DB_PASSWORD=your_secure_password_here
DB_HOST=localhost
DB_PORT=5432
```

### If using default postgres user:
```env
SECRET_KEY=your-secret-key-here-change-this-in-production
DEBUG=True
DB_NAME=pama_lodge
DB_USER=postgres
DB_PASSWORD=the_password_you_set_during_installation
DB_HOST=localhost
DB_PORT=5432
```

## Step 5: Test Connection

Test if Django can connect to the database:

```bash
cd backend
python manage.py dbshell
```

If it connects successfully, you'll see the PostgreSQL prompt. Type `\q` to exit.

## Visual Guide (Windows)

1. **Open SQL Shell (psql)** from Start Menu
2. Press Enter for Server [localhost]
3. Press Enter for Database [postgres]
4. Press Enter for Port [5432]
5. Enter your postgres user password
6. You should see: `postgres=#`
7. Type the SQL commands from Step 3 above
8. After each command, press Enter

## Troubleshooting

### "password authentication failed"
- Double-check the password in `.env` matches the PostgreSQL user password
- Make sure there are no extra spaces in the `.env` file
- Try resetting the password:
  ```sql
  ALTER USER pama_user WITH PASSWORD 'new_password';
  ```

### "database does not exist"
- Make sure you created the database: `CREATE DATABASE pama_lodge;`
- Check the database name in `.env` matches exactly (case-sensitive)
- List databases to verify: `\l` in psql

### "connection refused" or "could not connect"
- Make sure PostgreSQL service is running:
  - **Windows**: 
    - Press `Win + R`, type `services.msc`
    - Look for "postgresql-x64-XX" service
    - Right-click and select "Start" if stopped
  - **Linux**: `sudo systemctl status postgresql`
  - **Mac**: `brew services list`
- Check if PostgreSQL is listening on port 5432

### "permission denied"
- Make sure you granted privileges: `GRANT ALL PRIVILEGES ON DATABASE pama_lodge TO your_user;`
- For PostgreSQL 15+, also grant schema privileges:
  ```sql
  \c pama_lodge
  GRANT ALL ON SCHEMA public TO pama_user;
  ```

### "role does not exist"
- Make sure you created the user: `CREATE USER pama_user WITH PASSWORD 'password';`
- List users to verify: `\du` in psql

## Quick Reference Commands

### Start PostgreSQL service:
- **Windows**: Start the service from Services panel (services.msc)
- **Linux**: `sudo systemctl start postgresql`
- **Mac**: `brew services start postgresql`

### Connect to PostgreSQL:
```bash
# Using default postgres user
psql -U postgres

# Using custom user
psql -U pama_user -d pama_lodge
```

### Useful psql commands:
```sql
\l          -- List all databases
\du         -- List all users
\c dbname   -- Connect to a database
\dt         -- List tables in current database
\q          -- Quit psql
```

### Change user password:
```sql
ALTER USER pama_user WITH PASSWORD 'new_password';
```

### Delete database (if you need to start over):
```sql
DROP DATABASE pama_lodge;
```

### Delete user (if you need to start over):
```sql
DROP USER pama_user;
```

## Example Session

Here's what a complete setup session looks like:

```
C:\Users\User> psql -U postgres
Password for user postgres: ********

postgres=# CREATE DATABASE pama_lodge;
CREATE DATABASE

postgres=# CREATE USER pama_user WITH PASSWORD 'MyPassword123';
CREATE ROLE

postgres=# GRANT ALL PRIVILEGES ON DATABASE pama_lodge TO pama_user;
GRANT

postgres=# \c pama_lodge
You are now connected to database "pama_lodge" as user "postgres".

pama_lodge=# GRANT ALL ON SCHEMA public TO pama_user;
GRANT

pama_lodge=# \q
```

Then create `backend/.env`:
```env
DB_NAME=pama_lodge
DB_USER=pama_user
DB_PASSWORD=MyPassword123
DB_HOST=localhost
DB_PORT=5432
```

