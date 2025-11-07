"""
URL configuration for pama_lodge project.
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.http import FileResponse, HttpResponseNotFound
import os

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('bookings.urls')),
]

# Serve React app for all non-API routes
# This must be last to catch all other routes
def serve_react_app(request):
    """
    Serve the React app's index.html for all non-API routes.
    This allows React Router to handle client-side routing.
    Static assets (JS, CSS) are served by WhiteNoise from STATICFILES_DIRS.
    """
    frontend_dir = os.path.join(settings.BASE_DIR.parent, 'frontend', 'dist')
    index_path = os.path.join(frontend_dir, 'index.html')
    
    if os.path.exists(index_path):
        return FileResponse(open(index_path, 'rb'), content_type='text/html')
    else:
        # Fallback if frontend is not built
        return HttpResponseNotFound(
            '<h1>Frontend not built</h1><p>Please run: npm run build in the frontend directory</p>'
        )

# Catch all other routes and serve React app (for client-side routing)
# Exclude API, admin, and static file routes
urlpatterns += [
    re_path(r'^(?!api|admin|static).*$', serve_react_app),
]

# Serve static files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

