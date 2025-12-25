# Neon PostgreSQL Setup Guide

This guide will help you switch from Render PostgreSQL to Neon PostgreSQL.

## Step 1: Create a Neon Account and Database

1. Go to [neon.tech](https://neon.tech) and sign up for a free account
2. Click **"Create Project"** or **"New Project"**
3. Choose a project name (e.g., "pama-lodge")
4. Select a region (choose one close to your Render service region for better performance)
5. Select PostgreSQL version (use the latest stable version, e.g., 16)
6. Click **"Create Project"**

## Step 2: Get Your Connection String

After creating your project:

1. You'll be taken to the Neon dashboard
2. Click on your project
3. Look for the **"Connection Details"** section or **"Connection String"**
4. You'll see a connection string that looks like:
   ```
   postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```
5. **Copy the entire connection string** - you'll need this for Render

### Alternative: Build Connection String Manually

If Neon doesn't show the full connection string, you can build it from the connection details:

```
postgresql://[user]:[password]@[host]/[dbname]?sslmode=require
```

- **user**: Your database user (usually `neondb_owner` or similar)
- **password**: Your database password (you set this during project creation)
- **host**: Something like `ep-xxx-xxx.region.aws.neon.tech`
- **dbname**: Your database name (usually `neondb` or your project name)

## Step 3: Configure Render

1. Go to your [Render Dashboard](https://dashboard.render.com)
2. Click on your **pama-lodge** service
3. Go to **"Environment"** tab (or **"Environment Variables"**)
4. Find the **DATABASE_URL** variable
5. Click **"Edit"** or **"Add"** if it doesn't exist
6. Paste your Neon connection string as the value
7. Click **"Save Changes"**
8. Render will automatically redeploy your service

## Step 4: Verify the Connection

After Render redeploys:

1. Go to your service logs in Render
2. Check for successful migration messages
3. You should see messages like:
   - `Operations to perform:`
   - `Running migrations:`
   - `Creating superadmin users...`
   - `✓ Paul_Ayitey created/updated successfully`
   - `✓ naa_okailey_ayitey created/updated successfully`

## Step 5: Test Your Application

1. Visit your Render URL (e.g., `https://pama-lodge.onrender.com`)
2. Try logging in with the superadmin credentials:
   - Username: `Paul_Ayitey`
   - Password: `admin123`
3. If login works, your Neon database is properly configured!

## Optional: Delete Render PostgreSQL Service

Once you've confirmed everything works with Neon:

1. Go to your Render Dashboard
2. Find the **pama-lodge-db** PostgreSQL service
3. Click on it and go to **"Settings"**
4. Scroll down and click **"Delete"** or **"Destroy"**
5. This will free up your Render resources (no longer needed)

⚠️ **Warning**: Only delete the Render PostgreSQL service **after** confirming Neon is working and you've backed up any important data!

## Local Development with Neon (Optional)

You can also use Neon for local development:

1. Create a `.env` file in the `backend/` directory (if you don't have one)
2. Add your Neon connection string:
   ```env
   DATABASE_URL=postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
   SECRET_KEY=your-local-secret-key
   DEBUG=True
   ```
3. Your Django app will automatically use `DATABASE_URL` if it's set

## Troubleshooting

### Connection Errors

If you see connection errors:
- Verify the `DATABASE_URL` in Render dashboard is correct
- Check that the connection string includes `?sslmode=require`
- Make sure your Neon project is active (not paused)

### Migration Errors

If migrations fail:
- Check Render logs for specific error messages
- Verify the database user has proper permissions
- Try running migrations manually in Neon's SQL editor

### Slow First Request

If the first request after idle time is slow:
- This is normal with Neon's "scale to zero" feature
- The database compute layer wakes up automatically
- Subsequent requests will be fast

## Benefits of Using Neon

✅ **Cost**: Free tier with generous limits  
✅ **Performance**: Fast queries once warmed up  
✅ **Features**: Database branching, point-in-time recovery  
✅ **Scalability**: Serverless architecture  
✅ **Backups**: Automatic backups included  

## Need Help?

- Neon Documentation: https://neon.tech/docs
- Neon Support: https://neon.tech/docs/support
- Render Documentation: https://render.com/docs

