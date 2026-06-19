const DB_NAME = 'fleetManagerOffline'
const STORE_NAME = 'offlineQueue'

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function addToQueue(entry) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const request = store.add({ ...entry, createdAt: Date.now() })
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function getQueue() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function clearQueue() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const request = store.clear()
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function syncOfflineQueue(api) {
  const queue = await getQueue()
  if (queue.length === 0) return { synced: 0 }

  let synced = 0
  for (const entry of queue) {
    try {
      if (entry.type === 'income') {
        await api.post(`/cars/${entry.carId}/income`, entry.data)
      } else if (entry.type === 'damage') {
        await api.post(`/cars/${entry.carId}/damage`, entry.data)
      } else if (entry.type === 'expense') {
        await api.post(`/cars/${entry.carId}/expense`, entry.data)
      }
      synced++
    } catch (err) {
      console.error('Failed to sync entry:', err)
    }
  }

  await clearQueue()
  return { synced, total: queue.length }
}
