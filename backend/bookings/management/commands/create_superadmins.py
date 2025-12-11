from django.core.management.base import BaseCommand
from bookings.models import User


class Command(BaseCommand):
    help = 'Create superadmin users for production deployment'

    def handle(self, *args, **options):
        """Create the required superadmin users"""
        
        # Superadmin 1: Paul_Ayitey
        user1, created1 = User.objects.get_or_create(
            username='Paul_Ayitey',
            defaults={
                'email': 'paul.ayitey@margav.energy',
                'first_name': 'Paul',
                'last_name': 'Ayitey',
                'is_staff': True,
                'is_superuser': True,
                'is_active': True,
                'role': 'manager'
            }
        )
        if created1:
            user1.set_password('admin123')
            user1.save()
            self.stdout.write(self.style.SUCCESS(f'✓ Created superuser: {user1.username}'))
        else:
            # Update existing user to ensure correct permissions
            user1.set_password('admin123')
            user1.is_staff = True
            user1.is_superuser = True
            user1.is_active = True
            user1.role = 'manager'
            user1.email = 'paul.ayitey@margav.energy'
            user1.first_name = 'Paul'
            user1.last_name = 'Ayitey'
            user1.save()
            self.stdout.write(self.style.WARNING(f'✓ Updated superuser: {user1.username}'))

        # Superadmin 2: naa_okailey_ayitey
        user2, created2 = User.objects.get_or_create(
            username='naa_okailey_ayitey',
            defaults={
                'email': 'naa.okailey@margav.energy',
                'first_name': 'Naa',
                'last_name': 'Okailey Ayitey',
                'is_staff': True,
                'is_superuser': True,
                'is_active': True,
                'role': 'manager'
            }
        )
        if created2:
            user2.set_password('123')
            user2.save()
            self.stdout.write(self.style.SUCCESS(f'✓ Created superuser: {user2.username}'))
        else:
            # Update existing user to ensure correct permissions
            user2.set_password('123')
            user2.is_staff = True
            user2.is_superuser = True
            user2.is_active = True
            user2.role = 'manager'
            user2.email = 'naa.okailey@margav.energy'
            user2.first_name = 'Naa'
            user2.last_name = 'Okailey Ayitey'
            user2.save()
            self.stdout.write(self.style.WARNING(f'✓ Updated superuser: {user2.username}'))

        self.stdout.write(self.style.SUCCESS('\n✓ Superadmin users are ready!'))
        self.stdout.write(self.style.SUCCESS('\nLogin credentials:'))
        self.stdout.write(self.style.SUCCESS('  Username: Paul_Ayitey | Password: admin123'))
        self.stdout.write(self.style.SUCCESS('  Username: naa_okailey_ayitey | Password: 123'))

