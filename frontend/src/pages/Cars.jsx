import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useToast } from '../components/Toast'
import { formatCurrency } from '../utils/formatters'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import {
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlinePhone,
  HiOutlineUsers,
  HiOutlineTruck,
  HiOutlineMagnifyingGlass,
  HiOutlineXMark,
  HiOutlineChevronRight
} from 'react-icons/hi2'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'healthy', label: 'Healthy' },
  { key: 'damaged', label: 'Damaged' },
  { key: 'profit_high', label: 'Highest Profit' },
  { key: 'profit_low', label: 'Lowest Profit' },
]

export default function Cars() {
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCar, setEditingCar] = useState(null)
  const [form, setForm] = useState({ plateNumber: '', passengerCapacity: '', driverName: '', driverPhone: '' })
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const { addToast } = useToast()
  const navigate = useNavigate()

  const fetchCars = async () => {
    try {
      const params = {}
      if (search) params.search = search
      if (activeFilter === 'healthy') params.status = 'healthy'
      if (activeFilter === 'damaged') params.status = 'damaged'
      if (activeFilter === 'profit_high') params.sort = 'profit_high'
      if (activeFilter === 'profit_low') params.sort = 'profit_low'

      const res = await api.get('/cars', { params })
      setCars(res.data)
    } catch {
      addToast('Failed to load cars', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCars() }, [search, activeFilter])

  const resetForm = () => {
    setForm({ plateNumber: '', passengerCapacity: '', driverName: '', driverPhone: '' })
    setEditingCar(null)
    setShowForm(false)
  }

  const handleEdit = (car) => {
    setEditingCar(car)
    setForm({
      plateNumber: car.plateNumber,
      passengerCapacity: car.passengerCapacity,
      driverName: car.driverName,
      driverPhone: car.driverPhone
    })
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingCar) {
        await api.put(`/cars/${editingCar._id}`, form)
        addToast('Car updated!', 'success')
      } else {
        await api.post('/cars', form)
        addToast('Car added successfully!', 'success')
      }
      resetForm()
      fetchCars()
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (carId) => {
    try {
      await api.delete(`/cars/${carId}`)
      addToast('Car deleted', 'success')
      setDeleteConfirm(null)
      fetchCars()
    } catch {
      addToast('Failed to delete', 'error')
    }
  }

  const formInputClass = 'w-full bg-[#0B1120] text-white rounded-2xl pl-12 pr-4 h-[56px] border border-white/5 focus:border-teal-500 focus:outline-none text-[15px] transition-all duration-200'
  const labelClass = 'text-[12px] text-[#64748B] uppercase tracking-widest font-semibold mb-2 block'

  const totalCars = cars.length
  const healthyCars = cars.filter(c => c.status === 'healthy').length
  const damagedCars = cars.filter(c => c.status === 'damaged').length
  const totalProfit = cars.reduce((s, c) => s + (c.profitThisMonth || 0), 0)

  if (loading) {
    return (
      <div className="py-8">
        <div className="skeleton h-10 w-32 rounded-2xl mb-2" />
        <div className="skeleton h-5 w-56 rounded-xl mb-6" />
        <div className="skeleton h-12 w-full rounded-2xl mb-6" />
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-[88px] rounded-2xl" />)}
        </div>
        {[1, 2, 3].map(i => <div key={i} className="skeleton h-48 rounded-2xl mb-3" />)}
      </div>
    )
  }

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div>
          <h1 className="text-[28px] font-bold text-white tracking-tight">My Fleet</h1>
          <p className="text-[#94A3B8] text-[15px] mt-1">Manage all your vehicles in one place.</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="bg-gradient-to-br from-teal-500 to-teal-600 text-white font-semibold rounded-2xl h-[48px] px-5 text-[14px] flex items-center gap-2 shadow-lg shadow-teal-500/20 ripple btn-press flex-shrink-0"
        >
          <HiOutlinePlus size={18} strokeWidth={2.5} />
          Add Car
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4 mt-6">
        <HiOutlineMagnifyingGlass size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by plate number or driver name..."
          className="w-full bg-[#1A2332] text-white rounded-2xl pl-12 pr-12 h-[56px] border border-white/5 focus:border-teal-500 focus:outline-none text-[15px] placeholder-[#64748B] transition-all duration-200"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white transition-colors duration-150">
            <HiOutlineXMark size={18} />
          </button>
        )}
      </div>

      {/* Filter Pills */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {FILTERS.map(filter => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            className={`flex-shrink-0 px-4 py-2.5 rounded-full text-[13px] font-semibold transition-all duration-200 ${
              activeFilter === filter.key ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20' : 'bg-[#1A2332] text-[#94A3B8] border border-white/5'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Fleet Summary */}
      {cars.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-[#1A2332] rounded-2xl p-4 border border-white/5 text-center">
            <p className="text-[11px] text-[#64748B] uppercase tracking-widest font-semibold mb-1">Total Cars</p>
            <p className="text-white text-xl font-bold">{totalCars}</p>
          </div>
          <div className="bg-[#1A2332] rounded-2xl p-4 border border-white/5 text-center">
            <p className="text-[11px] text-[#64748B] uppercase tracking-widest font-semibold mb-1">Fleet Profit</p>
            <p className={`text-xl font-bold font-mono ${totalProfit >= 0 ? 'text-success' : 'text-danger'}`}>{formatCurrency(totalProfit)}</p>
          </div>
          <div className="bg-[#1A2332] rounded-2xl p-4 border border-white/5 text-center">
            <p className="text-[11px] text-[#64748B] uppercase tracking-widest font-semibold mb-1">Healthy</p>
            <p className="text-success text-xl font-bold">{healthyCars}</p>
          </div>
          <div className="bg-[#1A2332] rounded-2xl p-4 border border-white/5 text-center">
            <p className="text-[11px] text-[#64748B] uppercase tracking-widest font-semibold mb-1">Damaged</p>
            <p className={`text-xl font-bold ${damagedCars > 0 ? 'text-danger' : 'text-[#64748B]'}`}>{damagedCars}</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {cars.length === 0 ? (
        <EmptyState
          icon={<HiOutlineTruck size={40} className="text-[#64748B] opacity-20" />}
          title="No Vehicles Yet"
          description="Start building your fleet by adding your first vehicle."
          actionLabel="Add Your First Car"
          onAction={() => { resetForm(); setShowForm(true) }}
        />
      ) : (
        <div className="space-y-3">
          {cars.map((car, index) => (
            <div
              key={car._id}
              className="bg-[#1A2332] rounded-2xl p-5 border border-white/5 shadow-lg shadow-black/10 card-lift list-item-enter"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${car.status === 'healthy' ? 'bg-success/10' : 'bg-danger/10'}`}>
                  <HiOutlineTruck size={24} className={car.status === 'healthy' ? 'text-success' : 'text-danger'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-[18px] font-mono font-bold text-white tracking-wide">{car.plateNumber}</h3>
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full flex-shrink-0 ${car.status === 'healthy' ? 'bg-[#065F46] text-success' : 'bg-[#7F1D1D] text-danger'}`}>
                      <span className={`w-2 h-2 rounded-full ${car.status === 'damaged' ? 'animate-pulse' : ''} ${car.status === 'healthy' ? 'bg-success' : 'bg-danger'}`} />
                      {car.status === 'healthy' ? 'Healthy' : 'Damaged'}
                    </span>
                  </div>
                  <p className="text-[#94A3B8] text-[13px]">{car.driverName}</p>
                  <div className="flex items-center gap-x-3 gap-y-1 text-[#64748B] text-[12px] mt-1 flex-wrap">
                    <span className="flex items-center gap-1"><HiOutlinePhone size={12} />{car.driverPhone}</span>
                    <span className="flex items-center gap-1"><HiOutlineUsers size={12} />{car.passengerCapacity} pass.</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between py-4 border-y border-white/5 mb-4">
                <div className="text-center flex-1">
                  <p className="text-[#64748B] text-[10px] uppercase tracking-widest mb-1">Income</p>
                  <p className="text-white font-semibold text-[14px] tabular-nums">{formatCurrency(car.incomeThisMonth || 0)}</p>
                </div>
                <div className="text-center flex-1 border-l border-white/5">
                  <p className="text-[#64748B] text-[10px] uppercase tracking-widest mb-1">Expenses</p>
                  <p className="text-white font-semibold text-[14px] tabular-nums">{formatCurrency(car.expensesThisMonth || 0)}</p>
                </div>
                <div className="text-center flex-1 border-l border-white/5">
                  <p className="text-[#64748B] text-[10px] uppercase tracking-widest mb-1">Profit</p>
                  <p className={`font-semibold text-[14px] tabular-nums ${(car.profitThisMonth || 0) >= 0 ? 'text-success' : 'text-danger'}`}>{formatCurrency(car.profitThisMonth || 0)}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => navigate(`/cars/${car._id}`)} className="flex-1 bg-teal-500/10 text-teal-500 rounded-2xl h-[44px] text-[13px] font-semibold flex items-center justify-center gap-1.5 hover:bg-teal-500/20 transition-all duration-200">
                  View Details <HiOutlineChevronRight size={14} />
                </button>
                <button onClick={() => handleEdit(car)} className="flex-1 bg-white/5 text-[#94A3B8] rounded-2xl h-[44px] text-[13px] font-semibold flex items-center justify-center gap-1.5 hover:bg-white/10 hover:text-white transition-all duration-200">
                  <HiOutlinePencilSquare size={15} /> Edit
                </button>
                <button onClick={() => setDeleteConfirm(car)} className="flex-1 bg-white/5 text-[#94A3B8] rounded-2xl h-[44px] text-[13px] font-semibold flex items-center justify-center gap-1.5 hover:bg-red-500/10 hover:text-danger transition-all duration-200">
                  <HiOutlineTrash size={15} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => { resetForm(); setShowForm(true) }}
        className="fixed bottom-28 right-5 z-40 w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center shadow-2xl shadow-teal-500/30 fab-glow ripple btn-press lg:hidden"
      >
        <HiOutlinePlus size={26} strokeWidth={2.5} className="text-white" />
      </button>

      {/* Bottom Sheet Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={resetForm}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm backdrop-enter" />
          <div
            className="relative bg-[#1A2332] rounded-t-[24px] w-full max-w-[480px] p-6 max-h-[80vh] overflow-y-auto sheet-enter border border-white/5"
            onClick={(e) => e.stopPropagation()}
            style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}
          >
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-6" />

            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[20px] font-semibold text-white">{editingCar ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
              <button type="button" onClick={resetForm} className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-white/10 transition-all duration-200">
                <HiOutlineXMark size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className={labelClass}>Plate Number</label>
                <div className="relative">
                  <HiOutlineTruck size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
                  <input type="text" value={form.plateNumber} onChange={(e) => setForm(prev => ({ ...prev, plateNumber: e.target.value.toUpperCase() }))} className={formInputClass} placeholder="KDA 123T" required autoFocus />
                </div>
              </div>
              <div>
                <label className={labelClass}>Passenger Capacity</label>
                <div className="relative">
                  <HiOutlineUsers size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
                  <input type="number" value={form.passengerCapacity} onChange={(e) => setForm(prev => ({ ...prev, passengerCapacity: e.target.value }))} className={formInputClass} placeholder="11" required min="1" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Driver Name</label>
                <div className="relative">
                  <HiOutlinePencilSquare size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
                  <input type="text" value={form.driverName} onChange={(e) => setForm(prev => ({ ...prev, driverName: e.target.value }))} className={formInputClass} placeholder="Driver name" required />
                </div>
              </div>
              <div>
                <label className={labelClass}>Driver Phone</label>
                <div className="relative">
                  <HiOutlinePhone size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
                  <input type="tel" value={form.driverPhone} onChange={(e) => setForm(prev => ({ ...prev, driverPhone: e.target.value }))} className={formInputClass} placeholder="+254 712 345678" required />
                </div>
              </div>

              <div className="flex gap-3 pt-2 pb-4">
                <button type="button" onClick={resetForm} className="flex-1 bg-white/5 hover:bg-white/10 text-white rounded-2xl h-[56px] font-medium text-[15px] transition-all duration-200">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-2xl h-[56px] font-semibold text-[15px] transition-all duration-200 disabled:opacity-40 shadow-lg shadow-teal-500/20 ripple btn-press">
                  {saving ? 'Saving...' : editingCar ? 'Update Vehicle' : 'Add Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={() => setDeleteConfirm(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm backdrop-enter" />
          <div className="relative bg-[#1A2332] rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-white/5 sheet-enter" onClick={(e) => e.stopPropagation()}>
            <div className="w-14 h-14 bg-danger/10 rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <HiOutlineTrash size={26} className="text-danger" />
            </div>
            <h3 className="text-[20px] font-semibold text-white text-center mb-2">Delete Vehicle?</h3>
            <p className="text-[#94A3B8] text-[14px] text-center mb-6">Are you sure you want to delete <strong className="text-white">{deleteConfirm.plateNumber}</strong>?<br />This cannot be undone. History will be preserved.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 bg-white/5 hover:bg-white/10 text-white rounded-2xl h-[52px] font-medium text-[15px] transition-all duration-200">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm._id)} className="flex-1 bg-danger hover:bg-red-600 text-white rounded-2xl h-[52px] font-semibold text-[15px] transition-all duration-200 shadow-lg shadow-red-500/15">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}