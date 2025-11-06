from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Booking, BookingVersion, Room

# Customize admin site header and title
admin.site.site_header = 'Pama Lodge Administration'
admin.site.site_title = 'Pama Lodge Administration'
admin.site.index_title = 'Welcome to Pama Lodge Administration'


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'role', 'is_staff', 'date_joined']
    list_filter = ['role', 'is_staff', 'is_superuser']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Role', {'fields': ('role',)}),
    )


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ['room_number', 'room_type', 'price_per_night', 'is_available', 'created_at']
    list_filter = ['room_type', 'is_available']
    search_fields = ['room_number']
    list_editable = ['is_available']


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['name', 'room_no', 'check_in_date', 'amount_ghs', 'booked_by', 'created_at']
    list_filter = ['check_in_date', 'payment_method', 'is_authorized']
    search_fields = ['name', 'room_no', 'id_or_telephone']


@admin.register(BookingVersion)
class BookingVersionAdmin(admin.ModelAdmin):
    list_display = ['booking', 'edited_by', 'edited_at', 'is_manager_edit']
    list_filter = ['is_manager_edit', 'edited_at']
    readonly_fields = ['edited_at']

