from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, Booking, BookingVersion, Room, RoomIssue


class RoomSerializer(serializers.ModelSerializer):
    room_type_display = serializers.CharField(source='get_room_type_display', read_only=True)
    
    class Meta:
        model = Room
        fields = ['id', 'room_number', 'room_type', 'room_type_display', 'description', 
                  'price_per_night', 'is_available', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class RoomAvailabilitySerializer(serializers.Serializer):
    """Serializer for checking room availability"""
    room_id = serializers.IntegerField()
    room_number = serializers.CharField()
    room_type = serializers.CharField()
    room_type_display = serializers.CharField()
    is_available = serializers.BooleanField()
    price_per_night = serializers.DecimalField(max_digits=10, decimal_places=2)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'first_name', 'last_name']
        read_only_fields = ['id', 'role']


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, label='Confirm Password')
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'role', 'first_name', 'last_name']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


class BookingVersionSerializer(serializers.ModelSerializer):
    edited_by_name = serializers.CharField(source='edited_by.username', read_only=True)
    
    class Meta:
        model = BookingVersion
        fields = ['id', 'version_data', 'edited_by', 'edited_by_name', 'edited_at', 'is_manager_edit']
        read_only_fields = ['id', 'edited_at']


class BookingSerializer(serializers.ModelSerializer):
    booked_by_name = serializers.CharField(source='booked_by.username', read_only=True)
    last_edited_by_name = serializers.CharField(source='last_edited_by.username', read_only=True)
    versions = BookingVersionSerializer(many=True, read_only=True)
    momo_number = serializers.CharField(required=False, allow_blank=True)
    room_info = RoomSerializer(source='room', read_only=True)
    
    class Meta:
        model = Booking
        fields = [
            'id', 'name', 'id_or_telephone', 'address_location', 'age', 'room_no', 'room', 'room_info',
            'check_in_date', 'check_in_time', 'check_out_date', 'check_out_time',
            'payment_method', 'amount_ghs', 'cash_amount', 'momo_amount',
            'momo_network', 'momo_number',
            'booked_by', 'booked_by_name',
            'created_at', 'updated_at', 'last_edited_by', 'last_edited_by_name',
            'authorized_by', 'is_authorized', 'is_original', 'original_booking',
            'version_number', 'versions'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'booked_by', 'last_edited_by', 
                           'is_original', 'original_booking', 'version_number']
    
    def validate(self, attrs):
        """Validate MoMo fields, age, and check-in/check-out times"""
        from datetime import time
        
        payment_method = attrs.get('payment_method', self.instance.payment_method if self.instance else 'cash')
        momo_network = attrs.get('momo_network', self.instance.momo_network if self.instance else None)
        momo_number = attrs.get('momo_number', self.instance.momo_number if self.instance else '')
        cash_amount = attrs.get('cash_amount', self.instance.cash_amount if self.instance else 0)
        momo_amount = attrs.get('momo_amount', self.instance.momo_amount if self.instance else 0)
        amount_ghs = attrs.get('amount_ghs', self.instance.amount_ghs if self.instance else 0)
        
        # Validate age (must be 18+)
        age = attrs.get('age', self.instance.age if self.instance else None)
        if age is not None and age < 18:
            raise serializers.ValidationError({
                'age': 'Guest must be at least 18 years old to check in'
            })
        
        # Validate check-in time (should be 2:00 PM)
        check_in_time = attrs.get('check_in_time', self.instance.check_in_time if self.instance else None)
        if check_in_time:
            if isinstance(check_in_time, str):
                # Parse time string if needed
                try:
                    hour, minute = map(int, check_in_time.split(':'))
                    check_in_time = time(hour, minute)
                except:
                    pass
            
            if isinstance(check_in_time, time):
                # Check-in time should be 2:00 PM (14:00)
                if check_in_time < time(14, 0):
                    raise serializers.ValidationError({
                        'check_in_time': 'Check-in time is 2:00 PM. Please select 2:00 PM or later.'
                    })
        
        # Validate check-out time (should be 12:00 PM)
        check_out_time = attrs.get('check_out_time', self.instance.check_out_time if self.instance else None)
        if check_out_time:
            if isinstance(check_out_time, str):
                # Parse time string if needed
                try:
                    hour, minute = map(int, check_out_time.split(':'))
                    check_out_time = time(hour, minute)
                except:
                    pass
            
            if isinstance(check_out_time, time):
                # Check-out time should be 12:00 PM (12:00)
                if check_out_time > time(12, 0):
                    raise serializers.ValidationError({
                        'check_out_time': 'Check-out time is 12:00 PM. Please select 12:00 PM or earlier.'
                    })
        
        # Validate payment amounts match total
        total_payments = float(cash_amount) + float(momo_amount)
        if abs(total_payments - float(amount_ghs)) > 0.01:  # Allow small floating point differences
            raise serializers.ValidationError({
                'amount_ghs': f'Total payment amount (₵{total_payments:.2f}) must equal amount due (₵{amount_ghs:.2f})'
            })
        
        # Validate payment method matches payment amounts
        if payment_method == 'cash':
            if float(momo_amount) > 0:
                raise serializers.ValidationError({
                    'payment_method': 'MoMo amount must be 0 when payment method is Cash only'
                })
            if float(cash_amount) != float(amount_ghs):
                raise serializers.ValidationError({
                    'cash_amount': f'Cash amount must equal total amount (₵{amount_ghs:.2f})'
                })
        elif payment_method == 'momo':
            if float(cash_amount) > 0:
                raise serializers.ValidationError({
                    'payment_method': 'Cash amount must be 0 when payment method is Mobile Money only'
                })
            if float(momo_amount) != float(amount_ghs):
                raise serializers.ValidationError({
                    'momo_amount': f'MoMo amount must equal total amount (₵{amount_ghs:.2f})'
                })
            if not momo_network:
                raise serializers.ValidationError({
                    'momo_network': 'Mobile Money network is required when payment method is Mobile Money'
                })
            if not momo_number:
                raise serializers.ValidationError({
                    'momo_number': 'Mobile Money number is required when payment method is Mobile Money'
                })
        elif payment_method == 'both':
            if float(cash_amount) == 0 and float(momo_amount) == 0:
                raise serializers.ValidationError({
                    'payment_method': 'At least one payment amount (cash or MoMo) must be greater than 0'
                })
            if not momo_network or not momo_number:
                raise serializers.ValidationError({
                    'momo_network': 'MoMo network and number are required when using both payment methods'
                })
        
        # Validate MoMo number format if provided
        if momo_number:
            digits_only = ''.join(filter(str.isdigit, str(momo_number)))
            if len(digits_only) != 10:
                raise serializers.ValidationError({
                    'momo_number': 'Mobile Money number must be exactly 10 digits'
                })
        
        # Validate id_or_telephone if it's a phone number (all digits)
        id_or_telephone = attrs.get('id_or_telephone', self.instance.id_or_telephone if self.instance else '')
        if id_or_telephone and id_or_telephone.isdigit():
            digits_only = ''.join(filter(str.isdigit, str(id_or_telephone)))
            if len(digits_only) != 10:
                raise serializers.ValidationError({
                    'id_or_telephone': 'Phone number must be exactly 10 digits'
                })
        
        return attrs
    
    def create(self, validated_data):
        validated_data['booked_by'] = self.context['request'].user
        validated_data['is_original'] = True
        validated_data['version_number'] = 1
        
        # Link room if room_no matches a Room object
        room_no = validated_data.get('room_no')
        if room_no:
            try:
                room = Room.objects.get(room_number=room_no)
                validated_data['room'] = room
            except Room.DoesNotExist:
                pass  # Room doesn't exist, keep room_no as string
        
        booking = Booking.objects.create(**validated_data)
        
        # Create initial version record after booking is saved
        version_data = {
            'id': booking.id,
            'name': booking.name,
            'id_or_telephone': booking.id_or_telephone,
            'address_location': booking.address_location,
            'room_no': booking.room_no,
            'check_in_date': str(booking.check_in_date),
            'check_in_time': str(booking.check_in_time),
            'check_out_date': str(booking.check_out_date) if booking.check_out_date else None,
            'check_out_time': str(booking.check_out_time) if booking.check_out_time else None,
            'payment_method': booking.payment_method,
            'amount_ghs': str(booking.amount_ghs),
            'cash_amount': str(booking.cash_amount),
            'momo_amount': str(booking.momo_amount),
            'momo_network': booking.momo_network or None,
            'momo_number': booking.momo_number or None,
            'booked_by_name': booking.booked_by.username if booking.booked_by else None,
            'created_at': booking.created_at.isoformat(),
            'version_number': booking.version_number,
        }
        BookingVersion.objects.create(
            booking=booking,
            version_data=version_data,
            edited_by=self.context['request'].user,
            is_manager_edit=False
        )
        
        return booking
    
    def update(self, instance, validated_data):
        user = self.context['request'].user
        
        # If manager is editing, mark as manager edit
        is_manager_edit = user.is_manager()
        
        # Save current state as version before updating
        version_data = {
            'id': instance.id,
            'name': instance.name,
            'id_or_telephone': instance.id_or_telephone,
            'address_location': instance.address_location,
            'room_no': instance.room_no,
            'check_in_date': str(instance.check_in_date),
            'check_in_time': str(instance.check_in_time),
            'check_out_date': str(instance.check_out_date) if instance.check_out_date else None,
            'check_out_time': str(instance.check_out_time) if instance.check_out_time else None,
            'payment_method': instance.payment_method,
            'amount_ghs': str(instance.amount_ghs),
            'cash_amount': str(instance.cash_amount),
            'momo_amount': str(instance.momo_amount),
            'momo_network': instance.momo_network or None,
            'momo_number': instance.momo_number or None,
            'booked_by_name': instance.booked_by.username if instance.booked_by else None,
            'last_edited_by_name': instance.last_edited_by.username if instance.last_edited_by else None,
            'created_at': instance.created_at.isoformat(),
            'updated_at': instance.updated_at.isoformat(),
            'version_number': instance.version_number,
            'is_authorized': instance.is_authorized,
            'authorized_by': instance.authorized_by or None,
        }
        BookingVersion.objects.create(
            booking=instance,
            version_data=version_data,
            edited_by=user,
            is_manager_edit=is_manager_edit
        )
        
        # Update booking
        validated_data['last_edited_by'] = user
        if is_manager_edit:
            # Manager edits supersede, so increment version
            instance.version_number += 1
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        return instance


class BookingListSerializer(serializers.ModelSerializer):
    booked_by_name = serializers.CharField(source='booked_by.username', read_only=True)
    
    class Meta:
        model = Booking
        fields = [
            'id', 'name', 'age', 'room_no', 'check_in_date', 'check_in_time',
            'check_out_date', 'check_out_time', 'amount_ghs', 'payment_method',
            'cash_amount', 'momo_amount', 'momo_network', 'momo_number',
            'booked_by_name', 'created_at', 'is_authorized', 'version_number'
        ]


class RoomIssueSerializer(serializers.ModelSerializer):
    room_number = serializers.CharField(source='room.room_number', read_only=True)
    room_type_display = serializers.CharField(source='room.get_room_type_display', read_only=True)
    reported_by_name = serializers.SerializerMethodField()
    fixed_by_name = serializers.SerializerMethodField()
    issue_type_display = serializers.CharField(source='get_issue_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    is_resolved = serializers.BooleanField(read_only=True)
    
    def get_reported_by_name(self, obj):
        if obj.reported_by:
            return obj.reported_by.get_full_name() or obj.reported_by.username
        return None
    
    def get_fixed_by_name(self, obj):
        if obj.fixed_by:
            return obj.fixed_by.get_full_name() or obj.fixed_by.username
        return None
    
    class Meta:
        model = RoomIssue
        fields = [
            'id', 'room', 'room_number', 'room_type_display', 'issue_type', 'issue_type_display',
            'title', 'description', 'status', 'status_display', 'priority', 'priority_display',
            'reported_by', 'reported_by_name', 'reported_at',
            'fixed_by', 'fixed_by_name', 'fixed_at', 'resolution_notes',
            'created_at', 'updated_at', 'is_resolved'
        ]
        read_only_fields = ['reported_by', 'reported_at', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        # Set reported_by to current user
        validated_data['reported_by'] = self.context['request'].user
        return super().create(validated_data)

