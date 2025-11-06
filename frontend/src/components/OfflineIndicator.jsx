import { useState, useEffect } from 'react'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import syncService from '../services/syncService'
import offlineStorage from '../services/offlineStorage'

const OfflineIndicator = () => {
  const isOnline = useOnlineStatus()
  const [pendingCount, setPendingCount] = useState(0)
  const [syncStatus, setSyncStatus] = useState(null)

  useEffect(() => {
    const updatePendingCount = async () => {
      const count = await offlineStorage.getPendingCount()
      setPendingCount(count)
    }

    updatePendingCount()
    const interval = setInterval(updatePendingCount, 5000) // Check every 5 seconds

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleSyncStatus = (status) => {
      setSyncStatus(status)
      if (!status.syncing) {
        // Refresh pending count after sync
        setTimeout(async () => {
          const count = await offlineStorage.getPendingCount()
          setPendingCount(count)
        }, 1000)
      }
    }

    syncService.onSync(handleSyncStatus)

    // Auto-sync when coming back online
    if (isOnline && pendingCount > 0) {
      syncService.checkAndSync()
    }

    return () => {
      // Cleanup if needed
    }
  }, [isOnline, pendingCount])

  if (isOnline && pendingCount === 0 && !syncStatus) {
    return null // Don't show anything when online and synced
  }

  return (
    <div className="fixed bottom-2 sm:bottom-4 right-2 sm:right-4 z-50 max-w-xs sm:max-w-none">
      {!isOnline ? (
        <div className="bg-yellow-500 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg shadow-lg flex items-center space-x-2 text-xs sm:text-sm">
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
            />
          </svg>
          <span className="font-semibold truncate">Offline Mode</span>
          {pendingCount > 0 && (
            <span className="bg-yellow-600 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs flex-shrink-0">
              {pendingCount}
            </span>
          )}
        </div>
      ) : syncStatus?.syncing ? (
        <div className="bg-blue-500 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg shadow-lg flex items-center space-x-2 text-xs sm:text-sm">
          <svg
            className="animate-spin h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="font-semibold truncate">
            Syncing... {syncStatus.count}/{syncStatus.total}
          </span>
        </div>
      ) : syncStatus?.synced !== undefined ? (
        <div className="bg-green-500 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg shadow-lg flex items-center space-x-2 text-xs sm:text-sm">
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className="font-semibold truncate">
            Synced {syncStatus.synced} booking{syncStatus.synced !== 1 ? 's' : ''}
          </span>
        </div>
      ) : pendingCount > 0 ? (
        <div className="bg-orange-500 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg shadow-lg flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 text-xs sm:text-sm">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-semibold truncate">
              {pendingCount} booking{pendingCount !== 1 ? 's' : ''} pending sync
            </span>
          </div>
          <button
            onClick={() => syncService.syncOfflineBookings()}
            className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 px-2 sm:px-3 py-1 rounded text-xs font-semibold flex-shrink-0"
          >
            Sync Now
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default OfflineIndicator

