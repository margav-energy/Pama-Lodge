from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Sum
from django.utils import timezone
from datetime import date
from .models import Booking, User, Room
from .serializers import BookingSerializer, BookingListSerializer, UserSerializer, RoomSerializer, RoomAvailabilitySerializer
from .permissions import IsManagerOrReadOnly, IsManager


class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        queryset = Booking.objects.filter(is_original=True)
        
        # Filter by check-in date if provided
        check_in_date = self.request.query_params.get('check_in_date', None)
        if check_in_date:
            try:
                queryset = queryset.filter(check_in_date=check_in_date)
            except ValueError:
                pass
        
        # Both receptionist and manager can see all bookings
        return queryset.order_by('-created_at')
    
    def get_serializer_class(self):
        if self.action == 'list':
            return BookingListSerializer
        return BookingSerializer
    
    def get_permissions(self):
        if self.action == 'destroy':
            # Only manager can delete
            return [IsAuthenticated(), IsManager()]
        elif self.action in ['update', 'partial_update']:
            # Both can edit, but manager edits supersede
            return [IsAuthenticated()]
        return [IsAuthenticated()]
    
    def perform_create(self, serializer):
        serializer.save(booked_by=self.request.user)
    
    def perform_update(self, serializer):
        # The update logic is handled in the serializer
        serializer.save()
    
    def perform_destroy(self, instance):
        # Only manager can delete
        if not self.request.user.is_manager():
            return Response(
                {"detail": "You do not have permission to delete bookings."},
                status=status.HTTP_403_FORBIDDEN
            )
        instance.delete()
    
    @action(detail=True, methods=['get'])
    def versions(self, request, pk=None):
        """Get all versions of a booking (manager only)"""
        if not request.user.is_manager():
            return Response(
                {"detail": "Only managers can view booking versions."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        booking = self.get_object()
        versions = booking.versions.all()
        
        from .serializers import BookingVersionSerializer
        serializer = BookingVersionSerializer(versions, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def daily_totals(self, request):
        """Get daily totals for bookings"""
        target_date = request.query_params.get('date', None)
        
        if target_date:
            try:
                target_date = date.fromisoformat(target_date)
            except ValueError:
                return Response(
                    {"error": "Invalid date format. Use YYYY-MM-DD."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            target_date = timezone.now().date()
        
        bookings = Booking.objects.filter(
            is_original=True,
            check_in_date=target_date
        )
        
        total_amount = bookings.aggregate(total=Sum('amount_ghs'))['total'] or 0
        total_bookings = bookings.count()
        
        return Response({
            'date': target_date,
            'total_bookings': total_bookings,
            'total_amount_ghs': float(total_amount)
        })
    
    @action(detail=True, methods=['post'])
    def authorize(self, request, pk=None):
        """Authorize a booking (manager only)"""
        if not request.user.is_manager():
            return Response(
                {"detail": "Only managers can authorize bookings."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        booking = self.get_object()
        authorized_by = request.data.get('authorized_by', request.user.get_full_name() or request.user.username)
        
        booking.is_authorized = True
        booking.authorized_by = authorized_by
        booking.save()
        
        serializer = self.get_serializer(booking)
        return Response(serializer.data)


class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def available(self, request):
        """Get available rooms for given dates"""
        check_in_date = request.query_params.get('check_in_date', None)
        check_out_date = request.query_params.get('check_out_date', None)
        room_type = request.query_params.get('room_type', None)
        
        if not check_in_date:
            return Response(
                {"error": "check_in_date parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            check_in = date.fromisoformat(check_in_date)
            check_out = date.fromisoformat(check_out_date) if check_out_date else None
        except ValueError:
            return Response(
                {"error": "Invalid date format. Use YYYY-MM-DD."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        rooms = Room.objects.filter(is_available=True)
        
        if room_type:
            rooms = rooms.filter(room_type=room_type)
        
        available_rooms = []
        for room in rooms:
            is_available = room.check_availability(check_in, check_out)
            if is_available:
                available_rooms.append({
                    'room_id': room.id,
                    'room_number': room.room_number,
                    'room_type': room.room_type,
                    'room_type_display': room.get_room_type_display(),
                    'is_available': True,
                    'price_per_night': float(room.price_per_night),
                    'description': room.description
                })
        
        return Response(available_rooms)
    
    @action(detail=False, methods=['get'])
    def status(self, request):
        """Get all rooms with their booking status for a given date"""
        target_date = request.query_params.get('date', None)
        
        if target_date:
            try:
                target_date = date.fromisoformat(target_date)
            except ValueError:
                return Response(
                    {"error": "Invalid date format. Use YYYY-MM-DD."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            target_date = timezone.now().date()
        
        rooms = Room.objects.all()
        room_status = []
        
        for room in rooms:
            is_booked = not room.check_availability(target_date)
            current_booking = None
            if is_booked:
                booking = Booking.objects.filter(
                    room_no=room.room_number,
                    is_original=True,
                    check_in_date__lte=target_date
                ).exclude(
                    check_out_date__lt=target_date
                ).first()
                if booking:
                    current_booking = {
                        'guest_name': booking.name,
                        'check_in': str(booking.check_in_date),
                        'check_out': str(booking.check_out_date) if booking.check_out_date else None
                    }
            
            room_status.append({
                'room_id': room.id,
                'room_number': room.room_number,
                'room_type': room.room_type,
                'room_type_display': room.get_room_type_display(),
                'is_available': room.is_available,
                'is_booked': is_booked,
                'current_booking': current_booking,
                'price_per_night': float(room.price_per_night)
            })
        
        return Response(room_status)


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user information"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

