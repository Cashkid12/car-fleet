import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useToast } from '../components/Toast'
import { formatCurrency } from '../utils/formatters'
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
  HiOutlineEllipsisHorizontal,
  HiOutlineArrowUpRight,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle
} from 'react-icons/hi2'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'healthy', label: 'Healthy' },
  { key: 'damaged', label: 'Damaged' },
  { key: 'profit_high', label: 'Highest profit' },
  { key: 'profit_low', label: 'Lowest profit' },
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
  const [menuOpen, setMenuOpen] = useState(null)
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

  const totalCars = cars.length
  const healthyCars = cars.filter(c => c.status === 'healthy').length
  const damagedCars = cars.filter(c => c.status === 'damaged').length
  const totalProfit = cars.reduce((s, c) => s + (c.profitThisMonth || 0), 0)

  if (loading) {
    return (
      <div className="py-2">
        <div className="skeleton mb-2 h-9 w-40" />
        <div className="skeleton mb-6 h-4 w-64" />
        <div className="skeleton mb-4 h-12 w-full" />
        <div className="mb-6 flex gap-2">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-9 w-24 rounded-full" />)}
        </div>
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-24" />)}
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-56" />)}
        </div>
      </div>
    )
  }

  const summary = [
    { label: 'Total vehicles', value: String(totalCars) },
    { label: 'Fleet profit', value: formatCurrency(totalProfit) },
    { label: 'Healthy', value: String(healthyCars) },
    { label: 'Damaged', value: String(damagedCars) },
  ]

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="t-page">My Fleet</h1>
          <p className="t-sm mt-1 text-ink-soft">Manage all your vehicles in one place.</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="btn btn-primary hidden sm:inline-flex"
        >
          <HiOutlinePlus size={17} strokeWidth={2} />
          Add vehicle
        </button>
      </div>

      {/* Search */}
      <div className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <HiOutlineMagnifyingGlass
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search plate number or driver"
            className="field pl-11 pr-11"
            aria-label="Search vehicles"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-[8px] text-ink-faint transition-colors hover:bg-ghost hover:text-ink"
            >
              <HiOutlineXMark size={17} />
            </button>
          )}
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="btn btn-primary sm:hidden"
          aria-label="Add vehicle"
        >
          <HiOutlinePlus size={18} strokeWidth={2} />
        </button>
      </div>

      {/* Filters */}
      <div className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {FILTERS.map(filter => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            className={`pill ${activeFilter === filter.key ? 'pill-active' : ''}`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Summary strip */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {summary.map((item) => (
          <div key={item.label} className="card p-4">
            <p className="t-label">{item.label}</p>
            <p className={`mt-2 ${item.label === 'Fleet profit' ? 'figure text-[18px]' : 'figure text-[21px]'}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {cars.length === 0 ? (
        <div className="card p-0">
          <EmptyState
            icon={<HiOutlineTruck size={26} />}
            title="No vehicles yet"
            description="Start building your fleet by adding your first vehicle."
            actionLabel="Add your first car"
            onAction={() => { resetForm(); setShowForm(true) }}
          />
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 md:gap-4">
          {cars.map((car, index) => {
            const healthy = car.status === 'healthy'
            return (
              <div
                key={car._id}
                className="card list-item-enter p-4 sm:p-5"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <div className="flex items-start gap-3">
                  <span className="tile tile-lg">
                    <HiOutlineTruck size={21} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="plate">{car.plateNumber}</h3>
                      <span className={`badge ${healthy ? 'badge-subtle' : 'badge-outline'}`}>
                        {healthy
                          ? <HiOutlineCheckCircle size={12} />
                          : <HiOutlineExclamationTriangle size={12} />}
                        {healthy ? 'Healthy' : 'Damaged'}
                      </span>
                    </div>
                    <p className="t-sm mt-1.5 truncate font-medium text-ink">{car.driverName}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-ink-faint">
                      <span className="t-xs inline-flex items-center gap-1">
                        <HiOutlinePhone size={12} />{car.driverPhone}
                      </span>
                      <span className="t-xs inline-flex items-center gap-1">
                        <HiOutlineUsers size={12} />{car.passengerCapacity} passengers
                      </span>
                    </div>
                  </div>

                  {/* Contextual actions */}
                  <div className="relative flex-shrink-0">
                    <button
                      onClick={() => setMenuOpen(menuOpen === car._id ? null : car._id)}
                      className="btn btn-ghost btn-icon"
                      aria-label={`Actions for ${car.plateNumber}`}
                      aria-expanded={menuOpen === car._id}
                    >
                      <HiOutlineEllipsisHorizontal size={19} />
                    </button>

                    {menuOpen === car._id && (
                      <>
                        <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(null)} />
                        <div className="absolute right-0 top-11 z-30 w-44 overflow-hidden rounded-[12px] border border-hairline bg-panel py-1 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.55)]">
                          <button
                            onClick={() => { setMenuOpen(null); handleEdit(car) }}
                            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13px] text-ink-soft transition-colors hover:bg-ghost hover:text-ink"
                          >
                            <HiOutlinePencilSquare size={16} />
                            Edit vehicle
                          </button>
                          <button
                            onClick={() => { setMenuOpen(null); setDeleteConfirm(car) }}
                            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13px] text-ink transition-colors hover:bg-ghost"
                          >
                            <HiOutlineTrash size={16} />
                            Delete vehicle
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Financial strip */}
                <div className="mt-4 grid grid-cols-3 gap-2 border-y border-hairline py-3">
                  <div>
                    <p className="t-label text-[9.5px]">Income</p>
                    <p className="figure-sm mt-1">{formatCurrency(car.incomeThisMonth || 0)}</p>
                  </div>
                  <div className="border-l border-hairline pl-3">
                    <p className="t-label text-[9.5px]">Expenses</p>
                    <p className="figure-sm mt-1">{formatCurrency(car.expensesThisMonth || 0)}</p>
                  </div>
                  <div className="border-l border-hairline pl-3">
                    <p className="t-label text-[9.5px]">Profit</p>
                    <p className={`figure-sm mt-1 ${(car.profitThisMonth || 0) < 0 ? 'text-ink-soft' : 'text-ink'}`}>
                      {formatCurrency(car.profitThisMonth || 0)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/cars/${car._id}`)}
                  className="btn btn-secondary btn-sm mt-3 w-full"
                >
                  View details
                  <HiOutlineArrowUpRight size={15} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* FAB (mobile) */}
      <button
        onClick={() => { resetForm(); setShowForm(true) }}
        className="fixed bottom-[88px] right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-hairline-strong bg-solid text-solid-ink shadow-[0_12px_30px_-12px_rgba(0,0,0,0.55)] transition-transform active:scale-95 md:hidden"
        aria-label="Add vehicle"
      >
        <HiOutlinePlus size={24} strokeWidth={2} />
      </button>

      {/* Add / edit sheet */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6"
          onClick={resetForm}
        >
          <div className="backdrop backdrop-enter" />
          <div
            className="sheet sheet-enter p-5 sm:p-6"
            onClick={(e) => e.stopPropagation()}
            style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}
            role="dialog"
            aria-modal="true"
            aria-label={editingCar ? 'Edit vehicle' : 'Add vehicle'}
          >
            <div className="grabber mb-5 md:hidden" />

            <div className="mb-6 flex items-start justify-between gap-3">
              <div>
                <h3 className="t-section">{editingCar ? 'Edit vehicle' : 'Add vehicle'}</h3>
                <p className="t-xs mt-1 text-ink-faint">
                  {editingCar ? 'Update the vehicle and driver details.' : 'Register a new vehicle and its driver.'}
                </p>
              </div>
              <button
                type="button"
                onClick={resetForm}
                className="btn btn-ghost btn-icon"
                aria-label="Close"
              >
                <HiOutlineXMark size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="t-label mb-1.5 block">Plate number</label>
                  <input
                    type="text"
                    value={form.plateNumber}
                    onChange={(e) => setForm(prev => ({ ...prev, plateNumber: e.target.value.toUpperCase() }))}
                    className="field mono"
                    placeholder="KDA 123T"
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="t-label mb-1.5 block">Passenger capacity</label>
                  <input
                    type="number"
                    value={form.passengerCapacity}
                    onChange={(e) => setForm(prev => ({ ...prev, passengerCapacity: e.target.value }))}
                    className="field mono"
                    placeholder="11"
                    required
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="t-label mb-1.5 block">Driver name</label>
                <input
                  type="text"
                  value={form.driverName}
                  onChange={(e) => setForm(prev => ({ ...prev, driverName: e.target.value }))}
                  className="field"
                  placeholder="Full name"
                  required
                />
              </div>

              <div>
                <label className="t-label mb-1.5 block">Driver phone</label>
                <input
                  type="tel"
                  value={form.driverPhone}
                  onChange={(e) => setForm(prev => ({ ...prev, driverPhone: e.target.value }))}
                  className="field mono"
                  placeholder="+254 712 345678"
                  required
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary flex-1"
                >
                  {saving ? 'Saving...' : editingCar ? 'Save changes' : 'Add vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          onClick={() => setDeleteConfirm(null)}
        >
          <div className="backdrop backdrop-enter" />
          <div
            className="modal sheet-enter"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Delete vehicle"
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-hairline bg-panel-soft">
              <HiOutlineTrash size={22} className="text-ink" />
            </div>
            <h3 className="t-section text-center">Delete vehicle?</h3>
            <p className="t-sm mt-2 text-center text-ink-soft">
              <strong className="mono font-semibold text-ink">{deleteConfirm.plateNumber}</strong> will be
              removed from your fleet. This cannot be undone. History will be preserved.
            </p>
            <div className="mt-6 flex gap-2.5">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm._id)}
                className="btn btn-primary flex-1"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
