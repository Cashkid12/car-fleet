import { useState, useEffect, useCallback } from 'react'
import db from '../utils/localDB'
import offlineSync from '../utils/offlineSync'

export function useOfflineStorage() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    const updateCount = async () => {
      const count = await offlineSync.getPendingCount()
      setPendingCount(count)
    }
    updateCount()
    const interval = setInterval(updateCount, 5000)
    return () => clearInterval(interval)
  }, [])

  const saveOffline = useCallback(async (table, data) => {
    try {
      await db.table(table).put(data)
      return true
    } catch {
      return false
    }
  }, [])

  const getOfflineData = useCallback(async (table, id) => {
    try {
      if (id) return await db.table(table).get(id)
      return await db.table(table).toArray()
    } catch {
      return null
    }
  }, [])

  const queueForSync = useCallback(async (type, carId, payload) => {
    await offlineSync.addToQueue({ type, carId, payload, clientId: Date.now().toString() })
  }, [])

  return { isOnline, pendingCount, saveOffline, getOfflineData, queueForSync, offlineSync }
}