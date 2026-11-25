import { useState, useEffect } from 'react'
import offlineSync from '../utils/offlineSync'
import {
  HiOutlineArrowPath,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineWifi
} from 'react-icons/hi2'

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
    offline: { icon: HiOutlineWifi, message: 'Offline — changes saved locally' },
    syncing: { icon: HiOutlineArrowPath, message: `Syncing ${pendingCount > 0 ? `${pendingCount} item${pendingCount > 1 ? 's' : ''}` : '...'}` },
    online: { icon: HiOutlineCheckCircle, message: 'All changes synced' },
    error: { icon: HiOutlineExclamationTriangle, message: 'Sync failed — retrying...' },
  }

  const config = configs[status]
  const Icon = config.icon

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[88px] z-50 flex justify-center px-4 md:bottom-6">
      <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-hairline bg-panel/95 px-3.5 py-2 text-[12px] font-medium text-ink shadow-[var(--nav-shadow)] backdrop-blur-xl">
        <Icon
          size={15}
          className={`text-ink-soft ${status === 'syncing' ? 'animate-spin' : ''}`}
        />
        <span>{config.message}</span>
        {status === 'error' && (
          <button onClick={() => offlineSync.syncPending()} className="underline underline-offset-2">
            Retry
          </button>
        )}
      </div>
    </div>
  )
}
