"""
URL configuration for pama_lodge project.
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.http import FileResponse, HttpResponseNotFound
from django.views.static import serve
import os

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('bookings.urls')),
]

# Frontend build directory
frontend_dir = os.path.join(settings.BASE_DIR.parent, 'frontend', 'dist')

# Serve React app static assets (JS, CSS from assets folder)
# Vite builds assets in /assets/ directory
def serve_react_assets(request, path):
    """Serve static assets from the React build directory."""
    try:
        assets_dir = os.path.join(frontend_dir, 'assets')
        file_path = os.path.join(assets_dir, path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return serve(request, path, document_root=assets_dir)
        # Try serving from frontend_dir directly (for files like vite.svg)
        file_path = os.path.join(frontend_dir, path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return serve(request, path, document_root=frontend_dir)
        return HttpResponseNotFound()
    except Exception as e:
        # Log error but don't expose it
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error serving asset {path}: {str(e)}")
        return HttpResponseNotFound()

# Serve React app for all non-API routes
# This must be last to catch all other routes
def serve_react_app(request):
    """
    Serve the React app's index.html for all non-API routes.
    This allows React Router to handle client-side routing.
    """
    index_path = os.path.join(frontend_dir, 'index.html')
    
    if os.path.exists(index_path):
        return FileResponse(open(index_path, 'rb'), content_type='text/html')
    else:
        # Fallback if frontend is not built
        return HttpResponseNotFound(
            '<h1>Frontend not built</h1><p>Please run: npm run build in the frontend directory</p>'
        )

# Serve assets from /assets/ (Vite build output)
urlpatterns += [
    re_path(r'^assets/.*$', serve_react_assets),
]

# Catch all other routes and serve React app (for client-side routing)
# Exclude API, admin, static, and assets routes
urlpatterns += [
    re_path(r'^(?!api|admin|static|assets).*$', serve_react_app),
]

# Serve static files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

