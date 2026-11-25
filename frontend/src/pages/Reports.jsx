import { useState, useEffect } from 'react'
import api from '../services/api'
import { formatCurrency } from '../utils/formatters'
import EmptyState from '../components/EmptyState'
import {
  HiOutlineArrowTrendingUp,
  HiOutlineReceiptPercent,
  HiOutlineTruck,
  HiOutlineCurrencyDollar,
  HiOutlineChartBar,
  HiOutlineLightBulb,
  HiOutlineTrophy,
  HiOutlineExclamationTriangle,
  HiOutlineCheckCircle,
  HiOutlineChartPie
} from 'react-icons/hi2'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'

const SHADE_OPACITY = [1, 0.82, 0.66, 0.52, 0.4, 0.3, 0.22, 0.16, 0.11, 0.07]

const PERIODS = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This week' },
  { key: 'month', label: 'This month' },
  { key: 'year', label: 'This year' },
]

const chartTooltip = {
  background: 'var(--panel)',
  border: '1px solid var(--hairline)',
  borderRadius: '12px',
  color: 'var(--ink)',
  fontSize: '12px',
  boxShadow: '0 12px 30px -16px rgba(0,0,0,0.5)',
}

export default function Reports() {
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('month')
  const [summary, setSummary] = useState(null)
  const [charts, setCharts] = useState([])
  const [chartPeriod, setChartPeriod] = useState('monthly')
  const [vehicles, setVehicles] = useState({ best: [], lowest: [] })
  const [expenses, setExpenses] = useState({ breakdown: [], totalExpenses: 0 })
  const [insights, setInsights] = useState([])
  const [incomeAnalysis, setIncomeAnalysis] = useState(null)

  const getDateRange = (p) => {
    const now = new Date()
    const end = now.toISOString()
    let start
    switch(p) {
      case 'today': start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString(); break
      case 'week': const ws = new Date(now); ws.setDate(now.getDate() - 7); start = ws.toISOString(); break
      case 'month': start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString(); break
      case 'year': start = new Date(now.getFullYear(), 0, 1).toISOString(); break
      default: start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    }
    return { startDate: start, endDate: end }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const range = getDateRange(period)
      const [summaryRes, chartsRes, vehiclesRes, expensesRes, insightsRes, incomeRes] = await Promise.all([
        api.get('/reports/summary', { params: range }),
        api.get('/reports/charts', { params: { period: chartPeriod } }),
        api.get('/reports/vehicles', { params: range }),
        api.get('/reports/expenses', { params: range }),
        api.get('/reports/insights'),
        api.get('/reports/income-analysis', { params: range })
      ])
      setSummary(summaryRes.data)
      setCharts(chartsRes.data)
      setVehicles(vehiclesRes.data)
      setExpenses(expensesRes.data)
      setInsights(insightsRes.data)
      setIncomeAnalysis(incomeRes.data)
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [period, chartPeriod])

  const periodLabel = PERIODS.find(p => p.key === period)?.label || 'This month'

  if (loading) {
    return (
      <div>
        <div className="skeleton mb-2 h-9 w-52" />
        <div className="skeleton mb-6 h-4 w-64" />
        <div className="mb-6 flex gap-2">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-9 w-24 rounded-full" />)}
        </div>
        <div className="skeleton mb-3 h-[148px]" />
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3">
          {[1, 2, 3].map(i => <div key={i} className="skeleton h-[112px]" />)}
        </div>
        <div className="skeleton h-[320px]" />
      </div>
    )
  }

  const netProfit = summary?.netProfit || 0
  const statCards = summary ? [
    { label: 'Total income', value: formatCurrency(summary.totalIncome), icon: HiOutlineCurrencyDollar },
    { label: 'Total expenses', value: formatCurrency(summary.totalExpenses), icon: HiOutlineReceiptPercent },
    { label: 'Fleet score', value: `${summary.activeCars}/${summary.totalCars}`, hint: 'vehicles healthy', icon: HiOutlineTruck },
  ] : []

  const hasChart = charts.length > 0

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="t-page">Reports &amp; analytics</h1>
          <p className="t-sm mt-1 text-ink-soft">Monitor fleet performance and growth.</p>
        </div>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          {PERIODS.map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`pill flex-shrink-0 ${period === p.key ? 'pill-active' : ''}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {!summary ? (
        <div className="card p-0">
          <EmptyState
            icon={<HiOutlineChartBar size={26} />}
            title="No report data"
            description="Record income and expenses to build your analytics."
          />
        </div>
      ) : (
        <>
          {/* Net profit hero */}
          <section className="card-invert p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="t-label text-[var(--solid-soft)]">Net profit · {periodLabel}</p>
                <p className="figure-lg mt-3 break-words text-[32px] sm:text-[40px]">
                  {formatCurrency(netProfit)}
                </p>
                <p className="t-xs mt-2 text-[var(--solid-soft)]">
                  {netProfit >= 0 ? 'Positive margin for the period' : 'Negative margin for the period'}
                </p>
              </div>
              <HiOutlineArrowTrendingUp size={22} className="mt-0.5 flex-shrink-0 opacity-50" />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4 border-t border-[color-mix(in_srgb,var(--solid-soft)_40%,transparent)] pt-4">
              <div>
                <p className="t-micro text-[var(--solid-soft)]">Income</p>
                <p className="figure-sm mt-1 text-[15px]">{formatCurrency(summary.totalIncome)}</p>
              </div>
              <div className="border-l border-[color-mix(in_srgb,var(--solid-soft)_40%,transparent)] pl-4">
                <p className="t-micro text-[var(--solid-soft)]">Expenses</p>
                <p className="figure-sm mt-1 text-[15px]">{formatCurrency(summary.totalExpenses)}</p>
              </div>
            </div>
          </section>

          {/* Stat cards */}
          <section className="mt-3 grid grid-cols-2 gap-3 md:mt-4 md:grid-cols-3 md:gap-4">
            {statCards.map((stat, i) => (
              <div key={i} className="card list-item-enter p-4" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex items-center justify-between">
                  <p className="t-label">{stat.label}</p>
                  <stat.icon size={16} className="text-ink-faint" />
                </div>
                <p className="figure mt-3 break-words text-[19px]">{stat.value}</p>
                {stat.hint && <p className="t-micro mt-1 text-ink-faint">{stat.hint}</p>}
              </div>
            ))}
          </section>

          {/* Trend chart */}
          <section className="card mt-4 p-5 md:mt-6 md:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="t-cardtitle">Profit overview</h2>
                <p className="t-xs mt-0.5 text-ink-faint">Income, expenses and profit</p>
              </div>
              <div className="seg">
                {['daily', 'weekly', 'monthly'].map(cp => (
                  <button
                    key={cp}
                    onClick={() => setChartPeriod(cp)}
                    className={`seg-item px-3 ${chartPeriod === cp ? 'seg-item-active' : ''}`}
                  >
                    {cp === 'daily' ? 'D' : cp === 'weekly' ? 'W' : 'M'}
                  </button>
                ))}
              </div>
            </div>

            {hasChart ? (
              <div className="h-[240px] w-full md:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={charts} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--hairline)" vertical={false} />
                    <XAxis
                      dataKey="label"
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
            ) : (
              <p className="t-sm py-12 text-center text-ink-faint">No chart data yet</p>
            )}

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

          {/* Expenses + rankings */}
          <div className="mt-4 grid gap-4 md:mt-6 lg:grid-cols-2 lg:gap-6">
            {expenses.breakdown.length > 0 && (
              <section className="card p-5 md:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="t-cardtitle">Expense breakdown</h2>
                    <p className="t-xs mt-0.5 text-ink-faint">By category · {periodLabel}</p>
                  </div>
                  <HiOutlineChartPie size={18} className="text-ink-faint" />
                </div>

                <div className="grid items-center gap-4 sm:grid-cols-[190px_1fr]">
                  <div className="h-[190px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expenses.breakdown}
                          dataKey="amount"
                          nameKey="category"
                          cx="50%"
                          cy="50%"
                          innerRadius={48}
                          outerRadius={82}
                          stroke="var(--panel)"
                          strokeWidth={2}
                        >
                          {expenses.breakdown.map((_, i) => (
                            <Cell
                              key={i}
                              fill="var(--ink)"
                              fillOpacity={SHADE_OPACITY[i % SHADE_OPACITY.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={chartTooltip}
                          formatter={(value, name) => [formatCurrency(value), name]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-2.5">
                    {expenses.breakdown.map((item, i) => (
                      <div key={item.category} className="flex items-center gap-2.5">
                        <span
                          className="h-2.5 w-2.5 flex-shrink-0 rounded-[3px] bg-ink"
                          style={{ opacity: SHADE_OPACITY[i % SHADE_OPACITY.length] }}
                        />
                        <span className="t-xs min-w-0 flex-1 truncate capitalize">{item.category}</span>
                        <span className="t-micro text-ink-faint">{item.percentage}%</span>
                        <span className="figure-sm w-[86px] text-right">{formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between border-t border-hairline pt-2.5">
                      <span className="t-xs font-semibold">Total</span>
                      <span className="figure-sm font-semibold">{formatCurrency(expenses.totalExpenses)}</span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            <div className="space-y-4 md:space-y-6">
              {vehicles.best.length > 0 && (
                <section className="card p-5 md:p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h2 className="t-cardtitle">Top performers</h2>
                      <p className="t-xs mt-0.5 text-ink-faint">Ranked by profit · {periodLabel}</p>
                    </div>
                    <HiOutlineTrophy size={18} className="text-ink-faint" />
                  </div>
                  <div className="-mx-1 divide-y divide-hairline">
                    {vehicles.best.map((v, i) => (
                      <div key={v._id} className="flex items-center gap-3 px-1 py-3">
                        <span className={`mono w-6 flex-shrink-0 text-[12px] ${i === 0 ? 'font-semibold text-ink' : 'text-ink-faint'}`}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="plate text-[14px]">{v.plateNumber}</p>
                          <p className="t-micro truncate text-ink-faint">{v.driverName}</p>
                        </div>
                        <span className="figure-sm flex-shrink-0 font-semibold">{formatCurrency(v.profit)}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {incomeAnalysis && (
                <section className="card p-5 md:p-6">
                  <h2 className="t-cardtitle">Income analysis</h2>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-[12px] border border-hairline bg-panel-soft/40 p-3.5">
                      <p className="t-label">Avg daily</p>
                      <p className="figure-sm mt-1.5 text-[15px]">{formatCurrency(incomeAnalysis.avgDailyIncome)}</p>
                    </div>
                    <div className="rounded-[12px] border border-hairline bg-panel-soft/40 p-3.5">
                      <p className="t-label">Total entries</p>
                      <p className="figure-sm mt-1.5 text-[15px]">{incomeAnalysis.totalEntries}</p>
                    </div>
                    {incomeAnalysis.highestIncomeDay && (
                      <div className="col-span-2 rounded-[12px] border border-hairline bg-panel-soft/40 p-3.5">
                        <p className="t-label">Best day</p>
                        <div className="mt-1.5 flex flex-wrap items-baseline justify-between gap-2">
                          <p className="figure-sm text-[15px]">{formatCurrency(incomeAnalysis.highestIncomeDay.amount)}</p>
                          <p className="t-micro text-ink-faint">
                            {new Date(incomeAnalysis.highestIncomeDay.date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )}
            </div>
          </div>

          {/* Insights */}
          {insights.length > 0 && (
            <section className="mt-4 md:mt-6">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="t-section">Insights</h2>
                <HiOutlineLightBulb size={17} className="text-ink-faint" />
              </div>
              <div className="card card-flush overflow-hidden">
                <div className="divide-y divide-hairline">
                  {insights.map((insight, i) => {
                    const Icon = insight.type === 'positive'
                      ? HiOutlineCheckCircle
                      : insight.type === 'negative'
                        ? HiOutlineExclamationTriangle
                        : HiOutlineLightBulb
                    return (
                      <div key={i} className="flex items-start gap-3 px-4 py-3.5 sm:px-5">
                        <span className="tile h-8 w-8 rounded-[9px]">
                          <Icon size={15} />
                        </span>
                        <p className="t-sm flex-1 text-ink-soft">{insight.message}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
