import { NavLink, useLocation } from 'react-router-dom'
import { HiOutlineHome, HiOutlineCurrencyDollar, HiOutlineExclamationTriangle, HiOutlineTruck, HiOutlineUser } from 'react-icons/hi2'

const navItems = [
  { path: '/', label: 'Home', Icon: HiOutlineHome },
  { path: '/add-income', label: 'Income', Icon: HiOutlineCurrencyDollar },
  { path: '/add-damage', label: 'Damage', Icon: HiOutlineExclamationTriangle },
  { path: '/cars', label: 'Cars', Icon: HiOutlineTruck },
  { path: '/profile', label: 'Profile', Icon: HiOutlineUser },
]

export default function BottomNav() {
  const location = useLocation()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-bg-card border-t border-border-subtle z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map(({ path, label, Icon }) => {
          const isActive = location.pathname === path
          return (
            <NavLink
              key={path}
              to={path}
              className={`flex flex-col items-center justify-center flex-1 h-full min-h-[48px] transition-colors duration-150 ${
                isActive ? 'text-teal-500' : 'text-text-muted'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] mt-1 font-medium tracking-wide ${isActive ? 'text-teal-500' : 'text-text-muted'}`}>
                {label}
              </span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}