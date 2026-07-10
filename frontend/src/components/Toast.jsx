import { createContext, useContext, useState, useCallback } from 'react'
import { HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineExclamationTriangle } from 'react-icons/hi2'

const ToastContext = createContext(null)

const iconMap = { success: HiOutlineCheckCircle, error: HiOutlineXCircle, info: HiOutlineExclamationTriangle }
const borderMap = { success: 'border-l-teal-500', error: 'border-l-danger', info: 'border-l-warning' }
const iconColorMap = { success: 'text-teal-500', error: 'text-danger', info: 'text-warning' }

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none max-w-[calc(100vw-2rem)]">
        {toasts.map(toast => {
          const Icon = iconMap[toast.type] || iconMap.info
          return (
            <div key={toast.id} className={`toast-enter px-4 py-3.5 rounded-2xl shadow-2xl text-white text-[14px] font-medium pointer-events-auto flex items-center gap-2.5 bg-[#1A2332] border-l-4 ${borderMap[toast.type] || borderMap.info} border border-white/5`}>
              <Icon size={20} className={iconColorMap[toast.type] || iconColorMap.info} />
              {toast.message}
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}

export default function Toast() { return null }