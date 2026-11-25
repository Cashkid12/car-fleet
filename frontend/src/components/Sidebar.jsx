import { NavLink } from 'react-router-dom'
import { UserButton } from '@clerk/clerk-react'
import BrandMark from './BrandMark'
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
  { path: '/add-damage', label: 'Vehicle Health', Icon: HiOutlineExclamationTriangle },
  { path: '/cars', label: 'My Fleet', Icon: HiOutlineTruck },
  { path: '/reports', label: 'Reports', Icon: HiOutlineChartBar },
  { path: '/profile', label: 'Profile', Icon: HiOutlineUser },
]

const linkBase =
  'flex h-10 items-center gap-3 rounded-[10px] px-3 text-[13.5px] font-medium transition-colors duration-150'
const linkIdle = 'text-ink-soft hover:bg-ghost hover:text-ink'
const linkActive = 'bg-solid text-solid-ink'

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[236px] flex-col border-r border-hairline bg-canvas-soft md:flex">
      {/* Brand */}
      <div className="flex h-16 items-center gap-2.5 px-5">
        <BrandMark size={32} iconSize={17} radius={9} />
        <div className="leading-tight">
          <p className="text-[14.5px] font-semibold tracking-tight">Fleet Manager</p>
          <p className="text-[10px] uppercase tracking-[0.14em] text-ink-faint">Operations</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4">
        <p className="t-label mb-2 px-3">Workspace</p>
        <div className="space-y-0.5">
          {navItems.map(({ path, label, Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkIdle}`
              }
            >
              <Icon size={19} strokeWidth={1.8} />
              {label}
            </NavLink>
          ))}
        </div>

        <p className="t-label mb-2 mt-7 px-3">Activity</p>
        <NavLink
          to="/notifications"
          className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}
        >
          <HiOutlineBell size={19} strokeWidth={1.8} />
          Notifications
        </NavLink>
      </nav>

      {/* Account */}
      <div className="border-t border-hairline p-3">
        <div className="flex items-center gap-3 rounded-[10px] px-2 py-2">
          <UserButton />
          <div className="min-w-0 leading-tight">
            <p className="text-[13px] font-medium">Account</p>
            <p className="text-[11px] text-ink-faint">Signed in</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
