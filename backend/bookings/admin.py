from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import UserCreationForm
from django import forms
from django.utils import timezone
from .models import User, Booking, BookingVersion, Room, RoomIssue

# Customize admin site header and title
admin.site.site_header = 'Pama Lodge Administration'
admin.site.site_title = 'Pama Lodge Administration'
admin.site.index_title = 'Welcome to Pama Lodge Administration'


class CustomUserCreationForm(UserCreationForm):
    """Custom form that doesn't require username during creation"""
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'email', 'role')
        field_classes = {}
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Make username optional and hide it
        if 'username' in self.fields:
            self.fields['username'].required = False
            self.fields['username'].widget = forms.HiddenInput()
    
    def clean_username(self):
        # Return empty string since we'll generate it
        return ''


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    add_form = CustomUserCreationForm
    list_display = ['username', 'first_name', 'last_name', 'email', 'role', 'is_staff', 'date_joined']
    list_filter = ['role', 'is_staff', 'is_superuser']
    
    # Fieldsets for editing existing users
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Role', {'fields': ('role',)}),
    )
    
    # Fieldsets for creating new users - show first_name, last_name, hide username
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('first_name', 'last_name', 'email', 'password1', 'password2', 'role'),
        }),
    )
    
    def save_model(self, request, obj, form, change):
        # If creating a new user (not editing), auto-generate username
        if not change and not obj.username:
            # Generate username from first_name and last_name
            first_name = obj.first_name.strip().lower() if obj.first_name else ''
            last_name = obj.last_name.strip().lower() if obj.last_name else ''
            
            if first_name and last_name:
                # Replace spaces and special characters with underscores
                first_name = first_name.replace(' ', '_')
                last_name = last_name.replace(' ', '_')
                
                base_username = f"{first_name}_{last_name}"
                username = base_username
                counter = 1
                
                # Check if username already exists, if so add a number
                while User.objects.filter(username=username).exists():
                    username = f"{base_username}_{counter}"
                    counter += 1
                
                obj.username = username
        
        super().save_model(request, obj, form, change)


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


@admin.register(RoomIssue)
class RoomIssueAdmin(admin.ModelAdmin):
    list_display = ['room', 'title', 'issue_type', 'status', 'priority', 'reported_by', 'reported_at', 'fixed_by', 'fixed_at']
    list_filter = ['status', 'issue_type', 'priority', 'reported_at']
    search_fields = ['room__room_number', 'title', 'description']
    readonly_fields = ['reported_at', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Issue Information', {
            'fields': ('room', 'issue_type', 'title', 'description', 'priority', 'status')
        }),
        ('Reporting', {
            'fields': ('reported_by', 'reported_at')
        }),
        ('Resolution', {
            'fields': ('fixed_by', 'fixed_at', 'resolution_notes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        # Set reported_by if creating new issue
        if not change and not obj.reported_by:
            obj.reported_by = request.user
        
        # If status is being set to 'fixed' or 'resolved' and fixed_by/fixed_at not set
        if obj.status in ['fixed', 'resolved'] and not obj.fixed_at:
            obj.fixed_by = request.user
            obj.fixed_at = timezone.now()
        
        super().save_model(request, obj, form, change)
    
    actions = ['mark_as_fixed', 'mark_as_in_progress']
    
    def mark_as_fixed(self, request, queryset):
        """Mark selected issues as fixed"""
        updated = queryset.update(
            status='fixed',
            fixed_by=request.user,
            fixed_at=timezone.now()
        )
        self.message_user(request, f'{updated} issue(s) marked as fixed.')
    mark_as_fixed.short_description = "Mark selected issues as fixed"
    
    def mark_as_in_progress(self, request, queryset):
        """Mark selected issues as in progress"""
        updated = queryset.update(status='in_progress')
        self.message_user(request, f'{updated} issue(s) marked as in progress.')
    mark_as_in_progress.short_description = "Mark selected issues as in progress"

