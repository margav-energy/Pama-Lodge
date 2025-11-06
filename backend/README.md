# Pama Lodge Backend

Django REST API backend for Pama Lodge booking system.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file based on `.env.example` and configure your database settings.

4. Run migrations:
```bash
python manage.py migrate
```

5. Create a superuser:
```bash
python manage.py createsuperuser
```

6. Run the development server:
```bash
python manage.py runserver
```

## Creating Users

You can create users through the Django admin panel or use the registration endpoint. To create users with specific roles:

```python
from bookings.models import User

# Create a manager
manager = User.objects.create_user(
    username='manager',
    password='password123',
    role='manager',
    email='manager@pamalodge.com'
)

# Create a receptionist
receptionist = User.objects.create_user(
    username='receptionist',
    password='password123',
    role='receptionist',
    email='receptionist@pamalodge.com'
)
```

## API Endpoints

- `POST /api/auth/login/` - Login (returns JWT tokens)
- `POST /api/auth/refresh/` - Refresh JWT token
- `GET /api/users/me/` - Get current user info
- `GET /api/bookings/` - List all bookings
- `POST /api/bookings/` - Create a booking
- `GET /api/bookings/{id}/` - Get booking details
- `PUT /api/bookings/{id}/` - Update booking
- `DELETE /api/bookings/{id}/` - Delete booking (manager only)
- `GET /api/bookings/{id}/versions/` - Get booking versions (manager only)
- `GET /api/bookings/daily_totals/?date=YYYY-MM-DD` - Get daily totals
- `POST /api/bookings/{id}/authorize/` - Authorize booking (manager only)

