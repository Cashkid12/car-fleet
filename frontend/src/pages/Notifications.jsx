import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { formatRelativeTime } from '../utils/formatters'
import { LoadingSkeleton } from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import {
  HiOutlineBell,
  HiOutlineBellAlert,
  HiOutlineCheck,
  HiOutlineTrash,
  HiOutlineMagnifyingGlass,
  HiOutlineXMark,
  HiOutlineCurrencyDollar,
  HiOutlineExclamationTriangle,
  HiOutlineWrenchScrewdriver,
  HiOutlineTruck,
  HiOutlineChartBar,
  HiOutlineInformationCircle,
  HiOutlineCheckCircle
} from 'react-icons/hi2'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'income_added', label: 'Income' },
  { key: 'expense_added', label: 'Expenses' },
  { key: 'damage_reported', label: 'Damage' },
  { key: 'vehicle_added', label: 'Vehicles' },
]

const notificationIcons = {
  income_added: { icon: HiOutlineCurrencyDollar, bg: 'bg-success/10', color: 'text-success' },
  income_updated: { icon: HiOutlineCurrencyDollar, bg: 'bg-success/10', color: 'text-success' },
  income_deleted: { icon: HiOutlineCurrencyDollar, bg: 'bg-danger/10', color: 'text-danger' },
  expense_added: { icon: HiOutlineChartBar, bg: 'bg-danger/10', color: 'text-danger' },
  expense_updated: { icon: HiOutlineChartBar, bg: 'bg-danger/10', color: 'text-danger' },
  expense_deleted: { icon: HiOutlineChartBar, bg: 'bg-danger/10', color: 'text-danger' },
  damage_reported: { icon: HiOutlineExclamationTriangle, bg: 'bg-warning/10', color: 'text-warning' },
  repair_started: { icon: HiOutlineWrenchScrewdriver, bg: 'bg-warning/10', color: 'text-warning' },
  repair_completed: { icon: HiOutlineCheckCircle, bg: 'bg-success/10', color: 'text-success' },
  vehicle_added: { icon: HiOutlineTruck, bg: 'bg-teal-500/10', color: 'text-teal-500' },
  vehicle_updated: { icon: HiOutlineTruck, bg: 'bg-teal-500/10', color: 'text-teal-500' },
  vehicle_deleted: { icon: HiOutlineTruck, bg: 'bg-danger/10', color: 'text-danger' },
  report_generated: { icon: HiOutlineChartBar, bg: 'bg-teal-500/10', color: 'text-teal-500' },
  system_message: { icon: HiOutlineInformationCircle, bg: 'bg-white/5', color: 'text-[#94A3B8]' },
}

const priorityColors = {
  high: 'bg-danger text-white',
  medium: 'bg-warning/20 text-warning',
  low: 'bg-white/5 text-[#94A3B8]',
}

export default function Notifications() {
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState({})
  const [unreadCount, setUnreadCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [todayCount, setTodayCount] = useState(0)
  const [activeFilter, setActiveFilter] = useState('all')
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const params = {}
      if (activeFilter === 'unread') params.isRead = 'unread'
      else if (activeFilter !== 'all') params.type = activeFilter
      if (search) params.search = search

      const res = await api.get('/notifications', { params })
      setNotifications(res.data.notifications)
      setUnreadCount(res.data.unreadCount)
      setTotalCount(res.data.totalCount)
      setTodayCount(res.data.todayCount)
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { fetchNotifications() }, [activeFilter, search])

  const handleMarkAsRead = async (id) => {
    await api.put(`/notifications/${id}/read`)
    fetchNotifications()
  }

  const handleMarkAllRead = async () => {
    await api.put('/notifications/read-all')
    fetchNotifications()
  }

  const handleDelete = async (id) => {
    await api.delete(`/notifications/${id}`)
    fetchNotifications()
  }

  const handleClearAll = async () => {
    await api.delete('/notifications/clear-all')
    fetchNotifications()
  }

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) handleMarkAsRead(notification._id)
    switch (notification.relatedType) {
      case 'car': navigate(`/cars/${notification.relatedId}`); break
      case 'report': navigate('/reports'); break
      default: break
    }
  }

  if (loading) {
    return (
      <div className="px-5 py-8 max-w-2xl mx-auto">
        <div className="skeleton h-10 w-40 rounded-xl mb-2" />
        <div className="skeleton h-5 w-56 rounded-xl mb-8" />
        {[1,2,3,4,5].map(i => <div key={i} className="skeleton h-24 rounded-2xl mb-3" />)}
      </div>
    )
  }

  const totalNotifications = Object.values(notifications).flat().length

  return (
    <div className="page-enter max-w-2xl mx-auto px-5 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-[28px] font-bold text-white tracking-tight">Notifications</h1>
          <p className="text-[#94A3B8] text-[15px] mt-1">Stay updated with your fleet</p>
        </div>
        {totalNotifications > 0 && (
          <button onClick={handleMarkAllRead} className="text-teal-500 text-[14px] font-semibold flex items-center gap-1">
            <HiOutlineCheck size={18} /> Mark All Read
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6 mt-6">
        <div className="bg-[#1A2332] rounded-2xl p-4 border border-white/5 text-center">
          <p className="text-2xl font-bold text-white">{unreadCount}</p>
          <p className="text-[#64748B] text-[11px] uppercase tracking-widest mt-1">Unread</p>
        </div>
        <div className="bg-[#1A2332] rounded-2xl p-4 border border-white/5 text-center">
          <p className="text-2xl font-bold text-white">{todayCount}</p>
          <p className="text-[#64748B] text-[11px] uppercase tracking-widest mt-1">Today</p>
        </div>
        <div className="bg-[#1A2332] rounded-2xl p-4 border border-white/5 text-center">
          <p className="text-2xl font-bold text-white">{totalCount}</p>
          <p className="text-[#64748B] text-[11px] uppercase tracking-widest mt-1">Total</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <HiOutlineMagnifyingGlass size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notifications..."
          className="w-full bg-[#1A2332] text-white rounded-2xl pl-12 pr-12 h-[56px] border border-white/5 focus:border-teal-500 focus:outline-none text-[15px] placeholder-[#64748B] transition-all duration-200"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white">
            <HiOutlineXMark size={18} />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`flex-shrink-0 px-4 py-2.5 rounded-full text-[13px] font-semibold transition-all duration-200 ${
              activeFilter === f.key ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20' : 'bg-[#1A2332] text-[#94A3B8] border border-white/5'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Clear All */}
      {totalNotifications > 0 && (
        <button onClick={handleClearAll} className="text-[#64748B] text-[13px] hover:text-danger transition-colors duration-150 mb-4 flex items-center gap-1">
          <HiOutlineTrash size={14} /> Clear All
        </button>
      )}

      {/* Notifications List */}
      {totalNotifications === 0 ? (
        <EmptyState
          icon={<HiOutlineBell size={40} className="text-[#64748B] opacity-20" />}
          title="No Notifications"
          description="You're all caught up."
        />
      ) : (
        <div className="space-y-6">
          {Object.entries(notifications).map(([group, items]) => (
            <div key={group}>
              <h3 className="text-[14px] font-semibold text-[#64748B] uppercase tracking-wider mb-3">{group}</h3>
              <div className="space-y-2">
                {items.map(notification => {
                  const config = notificationIcons[notification.type] || notificationIcons.system_message
                  const Icon = config.icon
                  return (
                    <div
                      key={notification._id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`bg-[#1A2332] rounded-2xl p-4 border cursor-pointer transition-all duration-200 hover:border-white/10 list-item-enter ${
                        !notification.isRead ? 'border-l-2 border-l-teal-500' : 'border-white/5'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 ${config.bg} rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          <Icon size={20} className={config.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <p className={`text-[14px] font-semibold ${!notification.isRead ? 'text-white' : 'text-[#94A3B8]'}`}>
                              {notification.title}
                            </p>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${priorityColors[notification.priority] || priorityColors.low}`}>
                              {notification.priority}
                            </span>
                          </div>
                          <p className="text-[#94A3B8] text-[13px]">{notification.message}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-[#64748B] text-[11px]">{formatRelativeTime(notification.createdAt)}</span>
                            {notification.plateNumber && (
                              <span className="text-teal-500 text-[11px] font-medium">{notification.plateNumber}</span>
                            )}
                            {notification.referenceNumber && (
                              <span className="text-[#64748B] text-[11px] font-mono">{notification.referenceNumber}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 flex-shrink-0">
                          {!notification.isRead && (
                            <button onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notification._id); }} className="text-teal-500 hover:text-teal-400 transition-colors duration-150" title="Mark as read">
                              <HiOutlineCheck size={16} />
                            </button>
                          )}
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(notification._id); }} className="text-[#64748B] hover:text-danger transition-colors duration-150" title="Delete">
                            <HiOutlineXMark size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}