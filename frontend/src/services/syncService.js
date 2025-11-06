import axios from 'axios'
import offlineStorage from './offlineStorage'

class SyncService {
  constructor() {
    this.isSyncing = false
    this.syncListeners = []
  }

  onSync(listener) {
    this.syncListeners.push(listener)
  }

  notifySyncListeners(status) {
    this.syncListeners.forEach((listener) => listener(status))
  }

  async syncOfflineBookings() {
    if (this.isSyncing) {
      console.log('Sync already in progress')
      return
    }

    if (!navigator.onLine) {
      console.log('Device is offline, cannot sync')
      return
    }

    this.isSyncing = true
    this.notifySyncListeners({ syncing: true, count: 0 })

    try {
      const offlineBookings = await offlineStorage.getAllOfflineBookings()
      let syncedCount = 0
      let failedCount = 0

      for (const booking of offlineBookings) {
        try {
          // Remove offline-specific fields before syncing
          const { id, timestamp, synced, ...bookingData } = booking

          const response = await axios.post('/api/bookings/', bookingData)

          // Mark as synced if successful
          await offlineStorage.markAsSynced(booking.id)
          syncedCount++

          this.notifySyncListeners({
            syncing: true,
            count: syncedCount,
            total: offlineBookings.length,
          })
        } catch (error) {
          console.error('Failed to sync booking:', error)
          failedCount++

          // If it's a validation error (400), mark as synced to avoid retrying invalid data
          if (error.response?.status === 400) {
            await offlineStorage.markAsSynced(booking.id)
          }
        }
      }

      this.notifySyncListeners({
        syncing: false,
        synced: syncedCount,
        failed: failedCount,
        total: offlineBookings.length,
      })

      return { synced: syncedCount, failed: failedCount }
    } catch (error) {
      console.error('Sync error:', error)
      this.notifySyncListeners({
        syncing: false,
        error: error.message,
      })
      throw error
    } finally {
      this.isSyncing = false
    }
  }

  async checkAndSync() {
    if (navigator.onLine && !this.isSyncing) {
      const pendingCount = await offlineStorage.getPendingCount()
      if (pendingCount > 0) {
        await this.syncOfflineBookings()
      }
    }
  }
}

export default new SyncService()

