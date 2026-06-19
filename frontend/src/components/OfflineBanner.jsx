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
    <div className="bg-warning/95 text-black text-[13px] font-medium px-4 py-2.5 flex items-center justify-center gap-2 offline-banner-slide">
      <HiOutlineWifi size={18} />
      <span>You are offline — changes will sync when connected</span>
    </div>
  )
}
