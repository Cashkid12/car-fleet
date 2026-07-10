import { useState, useEffect } from 'react'
import offlineSync from '../utils/offlineSync'
import { HiOutlineCloud, HiOutlineCloudArrowUp, HiOutlineCheckCircle, HiOutlineExclamationTriangle, HiOutlineWifi } from 'react-icons/hi2'

export default function SyncIndicator() {
  const [status, setStatus] = useState('online')
  const [pendingCount, setPendingCount] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const updatePending = async () => {
      const count = await offlineSync.getPendingCount()
      setPendingCount(count)
    }

    const unsubscribe = offlineSync.subscribe(async (event, data) => {
      switch (event) {
        case 'online': setStatus('online'); break
        case 'offline': setStatus('offline'); setVisible(true); break
        case 'syncing': setStatus('syncing'); setVisible(true); break
        case 'sync_complete':
          setStatus('online');
          if (data.count > 0) { setVisible(true); setTimeout(() => setVisible(false), 3000); }
          break
        case 'sync_error': setStatus('error'); setVisible(true); break
        case 'queued': updatePending(); break
      }
      await updatePending()
    })

    updatePending()

    // Initial check
    if (!navigator.onLine) setStatus('offline')

    return unsubscribe
  }, [])

  if (!visible && status === 'online') return null

  const configs = {
    offline: { icon: HiOutlineWifi, bg: 'bg-warning/90', text: 'text-black', message: 'Offline — changes saved locally' },
    syncing: { icon: HiOutlineCloudArrowUp, bg: 'bg-teal-500/90', text: 'text-white', message: `Syncing ${pendingCount > 0 ? `${pendingCount} item${pendingCount > 1 ? 's' : ''}` : '...'}` },
    online: { icon: HiOutlineCheckCircle, bg: 'bg-success/90', text: 'text-white', message: 'All changes synced' },
    error: { icon: HiOutlineExclamationTriangle, bg: 'bg-danger/90', text: 'text-white', message: 'Sync failed — retrying...' },
  }

  const config = configs[status]
  const Icon = config.icon

  return (
    <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full ${config.bg} ${config.text} text-[12px] font-semibold flex items-center gap-2 shadow-2xl transition-all duration-300`}>
      <Icon size={16} />
      <span>{config.message}</span>
      {status === 'error' && (
        <button onClick={() => offlineSync.syncPending()} className="underline ml-1">Retry</button>
      )}
    </div>
  )
}