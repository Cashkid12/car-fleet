import { useState, useEffect } from 'react'
import api from '../services/api'
import { useToast } from '../components/Toast'
import LoadingSpinner from '../components/LoadingSpinner'
import {
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlinePhone,
  HiOutlineUsers,
  HiOutlineTruck
} from 'react-icons/hi2'

export default function Cars() {
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCar, setEditingCar] = useState(null)
  const [form, setForm] = useState({ plateNumber: '', passengerCapacity: '', driverName: '', driverPhone: '' })
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const { addToast } = useToast()

  const fetchCars = async () => {
    try {
      const res = await api.get('/cars')
      setCars(res.data)
    } catch {
      addToast('Failed to load cars', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCars() }, [])

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
        addToast('Car added!', 'success')
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

  const formInputClass = 'w-full bg-bg-deepest text-text-primary rounded-xl px-4 h-12 border border-border-subtle focus:border-teal-500 focus:outline-none text-base transition-colors duration-150'
  const labelClass = 'text-xs text-text-muted uppercase tracking-wider font-medium mb-1.5 block'

  if (loading) return <LoadingSpinner className="min-h-screen" />

  return (
    <div className="px-4 py-6 lg:px-8 page-enter max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">My Cars</h1>
          <p className="text-text-secondary text-sm mt-0.5">{cars.length} car{cars.length !== 1 ? 's' : ''} in your fleet</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-xl h-11 px-4 text-sm flex items-center gap-1.5 transition-colors duration-150 shadow-lg shadow-teal-500/15"
        >
          <HiOutlinePlus size={18} />
          Add Car
        </button>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center" onClick={resetForm}>
          <div className="bg-bg-card rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/40" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-text-primary mb-5">{editingCar ? 'Edit Car' : 'Add New Car'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={labelClass}>Plate Number</label>
                <input
                  type="text"
                  value={form.plateNumber}
                  onChange={(e) => setForm(prev => ({ ...prev, plateNumber: e.target.value.toUpperCase() }))}
                  className={formInputClass}
                  placeholder="KDA 123T"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Passenger Capacity</label>
                <input
                  type="number"
                  value={form.passengerCapacity}
                  onChange={(e) => setForm(prev => ({ ...prev, passengerCapacity: e.target.value }))}
                  className={formInputClass}
                  placeholder="11"
                  required
                  min="1"
                />
              </div>
              <div>
                <label className={labelClass}>Driver Name</label>
                <input
                  type="text"
                  value={form.driverName}
                  onChange={(e) => setForm(prev => ({ ...prev, driverName: e.target.value }))}
                  className={formInputClass}
                  placeholder="Driver name"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Driver Phone</label>
                <input
                  type="tel"
                  value={form.driverPhone}
                  onChange={(e) => setForm(prev => ({ ...prev, driverPhone: e.target.value }))}
                  className={formInputClass}
                  placeholder="+254 712 345678"
                  required
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-border-subtle hover:bg-text-muted/40 text-text-primary rounded-xl h-12 font-medium text-sm transition-colors duration-150"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-teal-500 hover:bg-teal-600 text-white rounded-xl h-12 font-semibold text-sm transition-colors duration-150 disabled:opacity-50 shadow-lg shadow-teal-500/15"
                >
                  {saving ? 'Saving...' : editingCar ? 'Update Car' : 'Add Car'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-bg-card rounded-2xl w-full max-w-sm p-6 shadow-2xl shadow-black/40" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-text-primary mb-2">Delete Car?</h3>
            <p className="text-text-secondary text-sm mb-6">This will remove the car from your fleet. History will be preserved.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-border-subtle hover:bg-text-muted/40 text-text-primary rounded-xl h-12 font-medium text-sm transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 bg-danger hover:bg-red-600 text-white rounded-xl h-12 font-semibold text-sm transition-colors duration-150"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {cars.length === 0 ? (
        <div className="bg-bg-card rounded-2xl p-10 text-center shadow-lg shadow-black/20">
          <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-bg-card-hover flex items-center justify-center">
            <HiOutlineTruck size={36} className="text-text-muted opacity-40" />
          </div>
          <h3 className="text-text-primary font-semibold text-base mb-1.5">No cars yet</h3>
          <p className="text-text-secondary text-sm mb-6">Add your first car to get started.</p>
          <button
            onClick={() => { resetForm(); setShowForm(true) }}
            className="bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-xl h-12 px-6 text-sm transition-colors duration-150 shadow-lg shadow-teal-500/15"
          >
            Add Your First Car
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {cars.map(car => (
            <div key={car._id} className="bg-bg-card rounded-2xl p-5 shadow-lg shadow-black/20">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-mono font-bold text-text-primary tracking-wide">{car.plateNumber}</h3>
                <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full ${
                  car.status === 'healthy'
                    ? 'bg-healthy-bg text-success'
                    : 'bg-damaged-bg text-danger'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${car.status === 'healthy' ? 'bg-success' : 'bg-danger'}`} />
                  {car.status === 'healthy' ? 'Healthy' : 'Damaged'}
                </span>
              </div>

              <div className="space-y-1.5 mb-4">
                <p className="text-text-primary text-sm font-medium">{car.driverName}</p>
                <p className="text-text-secondary text-sm flex items-center gap-1.5">
                  <HiOutlinePhone size={14} className="text-text-muted" />
                  {car.driverPhone}
                </p>
                <p className="text-text-secondary text-sm flex items-center gap-1.5">
                  <HiOutlineUsers size={14} className="text-text-muted" />
                  {car.passengerCapacity} Passengers
                </p>
              </div>

              <div className="flex gap-2 pt-4 border-t border-border-subtle/40">
                <button
                  onClick={() => handleEdit(car)}
                  className="flex-1 bg-bg-card-hover hover:bg-border-subtle text-text-secondary hover:text-teal-400 rounded-xl h-10 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-150"
                >
                  <HiOutlinePencilSquare size={14} />
                  Edit
                </button>
                <button
                  onClick={() => setDeleteConfirm(car._id)}
                  className="flex-1 bg-bg-card-hover hover:bg-danger/10 text-text-secondary hover:text-danger rounded-xl h-10 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-150"
                >
                  <HiOutlineTrash size={14} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}