import { createContext, useContext, useState, useCallback } from 'react'
import { HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineInformationCircle } from 'react-icons/hi2'

const ToastContext = createContext(null)

const iconMap = {
  success: HiOutlineCheckCircle,
  error: HiOutlineXCircle,
  info: HiOutlineInformationCircle
}

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
      <div className="pointer-events-none fixed right-3 top-3 z-[100] flex w-full max-w-[340px] flex-col gap-2 sm:right-5 sm:top-5">
        {toasts.map(toast => {
          const Icon = iconMap[toast.type] || iconMap.info
          return (
            <div
              key={toast.id}
              role="status"
              className="toast-enter pointer-events-auto flex items-center gap-2.5 rounded-[12px] border border-hairline border-l-2 border-l-ink bg-panel px-3.5 py-3 text-[13px] font-medium text-ink shadow-[0_16px_40px_-20px_rgba(0,0,0,0.6)]"
            >
              <Icon
                size={18}
                className={toast.type === 'error' ? 'text-ink' : 'text-ink-soft'}
              />
              <span className="min-w-0">{toast.message}</span>
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
