import { useState, useEffect } from 'react'
import api from '../services/api'
import { useToast } from '../components/Toast'
import { formatCurrency } from '../utils/formatters'
import {
  HiOutlineTruck,
  HiOutlineCalendarDays,
  HiOutlineCurrencyDollar,
  HiOutlineWrenchScrewdriver,
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
  { value: 'oil_service', label: 'Oil Service' },
  { value: 'tires', label: 'Tires' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'fine', label: 'Fine' },
  { value: 'parking', label: 'Parking' },
  { value: 'car_wash', label: 'Car Wash' },
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

  const labelClass = 'text-[12px] text-[#64748B] uppercase tracking-widest font-semibold mb-2 block'
  const inputClass = 'w-full bg-[#0B1120] text-white rounded-2xl px-4 h-[56px] border border-white/5 focus:border-teal-500 focus:outline-none text-[15px] transition-all duration-200'
  const displayedDamageTypes = showAllDamage ? DAMAGE_TYPES : DAMAGE_TYPES.slice(0, INITIAL_SHOWN)

  return (
    <div className="page-enter max-w-lg mx-auto px-5 py-8">
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-white tracking-tight">Vehicle Health</h1>
        <p className="text-[#94A3B8] text-[15px] mt-1">Manage damages and operating expenses</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#1A2332] rounded-2xl p-1.5 mb-6 border border-white/5">
        <button onClick={() => setActiveTab('damage')} className={`flex-1 py-3 rounded-xl text-[14px] font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === 'damage' ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/15' : 'text-[#64748B]'}`}>
          <HiOutlineExclamationTriangle size={18} />Damage
        </button>
        <button onClick={() => setActiveTab('expense')} className={`flex-1 py-3 rounded-xl text-[14px] font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === 'expense' ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/15' : 'text-[#64748B]'}`}>
          <HiOutlineReceiptPercent size={18} />Expense
        </button>
      </div>

      {/* Shared Fields */}
      <div className="mb-5">
        <label className={labelClass}>Select Vehicle</label>
        <div className="relative">
          <HiOutlineTruck size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
          <select value={activeTab === 'damage' ? damageForm.carId : expenseForm.carId} onChange={(e) => activeTab === 'damage' ? updateDamage('carId', e.target.value) : updateExpense('carId', e.target.value)} className="w-full bg-[#0B1120] text-white rounded-2xl pl-12 pr-4 h-[56px] border border-white/5 focus:border-teal-500 focus:outline-none text-[15px] appearance-none transition-all duration-200" required>
            <option value="" className="bg-[#0B1120]">Choose a vehicle...</option>
            {cars.map(car => <option key={car._id} value={car._id} className="bg-[#0B1120]">{car.plateNumber} — {car.driverName}</option>)}
          </select>
        </div>
      </div>

      <div className="mb-5">
        <label className={labelClass}>Date</label>
        <div className="relative">
          <HiOutlineCalendarDays size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
          <input type="date" value={activeTab === 'damage' ? damageForm.date : expenseForm.date} onChange={(e) => activeTab === 'damage' ? updateDamage('date', e.target.value) : updateExpense('date', e.target.value)} className="w-full bg-[#0B1120] text-white rounded-2xl pl-12 pr-4 h-[56px] border border-white/5 focus:border-teal-500 focus:outline-none text-[15px] transition-all duration-200" required />
        </div>
      </div>

      {activeTab === 'damage' ? (
        <form onSubmit={handleDamageSubmit} className="space-y-5">
          <div>
            <label className={labelClass}>Damage Type</label>
            <div className="grid grid-cols-2 gap-2.5">
              {displayedDamageTypes.map(type => (
                <button key={type} type="button" onClick={() => updateDamage('damageType', type)} className={`text-left px-3.5 py-3.5 rounded-2xl text-[13px] font-medium border transition-all duration-200 ${damageForm.damageType === type ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-white/5 bg-[#0B1120] text-[#94A3B8]'}`}>{type}</button>
              ))}
            </div>
            {DAMAGE_TYPES.length > INITIAL_SHOWN && (
              <button type="button" onClick={() => setShowAllDamage(!showAllDamage)} className="mt-3 text-teal-500 text-[13px] font-medium flex items-center gap-1">
                {showAllDamage ? <><HiOutlineChevronUp size={14} /> Show Less</> : <><HiOutlineChevronDown size={14} /> Show All ({DAMAGE_TYPES.length})</>}
              </button>
            )}
          </div>

          <div>
            <label className={labelClass}>Estimated Repair Cost (KES)</label>
            <div className="relative">
              <HiOutlineCurrencyDollar size={22} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
              <input type="number" value={damageForm.estimatedCost} onChange={(e) => updateDamage('estimatedCost', e.target.value)} className="w-full bg-[#0B1120] text-white rounded-2xl pl-14 pr-4 h-[72px] border border-white/5 focus:border-teal-500 focus:outline-none text-4xl font-mono font-bold text-center transition-all duration-200" placeholder="0" required min="0" />
            </div>
          </div>

          <div>
            <label className={labelClass}>Driver at Fault?</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => updateDamage('driverAtFault', false)} className={`flex-1 py-3 rounded-2xl text-[14px] font-semibold border transition-all duration-200 ${!damageForm.driverAtFault ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-white/5 bg-[#0B1120] text-[#64748B]'}`}>No</button>
              <button type="button" onClick={() => updateDamage('driverAtFault', true)} className={`flex-1 py-3 rounded-2xl text-[14px] font-semibold border transition-all duration-200 ${damageForm.driverAtFault ? 'border-danger bg-danger/10 text-danger' : 'border-white/5 bg-[#0B1120] text-[#64748B]'}`}>Yes</button>
            </div>
          </div>

          <div>
            <label className={labelClass}>Note (optional)</label>
            <textarea value={damageForm.note} onChange={(e) => updateDamage('note', e.target.value)} className="w-full bg-[#0B1120] text-white rounded-2xl px-4 py-3.5 border border-white/5 focus:border-teal-500 focus:outline-none text-[15px] resize-none transition-all duration-200" rows="2" placeholder="Additional details..." />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-2xl h-[56px] text-[15px] transition-all duration-200 disabled:opacity-40 shadow-lg shadow-teal-500/15 ripple btn-press mt-8">
            {loading ? 'Reporting...' : 'Report Damage'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleExpenseSubmit} className="space-y-5">
          <div>
            <label className={labelClass}>Expense Category</label>
            <div className="grid grid-cols-3 gap-2">
              {EXPENSE_TYPES.map(t => (
                <button key={t.value} type="button" onClick={() => updateExpense('type', t.value)} className={`py-3 px-2 rounded-2xl text-[12px] font-medium border transition-all duration-200 ${expenseForm.type === t.value ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-white/5 bg-[#0B1120] text-[#94A3B8]'}`}>{t.label}</button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <div className="relative">
              <HiOutlineDocumentText size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
              <input type="text" value={expenseForm.description} onChange={(e) => updateExpense('description', e.target.value)} className={inputClass + ' pl-12'} placeholder="e.g., Full tank refill" />
            </div>
          </div>

          <div>
            <label className={labelClass}>Cost (KES)</label>
            <div className="relative">
              <HiOutlineCurrencyDollar size={22} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
              <input type="number" value={expenseForm.cost} onChange={(e) => updateExpense('cost', e.target.value)} className="w-full bg-[#0B1120] text-white rounded-2xl pl-14 pr-4 h-[72px] border border-white/5 focus:border-teal-500 focus:outline-none text-4xl font-mono font-bold text-center transition-all duration-200" placeholder="0" required min="0" />
            </div>
          </div>

          <div>
            <label className={labelClass}>Note (optional)</label>
            <textarea value={expenseForm.note} onChange={(e) => updateExpense('note', e.target.value)} className="w-full bg-[#0B1120] text-white rounded-2xl px-4 py-3.5 border border-white/5 focus:border-teal-500 focus:outline-none text-[15px] resize-none transition-all duration-200" rows="2" placeholder="Additional details..." />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-2xl h-[56px] text-[15px] transition-all duration-200 disabled:opacity-40 shadow-lg shadow-teal-500/15 ripple btn-press mt-8">
            {loading ? 'Saving...' : 'Record Expense'}
          </button>
        </form>
      )}

      {/* Success Modal */}
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={closeSuccess}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-[#1A2332] rounded-2xl w-full max-w-sm p-8 shadow-2xl border border-white/5 text-center" onClick={(e) => e.stopPropagation()}>
            <button onClick={closeSuccess} className="absolute top-4 right-4 text-[#64748B] hover:text-white transition-colors duration-150"><HiOutlineXMark size={20} /></button>
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <HiOutlineCheckCircle size={44} className="text-success" />
            </div>
            <h2 className="text-[22px] font-bold text-white mb-1">{success.type === 'damage' ? 'Damage Reported!' : 'Expense Added!'}</h2>
            <p className="text-3xl font-mono font-bold text-success mb-6">{formatCurrency(success.amount)}</p>
            <div className="bg-[#0B1120] rounded-2xl p-4 space-y-3 mb-6 text-left">
              <div className="flex justify-between"><span className="text-[#64748B] text-[13px]">Vehicle</span><span className="text-white text-[13px] font-medium">{success.plateNumber}</span></div>
              <div className="flex justify-between"><span className="text-[#64748B] text-[13px]">Reference</span><span className="text-teal-400 text-[13px] font-mono font-medium">{success.referenceNumber}</span></div>
              <div className="flex justify-between"><span className="text-[#64748B] text-[13px]">Date</span><span className="text-white text-[13px]">{success.date}</span></div>
              <div className="flex justify-between"><span className="text-[#64748B] text-[13px]">Time</span><span className="text-white text-[13px]">{success.time}</span></div>
            </div>
            <div className="flex gap-3">
              <button onClick={closeSuccess} className="flex-1 bg-white/5 hover:bg-white/10 text-white rounded-2xl h-[52px] font-medium text-[14px] transition-all duration-200">Add Another</button>
              <button onClick={closeSuccess} className="flex-1 bg-teal-500 hover:bg-teal-600 text-white rounded-2xl h-[52px] font-semibold text-[14px] transition-all duration-200 shadow-lg shadow-teal-500/15">Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}