#!/bin/bash

# Pama Lodge Backend Setup Script

echo "Setting up Pama Lodge Backend..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "Please edit .env file with your database credentials"
fi

# Run migrations
echo "Running migrations..."
python manage.py migrate

echo ""
echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your database credentials"
echo "2. Create a superuser: python manage.py createsuperuser"
echo "3. Create users via Django shell or admin panel"
echo "4. Start the server: python manage.py runserver"

