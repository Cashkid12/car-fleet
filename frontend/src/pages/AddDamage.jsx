import { useState, useEffect } from 'react'
import api from '../services/api'
import { useToast } from '../components/Toast'
import { formatCurrency } from '../utils/formatters'
import {
  HiOutlineCalendarDays,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineDocumentText,
  HiOutlineCheckCircle,
  HiOutlineXMark,
  HiOutlineExclamationTriangle,
  HiOutlineReceiptPercent
} from 'react-icons/hi2'

const DAMAGE_TYPES = [
  "Broken side mirror", "Scratched door / body", "Broken headlight / taillight",
  "Cracked windshield", "Dented bumper", "Flat tire / tire burst", "Engine problem",
  "Brake issue", "Gearbox issue", "Seat damage / interior damage", "Electrical fault", "Other"
]

const EXPENSE_TYPES = [
  { value: 'fuel', label: 'Fuel' },
  { value: 'repair', label: 'Repair' },
  { value: 'oil_service', label: 'Oil service' },
  { value: 'tires', label: 'Tires' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'fine', label: 'Fine' },
  { value: 'parking', label: 'Parking' },
  { value: 'car_wash', label: 'Car wash' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'other', label: 'Other' },
]

const INITIAL_SHOWN = 6

export default function AddDamage() {
  const [activeTab, setActiveTab] = useState('damage')
  const [cars, setCars] = useState([])
  const [showAllDamage, setShowAllDamage] = useState(false)
  const [success, setSuccess] = useState(null)
  const { addToast } = useToast()

  const [damageForm, setDamageForm] = useState({
    carId: '', date: new Date().toISOString().split('T')[0],
    damageType: '', estimatedCost: '', driverAtFault: false, note: ''
  })

  const [expenseForm, setExpenseForm] = useState({
    carId: '', date: new Date().toISOString().split('T')[0],
    type: 'fuel', description: '', cost: '', note: ''
  })

  const [loading, setLoading] = useState(false)

  useEffect(() => { api.get('/cars').then(res => setCars(res.data)).catch(() => {}) }, [])

  const updateDamage = (f, v) => setDamageForm(p => ({ ...p, [f]: v }))
  const updateExpense = (f, v) => setExpenseForm(p => ({ ...p, [f]: v }))

  const handleDamageSubmit = async (e) => {
    e.preventDefault()
    if (!damageForm.carId || !damageForm.damageType || !damageForm.estimatedCost) {
      addToast('Fill all required fields', 'error'); return
    }
    setLoading(true)
    try {
      const res = await api.post(`/cars/${damageForm.carId}/damage`, {
        date: damageForm.date,
        damageType: damageForm.damageType,
        description: damageForm.note,
        estimatedCost: Number(damageForm.estimatedCost),
        driverAtFault: damageForm.driverAtFault,
        note: damageForm.note
      })
      setSuccess({
        type: 'damage',
        plateNumber: res.data.car.plateNumber,
        referenceNumber: res.data.entry.referenceNumber,
        amount: Number(damageForm.estimatedCost),
        date: new Date().toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' }),
        time: new Date().toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })
      })
      setDamageForm({ carId: '', date: new Date().toISOString().split('T')[0], damageType: '', estimatedCost: '', driverAtFault: false, note: '' })
      setShowAllDamage(false)
    } catch (err) { addToast(err.response?.data?.message || 'Failed', 'error') } finally { setLoading(false) }
  }

  const handleExpenseSubmit = async (e) => {
    e.preventDefault()
    if (!expenseForm.carId || !expenseForm.cost) { addToast('Fill all required fields', 'error'); return }
    setLoading(true)
    try {
      const res = await api.post(`/cars/${expenseForm.carId}/expense`, {
        date: expenseForm.date,
        type: expenseForm.type,
        description: expenseForm.description,
        cost: Number(expenseForm.cost),
        note: expenseForm.note
      })
      setSuccess({
        type: 'expense',
        plateNumber: res.data.car.plateNumber,
        referenceNumber: res.data.entry.referenceNumber,
        amount: Number(expenseForm.cost),
        date: new Date().toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' }),
        time: new Date().toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })
      })
      setExpenseForm({ carId: '', date: new Date().toISOString().split('T')[0], type: 'fuel', description: '', cost: '', note: '' })
    } catch (err) { addToast(err.response?.data?.message || 'Failed', 'error') } finally { setLoading(false) }
  }

  const closeSuccess = () => setSuccess(null)
  const displayedDamageTypes = showAllDamage ? DAMAGE_TYPES : DAMAGE_TYPES.slice(0, INITIAL_SHOWN)

  return (
    <div className="page-enter mx-auto w-full max-w-3xl">
      <div className="mb-7">
        <h1 className="t-page">Vehicle health</h1>
        <p className="t-sm mt-1 text-ink-soft">Manage damages and operating expenses.</p>
      </div>

      {/* Tabs */}
      <div className="seg mb-5">
        <button
          onClick={() => setActiveTab('damage')}
          className={`seg-item ${activeTab === 'damage' ? 'seg-item-active' : ''}`}
        >
          <HiOutlineExclamationTriangle size={16} />
          Damage
        </button>
        <button
          onClick={() => setActiveTab('expense')}
          className={`seg-item ${activeTab === 'expense' ? 'seg-item-active' : ''}`}
        >
          <HiOutlineReceiptPercent size={16} />
          Expense
        </button>
      </div>

      {/* Shared fields */}
      <div className="card mb-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="t-label mb-1.5 block">Vehicle</label>
            <div className="select-wrap">
              <select
                value={activeTab === 'damage' ? damageForm.carId : expenseForm.carId}
                onChange={(e) => activeTab === 'damage' ? updateDamage('carId', e.target.value) : updateExpense('carId', e.target.value)}
                className="field appearance-none pr-10"
                required
              >
                <option value="">Choose a vehicle</option>
                {cars.map(car => <option key={car._id} value={car._id}>{car.plateNumber} — {car.driverName}</option>)}
              </select>
              <HiOutlineChevronDown size={16} />
            </div>
          </div>

          <div>
            <label className="t-label mb-1.5 block">Date</label>
            <div className="relative">
              <HiOutlineCalendarDays
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint"
              />
              <input
                type="date"
                value={activeTab === 'damage' ? damageForm.date : expenseForm.date}
                onChange={(e) => activeTab === 'damage' ? updateDamage('date', e.target.value) : updateExpense('date', e.target.value)}
                className="field pl-11"
                required
              />
            </div>
          </div>
        </div>
      </div>

      {activeTab === 'damage' ? (
        <form onSubmit={handleDamageSubmit} className="space-y-4">
          <div className="card">
            <label className="t-label mb-3 block">Damage type</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {displayedDamageTypes.map(type => {
                const active = damageForm.damageType === type
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => updateDamage('damageType', type)}
                    aria-pressed={active}
                    className={`rounded-[10px] border px-3 py-3 text-left text-[12.5px] leading-snug transition-colors duration-150 ${
                      active
                        ? 'border-[var(--solid)] bg-solid font-medium text-solid-ink'
                        : 'border-hairline bg-field text-ink-soft hover:border-hairline-strong hover:text-ink'
                    }`}
                  >
                    {type}
                  </button>
                )
              })}
            </div>
            {DAMAGE_TYPES.length > INITIAL_SHOWN && (
              <button
                type="button"
                onClick={() => setShowAllDamage(!showAllDamage)}
                className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-medium text-ink-soft transition-colors hover:text-ink"
              >
                {showAllDamage
                  ? <><HiOutlineChevronUp size={14} /> Show less</>
                  : <><HiOutlineChevronDown size={14} /> Show all ({DAMAGE_TYPES.length})</>}
              </button>
            )}
          </div>

          <div className="card">
            <div className="mb-3 flex items-baseline justify-between">
              <label className="t-label">Estimated repair cost</label>
              <span className="t-micro text-ink-faint">KES</span>
            </div>
            <input
              type="number"
              value={damageForm.estimatedCost}
              onChange={(e) => updateDamage('estimatedCost', e.target.value)}
              className="field field-lg"
              placeholder="0"
              required
              min="0"
              aria-label="Estimated repair cost in KES"
            />
          </div>

          <div className="card">
            <label className="t-label mb-3 block">Driver at fault?</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateDamage('driverAtFault', false)}
                aria-pressed={!damageForm.driverAtFault}
                className={`h-11 rounded-[10px] border text-[13px] font-medium transition-colors ${
                  !damageForm.driverAtFault
                    ? 'border-[var(--solid)] bg-solid text-solid-ink'
                    : 'border-hairline bg-field text-ink-soft hover:border-hairline-strong'
                }`}
              >
                No
              </button>
              <button
                type="button"
                onClick={() => updateDamage('driverAtFault', true)}
                aria-pressed={damageForm.driverAtFault}
                className={`h-11 rounded-[10px] border text-[13px] font-medium transition-colors ${
                  damageForm.driverAtFault
                    ? 'border-[var(--solid)] bg-solid text-solid-ink'
                    : 'border-hairline bg-field text-ink-soft hover:border-hairline-strong'
                }`}
              >
                Yes
              </button>
            </div>
          </div>

          <div className="card">
            <label className="t-label mb-1.5 block">Note (optional)</label>
            <textarea
              value={damageForm.note}
              onChange={(e) => updateDamage('note', e.target.value)}
              className="field"
              rows="2"
              placeholder="Additional details..."
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary btn-lg btn-block">
            {loading ? 'Reporting...' : 'Report damage'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleExpenseSubmit} className="space-y-4">
          <div className="card">
            <label className="t-label mb-3 block">Expense category</label>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {EXPENSE_TYPES.map(t => {
                const active = expenseForm.type === t.value
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => updateExpense('type', t.value)}
                    aria-pressed={active}
                    className={`h-10 rounded-[10px] border px-2 text-[12px] font-medium transition-colors duration-150 ${
                      active
                        ? 'border-[var(--solid)] bg-solid text-solid-ink'
                        : 'border-hairline bg-field text-ink-soft hover:border-hairline-strong hover:text-ink'
                    }`}
                  >
                    {t.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="card">
            <label className="t-label mb-1.5 block">Description</label>
            <div className="relative">
              <HiOutlineDocumentText
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint"
              />
              <input
                type="text"
                value={expenseForm.description}
                onChange={(e) => updateExpense('description', e.target.value)}
                className="field pl-11"
                placeholder="e.g., Full tank refill"
              />
            </div>
          </div>

          <div className="card">
            <div className="mb-3 flex items-baseline justify-between">
              <label className="t-label">Cost</label>
              <span className="t-micro text-ink-faint">KES</span>
            </div>
            <input
              type="number"
              value={expenseForm.cost}
              onChange={(e) => updateExpense('cost', e.target.value)}
              className="field field-lg"
              placeholder="0"
              required
              min="0"
              aria-label="Expense cost in KES"
            />
          </div>

          <div className="card">
            <label className="t-label mb-1.5 block">Note (optional)</label>
            <textarea
              value={expenseForm.note}
              onChange={(e) => updateExpense('note', e.target.value)}
              className="field"
              rows="2"
              placeholder="Additional details..."
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary btn-lg btn-block">
            {loading ? 'Saving...' : 'Record expense'}
          </button>
        </form>
      )}

      {/* Success receipt */}
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={closeSuccess}>
          <div className="backdrop backdrop-enter" />
          <div
            className="modal sheet-enter"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={success.type === 'damage' ? 'Damage reported' : 'Expense added'}
          >
            <button
              onClick={closeSuccess}
              aria-label="Close"
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-[8px] text-ink-faint transition-colors hover:bg-ghost hover:text-ink"
            >
              <HiOutlineXMark size={18} />
            </button>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-panel-soft">
                <HiOutlineCheckCircle size={30} className="text-ink" />
              </div>
              <h2 className="t-section">{success.type === 'damage' ? 'Damage reported' : 'Expense added'}</h2>
              <p className="figure-lg mt-3 break-words text-[30px]">{formatCurrency(success.amount)}</p>

              <div className="mt-6 rounded-[12px] border border-hairline bg-canvas-soft p-4 text-left">
                <div className="flex justify-between gap-4 py-2">
                  <span className="t-xs text-ink-faint">Vehicle</span>
                  <span className="mono text-[13px] font-medium">{success.plateNumber}</span>
                </div>
                <div className="flex justify-between gap-4 border-t border-hairline py-2">
                  <span className="t-xs text-ink-faint">Reference</span>
                  <span className="mono text-[12.5px] font-medium">{success.referenceNumber}</span>
                </div>
                <div className="flex justify-between gap-4 border-t border-hairline py-2">
                  <span className="t-xs text-ink-faint">Date</span>
                  <span className="text-[13px]">{success.date}</span>
                </div>
                <div className="flex justify-between gap-4 border-t border-hairline py-2">
                  <span className="t-xs text-ink-faint">Time</span>
                  <span className="mono text-[13px]">{success.time}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-2.5">
              <button onClick={closeSuccess} className="btn btn-secondary flex-1">
                Add another
              </button>
              <button onClick={closeSuccess} className="btn btn-primary flex-1">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
