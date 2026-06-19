import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { formatCurrency } from '../utils/formatters'
import { LoadingSkeleton } from '../components/LoadingSpinner'
import {
  HiOutlineArrowTrendingUp,
  HiOutlineReceiptPercent,
  HiOutlineTruck,
  HiOutlineCurrencyDollar,
  HiOutlineExclamationTriangle,
  HiOutlinePlus
} from 'react-icons/hi2'

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const fetchData = async () => {
    try {
      const [summaryRes, carsRes] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/cars')
      ])
      setSummary(summaryRes.data)
      setCars(carsRes.data)
      localStorage.setItem('dashboard_cache', JSON.stringify({
        summary: summaryRes.data,
        cars: carsRes.data,
        timestamp: Date.now()
      }))
    } catch {
      const cached = localStorage.getItem('dashboard_cache')
      if (cached) {
        const data = JSON.parse(cached)
        setSummary(data.summary)
        setCars(data.cars)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  if (loading) {
    return (
      <div className="px-4 py-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 mb-6 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
        <LoadingSkeleton lines={4} height="h-28" />
      </div>
    )
  }

  const statCards = summary ? [
    { label: 'Monthly Income', value: formatCurrency(summary.incomeThisMonth || 0), icon: HiOutlineCurrencyDollar, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Monthly Expenses', value: formatCurrency(summary.expensesThisMonth || 0), icon: HiOutlineReceiptPercent, color: 'text-danger', bg: 'bg-danger/10' },
    { label: 'Net Profit', value: formatCurrency(summary.profitThisMonth || 0), icon: HiOutlineArrowTrendingUp, color: (summary.profitThisMonth || 0) >= 0 ? 'text-success' : 'text-danger', bg: (summary.profitThisMonth || 0) >= 0 ? 'bg-success/10' : 'bg-danger/10' },
    { label: 'Active Cars', value: summary.activeCars || 0, icon: HiOutlineTruck, color: 'text-teal-500', bg: 'bg-teal-500/10' },
  ] : []

  const quickActions = [
    { label: 'Add Income', icon: HiOutlineCurrencyDollar, path: '/add-income', color: 'text-success' },
    { label: 'Record Damage', icon: HiOutlineExclamationTriangle, path: '/add-damage', color: 'text-warning' },
    { label: 'Add New Car', icon: HiOutlinePlus, path: '/cars', color: 'text-teal-500' },
  ]

  return (
    <div className="px-4 py-6 lg:px-8 page-enter">

      {/* ===== PAGE HEADER ===== */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-secondary text-sm mt-0.5">Your fleet at a glance</p>
      </div>

      {/* ===== STAT CARDS ===== */}
      <div className="grid grid-cols-2 gap-3 mb-6 lg:grid-cols-4">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-bg-card rounded-2xl p-4 shadow-lg shadow-black/20">
            <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon size={20} className={stat.color} />
            </div>
            <p className="text-xs text-text-muted uppercase tracking-wider font-medium">{stat.label}</p>
            <p className={`mt-1 text-lg font-mono font-bold tabular-nums ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* ===== QUICK ACTIONS (Mobile) ===== */}
      <div className="lg:hidden grid grid-cols-3 gap-2 mb-6">
        {quickActions.map((action, i) => (
          <button
            key={i}
            onClick={() => navigate(action.path)}
            className="bg-bg-card rounded-xl py-3 px-2 flex flex-col items-center gap-1.5 active:scale-[0.97] transition-transform duration-100 shadow-lg shadow-black/20"
          >
            <action.icon size={22} className={action.color} />
            <span className="text-[11px] text-text-secondary font-medium text-center leading-tight">{action.label}</span>
          </button>
        ))}
      </div>

      {/* ===== SECTION HEADER ===== */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-text-primary">Your Cars</h2>
        {cars.length > 0 && (
          <span className="text-text-muted text-xs">{cars.length} car{cars.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {/* ===== EMPTY STATE ===== */}
      {cars.length === 0 && (
        <div className="bg-bg-card rounded-2xl p-10 text-center shadow-lg shadow-black/20">
          <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-bg-card-hover flex items-center justify-center">
            <HiOutlineTruck size={36} className="text-text-muted opacity-40" />
          </div>
          <h3 className="text-text-primary font-semibold text-base mb-1.5">No cars added yet</h3>
          <p className="text-text-secondary text-sm mb-6 max-w-[260px] mx-auto">
            Add your first car to start tracking income, expenses, and damages.
          </p>
          <button
            onClick={() => navigate('/cars')}
            className="bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-xl h-12 px-6 text-sm transition-colors duration-150 shadow-lg shadow-teal-500/15"
          >
            Add Your First Car
          </button>
        </div>
      )}

      {/* ===== CAR GRID ===== */}
      {cars.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {cars.map(car => (
            <button
              key={car._id}
              onClick={() => navigate(`/cars/${car._id}`)}
              className="w-full bg-bg-card rounded-2xl p-5 text-left active:scale-[0.98] transition-transform duration-100 shadow-lg shadow-black/20 card-hover"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-mono font-bold text-text-primary tracking-wide">{car.plateNumber}</h3>
                <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full ${
                  car.status === 'healthy'
                    ? 'bg-healthy-bg text-success'
                    : 'bg-damaged-bg text-danger'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${car.status === 'healthy' ? 'bg-success' : 'bg-danger'}`} />
                  {car.status === 'healthy' ? 'Healthy' : 'Damaged'}
                </span>
              </div>

              <div className="flex items-center flex-wrap gap-x-2.5 gap-y-1 text-text-secondary text-[13px] mb-4">
                <span className="font-medium text-text-primary">{car.driverName}</span>
                <span className="w-1 h-1 bg-text-muted rounded-full" />
                <span>{car.driverPhone}</span>
                <span className="w-1 h-1 bg-text-muted rounded-full" />
                <span>{car.passengerCapacity} pass.</span>
              </div>

              <div className="flex justify-between pt-4 border-t border-border-subtle/40">
                <div>
                  <p className="text-text-muted text-[11px] uppercase tracking-wider mb-0.5">Income</p>
                  <p className="text-text-primary font-semibold text-sm tabular-nums">{formatCurrency(car.incomeThisMonth || 0)}</p>
                </div>
                <div>
                  <p className="text-text-muted text-[11px] uppercase tracking-wider mb-0.5">Expenses</p>
                  <p className="text-text-primary font-semibold text-sm tabular-nums">{formatCurrency(car.expensesThisMonth || 0)}</p>
                </div>
                <div>
                  <p className="text-text-muted text-[11px] uppercase tracking-wider mb-0.5">Profit</p>
                  <p className={`font-semibold text-sm tabular-nums ${(car.profitThisMonth || 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                    {formatCurrency(car.profitThisMonth || 0)}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}