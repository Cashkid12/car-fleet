import { useState, useEffect } from 'react'
import api from '../services/api'
import { useToast } from '../components/Toast'
import {
  HiOutlineTruck,
  HiOutlineCalendarDays,
  HiOutlineBanknotes,
  HiOutlinePencilSquare
} from 'react-icons/hi2'

export default function AddIncome() {
  const [cars, setCars] = useState([])
  const [selectedCar, setSelectedCar] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const { addToast } = useToast()

  useEffect(() => {
    api.get('/cars').then(res => setCars(res.data)).catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedCar) { addToast('Select a car first', 'error'); return }
    if (!amount || Number(amount) <= 0) { addToast('Enter a valid amount', 'error'); return }
    setLoading(true)
    try {
      await api.post(`/cars/${selectedCar}/income`, {
        date,
        amount: Number(amount),
        note
      })
      addToast('Income recorded!', 'success')
      setAmount('')
      setNote('')
      setDate(new Date().toISOString().split('T')[0])
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save', 'error')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full bg-[#1A2332] text-white rounded-xl pl-11 pr-4 h-12 border border-[#2A3441] focus:border-teal-500 focus:outline-none text-[15px] transition-colors duration-150'
  const labelClass = 'text-[11px] text-text-muted uppercase tracking-wider font-semibold mb-2 block'

  return (
    <div className="px-4 py-5 page-enter pb-24 max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-white">Add Income</h1>
        <p className="text-text-secondary text-[13px] mt-0.5">Record daily driver collection</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Car Select */}
        <div>
          <label className={labelClass}>Select Car</label>
          <div className="relative">
            <HiOutlineTruck size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            <select
              value={selectedCar}
              onChange={(e) => setSelectedCar(e.target.value)}
              className={`${inputClass} appearance-none`}
              required
            >
              <option value="" className="bg-[#1A2332]">Choose a car...</option>
              {cars.map(car => (
                <option key={car._id} value={car._id} className="bg-[#1A2332]">
                  {car.plateNumber} — {car.driverName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date */}
        <div>
          <label className={labelClass}>Date</label>
          <div className="relative">
            <HiOutlineCalendarDays size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputClass}
              required
            />
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className={labelClass}>Amount (KES)</label>
          <div className="relative">
            <HiOutlineBanknotes size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-[#1A2332] text-white rounded-xl pl-11 pr-4 h-14 border border-[#2A3441] focus:border-teal-500 focus:outline-none text-2xl font-mono font-bold text-center transition-colors duration-150"
              placeholder="0"
              required
              min="0"
            />
          </div>
        </div>

        {/* Note */}
        <div>
          <label className={labelClass}>Note (optional)</label>
          <div className="relative">
            <HiOutlinePencilSquare size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={inputClass}
              placeholder="e.g., Morning collection"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal-500 hover:bg-teal-600 active:bg-teal-700 text-white font-semibold rounded-xl h-14 text-[15px] transition-colors duration-150 disabled:opacity-50 mt-8 shadow-lg shadow-teal-500/10"
        >
          {loading ? 'Saving...' : 'Save Income'}
        </button>
      </form>
    </div>
  )
}