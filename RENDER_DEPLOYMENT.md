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

## Part 2: Deploy Django Backend

### Step 1: Create Web Service

1. In Render Dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `margav-energy/Pama-Lodge`
3. Configure:
   - **Name**: `pama-lodge-backend`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: 
     ```bash
     pip install -r requirements.txt && python manage.py collectstatic --noinput
     ```
   - **Start Command**: 
     ```bash
     gunicorn pama_lodge.wsgi:application
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

**After Frontend is Deployed, Add:**
```
ALLOWED_HOSTS=pama-lodge-backend.onrender.com
CORS_ALLOWED_ORIGINS=https://pama-lodge-frontend.onrender.com
```

**Important Notes:**
- Use the **Internal Database URL** (not External) for `DATABASE_URL`
- You'll get the Internal URL from your PostgreSQL service → **Info** tab
- Update `CORS_ALLOWED_ORIGINS` after you know your frontend URL
- Update `ALLOWED_HOSTS` with your actual backend URL

### Step 3: Run Migrations

After deployment, run migrations:
1. Go to your backend service → **Shell**
2. Run:
   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   python manage.py create_rooms
   ```

## Part 3: Deploy React Frontend

### Option A: Static Site (Recommended)

1. In Render Dashboard, click **"New +"** → **"Static Site"**
2. Connect your GitHub repository: `margav-energy/Pama-Lodge`
3. Configure:
   - **Name**: `pama-lodge-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

### Update Frontend Environment Variables

**Important**: After your backend is deployed, get its URL (e.g., `https://pama-lodge-backend.onrender.com`)

In Render Static Site settings → **Environment**, add:

```
VITE_API_URL=https://pama-lodge-backend.onrender.com
```

(Replace with your actual backend URL - it will be something like `https://pama-lodge-backend.onrender.com`)

**Note**: You'll need to redeploy the frontend after adding this environment variable for it to take effect.

### Option B: Using render.yaml (Alternative)

If you prefer, you can use the `render.yaml` file included in the repository. However, Render's static sites are best configured through the dashboard. The `render.yaml` file is mainly useful for the backend service.

## Quick Deployment Steps Summary

1. **Create PostgreSQL Database** on Render
2. **Create Backend Web Service**:
   - Root Directory: `backend`
   - Build: `pip install -r requirements.txt && python manage.py collectstatic --noinput`
   - Start: `gunicorn pama_lodge.wsgi:application`
   - Set environment variables (see below)
3. **Create Frontend Static Site**:
   - Root Directory: `frontend`
   - Build: `npm install && npm run build`
   - Publish: `dist`
   - Set `VITE_API_URL` environment variable
4. **Run migrations** via backend Shell
5. **Update CORS** in backend environment variables with frontend URL

## Part 4: Post-Deployment Checklist

1. ✅ Backend deployed and accessible
2. ✅ Database migrations run
3. ✅ Superuser created
4. ✅ Rooms created (`python manage.py create_rooms`)
5. ✅ Frontend deployed and accessible
6. ✅ Frontend can connect to backend API
7. ✅ CORS configured correctly
8. ✅ Environment variables set

## Troubleshooting

### Backend Issues

- **Static files not loading**: Ensure `collectstatic` runs in build command
- **Database connection errors**: Check `DATABASE_URL` is correct (use Internal URL)
- **CORS errors**: Verify `CORS_ALLOWED_ORIGINS` includes your frontend URL

### Frontend Issues

- **API calls failing**: Check `VITE_API_URL` environment variable
- **Build fails**: Check Node version compatibility
- **404 errors**: Verify `Publish Directory` is `dist`

## Environment Variables Reference

### Backend (in Render Dashboard)
```
SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=your-backend-url.onrender.com
DATABASE_URL=postgresql://user:password@host:port/dbname
CORS_ALLOWED_ORIGINS=https://your-frontend-url.onrender.com
```

### Frontend (in Render Dashboard)
```
VITE_API_URL=https://your-backend-url.onrender.com
```

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

