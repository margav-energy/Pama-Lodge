"""
Management command to import initial data from JSON files.
Usage: python manage.py import_initial_data [--file filename.json]
"""
from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.core.management.color import no_style
from django.db import connection
import os
import json


class Command(BaseCommand):
    help = 'Import initial data from JSON fixture files'

    def add_arguments(self, parser):
        parser.add_argument(
            '--file',
            type=str,
            help='Path to JSON fixture file to import',
        )
        parser.add_argument(
            '--users',
            type=str,
            help='Path to users JSON fixture file',
            default='backend/bookings/fixtures/users.json'
        )
        parser.add_argument(
            '--rooms',
            type=str,
            help='Path to rooms JSON fixture file',
            default='backend/bookings/fixtures/rooms.json'
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting data import...'))
        
        # Reset sequences to avoid primary key conflicts
        style = no_style()
        sequence_sql = connection.ops.sequence_reset_sql(style, [])
        if sequence_sql:
            with connection.cursor() as cursor:
                for sql in sequence_sql:
                    cursor.execute(sql)
        
        # Import users if file exists
        users_file = options['users']
        if os.path.exists(users_file):
            self.stdout.write(f'Importing users from {users_file}...')
            try:
                call_command('loaddata', users_file, verbosity=0)
                self.stdout.write(self.style.SUCCESS(f'✓ Successfully imported users from {users_file}'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'Could not import users: {str(e)}'))
        else:
            self.stdout.write(self.style.WARNING(f'Users file not found: {users_file}'))
        
        # Import rooms if file exists
        rooms_file = options['rooms']
        if os.path.exists(rooms_file):
            self.stdout.write(f'Importing rooms from {rooms_file}...')
            try:
                call_command('loaddata', rooms_file, verbosity=0)
                self.stdout.write(self.style.SUCCESS(f'✓ Successfully imported rooms from {rooms_file}'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'Could not import rooms: {str(e)}'))
        else:
            self.stdout.write(self.style.WARNING(f'Rooms file not found: {rooms_file}'))
        
        # Import from custom file if provided
        if options['file']:
            file_path = options['file']
            if os.path.exists(file_path):
                self.stdout.write(f'Importing from {file_path}...')
                try:
                    call_command('loaddata', file_path, verbosity=0)
                    self.stdout.write(self.style.SUCCESS(f'✓ Successfully imported from {file_path}'))
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'Error importing {file_path}: {str(e)}'))
            else:
                self.stdout.write(self.style.ERROR(f'File not found: {file_path}'))
        
        self.stdout.write(self.style.SUCCESS('Data import completed!'))

