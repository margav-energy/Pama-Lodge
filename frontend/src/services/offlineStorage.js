// Offline Storage Service using IndexedDB
class OfflineStorage {
  constructor() {
    this.dbName = 'PamaLodgeDB'
    this.dbVersion = 1
    this.db = null
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = event.target.result

        // Create object store for offline bookings
        if (!db.objectStoreNames.contains('offlineBookings')) {
          const bookingStore = db.createObjectStore('offlineBookings', {
            keyPath: 'id',
            autoIncrement: true,
          })
          bookingStore.createIndex('timestamp', 'timestamp', { unique: false })
          bookingStore.createIndex('synced', 'synced', { unique: false })
        }
      }
    })
  }

  async addBooking(bookingData) {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['offlineBookings'], 'readwrite')
      const store = transaction.objectStore('offlineBookings')

      const booking = {
        ...bookingData,
        timestamp: Date.now(),
        synced: false,
        id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      }

      const request = store.add(booking)

      request.onsuccess = () => resolve(booking.id)
      request.onerror = () => reject(request.error)
    })
  }

  async getAllOfflineBookings() {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['offlineBookings'], 'readonly')
      const store = transaction.objectStore('offlineBookings')
      
      // Get all bookings and filter for unsynced ones
      const request = store.getAll()

      request.onsuccess = () => {
        // Filter to get only unsynced bookings
        const unsyncedBookings = request.result.filter(booking => booking.synced === false)
        resolve(unsyncedBookings)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async markAsSynced(bookingId) {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['offlineBookings'], 'readwrite')
      const store = transaction.objectStore('offlineBookings')
      const getRequest = store.get(bookingId)

      getRequest.onsuccess = () => {
        const booking = getRequest.result
        if (booking) {
          booking.synced = true
          const updateRequest = store.put(booking)
          updateRequest.onsuccess = () => resolve()
          updateRequest.onerror = () => reject(updateRequest.error)
        } else {
          resolve() // Booking not found, might have been deleted
        }
      }
      getRequest.onerror = () => reject(getRequest.error)
    })
  }

  async deleteBooking(bookingId) {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['offlineBookings'], 'readwrite')
      const store = transaction.objectStore('offlineBookings')
      const request = store.delete(bookingId)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getPendingCount() {
    const bookings = await this.getAllOfflineBookings()
    return bookings.length
  }
}

export default new OfflineStorage()

