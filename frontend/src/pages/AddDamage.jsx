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
      addToast('Fill all required fields', 'error')
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
      addToast('Fill all required fields', 'error')
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

  const labelClass = 'text-[11px] text-text-muted uppercase tracking-wider font-semibold mb-2 block'
  const inputClass = 'w-full bg-[#1A2332] text-white rounded-xl px-4 h-12 border border-[#2A3441] focus:border-teal-500 focus:outline-none text-[15px] transition-colors duration-150'

  const displayedDamageTypes = showAllDamage ? DAMAGE_TYPES : DAMAGE_TYPES.slice(0, INITIAL_SHOWN)

  return (
    <div className="px-4 py-5 page-enter pb-24 max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-white">Record Entry</h1>
        <p className="text-text-secondary text-[13px] mt-0.5">Log damage or expense</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#1A2332] rounded-xl p-1 mb-5">
        <button
          onClick={() => setActiveTab('damage')}
          className={`flex-1 py-2.5 rounded-lg text-[13px] font-semibold transition-all duration-150 ${
            activeTab === 'damage'
              ? 'bg-teal-500 text-white shadow-md shadow-teal-500/15'
              : 'text-text-muted'
          }`}
        >
          <HiOutlineWrenchScrewdriver size={16} className="inline mr-1 -mt-0.5" />
          Damage
        </button>
        <button
          onClick={() => setActiveTab('expense')}
          className={`flex-1 py-2.5 rounded-lg text-[13px] font-semibold transition-all duration-150 ${
            activeTab === 'expense'
              ? 'bg-teal-500 text-white shadow-md shadow-teal-500/15'
              : 'text-text-muted'
          }`}
        >
          <HiOutlineCurrencyDollar size={16} className="inline mr-1 -mt-0.5" />
          Expense
        </button>
      </div>

      {/* Car Select */}
      <div className="mb-4">
        <label className={labelClass}>Select Car</label>
        <div className="relative">
          <HiOutlineTruck size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <select
            value={activeTab === 'damage' ? damageForm.carId : expenseForm.carId}
            onChange={(e) => activeTab === 'damage' ? updateDamage('carId', e.target.value) : updateExpense('carId', e.target.value)}
            className="w-full bg-[#1A2332] text-white rounded-xl pl-11 pr-4 h-12 border border-[#2A3441] focus:border-teal-500 focus:outline-none text-[15px] appearance-none transition-colors duration-150"
            required
          >
            <option value="" className="bg-[#1A2332]">Choose a car...</option>
            {cars.map(car => (
              <option key={car._id} value={car._id} className="bg-[#1A2332]">{car.plateNumber} — {car.driverName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Date */}
      <div className="mb-4">
        <label className={labelClass}>{activeTab === 'damage' ? 'Date of Damage' : 'Date'}</label>
        <div className="relative">
          <HiOutlineCalendarDays size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            type="date"
            value={activeTab === 'damage' ? damageForm.date : expenseForm.date}
            onChange={(e) => activeTab === 'damage' ? updateDamage('date', e.target.value) : updateExpense('date', e.target.value)}
            className="w-full bg-[#1A2332] text-white rounded-xl pl-11 pr-4 h-12 border border-[#2A3441] focus:border-teal-500 focus:outline-none text-[15px] transition-colors duration-150"
            required
          />
        </div>
      </div>

      {activeTab === 'damage' ? (
        <form onSubmit={handleDamageSubmit} className="space-y-4">
          {/* Damage Types */}
          <div>
            <label className={labelClass}>Type of Damage</label>
            <div className="grid grid-cols-2 gap-2">
              {displayedDamageTypes.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => updateDamage('damageType', type)}
                  className={`text-left px-3 py-3 rounded-xl text-[12px] font-medium border transition-all duration-150 ${
                    damageForm.damageType === type
                      ? 'border-teal-500 bg-teal-500/10 text-teal-400'
                      : 'border-[#2A3441] bg-[#1A2332] text-text-secondary'
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
                className="mt-2 text-teal-500 text-[12px] font-medium flex items-center gap-1"
              >
                {showAllDamage ? (
                  <><HiOutlineChevronUp size={13} /> Show Less</>
                ) : (
                  <><HiOutlineChevronDown size={13} /> Show All ({DAMAGE_TYPES.length})</>
                )}
              </button>
            )}
          </div>

          {/* Cost */}
          <div>
            <label className={labelClass}>Cost of Repair (KES)</label>
            <div className="relative">
              <HiOutlineCurrencyDollar size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              <input
                type="number"
                value={damageForm.cost}
                onChange={(e) => updateDamage('cost', e.target.value)}
                className="w-full bg-[#1A2332] text-white rounded-xl pl-11 pr-4 h-14 border border-[#2A3441] focus:border-teal-500 focus:outline-none text-2xl font-mono font-bold text-center transition-colors duration-150"
                placeholder="0"
                required
                min="0"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className={labelClass}>Status</label>
            <div className="flex bg-[#1A2332] rounded-xl p-1 border border-[#2A3441] gap-1">
              <button
                type="button"
                onClick={() => updateDamage('status', 'still damaged')}
                className={`flex-1 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                  damageForm.status === 'still damaged'
                    ? 'bg-[#7F1D1D] text-danger font-semibold'
                    : 'text-text-muted'
                }`}
              >
                Still Damaged
              </button>
              <button
                type="button"
                onClick={() => updateDamage('status', 'fixed')}
                className={`flex-1 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                  damageForm.status === 'fixed'
                    ? 'bg-[#065F46] text-success font-semibold'
                    : 'text-text-muted'
                }`}
              >
                Fixed
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={labelClass}>Notes (optional)</label>
            <textarea
              value={damageForm.notes}
              onChange={(e) => updateDamage('notes', e.target.value)}
              className="w-full bg-[#1A2332] text-white rounded-xl px-4 py-3 border border-[#2A3441] focus:border-teal-500 focus:outline-none text-[15px] resize-none transition-colors duration-150"
              rows="2"
              placeholder="e.g., Happened at the market..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-500 hover:bg-teal-600 active:bg-teal-700 text-white font-semibold rounded-xl h-14 text-[15px] transition-colors duration-150 disabled:opacity-50 mt-6 shadow-lg shadow-teal-500/10"
          >
            {loading ? 'Saving...' : 'Record Damage'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleExpenseSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Expense Type</label>
            <select
              value={expenseForm.type}
              onChange={(e) => updateExpense('type', e.target.value)}
              className="w-full bg-[#1A2332] text-white rounded-xl px-4 h-12 border border-[#2A3441] focus:border-teal-500 focus:outline-none text-[15px] appearance-none transition-colors duration-150"
            >
              {EXPENSE_TYPES.map(t => (
                <option key={t.value} value={t.value} className="bg-[#1A2332]">{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <input
              type="text"
              value={expenseForm.description}
              onChange={(e) => updateExpense('description', e.target.value)}
              className={inputClass}
              placeholder="e.g., Oil change, fuel..."
            />
          </div>

          <div>
            <label className={labelClass}>Cost (KES)</label>
            <div className="relative">
              <HiOutlineCurrencyDollar size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              <input
                type="number"
                value={expenseForm.cost}
                onChange={(e) => updateExpense('cost', e.target.value)}
                className="w-full bg-[#1A2332] text-white rounded-xl pl-11 pr-4 h-14 border border-[#2A3441] focus:border-teal-500 focus:outline-none text-2xl font-mono font-bold text-center transition-colors duration-150"
                placeholder="0"
                required
                min="0"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-500 hover:bg-teal-600 active:bg-teal-700 text-white font-semibold rounded-xl h-14 text-[15px] transition-colors duration-150 disabled:opacity-50 mt-6 shadow-lg shadow-teal-500/10"
          >
            {loading ? 'Saving...' : 'Record Expense'}
          </button>
        </form>
      )}
    </div>
  )
}