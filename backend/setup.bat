@echo off
REM Pama Lodge Backend Setup Script for Windows

echo Setting up Pama Lodge Backend...

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt

REM Check if .env exists
if not exist ".env" (
    echo Creating .env file from .env.example...
    copy .env.example .env
    echo Please edit .env file with your database credentials
)

REM Run migrations
echo Running migrations...
python manage.py migrate

echo.
echo Setup complete!
echo.
echo Next steps:
echo 1. Edit .env file with your database credentials
echo 2. Create a superuser: python manage.py createsuperuser
echo 3. Create users via Django shell or admin panel
echo 4. Start the server: python manage.py runserver

pause

