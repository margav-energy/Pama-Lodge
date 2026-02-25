# Script to create rooms for Pama Lodge
# Run this in Django shell: python manage.py shell
# Then copy and paste this code

from bookings.models import Room

# Room descriptions based on the provided information
room_descriptions = {
    'standard_full_night_ac': 'Double bed, air conditioning, refrigerator, flat-screen TV with DSTV, wardrobe, study desk, and sofa. Full night stay.',
    'standard_fan_only': 'Double bed, ceiling fan, refrigerator, flat-screen TV with DSTV, wardrobe, study desk, and sofa.',
    'short_stay_1_3_fan': 'Double bed, ceiling fan, refrigerator, flat-screen TV with DSTV, wardrobe, study desk, and sofa. Short stay 1–3 hours.',
    'short_stay_1_3_ac': 'Double bed, air conditioning, refrigerator, flat-screen TV with DSTV, wardrobe, study desk, and sofa. Short stay 1–3 hours.',
}

# Create rooms
# Standard - Fan only: 101-110
for i in range(101, 111):
    Room.objects.get_or_create(
        room_number=str(i),
        defaults={
            'room_type': 'standard_fan_only',
            'description': room_descriptions['standard_fan_only'],
            'price_per_night': 150.00,
            'is_available': True
        }
    )
    print(f"Created Room {i} - Standard - Fan only")

# Standard full night with A/C: 201-205
for i in range(201, 206):
    Room.objects.get_or_create(
        room_number=str(i),
        defaults={
            'room_type': 'standard_full_night_ac',
            'description': room_descriptions['standard_full_night_ac'],
            'price_per_night': 200.00,
            'is_available': True
        }
    )
    print(f"Created Room {i} - Standard full night with A/C")

# Short stay 1-3 (fan): 301-303
for i in range(301, 304):
    Room.objects.get_or_create(
        room_number=str(i),
        defaults={
            'room_type': 'short_stay_1_3_fan',
            'description': room_descriptions['short_stay_1_3_fan'],
            'price_per_night': 80.00,
            'is_available': True
        }
    )
    print(f"Created Room {i} - Short stay 1-3 (Fan)")

# Short stay 1-3 (A/C): 304-306
for i in range(304, 307):
    Room.objects.get_or_create(
        room_number=str(i),
        defaults={
            'room_type': 'short_stay_1_3_ac',
            'description': room_descriptions['short_stay_1_3_ac'],
            'price_per_night': 100.00,
            'is_available': True
        }
    )
    print(f"Created Room {i} - Short stay 1-3 (A/C)")

print("\nAll rooms created successfully!")
print(f"Total rooms: {Room.objects.count()}")

