from django.core.management.base import BaseCommand
from bookings.models import Room


class Command(BaseCommand):
    help = 'Create rooms for Pama Lodge'

    def handle(self, *args, **options):
        # Room descriptions based on the provided information
        room_descriptions = {
            'standard_fan': 'Double bed, ceiling fan, refrigerator, flat-screen TV with DSTV, wardrobe, study desk, and sofa.',
            'standard_ac': 'Double bed, air conditioning, refrigerator, flat-screen TV with DSTV, wardrobe, study desk, and sofa.',
            'twin_bed': 'Twin beds, air conditioning, refrigerator, flat-screen TV, ceiling fan, wardrobe, study desk, and sofa.'
        }

        # Create 20 rooms
        # Standard (Fan) rooms: 101-110
        for i in range(101, 111):
            room, created = Room.objects.get_or_create(
                room_number=str(i),
                defaults={
                    'room_type': 'standard_fan',
                    'description': room_descriptions['standard_fan'],
                    'price_per_night': 150.00,
                    'is_available': True
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created Room {i} - Standard (Fan)'))
            else:
                self.stdout.write(self.style.WARNING(f'Room {i} already exists'))

        # Standard (AC) rooms: 201-205
        for i in range(201, 206):
            room, created = Room.objects.get_or_create(
                room_number=str(i),
                defaults={
                    'room_type': 'standard_ac',
                    'description': room_descriptions['standard_ac'],
                    'price_per_night': 200.00,
                    'is_available': True
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created Room {i} - Standard (AC)'))
            else:
                self.stdout.write(self.style.WARNING(f'Room {i} already exists'))

        # Twin Bed rooms: 301-305
        for i in range(301, 306):
            room, created = Room.objects.get_or_create(
                room_number=str(i),
                defaults={
                    'room_type': 'twin_bed',
                    'description': room_descriptions['twin_bed'],
                    'price_per_night': 250.00,
                    'is_available': True
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created Room {i} - Twin Bed Room'))
            else:
                self.stdout.write(self.style.WARNING(f'Room {i} already exists'))

        self.stdout.write(self.style.SUCCESS(f'\nAll rooms processed! Total rooms: {Room.objects.count()}'))

