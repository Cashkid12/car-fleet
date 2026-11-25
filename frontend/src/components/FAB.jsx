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
      className="fixed bottom-[88px] right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-hairline-strong bg-solid text-solid-ink shadow-[0_12px_30px_-12px_rgba(0,0,0,0.55)] transition-transform duration-150 active:scale-95"
      aria-label={action.label}
    >
      <HiOutlinePlus size={24} strokeWidth={2} />
    </button>
  )
}
