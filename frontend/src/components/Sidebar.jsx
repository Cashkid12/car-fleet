import { NavLink, useLocation } from 'react-router-dom'
import { UserButton } from '@clerk/clerk-react'
import {
  HiOutlineHome,
  HiOutlineCurrencyDollar,
  HiOutlineExclamationTriangle,
  HiOutlineTruck,
  HiOutlineUser,
  HiOutlineBell,
  HiOutlineChartBar
} from 'react-icons/hi2'

const navItems = [
  { path: '/', label: 'Dashboard', Icon: HiOutlineHome },
  { path: '/add-income', label: 'Add Income', Icon: HiOutlineCurrencyDollar },
  { path: '/add-damage', label: 'Add Damage', Icon: HiOutlineExclamationTriangle },
  { path: '/cars', label: 'My Cars', Icon: HiOutlineTruck },
  { path: '/reports', label: 'Reports', Icon: HiOutlineChartBar },
  { path: '/profile', label: 'Profile', Icon: HiOutlineUser },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-[#111827] border-r border-white/5">
      {/* Brand */}
      <div className="flex items-center px-5 h-16 border-b border-white/5 gap-2.5">
        <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-[10px] flex items-center justify-center shadow-lg shadow-teal-500/20 flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
            <path d="M13 5l3 5m0 0h2.5a1.5 1.5 0 011.423 1.026L21 14H3l1.077-2.974A1.5 1.5 0 015.5 10H8m5 0H8m5 0v5H8V10" />
          </svg>
        </div>
        <span className="text-white font-semibold text-[17px] tracking-tight">Fleet Manager</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {navItems.map(({ path, label, Icon }) => {
          const isActive = location.pathname === path
          return (
            <NavLink
              key={path}
              to={path}
              className={`flex items-center gap-3 px-3 h-11 rounded-xl text-[14px] font-medium transition-all duration-200 ${
                isActive ? 'bg-teal-500/10 text-teal-500' : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={20} />
              {label}
            </NavLink>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-5 py-4 border-t border-white/5 space-y-3">
        <button className="w-full flex items-center gap-3 px-2 py-2 rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/5 transition-all duration-200 text-[14px]">
          <HiOutlineBell size={20} />
          Notifications
        </button>
        <div className="flex items-center gap-3 px-2 py-1">
          <UserButton afterSignOutUrl="/" />
          <span className="text-[#94A3B8] text-[14px]">Account</span>
        </div>
      </div>
    </aside>
  )
}