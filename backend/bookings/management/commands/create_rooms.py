from django.core.management.base import BaseCommand
from bookings.models import Room


class Command(BaseCommand):
    help = 'Create rooms for Pama Lodge'

    def handle(self, *args, **options):
        # Room descriptions based on the provided information
        room_descriptions = {
            'standard_full_night_ac': 'Double bed, air conditioning, refrigerator, flat-screen TV with DSTV, wardrobe, study desk, and sofa. Full night stay.',
            'standard_fan_only': 'Double bed, ceiling fan, refrigerator, flat-screen TV with DSTV, wardrobe, study desk, and sofa.',
            'short_stay_1_3_fan': 'Double bed, ceiling fan, refrigerator, flat-screen TV with DSTV, wardrobe, study desk, and sofa. Short stay 1–3 hours.',
            'short_stay_1_3_ac': 'Double bed, air conditioning, refrigerator, flat-screen TV with DSTV, wardrobe, study desk, and sofa. Short stay 1–3 hours.',
        }

        # Standard - Fan only: 101-110
        for i in range(101, 111):
            room, created = Room.objects.get_or_create(
                room_number=str(i),
                room_type='standard_fan_only',
                defaults={
                    'description': room_descriptions['standard_fan_only'],
                    'price_per_night': 150.00,
                    'is_available': True
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created Room {i} - Standard - Fan only'))
            else:
                self.stdout.write(self.style.WARNING(f'Room {i} already exists'))

        # Standard full night with A/C: 201-205
        for i in range(201, 206):
            room, created = Room.objects.get_or_create(
                room_number=str(i),
                room_type='standard_full_night_ac',
                defaults={
                    'description': room_descriptions['standard_full_night_ac'],
                    'price_per_night': 200.00,
                    'is_available': True
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created Room {i} - Standard full night with A/C'))
            else:
                self.stdout.write(self.style.WARNING(f'Room {i} already exists'))

        # Short stay 1-3 (fan): 301-303
        for i in range(301, 304):
            room, created = Room.objects.get_or_create(
                room_number=str(i),
                room_type='short_stay_1_3_fan',
                defaults={
                    'description': room_descriptions['short_stay_1_3_fan'],
                    'price_per_night': 80.00,
                    'is_available': True
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created Room {i} - Short stay 1-3 (Fan)'))
            else:
                self.stdout.write(self.style.WARNING(f'Room {i} already exists'))

        # Short stay 1-3 (A/C): 304-306
        for i in range(304, 307):
            room, created = Room.objects.get_or_create(
                room_number=str(i),
                room_type='short_stay_1_3_ac',
                defaults={
                    'description': room_descriptions['short_stay_1_3_ac'],
                    'price_per_night': 100.00,
                    'is_available': True
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created Room {i} - Short stay 1-3 (A/C)'))
            else:
                self.stdout.write(self.style.WARNING(f'Room {i} already exists'))

        self.stdout.write(self.style.SUCCESS(f'\nAll rooms processed! Total rooms: {Room.objects.count()}'))

