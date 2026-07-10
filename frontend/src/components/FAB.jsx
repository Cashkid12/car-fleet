import { useLocation, useNavigate } from 'react-router-dom'
import { HiOutlinePlus } from 'react-icons/hi2'

export default function FAB() {
  const location = useLocation()
  const navigate = useNavigate()

  // Hide FAB on certain pages
  const hideOn = ['/add-income', '/add-damage', '/cars', '/profile']
  if (hideOn.includes(location.pathname)) return null

  const getAction = () => {
    if (location.pathname === '/') return { path: '/add-income', label: 'Add Income' }
    return { path: '/add-income', label: 'Quick Add' }
  }

  const action = getAction()

  return (
    <button
      onClick={() => navigate(action.path)}
      className="fixed bottom-28 right-5 z-40 w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center shadow-2xl shadow-teal-500/30 fab-glow ripple btn-press lg:hidden"
      aria-label={action.label}
    >
      <HiOutlinePlus size={26} strokeWidth={2.5} className="text-white" />
    </button>
  )
}