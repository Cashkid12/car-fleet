import { useState, useEffect } from 'react'
import { HiOutlineWifi } from 'react-icons/hi2'

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const goOffline = () => setIsOffline(true)
    const goOnline = () => setIsOffline(false)
    window.addEventListener('offline', goOffline)
    window.addEventListener('online', goOnline)
    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online', goOnline)
    }
  }, [])

  if (!isOffline) return null

  return (
    <div className="offline-banner-slide flex items-center justify-center gap-2 border-b border-hairline bg-panel-soft px-4 py-2 text-ink-soft">
      <HiOutlineWifi size={15} />
      <span className="t-xs text-center">
        No internet connection — changes are stored and will sync automatically
      </span>
    </div>
  )
}
