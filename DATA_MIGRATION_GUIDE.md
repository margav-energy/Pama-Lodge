# Data Migration Guide: Localhost to Render

This guide explains how to migrate your data from your localhost database to Render production database.

## Method 1: Export from Localhost and Import via DATABASE_URL (Recommended)

### Step 1: Export Data from Localhost

Run these commands in your local backend directory:

```bash
cd backend

# Export all data (users, bookings, rooms, etc.)
python manage.py dumpdata bookings.User bookings.Room bookings.Booking bookings.BookingVersion bookings.RoomIssue --indent 2 -o bookings/fixtures/all_data.json

# Or export separately:
python manage.py dumpdata bookings.User --indent 2 -o bookings/fixtures/users.json
python manage.py dumpdata bookings.Room --indent 2 -o bookings/fixtures/rooms.json
python manage.py dumpdata bookings.Booking --indent 2 -o bookings/fixtures/bookings.json
python manage.py dumpdata bookings.BookingVersion --indent 2 -o bookings/fixtures/booking_versions.json
python manage.py dumpdata bookings.RoomIssue --indent 2 -o bookings/fixtures/room_issues.json
```

### Step 2: Get Your Render Database URL

1. Go to your Render dashboard
2. Select your PostgreSQL database service
3. Go to the "Connections" tab
4. Copy the "Internal Database URL" or "External Database URL"

### Step 3: Connect to Render Database from Localhost

Set the DATABASE_URL environment variable to point to Render's database:

**Windows (PowerShell):**
```powershell
$env:DATABASE_URL="postgresql://user:password@host:port/database"
python manage.py migrate
python manage.py loaddata bookings/fixtures/all_data.json
```

**Windows (Command Prompt):**
```cmd
set DATABASE_URL=postgresql://user:password@host:port/database
python manage.py migrate
python manage.py loaddata bookings/fixtures/all_data.json
```

**Mac/Linux:**
```bash
export DATABASE_URL="postgresql://user:password@host:port/database"
python manage.py migrate
python manage.py loaddata bookings/fixtures/all_data.json
```

Replace the connection string with your actual Render database URL.

### Step 4: Import Data

Once connected, import your data:

```bash
# Import all data
python manage.py loaddata bookings/fixtures/all_data.json

# Or import individually
python manage.py loaddata bookings/fixtures/users.json
python manage.py loaddata bookings/fixtures/rooms.json
python manage.py loaddata bookings/fixtures/bookings.json
```

## Method 2: Using Fixture Files in Repository (For Initial Data)

If you want to include initial data in your repository:

### Step 1: Export Data to Fixtures

```bash
cd backend
python manage.py dumpdata bookings.User bookings.Room --indent 2 -o bookings/fixtures/initial_data.json
```

### Step 2: Commit Fixture Files

```bash
git add bookings/fixtures/initial_data.json
git commit -m "Add initial data fixtures"
git push
```

### Step 3: Import on Render (via Build Command)

Add to your `render.yaml` build command (after migrations):

```yaml
buildCommand: |
  cd frontend && npm install && npm run build && cd ..
  cd backend && pip install --upgrade pip
  cd backend && pip install -r requirements.txt
  cd backend && python manage.py migrate
  cd backend && python manage.py import_initial_data || true
  cd backend && python manage.py collectstatic --noinput
```

The `|| true` ensures the build doesn't fail if data already exists.

## Method 3: Manual Database Connection (Using pgAdmin or DBeaver)

1. Install a PostgreSQL client (pgAdmin, DBeaver, or psql)
2. Get your Render database connection details from Render dashboard
3. Connect to the database
4. Export data from localhost using your client
5. Import data into Render database using your client

## Important Notes

⚠️ **Warning:**
- Always backup your Render database before importing data
- Be careful with user passwords - they should be hashed correctly
- Booking IDs might conflict if you're importing existing bookings
- Consider resetting auto-increment sequences if needed

## Troubleshooting

### Primary Key Conflicts
If you get primary key conflicts, you may need to reset sequences:

```python
# Run this in Django shell or as a management command
from django.db import connection
from django.core.management.color import no_style

style = no_style()
sequence_sql = connection.ops.sequence_reset_sql(style, [])
with connection.cursor() as cursor:
    for sql in sequence_sql:
        cursor.execute(sql)
```

### User Password Issues
If users can't log in after migration, you may need to reset passwords or ensure password hashing is correct. Django's User model should handle this automatically, but check if custom password fields exist.

### Foreign Key Constraints
If you're importing related data (e.g., bookings that reference users and rooms), make sure to import in the correct order:
1. Users
2. Rooms  
3. Bookings
4. BookingVersions
5. RoomIssues

## Quick Start (Recommended Method)

1. **Export from localhost:**
   ```bash
   cd backend
   python manage.py dumpdata bookings --indent 2 -o bookings/fixtures/all_data.json
   ```

2. **Get Render database URL** from Render dashboard

3. **Connect and import:**
   ```bash
   # Set DATABASE_URL (use your actual Render database URL)
   set DATABASE_URL=postgresql://...
   python manage.py migrate
   python manage.py loaddata bookings/fixtures/all_data.json
   ```

4. **Verify** by logging into your Render application

