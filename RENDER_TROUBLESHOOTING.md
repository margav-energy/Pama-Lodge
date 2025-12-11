# Render Deployment Troubleshooting

## 500 Error on Login Endpoint

If you're getting a 500 error on `/api/auth/login/`, check the following:

### 1. Check Render Logs

Go to your Render dashboard → Your service → Logs tab to see the actual error message.

### 2. Common Issues and Fixes

#### Issue: Database Not Migrated
**Solution**: Make sure migrations run in your start command:
```bash
python manage.py migrate && gunicorn pama_lodge.wsgi:application
```

#### Issue: Users Don't Exist
**Solution**: The migration `0010_create_superadmins` should create them automatically. If not, check:
- Are migrations running? Check logs for migration errors
- Run manually: `python manage.py create_superadmins` (if you have shell access)

#### Issue: Database Connection
**Solution**: Verify environment variables are set:
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `DB_HOST`
- `DB_PORT`

Or if using `DATABASE_URL`:
- `DATABASE_URL` (provided by Render PostgreSQL)

#### Issue: CORS Errors
**Solution**: Make sure `CORS_ALLOWED_ORIGINS` includes your frontend URL:
```
CORS_ALLOWED_ORIGINS=https://pama-lodge.onrender.com,https://your-frontend-url.onrender.com
```

#### Issue: ALLOWED_HOSTS
**Solution**: Make sure `ALLOWED_HOSTS` includes your Render domain:
```
ALLOWED_HOSTS=pama-lodge.onrender.com,your-domain.onrender.com
```

### 3. Test Login Endpoint

You can test the login endpoint directly:
```bash
curl -X POST https://pama-lodge.onrender.com/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"Paul_Ayitey","password":"admin123"}'
```

### 4. Verify Superadmins Exist

Check if superadmins were created by accessing Django admin:
- Go to: `https://pama-lodge.onrender.com/admin/`
- Try logging in with:
  - Username: `Paul_Ayitey` | Password: `admin123`
  - Username: `naa_okailey_ayitey` | Password: `123`

If admin login works but API doesn't, the issue is with the JWT serializer.

### 5. Check Environment Variables

Make sure these are set in Render:
- `SECRET_KEY` - Required!
- `DEBUG=False` - For production
- `ALLOWED_HOSTS` - Your Render domain
- Database credentials (DB_NAME, DB_USER, etc. OR DATABASE_URL)
- `CORS_ALLOWED_ORIGINS` - Your frontend URL

### 6. View Detailed Error

If DEBUG is enabled temporarily, you'll see the full error. But for production:
- Check Render logs
- Check Django logs if configured
- The error should show in the Render service logs

## Quick Fix Checklist

- [ ] Migrations have run (`python manage.py migrate`)
- [ ] Superadmins exist (check admin panel)
- [ ] Database connection works
- [ ] ALLOWED_HOSTS includes your domain
- [ ] CORS_ALLOWED_ORIGINS includes your frontend URL
- [ ] SECRET_KEY is set
- [ ] DEBUG=False for production

