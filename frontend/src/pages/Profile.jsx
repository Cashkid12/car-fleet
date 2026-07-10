import { useState, useEffect } from 'react'
import { useUser, SignOutButton } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { formatCurrency } from '../utils/formatters'
import { useSettings } from '../context/SettingsContext'
import { useToast } from '../components/Toast'
import {
  HiOutlineCog,
  HiOutlineArrowRightOnRectangle,
  HiOutlineTruck,
  HiOutlineCurrencyDollar,
  HiOutlineArrowTrendingUp,
  HiOutlineCheckCircle,
  HiOutlineXMark,
  HiOutlineMoon,
  HiOutlineSun,
  HiOutlineComputerDesktop,
  HiOutlineBell,
  HiOutlineShieldCheck,
  HiOutlineArrowDownTray,
  HiOutlineTrash,
  HiOutlineQuestionMarkCircle,
  HiOutlineInformationCircle,
  HiOutlineBuildingOffice,
  HiOutlineGlobeAlt
} from 'react-icons/hi2'

export default function Profile() {
  const { user: clerkUser } = useUser()
  const navigate = useNavigate()
  const { settings, updateSettings } = useSettings()
  const { addToast } = useToast()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('profile')
  const [showDeleteData, setShowDeleteData] = useState(false)
  const [saving, setSaving] = useState(false)

  const [businessForm, setBusinessForm] = useState({
    businessName: '', businessAddress: '', businessPhone: '', businessEmail: ''
  })

  useEffect(() => { fetchProfile() }, [])

  useEffect(() => {
    if (profile?.settings) {
      setBusinessForm({
        businessName: profile.settings.businessName || '',
        businessAddress: profile.settings.businessAddress || '',
        businessPhone: profile.settings.businessPhone || '',
        businessEmail: profile.settings.businessEmail || ''
      })
    }
  }, [profile])

  const fetchProfile = async () => {
    try {
      const res = await api.get('/account/profile')
      setProfile(res.data)
    } catch {} finally { setLoading(false) }
  }

  const handleSaveBusiness = async () => {
    setSaving(true)
    try {
      await api.put('/account/business', businessForm)
      addToast('Business settings saved!', 'success')
      fetchProfile()
    } catch {
      addToast('Failed to save', 'error')
    } finally { setSaving(false) }
  }

  const handleExportData = async () => {
    try {
      const res = await api.get('/account/export', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `fleet-manager-backup-${new Date().toISOString().split('T')[0]}.json`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      addToast('Data exported!', 'success')
    } catch {
      addToast('Export failed', 'error')
    }
  }

  const handleDeleteData = async () => {
    try {
      await api.delete('/account/data')
      addToast('All data deleted', 'success')
      setShowDeleteData(false)
      navigate('/')
    } catch {
      addToast('Failed to delete data', 'error')
    }
  }

  const name = clerkUser?.fullName || 'User'
  const email = clerkUser?.primaryEmailAddress?.emailAddress || ''
  const phone = clerkUser?.primaryPhoneNumber?.phoneNumber || ''
  const initial = (name?.charAt(0) || '?').toUpperCase()
  const memberSince = clerkUser?.createdAt ? new Date(clerkUser.createdAt).toLocaleDateString('en-KE', { year: 'numeric', month: 'long' }) : ''

  if (loading) {
    return (
      <div className="px-5 py-8 max-w-lg mx-auto">
        <div className="skeleton h-48 rounded-2xl mb-6" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    )
  }

  const statCards = profile?.fleetStats ? [
    { label: 'Vehicles', value: profile.fleetStats.totalVehicles, icon: HiOutlineTruck, color: 'text-teal-500' },
    { label: 'Total Income', value: formatCurrency(profile.fleetStats.totalIncome), icon: HiOutlineCurrencyDollar, color: 'text-success' },
    { label: 'Net Profit', value: formatCurrency(profile.fleetStats.totalProfit), icon: HiOutlineArrowTrendingUp, color: profile.fleetStats.totalProfit >= 0 ? 'text-success' : 'text-danger' },
    { label: 'Healthy', value: `${profile.fleetStats.healthyVehicles}/${profile.fleetStats.totalVehicles}`, icon: HiOutlineCheckCircle, color: 'text-success' },
  ] : []

  const sections = [
    { key: 'profile', label: 'Profile', icon: HiOutlineCog },
    { key: 'business', label: 'Business', icon: HiOutlineBuildingOffice },
    { key: 'appearance', label: 'Appearance', icon: HiOutlineMoon },
    { key: 'notifications', label: 'Notifications', icon: HiOutlineBell },
    { key: 'data', label: 'Data', icon: HiOutlineArrowDownTray },
    { key: 'help', label: 'Help', icon: HiOutlineQuestionMarkCircle },
  ]

  return (
    <div className="page-enter max-w-lg mx-auto px-5 py-8">
      {/* Profile Header Card */}
      <div className="bg-gradient-to-br from-teal-500/20 to-teal-500/5 rounded-2xl p-5 border border-teal-500/20 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-teal-500/20 flex-shrink-0">
            {initial}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{name}</h2>
            <p className="text-[#94A3B8] text-[13px]">Fleet Owner</p>
            <p className="text-[#64748B] text-[11px] mt-0.5">Member since {memberSince}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/5">
          {statCards.map((stat, i) => (
            <div key={i} className="text-center">
              <stat.icon size={18} className={`${stat.color} mx-auto mb-1`} />
              <p className="text-[11px] text-[#64748B]">{stat.label}</p>
              <p className={`text-sm font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Section Navigation */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {sections.map(s => (
          <button
            key={s.key}
            onClick={() => setActiveSection(s.key)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[13px] font-semibold transition-all duration-200 ${
              activeSection === s.key ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20' : 'bg-[#1A2332] text-[#94A3B8] border border-white/5'
            }`}
          >
            <s.icon size={16} />
            {s.label}
          </button>
        ))}
      </div>

      {/* Section Content */}
      <div className="space-y-4">
        {activeSection === 'profile' && (
          <div className="bg-[#1A2332] rounded-2xl p-5 border border-white/5">
            <h3 className="text-[18px] font-semibold text-white mb-4">Personal Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-[#64748B] text-[13px]">Name</span>
                <span className="text-white text-[13px] font-medium">{name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-[#64748B] text-[13px]">Email</span>
                <span className="text-white text-[13px] font-medium truncate ml-4">{email}</span>
              </div>
              {phone && (
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-[#64748B] text-[13px]">Phone</span>
                  <span className="text-white text-[13px] font-medium">{phone}</span>
                </div>
              )}
              <button
                onClick={() => window.location.href = 'https://accounts.clerk.com/user'}
                className="w-full bg-teal-500 hover:bg-teal-600 text-white rounded-2xl h-[52px] font-semibold text-[14px] transition-all duration-200 mt-2 shadow-lg shadow-teal-500/15"
              >
                Manage Account
              </button>
            </div>
          </div>
        )}

        {activeSection === 'business' && (
          <div className="bg-[#1A2332] rounded-2xl p-5 border border-white/5">
            <h3 className="text-[18px] font-semibold text-white mb-4">Business Settings</h3>
            <div className="space-y-4">
              {[
                { label: 'Business Name', value: businessForm.businessName, field: 'businessName', placeholder: 'Your business name' },
                { label: 'Business Phone', value: businessForm.businessPhone, field: 'businessPhone', placeholder: '+254 712 345678' },
                { label: 'Business Email', value: businessForm.businessEmail, field: 'businessEmail', placeholder: 'business@email.com' },
                { label: 'Business Address', value: businessForm.businessAddress, field: 'businessAddress', placeholder: 'Your address' },
              ].map((input, i) => (
                <div key={i}>
                  <label className="text-[12px] text-[#64748B] uppercase tracking-widest font-semibold mb-2 block">{input.label}</label>
                  <input
                    type="text"
                    value={input.value}
                    onChange={(e) => setBusinessForm(prev => ({ ...prev, [input.field]: e.target.value }))}
                    className="w-full bg-[#0B1120] text-white rounded-2xl px-4 h-[56px] border border-white/5 focus:border-teal-500 focus:outline-none text-[15px] transition-all duration-200"
                    placeholder={input.placeholder}
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSaveBusiness}
                  disabled={saving}
                  className="flex-1 bg-teal-500 hover:bg-teal-600 text-white rounded-2xl h-[52px] font-semibold text-[14px] transition-all duration-200 disabled:opacity-40 shadow-lg shadow-teal-500/15"
                >
                  {saving ? 'Saving...' : 'Save Business Settings'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'appearance' && (
          <div className="bg-[#1A2332] rounded-2xl p-5 border border-white/5 space-y-6">
            <div>
              <h3 className="text-[18px] font-semibold text-white mb-1">Theme</h3>
              <p className="text-[#64748B] text-[13px] mb-3">Choose your preferred appearance</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'dark', label: 'Dark', icon: HiOutlineMoon },
                  { key: 'light', label: 'Light', icon: HiOutlineSun },
                  { key: 'system', label: 'System', icon: HiOutlineComputerDesktop },
                ].map(t => (
                  <button
                    key={t.key}
                    onClick={() => updateSettings({ theme: t.key })}
                    className={`flex flex-col items-center gap-2 py-4 rounded-2xl border transition-all duration-200 ${
                      settings.theme === t.key ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-white/5 bg-[#0B1120] text-[#94A3B8]'
                    }`}
                  >
                    <t.icon size={22} />
                    <span className="text-[12px] font-medium">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[18px] font-semibold text-white mb-1">Font Size</h3>
              <p className="text-[#64748B] text-[13px] mb-3">Adjust text size</p>
              <div className="grid grid-cols-3 gap-2">
                {['small', 'medium', 'large'].map(size => (
                  <button
                    key={size}
                    onClick={() => updateSettings({ fontSize: size })}
                    className={`py-3 rounded-2xl border transition-all duration-200 ${
                      settings.fontSize === size ? 'border-teal-500 bg-teal-500/10 text-teal-400 font-semibold' : 'border-white/5 bg-[#0B1120] text-[#94A3B8]'
                    }`}
                  >
                    <span className={`${size === 'small' ? 'text-[12px]' : size === 'large' ? 'text-[18px]' : 'text-[15px]'} font-medium capitalize`}>{size}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[18px] font-semibold text-white mb-1">Layout</h3>
              <p className="text-[#64748B] text-[13px] mb-3">Choose spacing density</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'comfortable', label: 'Comfortable', desc: 'More spacing' },
                  { key: 'compact', label: 'Compact', desc: 'Tighter spacing' },
                ].map(l => (
                  <button
                    key={l.key}
                    onClick={() => updateSettings({ layout: l.key })}
                    className={`py-3 px-4 rounded-2xl border text-left transition-all duration-200 ${
                      settings.layout === l.key ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-white/5 bg-[#0B1120] text-[#94A3B8]'
                    }`}
                  >
                    <span className="text-[14px] font-semibold block">{l.label}</span>
                    <span className="text-[11px]">{l.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[18px] font-semibold text-white mb-1">Currency</h3>
              <div className="grid grid-cols-4 gap-2 mt-3">
                {['KES', 'USD', 'EUR', 'GBP'].map(c => (
                  <button
                    key={c}
                    onClick={() => updateSettings({ currency: c })}
                    className={`py-3 rounded-2xl border text-[14px] font-semibold transition-all duration-200 ${
                      settings.currency === c ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-white/5 bg-[#0B1120] text-[#94A3B8]'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'notifications' && (
          <div className="bg-[#1A2332] rounded-2xl p-5 border border-white/5">
            <h3 className="text-[18px] font-semibold text-white mb-1">Notification Preferences</h3>
            <p className="text-[#64748B] text-[13px] mb-4">Choose which notifications you receive</p>
            <div className="space-y-3">
              {[
                { key: 'income', label: 'Income Notifications' },
                { key: 'expense', label: 'Expense Notifications' },
                { key: 'damage', label: 'Damage Notifications' },
                { key: 'vehicle', label: 'Vehicle Notifications' },
                { key: 'reports', label: 'Report Notifications' },
                { key: 'system', label: 'System Notifications' },
              ].map(n => (
                <div key={n.key} className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-white text-[14px]">{n.label}</span>
                  <button
                    onClick={() => {
                      const prefs = { ...settings.notificationPreferences, [n.key]: !settings.notificationPreferences[n.key] }
                      updateSettings({ notificationPreferences: prefs })
                    }}
                    className={`w-12 h-7 rounded-full transition-all duration-200 relative ${
                      settings.notificationPreferences[n.key] ? 'bg-teal-500' : 'bg-[#2A3441]'
                    }`}
                  >
                    <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white transition-all duration-200 shadow ${
                      settings.notificationPreferences[n.key] ? 'left-[22px]' : 'left-[2px]'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'data' && (
          <div className="space-y-3">
            <div className="bg-[#1A2332] rounded-2xl p-5 border border-white/5">
              <h3 className="text-[18px] font-semibold text-white mb-1">Data Management</h3>
              <p className="text-[#64748B] text-[13px] mb-4">Export or delete your fleet data</p>
              <div className="space-y-3">
                <button
                  onClick={handleExportData}
                  className="w-full bg-[#0B1120] border border-white/5 rounded-2xl p-4 flex items-center gap-3 text-left hover:border-teal-500/30 transition-all duration-200"
                >
                  <HiOutlineArrowDownTray size={22} className="text-teal-500" />
                  <div>
                    <p className="text-white text-[14px] font-medium">Export All Data</p>
                    <p className="text-[#64748B] text-[12px]">Download JSON backup</p>
                  </div>
                </button>
                <button
                  onClick={() => setShowDeleteData(true)}
                  className="w-full bg-[#0B1120] border border-white/5 rounded-2xl p-4 flex items-center gap-3 text-left hover:border-danger/30 transition-all duration-200"
                >
                  <HiOutlineTrash size={22} className="text-danger" />
                  <div>
                    <p className="text-white text-[14px] font-medium">Delete All Data</p>
                    <p className="text-[#64748B] text-[12px]">Remove all vehicles and records</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'help' && (
          <div className="bg-[#1A2332] rounded-2xl p-5 border border-white/5">
            <h3 className="text-[18px] font-semibold text-white mb-4">Help & About</h3>
            <div className="space-y-2">
              {[
                { label: 'About Fleet Manager', value: 'Version 2.0.0' },
                { label: 'Build', value: '2026.07' },
                { label: 'Made for', value: 'Fleet Owners in Kenya' },
                { label: 'Contact', value: 'support@fleetmanager.app' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-[#64748B] text-[13px]">{item.label}</span>
                  <span className="text-white text-[13px] font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sign Out */}
      <div className="mt-8">
        <SignOutButton>
          <button className="w-full bg-transparent border border-danger/20 rounded-2xl p-4 text-danger font-medium text-[15px] flex items-center justify-center gap-2 hover:bg-danger/5 transition-all duration-200">
            <HiOutlineArrowRightOnRectangle size={20} />
            Sign Out
          </button>
        </SignOutButton>
      </div>

      {/* Delete Data Modal */}
      {showDeleteData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={() => setShowDeleteData(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-[#1A2332] rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-white/5" onClick={e => e.stopPropagation()}>
            <div className="w-14 h-14 bg-danger/10 rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <HiOutlineTrash size={26} className="text-danger" />
            </div>
            <h3 className="text-[20px] font-semibold text-white text-center mb-2">Delete All Data?</h3>
            <p className="text-[#94A3B8] text-[14px] text-center mb-6">This will permanently delete all vehicles, income, expenses, and damage records. This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteData(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white rounded-2xl h-[52px] font-medium text-[15px] transition-all duration-200">Cancel</button>
              <button onClick={handleDeleteData} className="flex-1 bg-danger hover:bg-red-600 text-white rounded-2xl h-[52px] font-semibold text-[15px] transition-all duration-200">Delete All</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}