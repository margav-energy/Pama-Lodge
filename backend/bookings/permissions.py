from rest_framework import permissions


class IsManager(permissions.BasePermission):
    """Permission check for manager role"""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_manager()


class IsReceptionist(permissions.BasePermission):
    """Permission check for receptionist role"""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_receptionist()


class IsManagerOrReadOnly(permissions.BasePermission):
    """Allow read-only access to all authenticated users, but write access only to managers"""
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_authenticated and request.user.is_manager()

