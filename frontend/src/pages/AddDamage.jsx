import { useState, useEffect } from 'react'
import api from '../services/api'
import { useToast } from '../components/Toast'
import {
  HiOutlineTruck,
  HiOutlineCalendarDays,
  HiOutlineCurrencyDollar,
  HiOutlineWrenchScrewdriver,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineDocumentText
} from 'react-icons/hi2'

const DAMAGE_TYPES = [
  "Broken side mirror",
  "Scratched door / body",
  "Broken headlight / taillight",
  "Cracked windshield",
  "Dented bumper",
  "Flat tire / tire burst",
  "Engine problem",
  "Brake issue",
  "Gearbox issue",
  "Seat damage / interior damage",
  "Electrical fault",
  "Other"
]

const EXPENSE_TYPES = [
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'fuel', label: 'Fuel' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'tires', label: 'Tires' },
  { value: 'other', label: 'Other' }
]

const INITIAL_SHOWN = 6

export default function AddDamage() {
  const [activeTab, setActiveTab] = useState('damage')
  const [cars, setCars] = useState([])
  const [showAllDamage, setShowAllDamage] = useState(false)
  const { addToast } = useToast()

  const [damageForm, setDamageForm] = useState({
    carId: '', date: new Date().toISOString().split('T')[0],
    damageType: '', cost: '', status: 'still damaged', notes: ''
  })

  const [expenseForm, setExpenseForm] = useState({
    carId: '', date: new Date().toISOString().split('T')[0],
    type: 'maintenance', description: '', cost: ''
  })

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/cars').then(res => setCars(res.data)).catch(() => {})
  }, [])

  const updateDamage = (field, value) => setDamageForm(prev => ({ ...prev, [field]: value }))
  const updateExpense = (field, value) => setExpenseForm(prev => ({ ...prev, [field]: value }))

  const handleDamageSubmit = async (e) => {
    e.preventDefault()
    if (!damageForm.carId || !damageForm.damageType || !damageForm.cost) {
      addToast('Please fill all required fields', 'error')
      return
    }
    setLoading(true)
    try {
      await api.post(`/cars/${damageForm.carId}/damage`, {
        date: damageForm.date,
        damageType: damageForm.damageType,
        description: damageForm.notes,
        cost: Number(damageForm.cost),
        status: damageForm.status,
        driverAtFault: ''
      })
      addToast('Damage recorded!', 'success')
      setDamageForm({ carId: '', date: new Date().toISOString().split('T')[0], damageType: '', cost: '', status: 'still damaged', notes: '' })
      setShowAllDamage(false)
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleExpenseSubmit = async (e) => {
    e.preventDefault()
    if (!expenseForm.carId || !expenseForm.cost) {
      addToast('Please fill all required fields', 'error')
      return
    }
    setLoading(true)
    try {
      await api.post(`/cars/${expenseForm.carId}/expense`, {
        date: expenseForm.date,
        type: expenseForm.type,
        description: expenseForm.description,
        cost: Number(expenseForm.cost)
      })
      addToast('Expense recorded!', 'success')
      setExpenseForm({ carId: '', date: new Date().toISOString().split('T')[0], type: 'maintenance', description: '', cost: '' })
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save', 'error')
    } finally {
      setLoading(false)
    }
  }

  const labelClass = 'text-xs text-text-muted uppercase tracking-wider font-medium mb-2 block'
  const fieldGroup = 'mb-5'
  const inputClass = 'w-full bg-bg-card text-text-primary rounded-xl px-4 h-12 border border-border-subtle focus:border-teal-500 focus:outline-none text-base transition-colors duration-150'

  const displayedDamageTypes = showAllDamage ? DAMAGE_TYPES : DAMAGE_TYPES.slice(0, INITIAL_SHOWN)

  return (
    <div className="px-4 py-6 lg:px-8 page-enter max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Record Entry</h1>
        <p className="text-text-secondary text-sm mt-0.5">Log damage or expense for a car</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-bg-card rounded-xl p-1 mb-6">
        <button
          onClick={() => setActiveTab('damage')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
            activeTab === 'damage'
              ? 'bg-teal-500 text-white shadow-md shadow-teal-500/20'
              : 'text-text-muted hover:text-text-secondary'
          }`}
        >
          <HiOutlineWrenchScrewdriver size={18} className="inline mr-1.5 -mt-0.5" />
          Damage
        </button>
        <button
          onClick={() => setActiveTab('expense')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
            activeTab === 'expense'
              ? 'bg-teal-500 text-white shadow-md shadow-teal-500/20'
              : 'text-text-muted hover:text-text-secondary'
          }`}
        >
          <HiOutlineCurrencyDollar size={18} className="inline mr-1.5 -mt-0.5" />
          Expense
        </button>
      </div>

      {/* Shared: Car Select */}
      <div className={fieldGroup}>
        <label className={labelClass}>Select Car</label>
        <div className="relative">
          <HiOutlineTruck size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <select
            value={activeTab === 'damage' ? damageForm.carId : expenseForm.carId}
            onChange={(e) => activeTab === 'damage' ? updateDamage('carId', e.target.value) : updateExpense('carId', e.target.value)}
            className="w-full bg-bg-card text-text-primary rounded-xl pl-11 pr-4 h-12 border border-border-subtle focus:border-teal-500 focus:outline-none text-base appearance-none transition-colors duration-150"
            required
          >
            <option value="" className="bg-bg-card">Choose a car...</option>
            {cars.map(car => (
              <option key={car._id} value={car._id} className="bg-bg-card">{car.plateNumber} — {car.driverName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Shared: Date */}
      <div className={fieldGroup}>
        <label className={labelClass}>{activeTab === 'damage' ? 'Date of Damage' : 'Date'}</label>
        <div className="relative">
          <HiOutlineCalendarDays size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            type="date"
            value={activeTab === 'damage' ? damageForm.date : expenseForm.date}
            onChange={(e) => activeTab === 'damage' ? updateDamage('date', e.target.value) : updateExpense('date', e.target.value)}
            className="w-full bg-bg-card text-text-primary rounded-xl pl-11 pr-4 h-12 border border-border-subtle focus:border-teal-500 focus:outline-none text-base transition-colors duration-150"
            required
          />
        </div>
      </div>

      {activeTab === 'damage' ? (
        <form onSubmit={handleDamageSubmit}>
          {/* Damage Type Grid */}
          <div className={fieldGroup}>
            <label className={labelClass}>Type of Damage</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {displayedDamageTypes.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => updateDamage('damageType', type)}
                  className={`text-left px-3 py-3 rounded-xl text-[13px] font-medium border transition-all duration-150 ${
                    damageForm.damageType === type
                      ? 'border-teal-500 bg-teal-500/10 text-teal-400'
                      : 'border-border-subtle bg-bg-card text-text-secondary hover:border-text-muted'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            {DAMAGE_TYPES.length > INITIAL_SHOWN && (
              <button
                type="button"
                onClick={() => setShowAllDamage(!showAllDamage)}
                className="mt-2 text-teal-500 text-xs font-medium flex items-center gap-1 hover:text-teal-400 transition-colors duration-150"
              >
                {showAllDamage ? (
                  <><HiOutlineChevronUp size={14} /> Show Less</>
                ) : (
                  <><HiOutlineChevronDown size={14} /> Show All ({DAMAGE_TYPES.length} types)</>
                )}
              </button>
            )}
          </div>

          {/* Cost */}
          <div className={fieldGroup}>
            <label className={labelClass}>Cost of Repair (KES)</label>
            <div className="relative">
              <HiOutlineCurrencyDollar size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              <input
                type="number"
                value={damageForm.cost}
                onChange={(e) => updateDamage('cost', e.target.value)}
                className="w-full bg-bg-card text-text-primary rounded-xl pl-11 pr-4 h-14 border border-border-subtle focus:border-teal-500 focus:outline-none text-2xl font-mono font-bold text-center transition-colors duration-150"
                placeholder="0"
                required
                min="0"
              />
            </div>
          </div>

          {/* Status Toggle */}
          <div className={fieldGroup}>
            <label className={labelClass}>Status</label>
            <div className="flex bg-bg-card rounded-xl p-1 border border-border-subtle gap-1">
              <button
                type="button"
                onClick={() => updateDamage('status', 'still damaged')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  damageForm.status === 'still damaged'
                    ? 'bg-damaged-bg text-danger font-semibold'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                Still Damaged
              </button>
              <button
                type="button"
                onClick={() => updateDamage('status', 'fixed')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  damageForm.status === 'fixed'
                    ? 'bg-healthy-bg text-success font-semibold'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                Fixed
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className={fieldGroup}>
            <label className={labelClass}>Notes (optional)</label>
            <textarea
              value={damageForm.notes}
              onChange={(e) => updateDamage('notes', e.target.value)}
              className="w-full bg-bg-card text-text-primary rounded-xl px-4 py-3 border border-border-subtle focus:border-teal-500 focus:outline-none text-base resize-none transition-colors duration-150"
              rows="3"
              placeholder="e.g., Happened at the market parking..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-500 hover:bg-teal-600 active:bg-teal-700 text-white font-semibold rounded-xl h-14 text-base transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/15 mt-8"
          >
            {loading ? 'Saving...' : 'Record Damage'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleExpenseSubmit}>
          <div className={fieldGroup}>
            <label className={labelClass}>Expense Type</label>
            <select
              value={expenseForm.type}
              onChange={(e) => updateExpense('type', e.target.value)}
              className="w-full bg-bg-card text-text-primary rounded-xl px-4 h-12 border border-border-subtle focus:border-teal-500 focus:outline-none text-base appearance-none transition-colors duration-150"
            >
              {EXPENSE_TYPES.map(t => (
                <option key={t.value} value={t.value} className="bg-bg-card">{t.label}</option>
              ))}
            </select>
          </div>

          <div className={fieldGroup}>
            <label className={labelClass}>Description</label>
            <input
              type="text"
              value={expenseForm.description}
              onChange={(e) => updateExpense('description', e.target.value)}
              className={inputClass}
              placeholder="e.g., Oil change, fuel refill..."
            />
          </div>

          <div className={fieldGroup}>
            <label className={labelClass}>Cost (KES)</label>
            <div className="relative">
              <HiOutlineCurrencyDollar size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              <input
                type="number"
                value={expenseForm.cost}
                onChange={(e) => updateExpense('cost', e.target.value)}
                className="w-full bg-bg-card text-text-primary rounded-xl pl-11 pr-4 h-14 border border-border-subtle focus:border-teal-500 focus:outline-none text-2xl font-mono font-bold text-center transition-colors duration-150"
                placeholder="0"
                required
                min="0"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-500 hover:bg-teal-600 active:bg-teal-700 text-white font-semibold rounded-xl h-14 text-base transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/15 mt-8"
          >
            {loading ? 'Saving...' : 'Record Expense'}
          </button>
        </form>
      )}
    </div>
  )
}
