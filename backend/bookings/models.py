from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator


class User(AbstractUser):
    ROLE_CHOICES = [
        ('receptionist', 'Receptionist'),
        ('manager', 'Manager'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='receptionist')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def is_manager(self):
        return self.role == 'manager'
    
    def is_receptionist(self):
        return self.role == 'receptionist'


class Room(models.Model):
    ROOM_TYPE_CHOICES = [
        ('standard_fan', 'Standard (Fan)'),
        ('standard_ac', 'Standard (AC)'),
        ('twin_bed', 'Twin Bed Room'),
    ]
    
    room_number = models.CharField(max_length=10, unique=True)
    room_type = models.CharField(max_length=20, choices=ROOM_TYPE_CHOICES)
    description = models.TextField(blank=True)
    price_per_night = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['room_number']
    
    def __str__(self):
        return f"Room {self.room_number} ({self.get_room_type_display()})"
    
    def check_availability(self, check_in_date, check_out_date=None, exclude_booking_id=None):
        """Check if room is available for given dates"""
        if not self.is_available:
            return False
        
        # Get all bookings for this room that overlap with the requested dates
        bookings = Booking.objects.filter(
            room_no=self.room_number,
            is_original=True
        )
        
        if exclude_booking_id:
            bookings = bookings.exclude(id=exclude_booking_id)
        
        # If no bookings exist, room is available
        if not bookings.exists():
            return True
        
        # Check for overlapping bookings
        for booking in bookings:
            booking_check_in = booking.check_in_date
            # If booking has no check-out date, it's considered ongoing and blocks all future dates
            if booking.check_out_date:
                booking_check_out = booking.check_out_date
            else:
                # No check-out means ongoing booking - blocks all dates from check-in onwards
                if check_in_date >= booking_check_in:
                    return False
                continue
            
            # Check if dates overlap
            if check_out_date:
                # Check if the requested dates overlap with existing booking
                # Overlap occurs if: requested check-in < booking check-out AND requested check-out > booking check-in
                if not (check_out_date <= booking_check_in or check_in_date >= booking_check_out):
                    return False
            else:
                # If no check-out date specified for new booking, check if check-in conflicts
                # Conflict if check-in is between booking check-in and check-out
                if booking_check_in <= check_in_date < booking_check_out:
                    return False
        
        return True


class Booking(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ('cash', 'Cash'),
        ('momo', 'Mobile Money'),
        ('both', 'Both'),
    ]
    
    MOMO_NETWORK_CHOICES = [
        ('MTN', 'MTN'),
        ('Vodafone', 'Vodafone'),
        ('AT', 'AT'),
    ]
    
    # Basic Information
    name = models.CharField(max_length=255)
    id_or_telephone = models.CharField(max_length=100, blank=True)
    address_location = models.CharField(max_length=500, blank=True)
    age = models.IntegerField(null=True, blank=True, help_text="Guest age (must be 18+)")
    room_no = models.CharField(max_length=50)
    room = models.ForeignKey(Room, on_delete=models.SET_NULL, null=True, blank=True, related_name='bookings')
    
    # Check-in/Check-out
    check_in_date = models.DateField()
    check_in_time = models.TimeField()
    check_out_date = models.DateField(null=True, blank=True)
    check_out_time = models.TimeField(null=True, blank=True)
    
    # Payment Information
    payment_method = models.CharField(max_length=10, choices=PAYMENT_METHOD_CHOICES, default='cash')
    amount_ghs = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    cash_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, validators=[MinValueValidator(0)])
    momo_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, validators=[MinValueValidator(0)])
    momo_network = models.CharField(max_length=20, choices=MOMO_NETWORK_CHOICES, blank=True, null=True)
    momo_number = models.CharField(max_length=20, blank=True)
    
    # Metadata
    booked_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='bookings_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_edited_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='bookings_edited')
    
    # Authorization
    authorized_by = models.CharField(max_length=255, blank=True)
    is_authorized = models.BooleanField(default=False)
    
    # Version tracking
    is_original = models.BooleanField(default=True)
    original_booking = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='derived_bookings')
    version_number = models.IntegerField(default=1)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - Room {self.room_no}"


class BookingVersion(models.Model):
    """Stores historical versions of bookings for manager review"""
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='versions')
    version_data = models.JSONField()  # Stores the booking data at this version
    edited_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    edited_at = models.DateTimeField(auto_now_add=True)
    is_manager_edit = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-edited_at']
    
    def __str__(self):
        return f"Version of {self.booking.name} - {self.edited_at}"

