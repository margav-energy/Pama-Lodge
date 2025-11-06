# Script to create rooms for Pama Lodge
# Run this in Django shell: python manage.py shell
# Then copy and paste this code

from bookings.models import Room

# Room descriptions based on the provided information
room_descriptions = {
    'standard_fan': 'Double bed, ceiling fan, refrigerator, flat-screen TV with DSTV, wardrobe, study desk, and sofa.',
    'standard_ac': 'Double bed, air conditioning, refrigerator, flat-screen TV with DSTV, wardrobe, study desk, and sofa.',
    'twin_bed': 'Twin beds, air conditioning, refrigerator, flat-screen TV, ceiling fan, wardrobe, study desk, and sofa.'
}

# Create 20 rooms
# Standard (Fan) rooms: 101-110
for i in range(101, 111):
    Room.objects.get_or_create(
        room_number=str(i),
        defaults={
            'room_type': 'standard_fan',
            'description': room_descriptions['standard_fan'],
            'price_per_night': 150.00,
            'is_available': True
        }
    )
    print(f"Created Room {i} - Standard (Fan)")

# Standard (AC) rooms: 201-205
for i in range(201, 206):
    Room.objects.get_or_create(
        room_number=str(i),
        defaults={
            'room_type': 'standard_ac',
            'description': room_descriptions['standard_ac'],
            'price_per_night': 200.00,
            'is_available': True
        }
    )
    print(f"Created Room {i} - Standard (AC)")

# Twin Bed rooms: 301-305
for i in range(301, 306):
    Room.objects.get_or_create(
        room_number=str(i),
        defaults={
            'room_type': 'twin_bed',
            'description': room_descriptions['twin_bed'],
            'price_per_night': 250.00,
            'is_available': True
        }
    )
    print(f"Created Room {i} - Twin Bed Room")

print("\nAll rooms created successfully!")
print(f"Total rooms: {Room.objects.count()}")

