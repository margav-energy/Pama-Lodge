import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import offlineStorage from './services/offlineStorage'
import syncService from './services/syncService'

// Initialize offline storage
offlineStorage.init().then(() => {
  console.log('Offline storage initialized')
  
  // Check for pending bookings and sync if online
  if (navigator.onLine) {
    syncService.checkAndSync()
  }
}).catch((error) => {
  console.error('Failed to initialize offline storage:', error)
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

