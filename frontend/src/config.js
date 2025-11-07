// API configuration
// In production (served from Django), use relative URLs
// In development, use the full URL or VITE_API_URL if set
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? '' : 'http://localhost:8000')

export default API_BASE_URL

