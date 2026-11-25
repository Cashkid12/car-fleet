import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { UserButton } from '@clerk/clerk-react'
import api from '../services/api'
import BrandMark from './BrandMark'
import { HiOutlineBell } from 'react-icons/hi2'

export default function AppHeader({ title, subtitle }) {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await api.get('/notifications/unread-count')
        setUnreadCount(res.data.count)
      } catch {}
    }
    fetchCount()
    const interval = setInterval(fetchCount, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="border-b border-hairline bg-canvas/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[58px] w-full max-w-[1400px] items-center gap-3 px-4 sm:px-6">
        <Link to="/" aria-label="Fleet Manager home" className="flex items-center">
          <BrandMark size={28} iconSize={15} radius={8} />
        </Link>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[14.5px] font-semibold leading-tight tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="truncate text-[11px] leading-tight text-ink-faint">{subtitle}</p>
          )}
        </div>

        <Link
          to="/notifications"
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-[10px] text-ink-soft transition-colors hover:bg-ghost hover:text-ink"
        >
          <HiOutlineBell size={19} />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-solid px-1 text-[9.5px] font-bold text-solid-ink ring-2 ring-canvas">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        <div className="flex h-8 w-8 items-center justify-center">
          <UserButton />
        </div>
      </div>
    </div>
  )
}
