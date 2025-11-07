# Pama Lodge - Attendance Record System

A comprehensive online booking system for Pama Lodge guest house, replacing manual attendance record forms.

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Django REST Framework
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)

## Features

### User Roles

1. **Receptionist**
   - Create new bookings
   - Edit existing bookings
   - View all bookings
   - Cannot delete bookings

2. **Manager**
   - All receptionist permissions
   - Delete bookings
   - View original and edited versions of bookings
   - Authorize bookings
   - Manager edits supersede receptionist edits

### Booking Features

- Complete booking form matching the original attendance record form
- Fields include:
  - Guest name, ID/Telephone, Address/Location
  - Room number
  - Check-in/Check-out dates and times
  - Payment method (Cash, Mobile Money, or Both)
  - Amount in GHS
  - Authorization status (Manager only)
- Version tracking for all edits
- Daily totals calculation
- Booking history and audit trail

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the backend directory:
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DB_NAME=pama_lodge
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
```

5. Create the PostgreSQL database:
```sql
CREATE DATABASE pama_lodge;
```

6. Run migrations:
```bash
python manage.py migrate
```

7. Create a superuser:
```bash
python manage.py createsuperuser
```

8. Create test users (optional, via Django shell):
```python
python manage.py shell
```

```python
from bookings.models import User

# Create manager
manager = User.objects.create_user(
    username='manager',
    password='password123',
    role='manager',
    email='manager@pamalodge.com'
)

# Create receptionist
receptionist = User.objects.create_user(
    username='receptionist',
    password='password123',
    role='receptionist',
    email='receptionist@pamalodge.com'
)
```

9. Start the Django server:
```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Usage

1. Login with your credentials (manager or receptionist)
2. Navigate to "New Booking" to create a booking
3. View all bookings in the "Bookings" page
4. Click on a booking to view details
5. Managers can view version history and authorize bookings
6. Dashboard shows daily totals and recent bookings

## API Endpoints

- `POST /api/auth/login/` - Login
- `POST /api/auth/refresh/` - Refresh token
- `GET /api/users/me/` - Get current user
- `GET /api/bookings/` - List bookings
- `POST /api/bookings/` - Create booking
- `GET /api/bookings/{id}/` - Get booking details
- `PUT /api/bookings/{id}/` - Update booking
- `DELETE /api/bookings/{id}/` - Delete booking (manager only)
- `GET /api/bookings/{id}/versions/` - Get versions (manager only)
- `GET /api/bookings/daily_totals/?date=YYYY-MM-DD` - Daily totals
- `POST /api/bookings/{id}/authorize/` - Authorize booking (manager only)

## Project Structure

```
Pama Lodge/
├── backend/
│   ├── pama_lodge/          # Django project settings
│   ├── bookings/            # Main app
│   │   ├── models.py        # Database models
│   │   ├── views.py         # API views
│   │   ├── serializers.py   # API serializers
│   │   └── urls.py          # URL routing
│   ├── manage.py
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/      # React components
    │   ├── contexts/        # React contexts (Auth)
    │   ├── pages/           # Page components
    │   └── App.jsx          # Main app component
    ├── package.json
    └── vite.config.js
```

## Deployment

The frontend is built and served from the Django backend. For deploying to production, see [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) for detailed instructions on deploying to Render.

### Building the Frontend

To build the frontend for production:

**Windows:**
```bash
build_frontend.bat
```

**Linux/Mac:**
```bash
chmod +x build_frontend.sh
./build_frontend.sh
```

Or manually:
```bash
cd frontend
npm install
npm run build
```

The built files will be in `frontend/dist/` and Django will serve them automatically.

## Notes

- The system maintains a complete audit trail of all booking changes
- Manager edits increment the version number and supersede previous edits
- Original booking data is preserved in the BookingVersion model
- Daily totals are calculated based on check-in date
- All API requests require authentication via JWT tokens

