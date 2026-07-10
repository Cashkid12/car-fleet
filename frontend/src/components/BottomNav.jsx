import { NavLink, useLocation } from 'react-router-dom'
import {
  HiOutlineHome,
  HiOutlineCurrencyDollar,
  HiOutlineExclamationTriangle,
  HiOutlineTruck,
  HiOutlineUser,
  HiOutlineChartBar
} from 'react-icons/hi2'

const navItems = [
  { path: '/', label: 'Home', Icon: HiOutlineHome },
  { path: '/add-income', label: 'Income', Icon: HiOutlineCurrencyDollar },
  { path: '/add-damage', label: 'Damage', Icon: HiOutlineExclamationTriangle },
  { path: '/cars', label: 'Cars', Icon: HiOutlineTruck },
  { path: '/reports', label: 'Reports', Icon: HiOutlineChartBar },
  { path: '/profile', label: 'Profile', Icon: HiOutlineUser },
]

export default function BottomNav() {
  const location = useLocation()

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="bg-[#111827] rounded-[24px] flex justify-around items-center h-[72px] border border-white/5 shadow-2xl shadow-black/40 max-w-[480px] mx-auto">
        {navItems.map(({ path, label, Icon }) => {
          const isActive = location.pathname === path
          return (
            <NavLink
              key={path}
              to={path}
              className="flex flex-col items-center justify-center flex-1 h-full relative transition-all duration-200"
            >
              {isActive && (
                <div className="absolute top-2 w-8 h-1 bg-teal-500 rounded-full nav-active-indicator" />
              )}
              <Icon
                size={20}
                strokeWidth={isActive ? 2.5 : 2}
                className={`transition-all duration-300 ${isActive ? 'text-teal-500 scale-110' : 'text-[#64748B]'}`}
              />
              <span className={`text-[10px] mt-1 font-semibold tracking-wide transition-all duration-300 ${isActive ? 'text-teal-500' : 'text-[#64748B]'}`}>
                {label}
              </span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}