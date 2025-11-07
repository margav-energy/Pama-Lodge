"""
Management command to export data to JSON fixture files.
Usage: python manage.py export_data
"""
from django.core.management.base import BaseCommand
from django.core.management import call_command
import os


class Command(BaseCommand):
    help = 'Export all data to JSON fixture files'

    def add_arguments(self, parser):
        parser.add_argument(
            '--output-dir',
            type=str,
            default='bookings/fixtures',
            help='Directory to save fixture files',
        )

    def handle(self, *args, **options):
        output_dir = options['output_dir']
        
        # Create output directory if it doesn't exist (including parent directories)
        os.makedirs(output_dir, exist_ok=True)
        
        # Ensure the directory was created
        if not os.path.exists(output_dir):
            self.stdout.write(self.style.ERROR(f'Failed to create directory: {output_dir}'))
            return
        
        self.stdout.write(self.style.SUCCESS(f'Exporting data to {output_dir}...'))
        
        # Export each model separately
        models = [
            ('bookings.User', 'users.json'),
            ('bookings.Room', 'rooms.json'),
            ('bookings.Booking', 'bookings.json'),
            ('bookings.BookingVersion', 'booking_versions.json'),
            ('bookings.RoomIssue', 'room_issues.json'),
        ]
        
        for model, filename in models:
            filepath = os.path.join(output_dir, filename)
            self.stdout.write(f'Exporting {model} to {filepath}...')
            try:
                call_command('dumpdata', model, '--indent', '2', '-o', filepath)
                self.stdout.write(self.style.SUCCESS(f'[OK] Exported {model}'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'[ERROR] Error exporting {model}: {str(e)}'))
        
        # Also export all data together
        all_data_path = os.path.join(output_dir, 'all_data.json')
        self.stdout.write(f'Exporting all data to {all_data_path}...')
        try:
            call_command('dumpdata', 'bookings', '--indent', '2', '-o', all_data_path)
            self.stdout.write(self.style.SUCCESS(f'[OK] Exported all data'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'[ERROR] Error exporting all data: {str(e)}'))
        
        self.stdout.write(self.style.SUCCESS(f'\nData export completed! Files saved in {output_dir}'))

