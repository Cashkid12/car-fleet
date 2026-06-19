import { useUser, SignOutButton } from '@clerk/clerk-react'
import {
  HiOutlineChevronRight,
  HiOutlineCog,
  HiOutlineArrowRightOnRectangle,
  HiOutlineShieldCheck,
  HiOutlineDevicePhoneMobile
} from 'react-icons/hi2'

export default function Profile() {
  const { user: clerkUser } = useUser()

  const name = clerkUser?.fullName || 'User'
  const email = clerkUser?.primaryEmailAddress?.emailAddress || ''
  const phone = clerkUser?.primaryPhoneNumber?.phoneNumber || ''
  const initial = (name?.charAt(0) || '?').toUpperCase()

  return (
    <div className="px-4 py-6 lg:px-8 page-enter max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Profile</h1>
        <p className="text-text-secondary text-sm mt-0.5">Manage your account</p>
      </div>

      {/* User Info Card */}
      <div className="bg-bg-card rounded-2xl p-5 mb-4 shadow-lg shadow-black/20">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-teal-500/20 flex-shrink-0">
            {initial}
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary">{name}</h2>
            <p className="text-text-secondary text-sm">Fleet Owner</p>
          </div>
        </div>
        <div className="space-y-3 pt-4 border-t border-border-subtle/40">
          {email && (
            <div className="flex justify-between items-center">
              <span className="text-text-muted text-sm">Email</span>
              <span className="text-text-primary text-sm truncate ml-4 max-w-[60%]">{email}</span>
            </div>
          )}
          {phone && (
            <div className="flex justify-between items-center">
              <span className="text-text-muted text-sm">Phone</span>
              <span className="text-text-primary text-sm">{phone}</span>
            </div>
          )}
          {!email && !phone && (
            <p className="text-text-muted text-sm text-center py-2">No contact info added</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={() => {
            if (clerkUser) {
              window.location.href = 'https://accounts.clerk.com/user'
            }
          }}
          className="w-full bg-bg-card rounded-2xl p-4 text-left flex items-center justify-between shadow-lg shadow-black/20 hover:bg-bg-card-hover transition-colors duration-150"
        >
          <div className="flex items-center gap-3">
            <HiOutlineCog size={22} className="text-text-muted" />
            <span className="text-text-primary text-sm font-medium">Manage Account</span>
          </div>
          <HiOutlineChevronRight size={18} className="text-text-muted" />
        </button>

        <div className="bg-bg-card rounded-2xl p-4 shadow-lg shadow-black/20">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <HiOutlineShieldCheck size={22} className="text-text-muted" />
              <span className="text-text-muted text-sm">App Version</span>
            </div>
            <span className="text-text-primary text-sm font-mono">1.0.0</span>
          </div>
        </div>
      </div>

      {/* Sign Out */}
      <div className="mt-8">
        <SignOutButton>
          <button className="w-full bg-transparent border border-danger/30 rounded-2xl p-4 text-danger font-medium text-sm flex items-center justify-center gap-2 hover:bg-danger/10 active:bg-danger/20 transition-all duration-150">
            <HiOutlineArrowRightOnRectangle size={20} />
            Sign Out
          </button>
        </SignOutButton>
      </div>

      <p className="text-center text-text-muted text-xs mt-6">
        Fleet Manager — Built for your business
      </p>
    </div>
  )
}