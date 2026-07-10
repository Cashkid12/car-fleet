import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { formatCurrency, formatDate, formatRelativeTime } from '../utils/formatters'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import { useToast } from '../components/Toast'
import {
  HiOutlineArrowLeft,
  HiOutlineCheck,
  HiOutlineTruck,
  HiOutlineCurrencyDollar,
  HiOutlineExclamationTriangle,
  HiOutlineReceiptPercent,
  HiOutlineArrowTrendingUp,
  HiOutlineClock,
  HiOutlinePhone,
  HiOutlineUsers,
  HiOutlineCalendarDays,
  HiOutlineEllipsisHorizontal,
  HiOutlinePlus
} from 'react-icons/hi2'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const TABS = ['Overview', 'Income', 'Expenses', 'Damages', 'Timeline']

const timelineIcons = {
  'currency-dollar': HiOutlineCurrencyDollar,
  'exclamation-triangle': HiOutlineExclamationTriangle,
  'receipt-percent': HiOutlineReceiptPercent,
}

const timelineColors = {
  success: { bg: 'bg-success/10', text: 'text-success' },
  danger: { bg: 'bg-danger/10', text: 'text-danger' },
  warning: { bg: 'bg-warning/10', text: 'text-warning' },
}

export default function CarHistory() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [car, setCar] = useState(null)
  const [summary, setSummary] = useState(null)
  const [timeline, setTimeline] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Overview')
  const [showMenu, setShowMenu] = useState(false)
  const [chartRange, setChartRange] = useState('12m')

  const fetchData = async () => {
    try {
      const [carRes, summaryRes, timelineRes] = await Promise.all([
        api.get(`/cars/${id}`),
        api.get(`/cars/${id}/summary`),
        api.get(`/cars/${id}/timeline`)
      ])
      setCar(carRes.data)
      setSummary(summaryRes.data)
      setTimeline(timelineRes.data)
    } catch {
      addToast('Failed to load vehicle data', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [id])

  const handleMarkFixed = async (damageId) => {
    try {
      await api.put(`/cars/${id}/damage/${damageId}`)
      addToast('Damage marked as fixed!', 'success')
      fetchData()
    } catch {
      addToast('Failed to update', 'error')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1120] px-5 py-8">
        <div className="skeleton h-8 w-24 rounded-xl mb-6" />
        <div className="skeleton h-48 rounded-2xl mb-6" />
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
        <div className="skeleton h-48 rounded-2xl" />
      </div>
    )
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
        <EmptyState
          icon={<HiOutlineTruck size={40} className="text-[#64748B] opacity-20" />}
          title="Vehicle Not Found"
          description="This vehicle may have been deleted."
          actionLabel="Go Back"
          onAction={() => navigate('/')}
        />
      </div>
    )
  }

  const statCards = summary ? [
    { label: 'Total Income', value: formatCurrency(summary.totalIncome), icon: HiOutlineCurrencyDollar, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Total Expenses', value: formatCurrency(summary.totalExpenses), icon: HiOutlineReceiptPercent, color: 'text-danger', bg: 'bg-danger/10' },
    { label: 'Net Profit', value: formatCurrency(summary.netProfit), icon: HiOutlineArrowTrendingUp, color: summary.netProfit >= 0 ? 'text-success' : 'text-danger', bg: summary.netProfit >= 0 ? 'bg-success/10' : 'bg-danger/10' },
    { label: 'Damages', value: summary.activeDamages > 0 ? `${summary.activeDamages} active` : 'None', icon: HiOutlineExclamationTriangle, color: summary.activeDamages > 0 ? 'text-danger' : 'text-[#64748B]', bg: summary.activeDamages > 0 ? 'bg-danger/10' : 'bg-white/5' },
  ] : []

  const quickActions = [
    { label: 'Add Income', icon: HiOutlineCurrencyDollar, path: `/add-income`, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Report Damage', icon: HiOutlineExclamationTriangle, path: `/add-damage`, color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'Add Expense', icon: HiOutlineReceiptPercent, path: `/add-damage`, color: 'text-danger', bg: 'bg-danger/10' },
  ]

  const chartData = summary?.monthlyBreakdown || []

  const filteredChartData = chartRange === '7d' ? chartData.slice(-7) : chartRange === '30d' ? chartData.slice(-30) : chartData

  return (
    <div className="flex flex-col min-h-screen bg-[#0B1120] page-enter">
      {/* ===== STICKY HEADER ===== */}
      <div className="sticky top-0 z-30 bg-[#0B1120]/95 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-5 h-14 max-w-[480px] mx-auto w-full">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-[#94A3B8] hover:text-white transition-colors duration-150"
          >
            <HiOutlineArrowLeft size={20} />
            <span className="text-[14px] font-medium">Back</span>
          </button>

          <div className="text-center">
            <h1 className="text-[17px] font-bold text-white">Vehicle Details</h1>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-10 h-10 rounded-full bg-[#1A2332] border border-white/5 flex items-center justify-center text-[#94A3B8] hover:text-white transition-colors duration-150"
            >
              <HiOutlineEllipsisHorizontal size={20} />
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-12 w-48 bg-[#1A2332] rounded-2xl border border-white/5 shadow-2xl z-20 py-1">
                  <button onClick={() => { setShowMenu(false); navigate('/cars') }} className="w-full text-left px-4 py-3 text-[14px] text-[#94A3B8] hover:text-white hover:bg-white/5 transition-colors duration-150">Edit Vehicle</button>
                  <button onClick={() => { setShowMenu(false); navigate('/cars') }} className="w-full text-left px-4 py-3 text-[14px] text-danger hover:bg-red-500/10 transition-colors duration-150">Delete Vehicle</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="flex-1 overflow-y-auto safe-bottom">
        <div className="max-w-[480px] mx-auto w-full px-5 pt-6">

          {/* ===== VEHICLE PROFILE CARD ===== */}
          <div className="bg-[#1A2332] rounded-2xl p-5 border border-white/5 shadow-lg shadow-black/10 mb-6">
            <div className="flex items-start gap-4 mb-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                car.status === 'healthy' ? 'bg-success/10' : 'bg-danger/10'
              }`}>
                <HiOutlineTruck size={32} className={car.status === 'healthy' ? 'text-success' : 'text-danger'} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-[22px] font-mono font-bold text-white tracking-wide">{car.plateNumber}</h2>
                  <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full ${
                    car.status === 'healthy' ? 'bg-[#065F46] text-success' : 'bg-[#7F1D1D] text-danger'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${car.status === 'damaged' ? 'animate-pulse' : ''} ${car.status === 'healthy' ? 'bg-success' : 'bg-danger'}`} />
                    {car.status === 'healthy' ? 'Healthy' : 'Damaged'}
                  </span>
                </div>
                <p className="text-white text-[15px] font-medium">{car.driverName}</p>
                <div className="flex items-center gap-x-3 gap-y-1 text-[#64748B] text-[12px] mt-1.5 flex-wrap">
                  <span className="flex items-center gap-1"><HiOutlinePhone size={12} />{car.driverPhone}</span>
                  <span className="flex items-center gap-1"><HiOutlineUsers size={12} />{car.passengerCapacity} pass.</span>
                  <span className="flex items-center gap-1"><HiOutlineCalendarDays size={12} />{formatDate(car.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ===== QUICK ACTIONS ===== */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {quickActions.map((action, i) => (
              <button
                key={i}
                onClick={() => navigate(action.path)}
                className={`${action.bg} rounded-2xl py-4 px-2 flex flex-col items-center gap-2 border border-white/5 shadow-lg shadow-black/10 ripple btn-press`}
              >
                <action.icon size={22} className={action.color} />
                <span className="text-[11px] text-white font-medium text-center leading-tight">{action.label}</span>
              </button>
            ))}
          </div>

          {/* ===== STAT CARDS 2x2 ===== */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {statCards.map((stat, i) => (
              <div key={i} className="bg-[#1A2332] rounded-2xl p-4 border border-white/5 shadow-lg shadow-black/10 list-item-enter" style={{ animationDelay: `${i * 80}ms` }}>
                <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                  <stat.icon size={20} className={stat.color} />
                </div>
                <p className="text-[10px] text-[#64748B] uppercase tracking-widest font-semibold">{stat.label}</p>
                <p className={`mt-1 text-lg font-mono font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* ===== CHART ===== */}
          {chartData.length > 0 && (
            <div className="bg-[#1A2332] rounded-2xl p-5 border border-white/5 shadow-lg shadow-black/10 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[18px] font-semibold text-white">Performance</h3>
                <div className="flex gap-1 bg-[#0B1120] rounded-xl p-1">
                  {['7d', '30d', '12m'].map(range => (
                    <button
                      key={range}
                      onClick={() => setChartRange(range)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 ${
                        chartRange === range ? 'bg-teal-500 text-white' : 'text-[#64748B]'
                      }`}
                    >
                      {range === '7d' ? '7D' : range === '30d' ? '30D' : '1Y'}
                    </button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={filteredChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={10} />
                  <YAxis stroke="#64748B" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      background: '#1A2332',
                      border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '14px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Line type="monotone" dataKey="income" stroke="#22C55E" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="profit" stroke="#14B8A6" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-3 text-[11px] justify-center">
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-success rounded-full" /> Income</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-danger rounded-full" /> Expenses</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-teal-500 rounded-full" /> Profit</span>
              </div>
            </div>
          )}

          {/* ===== TABS ===== */}
          <div className="flex bg-[#1A2332] rounded-2xl p-1.5 mb-6 border border-white/5 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 rounded-xl text-[12px] font-semibold whitespace-nowrap transition-all duration-200 ${
                  activeTab === tab ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/15' : 'text-[#64748B]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* ===== TAB CONTENT ===== */}
          {activeTab === 'Overview' && (
            <div className="space-y-3 pb-8">
              <h3 className="text-[16px] font-semibold text-white mb-2">Recent Activity</h3>
              {timeline.length === 0 ? (
                <EmptyState
                  icon={<HiOutlineClock size={32} className="text-[#64748B] opacity-20" />}
                  title="No Activity Yet"
                  description="Income, expenses, and damages will appear here."
                  actionLabel="Add Income"
                  onAction={() => navigate('/add-income')}
                />
              ) : (
                timeline.slice(0, 10).map((entry, i) => {
                  const Icon = timelineIcons[entry.icon] || HiOutlineClock
                  const colorConfig = timelineColors[entry.color] || timelineColors.success
                  return (
                    <div key={i} className="bg-[#1A2332] rounded-2xl p-4 border border-white/5 flex items-center gap-4 list-item-enter" style={{ animationDelay: `${i * 40}ms` }}>
                      <div className={`w-10 h-10 ${colorConfig.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <Icon size={20} className={colorConfig.text} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-[14px] font-medium">{entry.title}</p>
                        <p className="text-[#94A3B8] text-[12px] truncate">{entry.description}</p>
                      </div>
                      <span className="text-[#64748B] text-[11px] flex-shrink-0">{formatRelativeTime(entry.date)}</span>
                    </div>
                  )
                })
              )}
            </div>
          )}

          {activeTab === 'Income' && (
            <div className="pb-8">
              {(!car.incomeHistory || car.incomeHistory.length === 0) ? (
                <EmptyState
                  icon={<HiOutlineCurrencyDollar size={32} className="text-[#64748B] opacity-20" />}
                  title="No Income Yet"
                  description="Start recording today's collections."
                  actionLabel="Add Income"
                  onAction={() => navigate('/add-income')}
                />
              ) : (
                <>
                  <div className="space-y-2 mb-4">
                    {[...car.incomeHistory].sort((a, b) => new Date(b.date) - new Date(a.date)).map((entry, i) => (
                      <div key={i} className="bg-[#1A2332] rounded-2xl p-4 border border-white/5 flex items-center justify-between list-item-enter" style={{ animationDelay: `${i * 30}ms` }}>
                        <div>
                          <p className="text-white text-[14px] font-medium">{formatDate(entry.date)}</p>
                          {entry.note && <p className="text-[#94A3B8] text-[12px] mt-0.5">{entry.note}</p>}
                          <p className="text-[#64748B] text-[11px] mt-0.5">{formatRelativeTime(entry.recordedAt)}</p>
                        </div>
                        <span className="text-success font-semibold font-mono text-[16px]">+{formatCurrency(entry.amount)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-[#1A2332] rounded-2xl p-4 border border-white/5 flex justify-between">
                    <span className="text-white font-semibold">Total Income</span>
                    <span className="text-success font-bold text-lg font-mono">{formatCurrency(summary?.totalIncome || 0)}</span>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'Expenses' && (
            <div className="pb-8">
              {(!car.expenseHistory || car.expenseHistory.length === 0) ? (
                <EmptyState
                  icon={<HiOutlineReceiptPercent size={32} className="text-[#64748B] opacity-20" />}
                  title="No Expenses Yet"
                  description="Record maintenance, fuel, and other costs."
                  actionLabel="Add Expense"
                  onAction={() => navigate('/add-damage')}
                />
              ) : (
                <>
                  <div className="space-y-2 mb-4">
                    {[...car.expenseHistory].sort((a, b) => new Date(b.date) - new Date(a.date)).map((entry, i) => (
                      <div key={i} className="bg-[#1A2332] rounded-2xl p-4 border border-white/5 flex items-center justify-between list-item-enter" style={{ animationDelay: `${i * 30}ms` }}>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[11px] bg-white/5 text-[#94A3B8] px-2 py-0.5 rounded-full capitalize font-medium">{entry.type}</span>
                            <span className="text-white text-[14px] font-medium">{entry.description || entry.type}</span>
                          </div>
                          <p className="text-[#64748B] text-[11px]">{formatDate(entry.date)}</p>
                        </div>
                        <span className="text-danger font-semibold font-mono text-[16px]">{formatCurrency(entry.cost)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-[#1A2332] rounded-2xl p-4 border border-white/5 flex justify-between">
                    <span className="text-white font-semibold">Total Expenses</span>
                    <span className="text-danger font-bold text-lg font-mono">{formatCurrency(car.expenseHistory.reduce((s, e) => s + e.cost, 0))}</span>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'Damages' && (
            <div className="pb-8">
              {(!car.damageHistory || car.damageHistory.length === 0) ? (
                <EmptyState
                  icon={<HiOutlineExclamationTriangle size={32} className="text-[#64748B] opacity-20" />}
                  title="No Damages Reported"
                  description="Vehicle is in good condition."
                  actionLabel="Report Damage"
                  onAction={() => navigate('/add-damage')}
                />
              ) : (
                <>
                  <div className="space-y-2 mb-4">
                    {[...car.damageHistory].sort((a, b) => new Date(b.date) - new Date(a.date)).map((entry, i) => (
                      <div key={i} className="bg-[#1A2332] rounded-2xl p-4 border border-white/5 list-item-enter" style={{ animationDelay: `${i * 30}ms` }}>
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-white text-[14px] font-medium">{entry.damageType}</p>
                            <p className="text-[#64748B] text-[11px] mt-0.5">{formatDate(entry.date)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                              entry.status === 'fixed' ? 'bg-[#065F46] text-success' : 'bg-[#7F1D1D] text-danger'
                            }`}>
                              {entry.status === 'fixed' ? 'Fixed' : 'Damaged'}
                            </span>
                            <span className="text-danger font-semibold font-mono text-[16px]">{formatCurrency(entry.cost)}</span>
                          </div>
                        </div>
                        {entry.description && <p className="text-[#94A3B8] text-[12px] mb-2">{entry.description}</p>}
                        {entry.status === 'still damaged' && (
                          <button
                            onClick={() => handleMarkFixed(entry._id)}
                            className="mt-1 text-teal-500 text-[13px] font-semibold flex items-center gap-1.5 hover:text-teal-400 transition-colors duration-150"
                          >
                            <HiOutlineCheck size={15} />
                            Mark as Fixed
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="bg-[#1A2332] rounded-2xl p-4 border border-white/5 flex justify-between">
                    <span className="text-white font-semibold">Total Damage Cost</span>
                    <span className="text-danger font-bold text-lg font-mono">{formatCurrency(summary?.totalDamageCost || 0)}</span>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'Timeline' && (
            <div className="pb-8">
              {timeline.length === 0 ? (
                <EmptyState
                  icon={<HiOutlineClock size={32} className="text-[#64748B] opacity-20" />}
                  title="No Activity Yet"
                  description="Complete timeline will appear here."
                  actionLabel="Add Income"
                  onAction={() => navigate('/add-income')}
                />
              ) : (
                <div className="space-y-2">
                  {timeline.map((entry, i) => {
                    const Icon = timelineIcons[entry.icon] || HiOutlineClock
                    const colorConfig = timelineColors[entry.color] || timelineColors.success
                    return (
                      <div key={i} className="bg-[#1A2332] rounded-2xl p-4 border border-white/5 flex items-center gap-4 list-item-enter" style={{ animationDelay: `${i * 30}ms` }}>
                        <div className={`w-10 h-10 ${colorConfig.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                          <Icon size={20} className={colorConfig.text} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-[14px] font-medium">{entry.title}</p>
                          <p className="text-[#94A3B8] text-[12px] truncate">{entry.description}</p>
                          <p className="text-[#64748B] text-[11px] mt-0.5">{formatDate(entry.date)} · {formatRelativeTime(entry.recordedAt || entry.date)}</p>
                        </div>
                        {entry.amount && (
                          <span className={`font-semibold font-mono text-[14px] flex-shrink-0 ${entry.color === 'success' ? 'text-success' : 'text-danger'}`}>
                            {entry.type === 'income' ? '+' : '-'}{formatCurrency(entry.amount)}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ===== BOTTOM ACTION BAR ===== */}
      <div className="sticky bottom-0 z-30 bg-[#0B1120]/95 backdrop-blur-xl border-t border-white/5 lg:hidden">
        <div className="flex gap-3 px-5 py-3 max-w-[480px] mx-auto w-full" style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}>
          <button
            onClick={() => navigate('/add-income')}
            className="flex-1 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-2xl h-[52px] text-[14px] flex items-center justify-center gap-2 shadow-lg shadow-teal-500/15 transition-all duration-200 ripple btn-press"
          >
            <HiOutlinePlus size={18} />
            Add Income
          </button>
          <button
            onClick={() => navigate('/add-damage')}
            className="flex-1 bg-[#1A2332] border border-white/5 text-white font-semibold rounded-2xl h-[52px] text-[14px] flex items-center justify-center gap-2 hover:bg-white/5 transition-all duration-200 ripple btn-press"
          >
            <HiOutlineExclamationTriangle size={18} />
            Report Damage
          </button>
        </div>
      </div>
    </div>
  )
}