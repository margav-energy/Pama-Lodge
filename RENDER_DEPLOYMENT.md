# Deploying Pama Lodge on Render

This guide will help you deploy both the Django backend and React frontend on Render.

## Prerequisites

1. A GitHub account with your repository pushed
2. A Render account (sign up at https://render.com)
3. PostgreSQL database (Render provides managed PostgreSQL)

## Part 1: Deploy PostgreSQL Database

1. Go to your Render Dashboard
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `pama-lodge-db`
   - **Database**: `pama_lodge`
   - **User**: (auto-generated)
   - **Region**: Choose closest to your users
   - **PostgreSQL Version**: 15 or latest
   - **Plan**: Free tier (or paid for production)
4. Click **"Create Database"**
5. **Important**: Copy the **Internal Database URL** - you'll need this for your backend

## Part 2: Deploy Django Backend (with Frontend)

The frontend is now built and served from the Django backend. This means you only need to deploy one service.

### Step 1: Create Web Service

1. In Render Dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `margav-energy/Pama-Lodge`
3. Configure:
   - **Name**: `pama-lodge`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: (leave empty - root of repository)
   - **Runtime**: `Python 3.12` (important: use Python 3.12, not 3.13, for psycopg2 compatibility)
   - **Build Command**: 
     ```bash
     cd frontend && npm install && npm run build && cd .. && cd backend && pip install -r requirements.txt && python manage.py collectstatic --noinput
     ```
   - **Start Command**: 
     ```bash
     cd backend && gunicorn pama_lodge.wsgi:application
     ```

### Step 2: Add Environment Variables

In the **Environment** section, add these variables:

**Required Variables:**
```
SECRET_KEY=your-secret-key-here-generate-a-random-one
DEBUG=False
DATABASE_URL=<Internal Database URL from PostgreSQL service>
```

**To generate SECRET_KEY:**
```python
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

**After Deployment, Add:**
```
ALLOWED_HOSTS=pama-lodge.onrender.com
```

**Important Notes:**
- Use the **Internal Database URL** (not External) for `DATABASE_URL`
- You'll get the Internal URL from your PostgreSQL service → **Info** tab
- Update `ALLOWED_HOSTS` with your actual service URL (e.g., `pama-lodge.onrender.com`)
- Since frontend is served from the same domain, CORS is not needed

### Step 3: Run Migrations

After deployment, run migrations:
1. Go to your backend service → **Shell**
2. Run:
   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   python manage.py create_rooms
   ```

## Part 3: Frontend is Built from Backend

**Note**: The frontend is now built and served from the Django backend. You don't need a separate frontend service. The build command in Step 1 handles building the React app, and Django serves it automatically.

The frontend will be accessible at the same URL as your backend (e.g., `https://pama-lodge.onrender.com`), and the API will be at `https://pama-lodge.onrender.com/api/`.

## Quick Deployment Steps Summary

1. **Create PostgreSQL Database** on Render
2. **Create Web Service** (serves both backend and frontend):
   - Root Directory: (empty - root of repo)
   - Build: `cd frontend && npm install && npm run build && cd .. && cd backend && pip install -r requirements.txt && python manage.py collectstatic --noinput`
   - Start: `cd backend && gunicorn pama_lodge.wsgi:application`
   - Set environment variables (see below)
3. **Run migrations** via service Shell
4. **Access your app** at the service URL (frontend and API on same domain)

## Part 4: Post-Deployment Checklist

1. ✅ Service deployed and accessible
2. ✅ Database migrations run
3. ✅ Superuser created
4. ✅ Rooms created (`python manage.py create_rooms`)
5. ✅ Frontend accessible at service URL
6. ✅ API accessible at `/api/` endpoint
7. ✅ Environment variables set

## Troubleshooting

### Service Issues

- **Static files not loading**: Ensure `collectstatic` runs in build command
- **Database connection errors**: Check `DATABASE_URL` is correct (use Internal URL)
- **Frontend not loading**: Verify frontend build completed successfully in build logs
- **404 errors on routes**: Ensure the catch-all route in `urls.py` is working
- **Build fails**: Check Node version compatibility (Render should auto-detect)

## Environment Variables Reference

### Service (in Render Dashboard)
```
SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=your-service-url.onrender.com
DATABASE_URL=postgresql://user:password@host:port/dbname
```

**Note**: Since frontend and backend are on the same domain, no CORS configuration is needed.

## Custom Domains

1. Go to your service → **Settings** → **Custom Domains**
2. Add your domain
3. Update DNS records as instructed
4. Update `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS` accordingly

## Monitoring

- Check **Logs** tab for errors
- Monitor **Metrics** for performance
- Set up **Health Checks** if needed

## Cost Estimate

- **Free Tier**: 
  - PostgreSQL: 90 days free trial
  - Web Services: Free tier available (spins down after inactivity)
  - Static Sites: Free
  
- **Paid Plans**: Start at $7/month per service for always-on hosting

