import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import api from '../services/api'
import { formatCurrency, formatRelativeTime } from '../utils/formatters'
import { LoadingSkeleton } from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import {
  HiOutlineArrowTrendingUp,
  HiOutlineReceiptPercent,
  HiOutlineTruck,
  HiOutlineCurrencyDollar,
  HiOutlineExclamationTriangle,
  HiOutlinePlus,
  HiOutlineBell,
  HiOutlineClock,
  HiOutlineWrenchScrewdriver,
  HiOutlineCheckCircle,
  HiOutlineFire,
  HiOutlineChevronRight,
  HiOutlineBanknotes
} from 'react-icons/hi2'

const activityIcons = {
  income_added: HiOutlineCurrencyDollar,
  expense_added: HiOutlineReceiptPercent,
  damage_reported: HiOutlineExclamationTriangle,
  damage_fixed: HiOutlineCheckCircle,
  car_added: HiOutlinePlus,
  car_updated: HiOutlineWrenchScrewdriver,
  car_deleted: HiOutlineFire,
}

export default function Dashboard() {
  const { user } = useUser()
  const [summary, setSummary] = useState(null)
  const [cars, setCars] = useState([])
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  const fetchData = async () => {
    try {
      const [summaryRes, carsRes, activitiesRes] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/cars'),
        api.get('/activities')
      ])
      setSummary(summaryRes.data)
      setCars(carsRes.data)
      setActivities(activitiesRes.data)
      localStorage.setItem('dashboard_cache', JSON.stringify({
        summary: summaryRes.data,
        cars: carsRes.data,
        activities: activitiesRes.data,
        timestamp: Date.now()
      }))
    } catch {
      const cached = localStorage.getItem('dashboard_cache')
      if (cached) {
        const data = JSON.parse(cached)
        setSummary(data.summary)
        setCars(data.cars)
        setActivities(data.activities || [])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  if (loading) {
    return (
      <div className="py-2">
        <div className="skeleton mb-4 h-4 w-28" />
        <div className="skeleton mb-8 h-10 w-64" />
        <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-[124px]" />)}
        </div>
        <div className="mb-8 grid grid-cols-3 gap-3">
          {[1, 2, 3].map(i => <div key={i} className="skeleton h-[88px]" />)}
        </div>
        <LoadingSkeleton lines={3} height="h-32" />
      </div>
    )
  }

  const firstName = user?.firstName || user?.fullName?.split(' ')[0] || 'there'

  const statCards = summary ? [
    {
      label: 'Net Profit',
      value: formatCurrency(summary.profitThisMonth || 0),
      subtitle: (summary.profitThisMonth || 0) >= 0 ? 'Positive margin' : 'Negative margin',
      icon: HiOutlineArrowTrendingUp,
      invert: true,
    },
    {
      label: 'Income',
      value: formatCurrency(summary.incomeThisMonth || 0),
      subtitle: 'This month',
      icon: HiOutlineCurrencyDollar,
    },
    {
      label: 'Expenses',
      value: formatCurrency(summary.expensesThisMonth || 0),
      subtitle: 'This month',
      icon: HiOutlineReceiptPercent,
    },
    {
      label: 'Active Vehicles',
      value: String(summary.activeCars ?? 0),
      subtitle: summary.damagedCars > 0 ? `${summary.damagedCars} damaged` : 'All healthy',
      icon: HiOutlineTruck,
    },
  ] : []

  const quickActions = [
    { label: 'Income', hint: 'Record collection', icon: HiOutlineBanknotes, path: '/add-income' },
    { label: 'Damage', hint: 'Report repair', icon: HiOutlineExclamationTriangle, path: '/add-damage' },
    { label: 'New Car', hint: 'Add vehicle', icon: HiOutlinePlus, path: '/cars' },
  ]

  const today = new Date().toLocaleDateString('en-KE', {
    weekday: 'long', day: 'numeric', month: 'long'
  })

  return (
    <div className="page-enter">
      {/* ===== HEADER ===== */}
      <div className="mb-7 flex items-start justify-between gap-4 md:mb-9">
        <div className="min-w-0">
          <p className="t-label">{today}</p>
          <h1 className="t-page mt-2 truncate">
            {getGreeting()}, {firstName}
          </h1>
          <p className="t-sm mt-1 text-ink-soft">
            Welcome back. Here is how your fleet is performing.
          </p>
        </div>
        <Link
          to="/notifications"
          aria-label="Notifications"
          className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[10px] border border-hairline bg-panel text-ink-soft transition-colors hover:border-hairline-strong hover:text-ink"
        >
          <HiOutlineBell size={19} />
          {summary?.damagedCars > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-solid px-1 text-[9.5px] font-bold text-solid-ink ring-2 ring-canvas">
              {summary.damagedCars}
            </span>
          )}
        </Link>
      </div>

      {/* ===== STAT CARDS ===== */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon
          if (stat.invert) {
            return (
              <div key={i} className="card-invert list-item-enter p-4 sm:p-5" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex items-center justify-between">
                  <p className="t-label text-[var(--solid-soft)]">{stat.label}</p>
                  <Icon size={18} className="opacity-60" />
                </div>
                <p className="figure-lg mt-4 break-words text-[26px] sm:text-[30px] lg:text-[28px]">
                  {stat.value}
                </p>
                <p className="t-xs mt-1.5 text-[var(--solid-soft)]">{stat.subtitle}</p>
              </div>
            )
          }
          return (
            <div key={i} className="card list-item-enter p-4 sm:p-5" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="flex items-center justify-between">
                <p className="t-label">{stat.label}</p>
                <Icon size={18} className="text-ink-faint" />
              </div>
              <p className="figure mt-4 break-words text-[19px] sm:text-[21px]">{stat.value}</p>
              <p className="t-xs mt-1.5 text-ink-faint">{stat.subtitle}</p>
            </div>
          )
        })}
      </div>

      {/* ===== QUICK ACTIONS ===== */}
      <div className="mt-8">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="t-section">Quick actions</h2>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="card card-interactive flex flex-col items-start gap-3 p-3.5 text-left transition-transform active:scale-[0.99] sm:p-4"
            >
              <span className="tile">
                <action.icon size={18} />
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-semibold leading-tight">+ {action.label}</span>
                <span className="t-micro mt-0.5 hidden text-ink-faint sm:block">{action.hint}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ===== CONTENT GRID ===== */}
      <div className="mt-8 grid gap-6 lg:grid-cols-12 lg:gap-7">
        {/* Your fleet */}
        <section className="lg:col-span-7">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="t-section">Your fleet</h2>
            {cars.length > 0 && (
              <Link to="/cars" className="t-sm font-medium text-ink-soft transition-colors hover:text-ink">
                View all
              </Link>
            )}
          </div>

          <div className="card card-flush overflow-hidden">
            {cars.length === 0 ? (
              <EmptyState
                icon={<HiOutlineTruck size={26} />}
                title="No vehicles yet"
                description="Add your first vehicle to start tracking income and repairs."
                actionLabel="Add your first car"
                onAction={() => navigate('/cars')}
              />
            ) : (
              <div className="divide-y divide-hairline">
                {cars.slice(0, 3).map((car, index) => {
                  const healthy = car.status === 'healthy'
                  return (
                    <button
                      key={car._id}
                      onClick={() => navigate(`/cars/${car._id}`)}
                      className="list-item-enter block w-full px-4 py-4 text-left transition-colors hover:bg-ghost sm:px-5"
                      style={{ animationDelay: `${index * 40}ms` }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="plate">{car.plateNumber}</span>
                            <span className={`badge ${healthy ? 'badge-subtle' : 'badge-outline'}`}>
                              {healthy
                                ? <HiOutlineCheckCircle size={12} />
                                : <HiOutlineExclamationTriangle size={12} />}
                              {healthy ? 'Healthy' : 'Damaged'}
                            </span>
                          </div>
                          <p className="t-xs mt-1.5 truncate text-ink-faint">
                            {car.driverName} · {car.passengerCapacity} passengers
                          </p>
                        </div>
                        <HiOutlineChevronRight size={17} className="mt-1 flex-shrink-0 text-ink-faint" />
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-hairline pt-3">
                        <div>
                          <p className="t-label text-[9.5px]">Income</p>
                          <p className="figure-sm mt-1">{formatCurrency(car.incomeThisMonth || 0)}</p>
                        </div>
                        <div className="border-l border-hairline pl-3">
                          <p className="t-label text-[9.5px]">Expenses</p>
                          <p className="figure-sm mt-1">{formatCurrency(car.expensesThisMonth || 0)}</p>
                        </div>
                        <div className="border-l border-hairline pl-3">
                          <p className="t-label text-[9.5px]">Profit</p>
                          <p className={`figure-sm mt-1 ${(car.profitThisMonth || 0) < 0 ? 'text-ink-soft' : 'text-ink'}`}>
                            {formatCurrency(car.profitThisMonth || 0)}
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {cars.length > 3 && (
            <Link
              to="/cars"
              className="mt-3 flex h-10 items-center justify-center rounded-[10px] border border-hairline text-[12.5px] font-medium text-ink-soft transition-colors hover:bg-ghost hover:text-ink"
            >
              {cars.length - 3} more vehicles
            </Link>
          )}
        </section>

        {/* Recent activity */}
        <section className="lg:col-span-5">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="t-section">Recent activity</h2>
            <HiOutlineClock size={16} className="text-ink-faint" />
          </div>

          <div className="card card-flush overflow-hidden">
            {activities.length === 0 ? (
              <EmptyState
                icon={<HiOutlineClock size={26} />}
                title="No activity yet"
                description="Income, expenses, damages and new vehicles will appear here."
                actionLabel="Add income"
                onAction={() => navigate('/add-income')}
              />
            ) : (
              <div className="divide-y divide-hairline">
                {activities.map((activity, index) => {
                  const Icon = activityIcons[activity.type] || activityIcons.income_added
                  return (
                    <div
                      key={activity._id}
                      className="list-item-enter flex items-center gap-3 px-4 py-3.5 sm:px-5"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <span className="tile h-8 w-8 rounded-[9px]">
                        <Icon size={16} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium">{activity.title}</p>
                        <p className="t-xs truncate text-ink-faint">
                          {activity.description}
                          {activity.plateNumber && <span className="mono"> · {activity.plateNumber}</span>}
                        </p>
                      </div>
                      <span className="t-micro flex-shrink-0 text-ink-faint">
                        {formatRelativeTime(activity.createdAt)}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
