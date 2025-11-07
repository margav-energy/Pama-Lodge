# Generated migration to set initial status based on is_authorized

from django.db import migrations

def set_initial_status(apps, schema_editor):
    Booking = apps.get_model('bookings', 'Booking')
    # Set status based on is_authorized field
    Booking.objects.filter(is_authorized=True).update(status='authorized')
    Booking.objects.filter(is_authorized=False).update(status='pending')

def reverse_migration(apps, schema_editor):
    Booking = apps.get_model('bookings', 'Booking')
    # Reverse: set is_authorized based on status
    Booking.objects.filter(status='authorized').update(is_authorized=True)
    Booking.objects.filter(status__in=['pending', 'rejected']).update(is_authorized=False)

class Migration(migrations.Migration):

    dependencies = [
        ('bookings', '0008_add_reject_status'),
    ]

    operations = [
        migrations.RunPython(set_initial_status, reverse_migration),
    ]

