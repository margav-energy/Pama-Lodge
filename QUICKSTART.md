# Quick Start Guide - Pama Lodge Booking System

## Prerequisites

- Python 3.8+ installed
- Node.js 16+ and npm installed
- PostgreSQL installed and running
- Git (optional)

## Backend Setup (Django)

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment:**
   - Windows: `venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Create `.env` file:**
   Copy `.env.example` to `.env` and update with your PostgreSQL credentials:
   ```env
   SECRET_KEY=your-secret-key-here-change-this
   DEBUG=True
   DB_NAME=pama_lodge
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_HOST=localhost
   DB_PORT=5432
   ```

6. **Create PostgreSQL database:**
   ```sql
   CREATE DATABASE pama_lodge;
   ```

7. **Run migrations:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

8. **Create superuser:**
   ```bash
   python manage.py createsuperuser
   ```

9. **Create test users (via Django shell):**
   ```bash
   python manage.py shell
   ```
   
   Then run:
   ```python
   from bookings.models import User
   
   # Create manager
   User.objects.create_user(
       username='manager',
       password='password123',
       role='manager',
       email='manager@pamalodge.com'
   )
   
   # Create receptionist
   User.objects.create_user(
       username='receptionist',
       password='password123',
       role='receptionist',
       email='receptionist@pamalodge.com'
   )
   ```

10. **Start Django server:**
    ```bash
    python manage.py runserver
    ```
    
    Server will run on `http://localhost:8000`

## Frontend Setup (React)

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```
   
   App will run on `http://localhost:5173`

## Usage

1. Open `http://localhost:5173` in your browser
2. Login with:
   - Manager: `manager` / `password123`
   - Receptionist: `receptionist` / `password123`
3. Create bookings, view them, and manage as needed

## Default Credentials

- **Manager:**
  - Username: `manager`
  - Password: `password123`
  
- **Receptionist:**
  - Username: `receptionist`
  - Password: `password123`

**⚠️ IMPORTANT: Change these passwords in production!**

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check `.env` file has correct database credentials
- Verify database `pama_lodge` exists

### Port Already in Use
- Backend: Change port in `manage.py runserver 8001` (or any available port)
- Frontend: Update `vite.config.js` port and proxy settings

### CORS Issues
- Ensure backend CORS settings in `settings.py` include your frontend URL
- Check that `corsheaders` middleware is enabled

### Migration Issues
- Delete migration files (except `__init__.py`) and run `makemigrations` again
- Ensure all dependencies are installed

## Production Deployment

1. Set `DEBUG=False` in `.env`
2. Generate a secure `SECRET_KEY`
3. Set up proper database credentials
4. Configure static files serving
5. Set up proper CORS origins
6. Use environment variables for all sensitive data
7. Set up HTTPS
8. Configure proper logging

