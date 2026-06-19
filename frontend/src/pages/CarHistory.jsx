import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { formatCurrency, formatDate } from '../utils/formatters'
import LoadingSpinner from '../components/LoadingSpinner'
import { useToast } from '../components/Toast'
import { HiOutlineArrowLeft, HiOutlineCheck } from 'react-icons/hi2'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const TABS = ['Overview', 'Income', 'Damages', 'Expenses']

export default function CarHistory() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [car, setCar] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Overview')

  useEffect(() => {
    api.get(`/cars/${id}`)
      .then(res => setCar(res.data))
      .catch(() => addToast('Failed to load car', 'error'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <LoadingSpinner className="min-h-screen" />
  if (!car) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-text-secondary text-base mb-4">Car not found</p>
        <button onClick={() => navigate('/')} className="text-teal-500 text-sm font-medium">Go back to Dashboard</button>
      </div>
    </div>
  )

  const totalIncome = car.incomeHistory.reduce((s, e) => s + e.amount, 0)
  const totalDamageCost = car.damageHistory.reduce((s, e) => s + e.cost, 0)
  const totalExpenses = car.expenseHistory.reduce((s, e) => s + e.cost, 0) + totalDamageCost
  const netProfit = totalIncome - totalExpenses

  const monthlyData = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const month = d.toLocaleDateString('en', { month: 'short', year: '2-digit' })
    const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1)
    const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0)
    const income = car.incomeHistory.filter(e => { const ed = new Date(e.date); return ed >= startOfMonth && ed <= endOfMonth }).reduce((s, e) => s + e.amount, 0)
    const expenses = car.expenseHistory.filter(e => { const ed = new Date(e.date); return ed >= startOfMonth && ed <= endOfMonth }).reduce((s, e) => s + e.cost, 0) +
      car.damageHistory.filter(e => { const ed = new Date(e.date); return ed >= startOfMonth && ed <= endOfMonth }).reduce((s, e) => s + e.cost, 0)
    monthlyData.push({ month, income, expenses })
  }

  const allActivity = [
    ...car.incomeHistory.map(e => ({ ...e, type: 'income', label: 'Income collected' })),
    ...car.damageHistory.map(e => ({ ...e, type: 'damage', label: `Damage: ${e.damageType}` })),
    ...car.expenseHistory.map(e => ({ ...e, type: 'expense', label: `Expense: ${e.type}` }))
  ].sort((a, b) => new Date(b.date || b.recordedAt) - new Date(a.date || a.recordedAt)).slice(0, 10)

  const handleMarkFixed = async (damageId) => {
    try {
      const res = await api.put(`/cars/${id}/damage/${damageId}`)
      setCar(res.data)
      addToast('Damage marked as fixed!', 'success')
    } catch {
      addToast('Failed to update', 'error')
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg-deepest page-enter">
      {/* Header Card */}
      <div className="bg-bg-card mx-4 mt-4 rounded-2xl p-5 shadow-lg shadow-black/20">
        <button onClick={() => navigate('/')} className="text-text-secondary hover:text-text-primary flex items-center gap-1 mb-4 transition-colors duration-150">
          <HiOutlineArrowLeft size={18} />
          <span className="text-sm font-medium">Back</span>
        </button>

        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-mono font-bold text-text-primary tracking-wide">{car.plateNumber}</h1>
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full ${
            car.status === 'healthy' ? 'bg-healthy-bg text-success' : 'bg-damaged-bg text-danger'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${car.status === 'healthy' ? 'bg-success' : 'bg-danger'}`} />
            {car.status === 'healthy' ? 'Healthy' : 'Damaged'}
          </span>
        </div>

        <div className="flex items-center flex-wrap gap-x-2.5 gap-y-1 text-text-secondary text-sm mb-4">
          <span className="text-text-primary font-medium">{car.driverName}</span>
          <span className="w-1 h-1 bg-text-muted rounded-full" />
          <span>{car.driverPhone}</span>
          <span className="w-1 h-1 bg-text-muted rounded-full" />
          <span>{car.passengerCapacity} passengers</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-bg-deepest rounded-xl p-3 text-center">
            <p className="text-text-muted text-[11px] uppercase tracking-wider mb-0.5">Income</p>
            <p className="text-success font-mono font-bold text-sm">{formatCurrency(totalIncome)}</p>
          </div>
          <div className="bg-bg-deepest rounded-xl p-3 text-center">
            <p className="text-text-muted text-[11px] uppercase tracking-wider mb-0.5">Expenses</p>
            <p className="text-danger font-mono font-bold text-sm">{formatCurrency(totalExpenses)}</p>
          </div>
          <div className="bg-bg-deepest rounded-xl p-3 text-center">
            <p className="text-text-muted text-[11px] uppercase tracking-wider mb-0.5">Profit</p>
            <p className={`font-mono font-bold text-sm ${netProfit >= 0 ? 'text-success' : 'text-danger'}`}>
              {formatCurrency(netProfit)}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex mx-4 mt-4 bg-bg-card rounded-xl p-1 gap-1 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-150 ${
              activeTab === tab
                ? 'bg-teal-500 text-white shadow-md shadow-teal-500/15'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 px-4 py-5 overflow-y-auto">
        {activeTab === 'Overview' && (
          <div className="space-y-5">
            <div className="bg-bg-card rounded-2xl p-4 shadow-lg shadow-black/20">
              <h3 className="text-sm font-semibold text-text-primary mb-4">Monthly Income vs Expenses</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A3441" />
                  <XAxis dataKey="month" stroke="#6B7280" fontSize={10} />
                  <YAxis stroke="#6B7280" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      background: '#0A0F1A',
                      border: '1px solid #2A3441',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-3 text-xs">
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-success rounded-full" /> Income</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-danger rounded-full" /> Expenses</span>
              </div>
            </div>

            <h3 className="text-sm font-semibold text-text-primary">Recent Activity</h3>
            {allActivity.length === 0 ? (
              <div className="bg-bg-card rounded-2xl p-8 text-center">
                <p className="text-text-secondary text-sm">No activity recorded yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {allActivity.map((entry, i) => (
                  <div key={i} className="bg-bg-card rounded-xl p-3.5 flex items-center justify-between shadow-lg shadow-black/20">
                    <div>
                      <p className="text-text-primary text-sm font-medium">{entry.label}</p>
                      <p className="text-text-muted text-xs mt-0.5">{formatDate(entry.date)}</p>
                    </div>
                    <span className={`text-sm font-semibold font-mono ${
                      entry.type === 'income' ? 'text-success' : 'text-danger'
                    }`}>
                      {entry.type === 'income' ? '+' : '-'}{formatCurrency(entry.amount || entry.cost)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'Income' && (
          <div>
            {car.incomeHistory.length === 0 ? (
              <div className="bg-bg-card rounded-2xl p-8 text-center">
                <p className="text-text-secondary text-sm">No income recorded yet</p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {[...car.incomeHistory].sort((a, b) => new Date(b.date) - new Date(a.date)).map((entry, i) => (
                    <div key={i} className="bg-bg-card rounded-xl p-3.5 flex items-center justify-between shadow-lg shadow-black/20">
                      <div>
                        <p className="text-text-primary text-sm font-medium">{formatDate(entry.date)}</p>
                        {entry.note && <p className="text-text-muted text-xs mt-0.5">{entry.note}</p>}
                      </div>
                      <span className="text-success font-semibold font-mono text-sm">+{formatCurrency(entry.amount)}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-bg-card rounded-xl p-4 mt-4 flex justify-between shadow-lg shadow-black/20">
                  <span className="text-text-primary font-semibold text-sm">Total Income</span>
                  <span className="text-success font-bold text-lg font-mono">{formatCurrency(totalIncome)}</span>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'Damages' && (
          <div>
            {car.damageHistory.length === 0 ? (
              <div className="bg-bg-card rounded-2xl p-8 text-center">
                <p className="text-text-secondary text-sm">No damages recorded</p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {[...car.damageHistory].sort((a, b) => new Date(b.date) - new Date(a.date)).map((entry, i) => (
                    <div key={i} className="bg-bg-card rounded-xl p-3.5 shadow-lg shadow-black/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-text-primary text-sm font-medium">{entry.damageType}</p>
                          <p className="text-text-muted text-xs mt-0.5">{formatDate(entry.date)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                            entry.status === 'fixed'
                              ? 'bg-healthy-bg text-success'
                              : 'bg-damaged-bg text-danger'
                          }`}>
                            {entry.status === 'fixed' ? 'Fixed' : 'Damaged'}
                          </span>
                          <span className="text-danger font-semibold text-sm font-mono">{formatCurrency(entry.cost)}</span>
                        </div>
                      </div>
                      {entry.status === 'still damaged' && (
                        <button
                          onClick={() => handleMarkFixed(entry._id)}
                          className="mt-3 text-teal-500 text-xs font-semibold flex items-center gap-1 hover:text-teal-400 transition-colors duration-150"
                        >
                          <HiOutlineCheck size={14} />
                          Mark as Fixed
                        </button>
                      )}
                      {entry.driverAtFault && (
                        <p className="text-text-muted text-xs mt-2">Driver at fault: {entry.driverAtFault}</p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="bg-bg-card rounded-xl p-4 mt-4 flex justify-between shadow-lg shadow-black/20">
                  <span className="text-text-primary font-semibold text-sm">Total Damage Cost</span>
                  <span className="text-danger font-bold text-lg font-mono">{formatCurrency(totalDamageCost)}</span>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'Expenses' && (
          <div>
            {car.expenseHistory.length === 0 ? (
              <div className="bg-bg-card rounded-2xl p-8 text-center">
                <p className="text-text-secondary text-sm">No expenses recorded</p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {[...car.expenseHistory].sort((a, b) => new Date(b.date) - new Date(a.date)).map((entry, i) => (
                    <div key={i} className="bg-bg-card rounded-xl p-3.5 flex items-center justify-between shadow-lg shadow-black/20">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[11px] bg-border-subtle text-text-muted px-2 py-0.5 rounded-full capitalize font-medium">{entry.type}</span>
                          <p className="text-text-primary text-sm font-medium">{entry.description || entry.type}</p>
                        </div>
                        <p className="text-text-muted text-xs">{formatDate(entry.date)}</p>
                      </div>
                      <span className="text-danger font-semibold font-mono text-sm">{formatCurrency(entry.cost)}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-bg-card rounded-xl p-4 mt-4 flex justify-between shadow-lg shadow-black/20">
                  <span className="text-text-primary font-semibold text-sm">Total Expenses</span>
                  <span className="text-danger font-bold text-lg font-mono">
                    {formatCurrency(car.expenseHistory.reduce((s, e) => s + e.cost, 0))}
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}