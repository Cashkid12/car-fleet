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
  HiOutlinePlus,
  HiOutlineChevronRight
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
      <div className="px-4 py-6">
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-[88px] rounded-2xl" />)}
        </div>
        <LoadingSkeleton lines={3} height="h-36" />
      </div>
    )
  }

  const statCards = summary ? [
    { label: 'Income', value: formatCurrency(summary.incomeThisMonth || 0), icon: HiOutlineCurrencyDollar, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Expenses', value: formatCurrency(summary.expensesThisMonth || 0), icon: HiOutlineReceiptPercent, color: 'text-danger', bg: 'bg-danger/10' },
    { label: 'Profit', value: formatCurrency(summary.profitThisMonth || 0), icon: HiOutlineArrowTrendingUp, color: (summary.profitThisMonth || 0) >= 0 ? 'text-success' : 'text-danger', bg: (summary.profitThisMonth || 0) >= 0 ? 'bg-success/10' : 'bg-danger/10' },
    { label: 'Cars', value: summary.activeCars || 0, icon: HiOutlineTruck, color: 'text-teal-500', bg: 'bg-teal-500/10' },
  ] : []

  return (
    <div className="px-4 py-5 page-enter pb-20">
      
      {/* ===== HEADER ===== */}
      <div className="mb-5">
        <h1 className="text-[22px] font-bold text-white">Dashboard</h1>
        <p className="text-text-secondary text-[13px] mt-0.5">Your fleet at a glance</p>
      </div>

      {/* ===== STAT CARDS - 2x2 Grid ===== */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-[#1A2332] rounded-2xl p-4 shadow-lg shadow-black/20">
            <div className={`w-9 h-9 ${stat.bg} rounded-xl flex items-center justify-center mb-2.5`}>
              <stat.icon size={18} className={stat.color} />
            </div>
            <p className="text-[11px] text-text-muted uppercase tracking-wider font-semibold">{stat.label}</p>
            <p className={`mt-0.5 text-lg font-mono font-bold tracking-tight ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* ===== QUICK ACTIONS - Mobile ===== */}
      <div className="grid grid-cols-3 gap-2 mb-6 lg:hidden">
        {[
          { label: 'Income', icon: HiOutlineCurrencyDollar, path: '/add-income', color: 'text-success' },
          { label: 'Damage', icon: HiOutlineExclamationTriangle, path: '/add-damage', color: 'text-warning' },
          { label: 'New Car', icon: HiOutlinePlus, path: '/cars', color: 'text-teal-500' },
        ].map((action, i) => (
          <button
            key={i}
            onClick={() => navigate(action.path)}
            className="bg-[#1A2332] rounded-xl py-3.5 px-2 flex flex-col items-center gap-1.5 active:scale-95 transition-transform duration-100"
          >
            <action.icon size={22} className={action.color} />
            <span className="text-[11px] text-text-secondary font-medium">{action.label}</span>
          </button>
        ))}
      </div>

      {/* ===== CARS SECTION HEADER ===== */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-white">Your Cars</h2>
        {cars.length > 0 && (
          <span className="text-text-muted text-xs bg-[#1A2332] px-2.5 py-1 rounded-full">
            {cars.length} car{cars.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* ===== EMPTY STATE ===== */}
      {cars.length === 0 && (
        <div className="bg-[#1A2332] rounded-2xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#1F2A3A] flex items-center justify-center">
            <HiOutlineTruck size={30} className="text-text-muted opacity-30" />
          </div>
          <h3 className="text-white font-semibold text-[15px] mb-1">No cars yet</h3>
          <p className="text-text-secondary text-[13px] mb-5">Add your first car to start tracking</p>
          <button
            onClick={() => navigate('/cars')}
            className="bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-xl h-11 px-5 text-sm transition-colors duration-150"
          >
            Add Your First Car
          </button>
        </div>
      )}

      {/* ===== CAR CARDS ===== */}
      {cars.length > 0 && (
        <div className="space-y-3">
          {cars.map(car => (
            <button
              key={car._id}
              onClick={() => navigate(`/cars/${car._id}`)}
              className="w-full bg-[#1A2332] rounded-2xl p-4 text-left active:scale-[0.98] transition-transform duration-100 relative overflow-hidden"
            >
              {/* Top Row */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-mono font-bold text-white tracking-wide">{car.plateNumber}</h3>
                <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                  car.status === 'healthy'
                    ? 'bg-[#065F46] text-success'
                    : 'bg-[#7F1D1D] text-danger'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${car.status === 'healthy' ? 'bg-success' : 'bg-danger'}`} />
                  {car.status === 'healthy' ? 'Healthy' : 'Damaged'}
                </span>
              </div>

              {/* Driver Info */}
              <div className="flex items-center gap-x-2 gap-y-0.5 text-text-secondary text-[12px] mb-4 flex-wrap">
                <span className="text-white font-medium">{car.driverName}</span>
                <span className="text-text-muted">·</span>
                <span>{car.driverPhone}</span>
                <span className="text-text-muted">·</span>
                <span>{car.passengerCapacity} pass.</span>
              </div>

              {/* Stats Row */}
              <div className="flex justify-between pt-3 border-t border-white/5">
                <div className="text-center flex-1">
                  <p className="text-text-muted text-[10px] uppercase tracking-wider mb-0.5">Income</p>
                  <p className="text-white font-semibold text-[13px]">{formatCurrency(car.incomeThisMonth || 0)}</p>
                </div>
                <div className="text-center flex-1 border-l border-white/5">
                  <p className="text-text-muted text-[10px] uppercase tracking-wider mb-0.5">Expenses</p>
                  <p className="text-white font-semibold text-[13px]">{formatCurrency(car.expensesThisMonth || 0)}</p>
                </div>
                <div className="text-center flex-1 border-l border-white/5">
                  <p className="text-text-muted text-[10px] uppercase tracking-wider mb-0.5">Profit</p>
                  <p className={`font-semibold text-[13px] ${(car.profitThisMonth || 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                    {formatCurrency(car.profitThisMonth || 0)}
                  </p>
                </div>
              </div>

              {/* Arrow indicator */}
              <HiOutlineChevronRight size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted opacity-0 group-hover:opacity-100" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}