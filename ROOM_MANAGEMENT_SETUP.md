# Room Management System - Setup Instructions

## Backend Setup Complete ✅

1. Room model created with:
   - Room number (unique)
   - Room type (Standard Fan, Standard AC, Twin Bed)
   - Description
   - Price per night
   - Availability status

2. API Endpoints Created:
   - `GET /api/rooms/` - List all rooms
   - `GET /api/rooms/available/?check_in_date=YYYY-MM-DD&check_out_date=YYYY-MM-DD&room_type=type` - Get available rooms
   - `GET /api/rooms/status/?date=YYYY-MM-DD` - Get room status for a date
   - `POST /api/rooms/` - Create room (manager only)
   - `PUT /api/rooms/{id}/` - Update room (manager only)
   - `DELETE /api/rooms/{id}/` - Delete room (manager only)

## Next Steps:

### 1. Create Rooms in Database

Run this in Django shell:
```bash
cd backend
python manage.py shell
```

Then paste the code from `create_rooms.py` or run:
```python
from bookings.models import Room

# Creates 20 rooms:
# - Rooms 101-110: Standard (Fan) - ₵150/night
# - Rooms 201-205: Standard (AC) - ₵200/night  
# - Rooms 301-305: Twin Bed - ₵250/night

room_descriptions = {
    'standard_fan': 'Double bed, ceiling fan, refrigerator, flat-screen TV with DSTV, wardrobe, study desk, and sofa.',
    'standard_ac': 'Double bed, air conditioning, refrigerator, flat-screen TV with DSTV, wardrobe, study desk, and sofa.',
    'twin_bed': 'Twin beds, air conditioning, refrigerator, flat-screen TV, ceiling fan, wardrobe, study desk, and sofa.'
}

for i in range(101, 111):
    Room.objects.get_or_create(room_number=str(i), defaults={'room_type': 'standard_fan', 'description': room_descriptions['standard_fan'], 'price_per_night': 150.00, 'is_available': True})

for i in range(201, 206):
    Room.objects.get_or_create(room_number=str(i), defaults={'room_type': 'standard_ac', 'description': room_descriptions['standard_ac'], 'price_per_night': 200.00, 'is_available': True})

for i in range(301, 306):
    Room.objects.get_or_create(room_number=str(i), defaults={'room_type': 'twin_bed', 'description': room_descriptions['twin_bed'], 'price_per_night': 250.00, 'is_available': True})
```

### 2. Frontend Updates Needed

The BookingForm needs to be updated to:
- Fetch available rooms when check-in date is selected
- Display rooms in a dropdown/select with room type and price
- Show room availability status
- Filter rooms by type if needed

### 3. Room Management Page

Create a new page for managers to:
- View all rooms and their status
- See which rooms are booked on specific dates
- Manage room availability (mark rooms as unavailable for maintenance)
- Add/edit room information

## Room Types:

1. **Standard (Fan)** - ₵150/night
   - Double bed, ceiling fan, refrigerator, flat-screen TV with DSTV, wardrobe, study desk, and sofa

2. **Standard (AC)** - ₵200/night
   - Double bed, air conditioning, refrigerator, flat-screen TV with DSTV, wardrobe, study desk, and sofa

3. **Twin Bed Room** - ₵250/night
   - Twin beds, air conditioning, refrigerator, flat-screen TV, ceiling fan, wardrobe, study desk, and sofa

