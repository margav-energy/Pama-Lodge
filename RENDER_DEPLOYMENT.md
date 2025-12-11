# Render Deployment Guide

## Post-Deployment Setup

**Good News!** Superadmins are created automatically when you run migrations - no shell access needed!

### Automatic Superadmin Creation

The superadmins are created automatically via a data migration (`0010_create_superadmins.py`). When you deploy to Render, just make sure migrations run, and the superadmins will be created automatically.

### Render Start Command

In your Render service settings, set the **Start Command** to:

```bash
python manage.py migrate && gunicorn pama_lodge.wsgi:application
```

The `migrate` command will:

1. Apply all database migrations
2. **Automatically create the superadmin users** (via migration 0010)

That's it! No shell access needed. The superadmins will be created automatically.

### Alternative: Manual Creation (if needed)

If for some reason the migration doesn't run, you can also use the management command. Add this to your start command:

```bash
python manage.py migrate && python manage.py create_superadmins && gunicorn pama_lodge.wsgi:application
```

But this is usually not necessary since the migration handles it automatically.

## Superadmin Credentials

After migrations run, you can login with:

1. **Username**: `Paul_Ayitey`  
   **Password**: `admin123`

2. **Username**: `naa_okailey_ayitey`  
   **Password**: `123`

## Access Points

- **Django Admin**: `https://your-app.onrender.com/admin/`
- **Frontend**: `https://your-app.onrender.com/`
- **API**: `https://your-app.onrender.com/api/`

## Environment Variables on Render

Make sure to set these environment variables in your Render service:

- `SECRET_KEY` - Django secret key
- `DEBUG=False` - Set to False for production
- `DB_NAME` - PostgreSQL database name
- `DB_USER` - PostgreSQL username
- `DB_PASSWORD` - PostgreSQL password
- `DB_HOST` - PostgreSQL host (provided by Render)
- `DB_PORT` - PostgreSQL port (usually 5432)
- `ALLOWED_HOSTS` - Your Render domain (e.g., `your-app.onrender.com`)
- `CORS_ALLOWED_ORIGINS` - Your frontend URL

## Notes

- The migration is idempotent - it's safe to run multiple times
- If users already exist, it will update them to ensure they have correct permissions
- Migrations run automatically on every deployment if you include `python manage.py migrate` in your start command
