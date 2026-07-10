import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  HiOutlineFire
} from 'react-icons/hi2'

const activityIcons = {
  income_added: { icon: HiOutlineCurrencyDollar, bg: 'bg-success/10', color: 'text-success' },
  expense_added: { icon: HiOutlineReceiptPercent, bg: 'bg-danger/10', color: 'text-danger' },
  damage_reported: { icon: HiOutlineExclamationTriangle, bg: 'bg-warning/10', color: 'text-warning' },
  damage_fixed: { icon: HiOutlineCheckCircle, bg: 'bg-success/10', color: 'text-success' },
  car_added: { icon: HiOutlinePlus, bg: 'bg-teal-500/10', color: 'text-teal-500' },
  car_updated: { icon: HiOutlineWrenchScrewdriver, bg: 'bg-teal-500/10', color: 'text-teal-500' },
  car_deleted: { icon: HiOutlineFire, bg: 'bg-danger/10', color: 'text-danger' },
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
      <div className="py-8">
        <div className="skeleton h-16 w-48 rounded-2xl mb-4" />
        <div className="skeleton h-6 w-64 rounded-xl mb-8" />
        <div className="grid grid-cols-2 gap-4 mb-8">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-[110px] rounded-2xl" />)}
        </div>
        <LoadingSkeleton lines={3} height="h-40" />
      </div>
    )
  }

  const firstName = user?.firstName || user?.fullName?.split(' ')[0] || 'there'

  const statCards = summary ? [
    { label: "Today's Income", value: formatCurrency(summary.incomeThisMonth || 0), subtitle: 'This month', icon: HiOutlineCurrencyDollar, color: 'text-success', bg: 'bg-success/10' },
    { label: "Today's Expenses", value: formatCurrency(summary.expensesThisMonth || 0), subtitle: 'This month', icon: HiOutlineReceiptPercent, color: 'text-danger', bg: 'bg-danger/10' },
    { label: 'Net Profit', value: formatCurrency(summary.profitThisMonth || 0), subtitle: (summary.profitThisMonth || 0) >= 0 ? 'Positive margin' : 'Negative margin', icon: HiOutlineArrowTrendingUp, color: (summary.profitThisMonth || 0) >= 0 ? 'text-success' : 'text-danger', bg: (summary.profitThisMonth || 0) >= 0 ? 'bg-success/10' : 'bg-danger/10' },
    { label: 'Active Cars', value: summary.activeCars || 0, subtitle: summary.damagedCars > 0 ? `${summary.damagedCars} damaged` : 'All healthy', icon: HiOutlineTruck, color: 'text-teal-500', bg: 'bg-teal-500/10' },
  ] : []

  const quickActions = [
    { label: 'Income', icon: HiOutlineCurrencyDollar, path: '/add-income', gradient: 'from-success/20 to-success/5', color: 'text-success' },
    { label: 'Damage', icon: HiOutlineExclamationTriangle, path: '/add-damage', gradient: 'from-warning/20 to-warning/5', color: 'text-warning' },
    { label: 'New Car', icon: HiOutlinePlus, path: '/cars', gradient: 'from-teal-500/20 to-teal-500/5', color: 'text-teal-500' },
  ]

  return (
    <div className="page-enter">
      {/* ===== GREETING HEADER ===== */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-white tracking-tight">
            {getGreeting()}, {firstName} 👋
          </h1>
          <p className="text-[#94A3B8] text-[15px] mt-1">Welcome back. Let's manage today's fleet.</p>
        </div>
        <button className="w-11 h-11 rounded-full bg-[#1A2332] border border-white/5 flex items-center justify-center relative shadow-lg shadow-black/10">
          <HiOutlineBell size={20} className="text-[#94A3B8]" />
          {summary?.damagedCars > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger rounded-full text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-[#0B1120]">
              {summary.damagedCars}
            </span>
          )}
        </button>
      </div>

      {/* ===== STAT CARDS 2x2 ===== */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <div
            key={i}
            className="bg-[#1A2332] rounded-2xl p-5 border border-white/5 shadow-lg shadow-black/10 card-lift list-item-enter"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className={`w-11 h-11 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon size={22} className={stat.color} />
            </div>
            <p className="text-[11px] text-[#64748B] uppercase tracking-widest font-semibold">{stat.label}</p>
            <p className={`mt-1.5 text-xl font-mono font-bold tracking-tight ${stat.color}`}>
              {stat.value}
            </p>
            <p className="text-[#64748B] text-[11px] mt-0.5">{stat.subtitle}</p>
          </div>
        ))}
      </div>

      {/* ===== QUICK ACTIONS ===== */}
      <div className="mb-8">
        <h2 className="text-[20px] font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => navigate(action.path)}
              className={`bg-gradient-to-br ${action.gradient} rounded-2xl py-5 px-3 flex flex-col items-center gap-2.5 border border-white/5 shadow-lg shadow-black/10 ripple btn-press`}
            >
              <action.icon size={24} className={action.color} />
              <span className="text-[12px] text-white font-medium">+ {action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ===== YOUR CARS ===== */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[20px] font-semibold text-white">Your Cars</h2>
          {cars.length > 0 && (
            <button onClick={() => navigate('/cars')} className="text-teal-500 text-[14px] font-semibold">
              View All
            </button>
          )}
        </div>

        {cars.length === 0 ? (
          <EmptyState
            icon={<HiOutlineTruck size={36} className="text-[#64748B] opacity-30" />}
            title="No cars yet"
            description="Add your first car to start tracking."
            actionLabel="Add Your First Car"
            onAction={() => navigate('/cars')}
          />
        ) : (
          <div className="space-y-3">
            {cars.slice(0, 3).map((car, index) => (
              <button
                key={car._id}
                onClick={() => navigate(`/cars/${car._id}`)}
                className="w-full bg-[#1A2332] rounded-2xl p-5 text-left border border-white/5 shadow-lg shadow-black/10 card-lift btn-press list-item-enter"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[18px] font-mono font-bold text-white tracking-wide">{car.plateNumber}</h3>
                  <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full ${
                    car.status === 'healthy' ? 'bg-[#065F46] text-success' : 'bg-[#7F1D1D] text-danger'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${car.status === 'healthy' ? 'bg-success' : 'bg-danger'}`} />
                    {car.status === 'healthy' ? 'Healthy' : 'Damaged'}
                  </span>
                </div>
                <p className="text-[#94A3B8] text-[13px] mb-4">{car.driverName} · {car.passengerCapacity} pass.</p>
                <div className="flex justify-between pt-4 border-t border-white/5">
                  <div><p className="text-[#64748B] text-[10px] uppercase tracking-widest">Income</p><p className="text-white font-semibold text-[13px] mt-0.5">{formatCurrency(car.incomeThisMonth || 0)}</p></div>
                  <div><p className="text-[#64748B] text-[10px] uppercase tracking-widest">Expenses</p><p className="text-white font-semibold text-[13px] mt-0.5">{formatCurrency(car.expensesThisMonth || 0)}</p></div>
                  <div><p className="text-[#64748B] text-[10px] uppercase tracking-widest">Profit</p><p className={`font-semibold text-[13px] mt-0.5 ${(car.profitThisMonth || 0) >= 0 ? 'text-success' : 'text-danger'}`}>{formatCurrency(car.profitThisMonth || 0)}</p></div>
                </div>
              </button>
            ))}
            {cars.length > 3 && (
              <button onClick={() => navigate('/cars')} className="w-full text-teal-500 text-[14px] font-semibold py-3 text-center">
                + {cars.length - 3} more cars
              </button>
            )}
          </div>
        )}
      </div>

      {/* ===== RECENT ACTIVITY ===== */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[20px] font-semibold text-white">Recent Activity</h2>
          {activities.length > 0 && (
            <HiOutlineClock size={18} className="text-[#64748B]" />
          )}
        </div>

        {activities.length === 0 ? (
          <EmptyState
            icon={<HiOutlineClock size={36} className="text-[#64748B] opacity-30" />}
            title="No Activity Yet"
            description="Your latest income, expenses, damages and new cars will appear here."
            actionLabel="Add Income"
            onAction={() => navigate('/add-income')}
          />
        ) : (
          <div className="space-y-2">
            {activities.map((activity, index) => {
              const config = activityIcons[activity.type] || activityIcons.income_added
              const Icon = config.icon
              return (
                <div
                  key={activity._id}
                  className="bg-[#1A2332] rounded-2xl p-4 border border-white/5 shadow-lg shadow-black/10 list-item-enter flex items-center gap-4"
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <div className={`w-10 h-10 ${config.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon size={20} className={config.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-[14px] font-medium truncate">{activity.title}</p>
                    <p className="text-[#94A3B8] text-[12px] truncate">
                      {activity.description}
                      {activity.plateNumber && <span className="text-[#64748B]"> · {activity.plateNumber}</span>}
                    </p>
                  </div>
                  <span className="text-[#64748B] text-[11px] flex-shrink-0">
                    {formatRelativeTime(activity.createdAt)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}