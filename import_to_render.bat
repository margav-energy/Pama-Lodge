@echo off
REM Script to import data to Render database
REM Make sure to set DATABASE_URL environment variable first!
REM Example: set DATABASE_URL=postgresql://user:password@host:port/database

echo ========================================
echo Pama Lodge - Import Data to Render
echo ========================================
echo.

if "%DATABASE_URL%"=="" (
    echo ERROR: DATABASE_URL environment variable is not set!
    echo.
    echo Please set it first:
    echo set DATABASE_URL=postgresql://user:password@host:port/database
    echo.
    echo Get your database URL from Render dashboard -^> Database -^> Connections
    echo.
    pause
    exit /b 1
)

echo DATABASE_URL is set.
echo.
cd backend

echo [1/3] Running migrations...
python manage.py migrate

echo.
echo [2/3] Importing data...
if exist "bookings\fixtures\all_data.json" (
    python manage.py loaddata bookings/fixtures/all_data.json
) else (
    echo ERROR: Fixture file not found!
    echo Please run migrate_to_render.bat first to export data.
    pause
    exit /b 1
)

echo.
echo [3/3] Data import completed!
echo.
echo You can now verify the data in your Render application.
echo.
pause

