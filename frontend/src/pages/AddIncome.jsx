import { useState, useEffect } from 'react'
import api from '../services/api'
import { useToast } from '../components/Toast'
import { formatCurrency } from '../utils/formatters'
import { useOfflineStorage } from '../hooks/useOfflineStorage'
import {
  HiOutlineCalendarDays,
  HiOutlineBanknotes,
  HiOutlinePencilSquare,
  HiOutlineCheckCircle,
  HiOutlineXMark,
  HiOutlineCreditCard,
  HiOutlineDevicePhoneMobile,
  HiOutlineBuildingOffice,
  HiOutlineChevronDown
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

  return (
    <div className="page-enter mx-auto w-full max-w-2xl">
      <div className="mb-7">
        <h1 className="t-page">Record income</h1>
        <p className="t-sm mt-1 text-ink-soft">Record a driver's daily collection.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Vehicle & date */}
        <div className="card">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="t-label mb-1.5 block">Vehicle</label>
              <div className="select-wrap">
                <select
                  value={selectedCar}
                  onChange={(e) => setSelectedCar(e.target.value)}
                  className="field appearance-none pr-10"
                  required
                >
                  <option value="">Choose a vehicle</option>
                  {cars.map(car => (
                    <option key={car._id} value={car._id}>
                      {car.plateNumber} — {car.driverName}
                    </option>
                  ))}
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
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="field pl-11"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Amount */}
        <div className="card">
          <div className="mb-3 flex items-baseline justify-between">
            <label className="t-label">Amount</label>
            <span className="t-micro text-ink-faint">KES</span>
          </div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="field field-lg"
            placeholder="0"
            required
            min="1"
            inputMode="numeric"
            aria-label="Amount in KES"
          />
          <p className="t-xs mt-3 text-center text-ink-faint">
            Enter the total collected for this vehicle.
          </p>
        </div>

        {/* Payment method */}
        <div className="card">
          <label className="t-label mb-3 block">Payment method</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PAYMENT_METHODS.map(method => {
              const active = paymentMethod === method.value
              return (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => setPaymentMethod(method.value)}
                  aria-pressed={active}
                  className={`flex flex-col items-center gap-2 rounded-[12px] border px-2 py-3.5 transition-colors duration-150 ${
                    active
                      ? 'border-[var(--solid)] bg-solid text-solid-ink'
                      : 'border-hairline bg-field text-ink-soft hover:border-hairline-strong hover:text-ink'
                  }`}
                >
                  <method.icon size={19} />
                  <span className="text-[11.5px] font-medium">{method.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Note */}
        <div className="card">
          <label className="t-label mb-1.5 block">Note (optional)</label>
          <div className="relative">
            <HiOutlinePencilSquare
              size={17}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint"
            />
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="field pl-11"
              placeholder="e.g., Morning collection"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary btn-lg btn-block mt-2"
        >
          {loading ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Recording...
            </>
          ) : 'Record income'}
        </button>
      </form>

      {/* Success receipt */}
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={closeSuccess}>
          <div className="backdrop backdrop-enter" />
          <div
            className="modal sheet-enter"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Income recorded"
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
              <h2 className="t-section">Income recorded</h2>
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
