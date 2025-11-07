@echo off
REM Script to export data from localhost and prepare for Render migration
REM Run this from the project root directory

echo ========================================
echo Pama Lodge - Data Migration Tool
echo ========================================
echo.

cd backend

echo [1/3] Exporting data from localhost...
python manage.py export_data

echo.
echo [2/3] Data export completed!
echo.
echo Next steps:
echo 1. Get your Render database URL from Render dashboard
echo 2. Set DATABASE_URL environment variable to point to Render database
echo 3. Run: python manage.py migrate
echo 4. Run: python manage.py loaddata bookings/fixtures/all_data.json
echo.
echo For detailed instructions, see DATA_MIGRATION_GUIDE.md
echo.
pause

