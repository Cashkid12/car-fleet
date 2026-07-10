import { useState, useEffect } from 'react'
import api from '../services/api'
import { useToast } from '../components/Toast'
import { formatCurrency } from '../utils/formatters'
import { useOfflineStorage } from '../hooks/useOfflineStorage'
import {
  HiOutlineTruck,
  HiOutlineCalendarDays,
  HiOutlineBanknotes,
  HiOutlinePencilSquare,
  HiOutlineCheckCircle,
  HiOutlineXMark,
  HiOutlineCreditCard,
  HiOutlineDevicePhoneMobile,
  HiOutlineBuildingOffice
} from 'react-icons/hi2'

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash', icon: HiOutlineBanknotes },
  { value: 'mpesa', label: 'M-Pesa', icon: HiOutlineDevicePhoneMobile },
  { value: 'bank', label: 'Bank', icon: HiOutlineBuildingOffice },
  { value: 'other', label: 'Other', icon: HiOutlineCreditCard },
]

export default function AddIncome() {
  const [cars, setCars] = useState([])
  const [selectedCar, setSelectedCar] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const { addToast } = useToast()
  const { saveOffline, queueForSync } = useOfflineStorage()

  useEffect(() => {
    api.get('/cars').then(res => setCars(res.data)).catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedCar) { addToast('Select a car first', 'error'); return }
    if (!amount || Number(amount) <= 0) { addToast('Enter a valid amount', 'error'); return }
    setLoading(true)
    try {
      const res = await api.post(`/cars/${selectedCar}/income`, {
        date,
        amount: Number(amount),
        paymentMethod,
        note
      })
      setSuccess({
        amount: Number(amount),
        plateNumber: res.data.car.plateNumber,
        referenceNumber: res.data.entry.referenceNumber,
        date: new Date().toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' }),
        time: new Date().toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })
      })
      setAmount('')
      setNote('')
      setPaymentMethod('cash')
      setDate(new Date().toISOString().split('T')[0])
    } catch (err) {
      if (err.offline || !navigator.onLine) {
        const offlineEntry = {
          _id: `offline_${Date.now()}`,
          carId: selectedCar,
          date, amount: Number(amount), paymentMethod, note,
          referenceNumber: `INC-OFFLINE-${Date.now()}`,
          recordedAt: new Date().toISOString()
        }
        await saveOffline('income', offlineEntry)
        await queueForSync('create_income', selectedCar, {
          date, amount: Number(amount), paymentMethod, note,
          referenceNumber: offlineEntry.referenceNumber,
          recordedAt: offlineEntry.recordedAt
        })
        addToast('Saved offline — will sync when connected', 'info')
        setAmount('')
        setNote('')
        setPaymentMethod('cash')
        setDate(new Date().toISOString().split('T')[0])
      } else {
        addToast(err.response?.data?.message || 'Failed to save', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  const closeSuccess = () => setSuccess(null)

  const inputClass = 'w-full bg-[#0B1120] text-white rounded-2xl pl-12 pr-4 h-[56px] border border-white/5 focus:border-teal-500 focus:outline-none text-[15px] transition-all duration-200'
  const labelClass = 'text-[12px] text-[#64748B] uppercase tracking-widest font-semibold mb-2 block'

  return (
    <div className="page-enter max-w-lg mx-auto px-5 py-8">
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-white tracking-tight">Record Income</h1>
        <p className="text-[#94A3B8] text-[15px] mt-1">Record daily driver collection</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className={labelClass}>Select Vehicle</label>
          <div className="relative">
            <HiOutlineTruck size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
            <select value={selectedCar} onChange={(e) => setSelectedCar(e.target.value)} className={`${inputClass} appearance-none`} required>
              <option value="" className="bg-[#0B1120]">Choose a vehicle...</option>
              {cars.map(car => (
                <option key={car._id} value={car._id} className="bg-[#0B1120]">{car.plateNumber} — {car.driverName}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Date</label>
          <div className="relative">
            <HiOutlineCalendarDays size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} required />
          </div>
        </div>

        <div>
          <label className={labelClass}>Amount (KES)</label>
          <div className="relative">
            <HiOutlineBanknotes size={22} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-[#0B1120] text-white rounded-2xl pl-14 pr-4 h-[72px] border border-white/5 focus:border-teal-500 focus:outline-none text-4xl font-mono font-bold text-center transition-all duration-200"
              placeholder="0"
              required
              min="1"
              inputMode="numeric"
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Payment Method</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PAYMENT_METHODS.map(method => (
              <button
                key={method.value}
                type="button"
                onClick={() => setPaymentMethod(method.value)}
                className={`flex flex-col items-center gap-1.5 py-3.5 px-2 rounded-2xl border transition-all duration-200 ${
                  paymentMethod === method.value
                    ? 'border-teal-500 bg-teal-500/10 text-teal-400'
                    : 'border-white/5 bg-[#0B1120] text-[#94A3B8]'
                }`}
              >
                <method.icon size={20} />
                <span className="text-[11px] font-medium">{method.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClass}>Note (optional)</label>
          <div className="relative">
            <HiOutlinePencilSquare size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)} className={inputClass} placeholder="e.g., Morning collection" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-2xl h-[56px] text-[15px] transition-all duration-200 disabled:opacity-40 shadow-lg shadow-teal-500/15 ripple btn-press mt-10"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              Recording...
            </span>
          ) : 'Record Income'}
        </button>
      </form>

      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={closeSuccess}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-[#1A2332] rounded-2xl w-full max-w-sm p-8 shadow-2xl border border-white/5 text-center" onClick={(e) => e.stopPropagation()}>
            <button onClick={closeSuccess} className="absolute top-4 right-4 text-[#64748B] hover:text-white transition-colors duration-150">
              <HiOutlineXMark size={20} />
            </button>
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <HiOutlineCheckCircle size={44} className="text-success" />
            </div>
            <h2 className="text-[22px] font-bold text-white mb-1">Income Recorded!</h2>
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