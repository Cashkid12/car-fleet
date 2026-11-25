import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { formatRelativeTime } from '../utils/formatters'
import EmptyState from '../components/EmptyState'
import {
  HiOutlineBell,
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
  income_added: HiOutlineCurrencyDollar,
  income_updated: HiOutlineCurrencyDollar,
  income_deleted: HiOutlineCurrencyDollar,
  expense_added: HiOutlineChartBar,
  expense_updated: HiOutlineChartBar,
  expense_deleted: HiOutlineChartBar,
  damage_reported: HiOutlineExclamationTriangle,
  repair_started: HiOutlineWrenchScrewdriver,
  repair_completed: HiOutlineCheckCircle,
  vehicle_added: HiOutlineTruck,
  vehicle_updated: HiOutlineTruck,
  vehicle_deleted: HiOutlineTruck,
  report_generated: HiOutlineChartBar,
  system_message: HiOutlineInformationCircle,
}

const priorityStyles = {
  high: 'badge-solid',
  medium: 'badge-outline',
  low: 'badge-subtle',
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
      <div>
        <div className="skeleton mb-2 h-9 w-48" />
        <div className="skeleton mb-6 h-4 w-56" />
        <div className="mb-6 grid grid-cols-3 gap-3">
          {[1, 2, 3].map(i => <div key={i} className="skeleton h-[88px]" />)}
        </div>
        <div className="skeleton mb-4 h-12 w-full" />
        {[1, 2, 3, 4].map(i => <div key={i} className="skeleton mb-2 h-24" />)}
      </div>
    )
  }

  const totalNotifications = Object.values(notifications).flat().length
  const counters = [
    { label: 'Unread', value: unreadCount },
    { label: 'Today', value: todayCount },
    { label: 'Total', value: totalCount },
  ]

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="t-page">Notifications</h1>
          <p className="t-sm mt-1 text-ink-soft">Stay updated with your fleet.</p>
        </div>
        {totalNotifications > 0 && (
          <button onClick={handleMarkAllRead} className="btn btn-secondary btn-sm">
            <HiOutlineCheck size={15} />
            Mark all read
          </button>
        )}
      </div>

      {/* Counters */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        {counters.map((counter) => (
          <div key={counter.label} className="card p-4">
            <p className="figure text-[22px]">{counter.value}</p>
            <p className="t-label mt-1.5">{counter.label}</p>
          </div>
        ))}
      </div>

      {/* Search + filters */}
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative w-full lg:max-w-[360px]">
          <HiOutlineMagnifyingGlass
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notifications"
            aria-label="Search notifications"
            className="field pl-11 pr-11"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-[8px] text-ink-faint transition-colors hover:bg-ghost hover:text-ink"
            >
              <HiOutlineXMark size={17} />
            </button>
          )}
        </div>

        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`pill flex-shrink-0 ${activeFilter === f.key ? 'pill-active' : ''}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* List header */}
      {totalNotifications > 0 && (
        <div className="mb-2 flex items-center justify-between">
          <p className="t-label">{totalNotifications} notifications</p>
          <button
            onClick={handleClearAll}
            className="btn btn-ghost btn-sm text-ink-faint hover:text-ink"
          >
            <HiOutlineTrash size={14} />
            Clear all
          </button>
        </div>
      )}

      {/* Notifications */}
      {totalNotifications === 0 ? (
        <div className="card p-0">
          <EmptyState
            icon={<HiOutlineBell size={26} />}
            title="No notifications"
            description="You're all caught up."
          />
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(notifications).map(([group, items]) => (
            <section key={group}>
              <h2 className="t-label mb-2">{group}</h2>
              <div className="card card-flush overflow-hidden">
                <div className="divide-y divide-hairline">
                  {items.map(notification => {
                    const Icon = notificationIcons[notification.type] || notificationIcons.system_message
                    return (
                      <div
                        key={notification._id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`relative flex cursor-pointer items-start gap-3 px-4 py-4 transition-colors hover:bg-ghost sm:px-5 ${
                          !notification.isRead ? 'bg-panel-soft/30' : ''
                        }`}
                      >
                        {!notification.isRead && (
                          <span className="absolute inset-y-0 left-0 w-[2px] bg-ink" aria-hidden="true" />
                        )}

                        <span className="tile h-9 w-9 rounded-[10px]">
                          <Icon size={16} />
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <p className={`text-[13.5px] leading-snug ${!notification.isRead ? 'font-semibold text-ink' : 'font-medium text-ink-soft'}`}>
                              {notification.title}
                            </p>
                            <span className={`badge flex-shrink-0 capitalize ${priorityStyles[notification.priority] || priorityStyles.low}`}>
                              {notification.priority}
                            </span>
                          </div>

                          <p className="t-xs mt-1 line-clamp-2 text-ink-soft">{notification.message}</p>

                          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                            <span className="t-micro text-ink-faint">{formatRelativeTime(notification.createdAt)}</span>
                            {notification.plateNumber && (
                              <span className="mono rounded-[6px] border border-hairline bg-ghost px-1.5 py-0.5 text-[10.5px] font-medium text-ink-soft">
                                {notification.plateNumber}
                              </span>
                            )}
                            {notification.referenceNumber && (
                              <span className="mono text-[10.5px] text-ink-faint">{notification.referenceNumber}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-shrink-0 flex-col gap-1">
                          {!notification.isRead && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notification._id) }}
                              className="btn btn-ghost btn-icon h-8 w-8 min-w-8"
                              aria-label="Mark as read"
                              title="Mark as read"
                            >
                              <HiOutlineCheck size={15} />
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(notification._id) }}
                            className="btn btn-ghost btn-icon h-8 w-8 min-w-8 text-ink-faint"
                            aria-label="Delete notification"
                            title="Delete"
                          >
                            <HiOutlineXMark size={15} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
