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
    if (!selectedCar) { addToast('Please select a car', 'error'); return }
    if (!amount || Number(amount) <= 0) { addToast('Please enter a valid amount', 'error'); return }
    setLoading(true)
    try {
      await api.post(`/cars/${selectedCar}/income`, {
        date,
        amount: Number(amount),
        note
      })
      addToast('Income recorded successfully!', 'success')
      setAmount('')
      setNote('')
      setDate(new Date().toISOString().split('T')[0])
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save', 'error')
    } finally {
      setLoading(false)
    }
  }

  const labelClass = 'text-xs text-text-muted uppercase tracking-wider font-medium mb-2 block'
  const fieldGroup = 'mb-5'

  return (
    <div className="px-4 py-6 lg:px-8 page-enter max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Add Income</h1>
        <p className="text-text-secondary text-sm mt-0.5">Record daily collection from a driver</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={fieldGroup}>
          <label className={labelClass}>Select Car</label>
          <div className="relative">
            <HiOutlineTruck size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            <select
              value={selectedCar}
              onChange={(e) => setSelectedCar(e.target.value)}
              className="w-full bg-bg-card text-text-primary rounded-xl pl-11 pr-4 h-12 border border-border-subtle focus:border-teal-500 focus:outline-none text-base appearance-none transition-colors duration-150"
              required
            >
              <option value="" className="bg-bg-card">Choose a car...</option>
              {cars.map(car => (
                <option key={car._id} value={car._id} className="bg-bg-card">
                  {car.plateNumber} — {car.driverName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={fieldGroup}>
          <label className={labelClass}>Date</label>
          <div className="relative">
            <HiOutlineCalendarDays size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-bg-card text-text-primary rounded-xl pl-11 pr-4 h-12 border border-border-subtle focus:border-teal-500 focus:outline-none text-base transition-colors duration-150"
              required
            />
          </div>
        </div>

        <div className={fieldGroup}>
          <label className={labelClass}>Amount Received (KES)</label>
          <div className="relative">
            <HiOutlineBanknotes size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-bg-card text-text-primary rounded-xl pl-11 pr-4 h-14 border border-border-subtle focus:border-teal-500 focus:outline-none text-2xl font-mono font-bold text-center transition-colors duration-150"
              placeholder="0"
              required
              min="0"
            />
          </div>
        </div>

        <div className={fieldGroup}>
          <label className={labelClass}>Note (optional)</label>
          <div className="relative">
            <HiOutlinePencilSquare size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-bg-card text-text-primary rounded-xl pl-11 pr-4 h-12 border border-border-subtle focus:border-teal-500 focus:outline-none text-base transition-colors duration-150"
              placeholder="e.g., Morning collection"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal-500 hover:bg-teal-600 active:bg-teal-700 text-white font-semibold rounded-xl h-14 text-base transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/15 mt-8"
        >
          {loading ? 'Saving...' : 'Save Income'}
        </button>
      </form>
    </div>
  )
}