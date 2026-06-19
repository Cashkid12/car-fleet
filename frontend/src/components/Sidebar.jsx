import { NavLink, useLocation } from 'react-router-dom'
import { UserButton } from '@clerk/clerk-react'
import {
  HiOutlineHome,
  HiOutlineCurrencyDollar,
  HiOutlineExclamationTriangle,
  HiOutlineTruck,
  HiOutlineUser
} from 'react-icons/hi2'

const navItems = [
  { path: '/', label: 'Dashboard', Icon: HiOutlineHome },
  { path: '/add-income', label: 'Add Income', Icon: HiOutlineCurrencyDollar },
  { path: '/add-damage', label: 'Add Damage', Icon: HiOutlineExclamationTriangle },
  { path: '/cars', label: 'My Cars', Icon: HiOutlineTruck },
  { path: '/profile', label: 'Profile', Icon: HiOutlineUser },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-bg-card border-r border-border-subtle">
      {/* Brand */}
      <div className="flex items-center px-5 h-14 border-b border-border-subtle gap-2.5">
        <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center shadow-md shadow-teal-500/20 flex-shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
            <path d="M13 5l3 5m0 0h2.5a1.5 1.5 0 011.423 1.026L21 14H3l1.077-2.974A1.5 1.5 0 015.5 10H8m5 0H8m5 0v5H8V10" />
          </svg>
        </div>
        <span className="text-text-primary font-semibold text-lg tracking-tight">Fleet Manager</span>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map(({ path, label, Icon }) => {
          const isActive = location.pathname === path
          return (
            <NavLink
              key={path}
              to={path}
              className={`flex items-center gap-3 px-3 h-11 rounded-xl text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? 'bg-teal-500/10 text-teal-500'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-card-hover'
              }`}
            >
              <Icon size={20} />
              {label}
            </NavLink>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="px-5 py-3 border-t border-border-subtle flex items-center gap-3">
        <UserButton afterSignOutUrl="/" />
        <span className="text-text-secondary text-sm">Account</span>
      </div>
    </aside>
  )
}