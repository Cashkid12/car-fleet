import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { formatCurrency, formatDate, formatRelativeTime } from '../utils/formatters'
import EmptyState from '../components/EmptyState'
import { useToast } from '../components/Toast'
import {
  HiOutlineArrowLeft,
  HiOutlineCheck,
  HiOutlineTruck,
  HiOutlineCurrencyDollar,
  HiOutlineExclamationTriangle,
  HiOutlineReceiptPercent,
  HiOutlineClock,
  HiOutlinePhone,
  HiOutlineUsers,
  HiOutlineCalendarDays,
  HiOutlineEllipsisHorizontal,
  HiOutlinePlus,
  HiOutlineCheckCircle,
  HiOutlineArrowUpRight
} from 'react-icons/hi2'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const TABS = ['Overview', 'Income', 'Expenses', 'Damages', 'Timeline']

const timelineIcons = {
  'currency-dollar': HiOutlineCurrencyDollar,
  'exclamation-triangle': HiOutlineExclamationTriangle,
  'receipt-percent': HiOutlineReceiptPercent,
}

const chartTooltip = {
  background: 'var(--panel)',
  border: '1px solid var(--hairline)',
  borderRadius: '12px',
  color: 'var(--ink)',
  fontSize: '12px',
  boxShadow: '0 12px 30px -16px rgba(0,0,0,0.5)',
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
      <div className="min-h-screen bg-canvas px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto w-full max-w-[1180px]">
          <div className="skeleton mb-6 h-8 w-24" />
          <div className="skeleton mb-4 h-40" />
          <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-24" />)}
          </div>
          <div className="skeleton h-64" />
        </div>
      </div>
    )
  }

  if (!car) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
        <div className="w-full max-w-md">
          <div className="card p-0">
            <EmptyState
              icon={<HiOutlineTruck size={26} />}
              title="Vehicle not found"
              description="This vehicle may have been deleted."
              actionLabel="Go back"
              onAction={() => navigate('/')}
            />
          </div>
        </div>
      </div>
    )
  }

  const healthy = car.status === 'healthy'

  const statCards = summary ? [
    { label: 'Total income', value: formatCurrency(summary.totalIncome), icon: HiOutlineCurrencyDollar },
    { label: 'Total expenses', value: formatCurrency(summary.totalExpenses), icon: HiOutlineReceiptPercent },
    { label: 'Net profit', value: formatCurrency(summary.netProfit), icon: HiOutlineArrowUpRight, invert: true },
    {
      label: 'Damages',
      value: summary.activeDamages > 0 ? `${summary.activeDamages} active` : 'None',
      icon: HiOutlineExclamationTriangle,
    },
  ] : []

  const quickActions = [
    { label: 'Add income', icon: HiOutlineCurrencyDollar, path: `/add-income` },
    { label: 'Report damage', icon: HiOutlineExclamationTriangle, path: `/add-damage` },
    { label: 'Add expense', icon: HiOutlineReceiptPercent, path: `/add-damage` },
  ]

  const chartData = summary?.monthlyBreakdown || []
  const filteredChartData = chartRange === '7d' ? chartData.slice(-7) : chartRange === '30d' ? chartData.slice(-30) : chartData

  const sortedIncome = [...(car.incomeHistory || [])].sort((a, b) => new Date(b.date) - new Date(a.date))
  const sortedExpenses = [...(car.expenseHistory || [])].sort((a, b) => new Date(b.date) - new Date(a.date))
  const sortedDamages = [...(car.damageHistory || [])].sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink page-enter">
      {/* ===== STICKY HEADER ===== */}
      <header className="sticky top-0 z-30 border-b border-hairline bg-canvas/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-[1180px] items-center justify-between px-4 sm:px-6 lg:px-10">
          <button
            onClick={() => navigate('/cars')}
            className="btn btn-ghost btn-sm -ml-2"
          >
            <HiOutlineArrowLeft size={17} />
            <span className="hidden sm:inline">My fleet</span>
          </button>

          <p className="mono absolute left-1/2 -translate-x-1/2 text-[13px] font-semibold tracking-wide">
            {car.plateNumber}
          </p>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="btn btn-ghost btn-icon"
              aria-label="Vehicle actions"
              aria-expanded={showMenu}
            >
              <HiOutlineEllipsisHorizontal size={19} />
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-11 z-20 w-44 overflow-hidden rounded-[12px] border border-hairline bg-panel py-1 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.55)]">
                  <button
                    onClick={() => { setShowMenu(false); navigate('/cars') }}
                    className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13px] text-ink-soft transition-colors hover:bg-ghost hover:text-ink"
                  >
                    Edit vehicle
                  </button>
                  <button
                    onClick={() => { setShowMenu(false); navigate('/cars') }}
                    className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13px] text-ink transition-colors hover:bg-ghost"
                  >
                    Delete vehicle
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ===== CONTENT ===== */}
      <main className="mx-auto w-full max-w-[1180px] flex-1 px-4 pt-6 sm:px-6 md:pb-12 lg:px-10">
        {/* Vehicle card */}
        <section className="card p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="plate text-[26px] sm:text-[30px]">{car.plateNumber}</h1>
                <span className={`badge ${healthy ? 'badge-subtle' : 'badge-outline'}`}>
                  {healthy
                    ? <HiOutlineCheckCircle size={12} />
                    : <HiOutlineExclamationTriangle size={12} />}
                  {healthy ? 'Healthy' : 'Damaged'}
                </span>
              </div>
              <p className="t-body mt-2 font-medium">{car.driverName}</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-ink-faint">
                <span className="t-xs inline-flex items-center gap-1.5">
                  <HiOutlinePhone size={13} />{car.driverPhone}
                </span>
                <span className="t-xs inline-flex items-center gap-1.5">
                  <HiOutlineUsers size={13} />{car.passengerCapacity} passengers
                </span>
                <span className="t-xs inline-flex items-center gap-1.5">
                  <HiOutlineCalendarDays size={13} />Since {formatDate(car.createdAt)}
                </span>
              </div>
            </div>
            <span className="tile tile-lg">
              <HiOutlineTruck size={22} />
            </span>
          </div>

          {/* Quick actions */}
          <div className="mt-5 grid grid-cols-3 gap-2.5 border-t border-hairline pt-4">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="flex flex-col items-start gap-2 rounded-[12px] border border-hairline bg-panel-soft/40 p-3 text-left transition-colors hover:border-hairline-strong hover:bg-ghost active:scale-[0.99]"
              >
                <action.icon size={17} className="text-ink-soft" />
                <span className="text-[12px] font-medium leading-tight">{action.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="mt-4 grid grid-cols-2 gap-3 md:mt-6 md:grid-cols-4 md:gap-4">
          {statCards.map((stat, i) => (
            stat.invert ? (
              <div key={i} className="card-invert list-item-enter p-4" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex items-center justify-between">
                  <p className="t-label text-[var(--solid-soft)]">{stat.label}</p>
                  <stat.icon size={16} className="opacity-60" />
                </div>
                <p className="figure mt-3 break-words text-[19px]">{stat.value}</p>
              </div>
            ) : (
              <div key={i} className="card list-item-enter p-4" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex items-center justify-between">
                  <p className="t-label">{stat.label}</p>
                  <stat.icon size={16} className="text-ink-faint" />
                </div>
                <p className="figure mt-3 break-words text-[19px]">{stat.value}</p>
              </div>
            )
          ))}
        </section>

        {/* Chart */}
        {chartData.length > 0 && (
          <section className="card mt-4 p-5 md:mt-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="t-cardtitle">Performance</h2>
                <p className="t-xs mt-0.5 text-ink-faint">Income, expenses and profit over time</p>
              </div>
              <div className="seg">
                {['7d', '30d', '12m'].map(range => (
                  <button
                    key={range}
                    onClick={() => setChartRange(range)}
                    className={`seg-item px-3 ${chartRange === range ? 'seg-item-active' : ''}`}
                  >
                    {range === '7d' ? '7D' : range === '30d' ? '30D' : '1Y'}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[210px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredChartData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--hairline)" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: 'var(--ink-faint)', fontSize: 10 }}
                    tickLine={false}
                    axisLine={{ stroke: 'var(--hairline)' }}
                  />
                  <YAxis
                    tick={{ fill: 'var(--ink-faint)', fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip contentStyle={chartTooltip} cursor={{ stroke: 'var(--hairline-strong)' }} />
                  <Line type="monotone" dataKey="income" stroke="var(--ink)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="expenses" stroke="var(--ink-faint)" strokeWidth={1.75} dot={false} />
                  <Line type="monotone" dataKey="profit" stroke="var(--ink-soft)" strokeWidth={1.75} dot={false} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-2">
              <span className="t-micro inline-flex items-center gap-1.5 text-ink-soft">
                <span className="h-px w-4 rounded-full bg-ink" /> Income
              </span>
              <span className="t-micro inline-flex items-center gap-1.5 text-ink-soft">
                <span className="h-px w-4 rounded-full bg-ink-faint" /> Expenses
              </span>
              <span className="t-micro inline-flex items-center gap-1.5 text-ink-soft">
                <span className="w-4 border-t border-dashed border-ink-soft" /> Profit
              </span>
            </div>
          </section>
        )}

        {/* Tabs */}
        <div className="seg no-scrollbar mt-4 overflow-x-auto md:mt-6" role="tablist" aria-label="Vehicle sections">
          {TABS.map(tab => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={`seg-item flex-none px-4 sm:flex-1 ${activeTab === tab ? 'seg-item-active' : ''}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <section className="mt-3 md:mt-4">
          {activeTab === 'Overview' && (
            timeline.length === 0 ? (
              <div className="card p-0">
                <EmptyState
                  icon={<HiOutlineClock size={26} />}
                  title="No activity yet"
                  description="Income, expenses, and damages will appear here."
                  actionLabel="Add income"
                  onAction={() => navigate('/add-income')}
                />
              </div>
            ) : (
              <div className="card card-flush overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 sm:px-5">
                  <h2 className="t-cardtitle">Recent activity</h2>
                  <span className="t-micro text-ink-faint">{timeline.length} entries</span>
                </div>
                <div className="divide-y divide-hairline border-t border-hairline">
                  {timeline.slice(0, 10).map((entry, i) => {
                    const Icon = timelineIcons[entry.icon] || HiOutlineClock
                    return (
                      <div key={i} className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
                        <span className="tile h-8 w-8 rounded-[9px]">
                          <Icon size={15} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-medium">{entry.title}</p>
                          <p className="t-xs truncate text-ink-faint">{entry.description}</p>
                        </div>
                        <span className="t-micro flex-shrink-0 text-ink-faint">
                          {formatRelativeTime(entry.date)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          )}

          {activeTab === 'Income' && (
            !car.incomeHistory || car.incomeHistory.length === 0 ? (
              <div className="card p-0">
                <EmptyState
                  icon={<HiOutlineCurrencyDollar size={26} />}
                  title="No income yet"
                  description="Start recording today's collections."
                  actionLabel="Add income"
                  onAction={() => navigate('/add-income')}
                />
              </div>
            ) : (
              <div className="card card-flush overflow-hidden">
                <div className="divide-y divide-hairline">
                  {sortedIncome.map((entry, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5">
                      <div className="min-w-0">
                        <p className="text-[13.5px] font-medium">{formatDate(entry.date)}</p>
                        {entry.note && <p className="t-xs mt-0.5 truncate text-ink-soft">{entry.note}</p>}
                        <p className="t-micro mt-0.5 text-ink-faint">{formatRelativeTime(entry.recordedAt)}</p>
                      </div>
                      <span className="figure-sm flex-shrink-0">+{formatCurrency(entry.amount)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-hairline bg-panel-soft/40 px-4 py-3.5 sm:px-5">
                  <span className="text-[13px] font-semibold">Total income</span>
                  <span className="figure-sm text-[15px] font-semibold">{formatCurrency(summary?.totalIncome || 0)}</span>
                </div>
              </div>
            )
          )}

          {activeTab === 'Expenses' && (
            !car.expenseHistory || car.expenseHistory.length === 0 ? (
              <div className="card p-0">
                <EmptyState
                  icon={<HiOutlineReceiptPercent size={26} />}
                  title="No expenses yet"
                  description="Record maintenance, fuel, and other costs."
                  actionLabel="Add expense"
                  onAction={() => navigate('/add-damage')}
                />
              </div>
            ) : (
              <div className="card card-flush overflow-hidden">
                <div className="divide-y divide-hairline">
                  {sortedExpenses.map((entry, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="badge badge-subtle capitalize">{entry.type}</span>
                          <span className="truncate text-[13.5px] font-medium">{entry.description || entry.type}</span>
                        </div>
                        <p className="t-micro mt-1 text-ink-faint">{formatDate(entry.date)}</p>
                      </div>
                      <span className="figure-sm flex-shrink-0">{formatCurrency(entry.cost)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-hairline bg-panel-soft/40 px-4 py-3.5 sm:px-5">
                  <span className="text-[13px] font-semibold">Total expenses</span>
                  <span className="figure-sm text-[15px] font-semibold">
                    {formatCurrency(car.expenseHistory.reduce((s, e) => s + e.cost, 0))}
                  </span>
                </div>
              </div>
            )
          )}

          {activeTab === 'Damages' && (
            !car.damageHistory || car.damageHistory.length === 0 ? (
              <div className="card p-0">
                <EmptyState
                  icon={<HiOutlineExclamationTriangle size={26} />}
                  title="No damages reported"
                  description="Vehicle is in good condition."
                  actionLabel="Report damage"
                  onAction={() => navigate('/add-damage')}
                />
              </div>
            ) : (
              <div className="card card-flush overflow-hidden">
                <div className="divide-y divide-hairline">
                  {sortedDamages.map((entry, i) => (
                    <div key={i} className="px-4 py-4 sm:px-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[13.5px] font-medium">{entry.damageType}</p>
                          <p className="t-micro mt-0.5 text-ink-faint">{formatDate(entry.date)}</p>
                        </div>
                        <div className="flex flex-shrink-0 items-center gap-2.5">
                          <span className={`badge ${entry.status === 'fixed' ? 'badge-subtle' : 'badge-outline'}`}>
                            {entry.status === 'fixed'
                              ? <HiOutlineCheck size={11} />
                              : <HiOutlineExclamationTriangle size={11} />}
                            {entry.status === 'fixed' ? 'Fixed' : 'Damaged'}
                          </span>
                          <span className="figure-sm">{formatCurrency(entry.cost)}</span>
                        </div>
                      </div>
                      {entry.description && (
                        <p className="t-sm mt-2 text-ink-soft">{entry.description}</p>
                      )}
                      {entry.status === 'still damaged' && (
                        <button
                          onClick={() => handleMarkFixed(entry._id)}
                          className="btn btn-outline btn-sm mt-3"
                        >
                          <HiOutlineCheck size={14} />
                          Mark as fixed
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-hairline bg-panel-soft/40 px-4 py-3.5 sm:px-5">
                  <span className="text-[13px] font-semibold">Total damage cost</span>
                  <span className="figure-sm text-[15px] font-semibold">{formatCurrency(summary?.totalDamageCost || 0)}</span>
                </div>
              </div>
            )
          )}

          {activeTab === 'Timeline' && (
            timeline.length === 0 ? (
              <div className="card p-0">
                <EmptyState
                  icon={<HiOutlineClock size={26} />}
                  title="No activity yet"
                  description="Complete timeline will appear here."
                  actionLabel="Add income"
                  onAction={() => navigate('/add-income')}
                />
              </div>
            ) : (
              <div className="card card-flush overflow-hidden">
                <div className="divide-y divide-hairline">
                  {timeline.map((entry, i) => {
                    const Icon = timelineIcons[entry.icon] || HiOutlineClock
                    return (
                      <div key={i} className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
                        <span className="tile h-8 w-8 rounded-[9px]">
                          <Icon size={15} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-medium">{entry.title}</p>
                          <p className="t-xs truncate text-ink-faint">{entry.description}</p>
                          <p className="t-micro mt-0.5 text-ink-faint">
                            {formatDate(entry.date)} · {formatRelativeTime(entry.recordedAt || entry.date)}
                          </p>
                        </div>
                        {entry.amount && (
                          <span className={`figure-sm flex-shrink-0 ${entry.type === 'income' ? 'text-ink' : 'text-ink-soft'}`}>
                            {entry.type === 'income' ? '+' : '-'}{formatCurrency(entry.amount)}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          )}
        </section>
      </main>

      {/* ===== MOBILE ACTION BAR ===== */}
      <div className="sticky bottom-0 z-30 border-t border-hairline bg-canvas/95 backdrop-blur-xl md:hidden">
        <div
          className="mx-auto flex w-full max-w-[1180px] gap-2.5 px-4 py-3"
          style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
        >
          <button
            onClick={() => navigate('/add-income')}
            className="btn btn-primary flex-1"
          >
            <HiOutlinePlus size={17} />
            Add income
          </button>
          <button
            onClick={() => navigate('/add-damage')}
            className="btn btn-secondary flex-1"
          >
            <HiOutlineExclamationTriangle size={17} />
            Report damage
          </button>
        </div>
      </div>
    </div>
  )
}
