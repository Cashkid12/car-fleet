import { useState, useEffect } from 'react'
import api from '../services/api'
import { formatCurrency } from '../utils/formatters'
import { LoadingSkeleton } from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import {
  HiOutlineArrowTrendingUp,
  HiOutlineReceiptPercent,
  HiOutlineTruck,
  HiOutlineCurrencyDollar,
  HiOutlineChartBar,
  HiOutlineCalendarDays,
  HiOutlineLightBulb,
  HiOutlineTrophy,
  HiOutlineExclamationTriangle,
  HiOutlineFire
} from 'react-icons/hi2'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts'

const COLORS = ['#14B8A6', '#22C55E', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899', '#64748B', '#94A3B8', '#1F2937'];

const PERIODS = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'year', label: 'This Year' },
]

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

  if (loading) {
    return (
      <div className="px-5 py-8 max-w-2xl mx-auto">
        <div className="skeleton h-10 w-48 rounded-xl mb-2" />
        <div className="skeleton h-5 w-64 rounded-xl mb-8" />
        <div className="grid grid-cols-2 gap-4 mb-8">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
        <div className="skeleton h-64 rounded-2xl mb-8" />
      </div>
    )
  }

  const statCards = summary ? [
    { label: 'Total Income', value: formatCurrency(summary.totalIncome), icon: HiOutlineCurrencyDollar, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Total Expenses', value: formatCurrency(summary.totalExpenses), icon: HiOutlineReceiptPercent, color: 'text-danger', bg: 'bg-danger/10' },
    { label: 'Net Profit', value: formatCurrency(summary.netProfit), icon: HiOutlineArrowTrendingUp, color: summary.netProfit >= 0 ? 'text-success' : 'text-danger', bg: summary.netProfit >= 0 ? 'bg-success/10' : 'bg-danger/10' },
    { label: 'Fleet Score', value: `${summary.activeCars}/${summary.totalCars} healthy`, icon: HiOutlineTruck, color: 'text-teal-500', bg: 'bg-teal-500/10' },
  ] : []

  return (
    <div className="page-enter max-w-2xl mx-auto px-5 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-white tracking-tight">Reports & Analytics</h1>
        <p className="text-[#94A3B8] text-[15px] mt-1">Monitor fleet performance and growth</p>
      </div>

      {/* Period Filters */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
        {PERIODS.map(p => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`flex-shrink-0 px-4 py-2.5 rounded-full text-[13px] font-semibold transition-all duration-200 ${
              period === p.key ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20' : 'bg-[#1A2332] text-[#94A3B8] border border-white/5'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-[#1A2332] rounded-2xl p-4 border border-white/5 list-item-enter" style={{ animationDelay: `${i*80}ms` }}>
            <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon size={20} className={stat.color} />
            </div>
            <p className="text-[10px] text-[#64748B] uppercase tracking-widest font-semibold">{stat.label}</p>
            <p className={`mt-1 text-lg font-mono font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-[#1A2332] rounded-2xl p-5 border border-white/5 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[18px] font-semibold text-white">Profit Overview</h3>
          <div className="flex gap-1 bg-[#0B1120] rounded-xl p-1">
            {['daily', 'weekly', 'monthly'].map(cp => (
              <button key={cp} onClick={() => setChartPeriod(cp)} className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 ${chartPeriod === cp ? 'bg-teal-500 text-white' : 'text-[#64748B]'}`}>
                {cp === 'daily' ? 'D' : cp === 'weekly' ? 'W' : 'M'}
              </button>
            ))}
          </div>
        </div>
        {charts.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={charts}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="label" stroke="#64748B" fontSize={10} />
              <YAxis stroke="#64748B" fontSize={10} />
              <Tooltip contentStyle={{ background: '#1A2332', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', color: '#fff', fontSize: '12px' }} />
              <Line type="monotone" dataKey="income" stroke="#22C55E" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="profit" stroke="#14B8A6" strokeWidth={2} dot={false} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-[#64748B] text-center py-8 text-sm">No chart data yet</p>
        )}
        <div className="flex gap-4 mt-3 text-[11px] justify-center">
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-success rounded-full" /> Income</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-danger rounded-full" /> Expenses</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-teal-500 rounded-full" /> Profit</span>
        </div>
      </div>

      {/* Expense Breakdown */}
      {expenses.breakdown.length > 0 && (
        <div className="bg-[#1A2332] rounded-2xl p-5 border border-white/5 mb-8">
          <h3 className="text-[18px] font-semibold text-white mb-4">Expense Breakdown</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={expenses.breakdown} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={80} label={({ category, percentage }) => `${category} ${percentage}%`}>
                {expenses.breakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1A2332', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Vehicle Rankings */}
      {vehicles.best.length > 0 && (
        <div className="bg-[#1A2332] rounded-2xl p-5 border border-white/5 mb-8">
          <h3 className="text-[18px] font-semibold text-white mb-4 flex items-center gap-2"><HiOutlineTrophy size={22} className="text-warning" /> Top Performers</h3>
          <div className="space-y-2">
            {vehicles.best.map((v, i) => (
              <div key={v._id} className="bg-[#0B1120] rounded-xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-[#64748B] text-sm font-bold w-6">{i+1}</span>
                  <div>
                    <p className="text-white text-[14px] font-medium">{v.plateNumber}</p>
                    <p className="text-[#64748B] text-[11px]">{v.driverName}</p>
                  </div>
                </div>
                <span className="text-success font-mono font-semibold text-sm">{formatCurrency(v.profit)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <div className="bg-[#1A2332] rounded-2xl p-5 border border-white/5 mb-8">
          <h3 className="text-[18px] font-semibold text-white mb-4 flex items-center gap-2"><HiOutlineLightBulb size={22} className="text-warning" /> Insights</h3>
          <div className="space-y-2">
            {insights.map((insight, i) => (
              <div key={i} className={`bg-[#0B1120] rounded-xl p-3.5 flex items-start gap-3 ${
                insight.type === 'positive' ? 'border-l-2 border-success' : insight.type === 'negative' ? 'border-l-2 border-danger' : 'border-l-2 border-warning'
              }`}>
                {insight.type === 'positive' ? <HiOutlineArrowTrendingUp size={18} className="text-success mt-0.5" /> :
                 insight.type === 'negative' ? <HiOutlineExclamationTriangle size={18} className="text-danger mt-0.5" /> :
                 <HiOutlineLightBulb size={18} className="text-warning mt-0.5" />}
                <p className="text-[#94A3B8] text-[13px]">{insight.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Income Analysis */}
      {incomeAnalysis && (
        <div className="bg-[#1A2332] rounded-2xl p-5 border border-white/5 mb-8">
          <h3 className="text-[18px] font-semibold text-white mb-4">Income Analysis</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#0B1120] rounded-xl p-3 text-center">
              <p className="text-[#64748B] text-[10px] uppercase tracking-widest mb-1">Avg Daily</p>
              <p className="text-success font-mono font-bold">{formatCurrency(incomeAnalysis.avgDailyIncome)}</p>
            </div>
            <div className="bg-[#0B1120] rounded-xl p-3 text-center">
              <p className="text-[#64748B] text-[10px] uppercase tracking-widest mb-1">Total Entries</p>
              <p className="text-white font-mono font-bold">{incomeAnalysis.totalEntries}</p>
            </div>
            {incomeAnalysis.highestIncomeDay && (
              <div className="bg-[#0B1120] rounded-xl p-3 text-center col-span-2">
                <p className="text-[#64748B] text-[10px] uppercase tracking-widest mb-1">Best Day</p>
                <p className="text-success font-mono font-bold">{formatCurrency(incomeAnalysis.highestIncomeDay.amount)} <span className="text-[#64748B] text-xs">on {new Date(incomeAnalysis.highestIncomeDay.date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}</span></p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}