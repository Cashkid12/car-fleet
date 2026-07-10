import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserButton } from '@clerk/clerk-react'
import api from '../services/api'
import { HiOutlineBell } from 'react-icons/hi2'

export default function AppHeader({ title, subtitle }) {
  const [unreadCount, setUnreadCount] = useState(0)
  const navigate = useNavigate()

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
    <div className="bg-[#111827] border-b border-white/5">
      <div className="flex items-center justify-between px-5 h-[64px] max-w-[480px] mx-auto">
        <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-teal-600 rounded-[10px] flex items-center justify-center shadow-lg shadow-teal-500/20 flex-shrink-0">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
            <path d="M13 5l3 5m0 0h2.5a1.5 1.5 0 011.423 1.026L21 14H3l1.077-2.974A1.5 1.5 0 015.5 10H8m5 0H8m5 0v5H8V10" />
          </svg>
        </div>
        <div className="flex-1 text-center mx-3">
          <h1 className="text-[17px] font-semibold text-white tracking-tight leading-tight">{title}</h1>
          {subtitle && <p className="text-[12px] text-[#64748B] leading-tight">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => navigate('/notifications')} className="w-10 h-10 rounded-full flex items-center justify-center text-[#64748B] hover:text-white hover:bg-white/5 transition-all duration-200 relative">
            <HiOutlineBell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 bg-teal-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center px-1 ring-2 ring-[#111827]">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
          <UserButton />
        </div>
      </div>
    </div>
  )
}