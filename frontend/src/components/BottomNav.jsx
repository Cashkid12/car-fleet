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
    <nav
      className="fixed inset-x-3 bottom-3 z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex h-[62px] max-w-[440px] items-stretch gap-0.5 rounded-[20px] border border-hairline bg-panel/95 px-1.5 shadow-[var(--nav-shadow)] backdrop-blur-xl">
        {navItems.map(({ path, label, Icon }) => {
          const isActive = location.pathname === path
          return (
            <NavLink
              key={path}
              to={path}
              className="flex flex-1 flex-col items-center justify-center gap-1"
              aria-label={label}
            >
              <span
                className={`grid h-7 w-9 place-items-center rounded-[8px] transition-colors duration-200 ${
                  isActive ? 'bg-solid text-solid-ink' : 'text-ink-faint'
                }`}
              >
                <Icon size={17} strokeWidth={isActive ? 2.2 : 1.9} />
              </span>
              <span
                className={`text-[9.5px] leading-none tracking-wide transition-colors duration-200 ${
                  isActive ? 'font-semibold text-ink' : 'text-ink-faint'
                }`}
              >
                {label}
              </span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
