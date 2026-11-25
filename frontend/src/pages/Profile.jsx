import { useState, useEffect } from 'react'
import { useUser, SignOutButton } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { formatCurrency } from '../utils/formatters'
import { useSettings } from '../context/SettingsContext'
import { useToast } from '../components/Toast'
import {
  HiOutlineUserCircle,
  HiOutlineArrowRightOnRectangle,
  HiOutlineMoon,
  HiOutlineSun,
  HiOutlineComputerDesktop,
  HiOutlineBell,
  HiOutlineArrowDownTray,
  HiOutlineTrash,
  HiOutlineQuestionMarkCircle,
  HiOutlineBuildingOffice,
  HiOutlineChevronRight
} from 'react-icons/hi2'

const optionBase = 'rounded-[12px] border px-3 py-3 text-center transition-colors duration-150'
const optionIdle = 'border-hairline bg-field text-ink-soft hover:border-hairline-strong hover:text-ink'
const optionActive = 'border-[var(--solid)] bg-[var(--solid)] text-[var(--solid-ink)]'

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

  useEffect(() => { fetchProfile() }, [])

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
      <div>
        <div className="skeleton mb-2 h-9 w-40" />
        <div className="skeleton mb-6 h-4 w-56" />
        <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
          <div className="skeleton h-[280px]" />
          <div className="skeleton h-[420px]" />
        </div>
      </div>
    )
  }

  const statCards = profile?.fleetStats ? [
    { label: 'Vehicles', value: String(profile.fleetStats.totalVehicles) },
    { label: 'Total income', value: formatCurrency(profile.fleetStats.totalIncome) },
    { label: 'Net profit', value: formatCurrency(profile.fleetStats.totalProfit) },
    { label: 'Healthy', value: `${profile.fleetStats.healthyVehicles}/${profile.fleetStats.totalVehicles}` },
  ] : []

  const sections = [
    { key: 'profile', label: 'Profile', icon: HiOutlineUserCircle },
    { key: 'business', label: 'Business', icon: HiOutlineBuildingOffice },
    { key: 'appearance', label: 'Appearance', icon: HiOutlineMoon },
    { key: 'notifications', label: 'Notifications', icon: HiOutlineBell },
    { key: 'data', label: 'Data', icon: HiOutlineArrowDownTray },
    { key: 'help', label: 'Help', icon: HiOutlineQuestionMarkCircle },
  ]

  const panelTitle = {
    profile: 'Personal information',
    business: 'Business settings',
    appearance: 'Appearance',
    notifications: 'Notification preferences',
    data: 'Data management',
    help: 'Help & about',
  }

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="mb-6">
        <h1 className="t-page">Profile</h1>
        <p className="t-sm mt-1 text-ink-soft">Manage your account, preferences and data.</p>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[300px_1fr] lg:gap-6">
        {/* Identity */}
        <aside className="card p-5 lg:sticky lg:top-8">
          <div className="flex items-center gap-3.5">
            <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-solid text-[20px] font-semibold text-solid-ink">
              {initial}
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-[15px] font-semibold">{name}</h2>
              <p className="t-xs mt-0.5 text-ink-soft">Fleet owner</p>
              {memberSince && <p className="t-micro mt-0.5 text-ink-faint">Member since {memberSince}</p>}
            </div>
          </div>

          {statCards.length > 0 && (
            <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-hairline pt-4">
              {statCards.map((stat) => (
                <div key={stat.label} className="min-w-0">
                  <p className="t-label text-[9.5px]">{stat.label}</p>
                  <p className="figure-sm mt-1 truncate text-[13px]">{stat.value}</p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 space-y-2.5 border-t border-hairline pt-4">
            <div className="flex items-baseline justify-between gap-3">
              <span className="t-micro flex-shrink-0 text-ink-faint">Email</span>
              <span className="t-xs truncate font-medium">{email}</span>
            </div>
            {phone && (
              <div className="flex items-baseline justify-between gap-3">
                <span className="t-micro flex-shrink-0 text-ink-faint">Phone</span>
                <span className="mono text-[12px] font-medium">{phone}</span>
              </div>
            )}
          </div>
        </aside>

        {/* Settings */}
        <section className="min-w-0">
          <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            {sections.map(s => (
              <button
                key={s.key}
                onClick={() => setActiveSection(s.key)}
                className={`pill flex-shrink-0 ${activeSection === s.key ? 'pill-active' : ''}`}
              >
                <s.icon size={14} />
                {s.label}
              </button>
            ))}
          </div>

          <div className="card p-5 sm:p-6">
            <h2 className="t-cardtitle mb-5">{panelTitle[activeSection]}</h2>

            {activeSection === 'profile' && (
              <div>
                <dl className="divide-y divide-hairline border-y border-hairline">
                  <div className="flex items-center justify-between gap-4 py-3">
                    <dt className="t-sm text-ink-soft">Name</dt>
                    <dd className="t-sm truncate font-medium">{name}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 py-3">
                    <dt className="t-sm flex-shrink-0 text-ink-soft">Email</dt>
                    <dd className="t-sm truncate font-medium">{email}</dd>
                  </div>
                  {phone && (
                    <div className="flex items-center justify-between gap-4 py-3">
                      <dt className="t-sm text-ink-soft">Phone</dt>
                      <dd className="mono t-sm font-medium">{phone}</dd>
                    </div>
                  )}
                </dl>
                <button
                  onClick={() => window.location.href = 'https://accounts.clerk.com/user'}
                  className="btn btn-primary btn-block mt-5"
                >
                  Manage account
                </button>
              </div>
            )}

            {activeSection === 'business' && (
              <form
                onSubmit={(e) => { e.preventDefault(); handleSaveBusiness() }}
                className="space-y-4"
              >
                {[
                  { label: 'Business name', value: businessForm.businessName, field: 'businessName', placeholder: 'Your business name' },
                  { label: 'Business phone', value: businessForm.businessPhone, field: 'businessPhone', placeholder: '+254 712 345678' },
                  { label: 'Business email', value: businessForm.businessEmail, field: 'businessEmail', placeholder: 'business@email.com' },
                  { label: 'Business address', value: businessForm.businessAddress, field: 'businessAddress', placeholder: 'Your address' },
                ].map((input) => (
                  <div key={input.field}>
                    <label className="t-label mb-1.5 block">{input.label}</label>
                    <input
                      type="text"
                      value={input.value}
                      onChange={(e) => setBusinessForm(prev => ({ ...prev, [input.field]: e.target.value }))}
                      className="field"
                      placeholder={input.placeholder}
                    />
                  </div>
                ))}
                <button type="submit" disabled={saving} className="btn btn-primary btn-block mt-2">
                  {saving ? 'Saving...' : 'Save business settings'}
                </button>
              </form>
            )}

            {activeSection === 'appearance' && (
              <div className="space-y-7">
                <div>
                  <h3 className="t-sm font-semibold">Theme</h3>
                  <p className="t-xs mb-3 mt-0.5 text-ink-faint">Choose your preferred appearance</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'dark', label: 'Dark', icon: HiOutlineMoon },
                      { key: 'light', label: 'Light', icon: HiOutlineSun },
                      { key: 'system', label: 'System', icon: HiOutlineComputerDesktop },
                    ].map(t => (
                      <button
                        key={t.key}
                        onClick={() => updateSettings({ theme: t.key })}
                        aria-pressed={settings.theme === t.key}
                        className={`${optionBase} flex flex-col items-center gap-2 py-4 ${settings.theme === t.key ? optionActive : optionIdle}`}
                      >
                        <t.icon size={20} />
                        <span className="text-[12px] font-medium">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="t-sm font-semibold">Font size</h3>
                  <p className="t-xs mb-3 mt-0.5 text-ink-faint">Adjust text size across the app</p>
                  <div className="seg">
                    {['small', 'medium', 'large'].map(size => (
                      <button
                        key={size}
                        onClick={() => updateSettings({ fontSize: size })}
                        aria-pressed={settings.fontSize === size}
                        className={`seg-item capitalize ${settings.fontSize === size ? 'seg-item-active' : ''}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="t-sm font-semibold">Layout</h3>
                  <p className="t-xs mb-3 mt-0.5 text-ink-faint">Choose spacing density</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'comfortable', label: 'Comfortable', desc: 'More spacing' },
                      { key: 'compact', label: 'Compact', desc: 'Tighter spacing' },
                    ].map(l => (
                      <button
                        key={l.key}
                        onClick={() => updateSettings({ layout: l.key })}
                        aria-pressed={settings.layout === l.key}
                        className={`rounded-[12px] border px-4 py-3 text-left transition-colors duration-150 ${
                          settings.layout === l.key ? optionActive : optionIdle
                        }`}
                      >
                        <span className="block text-[13px] font-semibold">{l.label}</span>
                        <span className="text-[11px] opacity-70">{l.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="t-sm font-semibold">Currency</h3>
                  <p className="t-xs mb-3 mt-0.5 text-ink-faint">Display currency for amounts</p>
                  <div className="grid grid-cols-4 gap-2">
                    {['KES', 'USD', 'EUR', 'GBP'].map(c => (
                      <button
                        key={c}
                        onClick={() => updateSettings({ currency: c })}
                        aria-pressed={settings.currency === c}
                        className={`${optionBase} mono text-[13px] font-semibold ${settings.currency === c ? optionActive : optionIdle}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div>
                <p className="t-xs -mt-2 mb-2 text-ink-faint">Choose which notifications you receive</p>
                <div className="divide-y divide-hairline">
                  {[
                    { key: 'income', label: 'Income notifications' },
                    { key: 'expense', label: 'Expense notifications' },
                    { key: 'damage', label: 'Damage notifications' },
                    { key: 'vehicle', label: 'Vehicle notifications' },
                    { key: 'reports', label: 'Report notifications' },
                    { key: 'system', label: 'System notifications' },
                  ].map(n => {
                    const enabled = !!settings.notificationPreferences[n.key]
                    return (
                      <div key={n.key} className="flex items-center justify-between gap-4 py-3">
                        <span className="t-sm">{n.label}</span>
                        <button
                          role="switch"
                          aria-checked={enabled}
                          aria-label={n.label}
                          onClick={() => {
                            const prefs = { ...settings.notificationPreferences, [n.key]: !enabled }
                            updateSettings({ notificationPreferences: prefs })
                          }}
                          className={`relative h-7 w-12 flex-shrink-0 rounded-full border transition-colors duration-200 ${
                            enabled ? 'border-[var(--solid)] bg-[var(--solid)]' : 'border-hairline bg-ghost'
                          }`}
                        >
                          <span
                            className={`absolute top-[3px] h-[20px] w-[20px] rounded-full border transition-all duration-200 ${
                              enabled
                                ? 'left-[24px] border-transparent bg-[var(--solid-ink)]'
                                : 'left-[3px] border-hairline-strong bg-panel'
                            }`}
                          />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {activeSection === 'data' && (
              <div>
                <p className="t-xs -mt-2 mb-4 text-ink-faint">Export or delete your fleet data</p>
                <div className="divide-y divide-hairline border-y border-hairline">
                  <button
                    onClick={handleExportData}
                    className="flex w-full items-center gap-3 py-3.5 text-left transition-colors hover:bg-ghost"
                  >
                    <span className="tile">
                      <HiOutlineArrowDownTray size={17} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13.5px] font-medium">Export all data</span>
                      <span className="t-micro block text-ink-faint">Download a JSON backup</span>
                    </span>
                    <HiOutlineChevronRight size={16} className="flex-shrink-0 text-ink-faint" />
                  </button>

                  <button
                    onClick={() => setShowDeleteData(true)}
                    className="flex w-full items-center gap-3 py-3.5 text-left transition-colors hover:bg-ghost"
                  >
                    <span className="tile">
                      <HiOutlineTrash size={17} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13.5px] font-medium">Delete all data</span>
                      <span className="t-micro block text-ink-faint">Remove all vehicles and records</span>
                    </span>
                    <HiOutlineChevronRight size={16} className="flex-shrink-0 text-ink-faint" />
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'help' && (
              <dl className="divide-y divide-hairline border-y border-hairline">
                {[
                  { label: 'About Fleet Manager', value: 'Version 2.0.0' },
                  { label: 'Build', value: '2026.07' },
                  { label: 'Made for', value: 'Fleet owners in Kenya' },
                  { label: 'Contact', value: 'support@fleetmanager.app' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-4 py-3">
                    <dt className="t-sm text-ink-soft">{item.label}</dt>
                    <dd className="t-xs truncate font-medium">{item.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </section>
      </div>

      {/* Sign out */}
      <div className="mt-6">
        <SignOutButton>
          <button className="btn btn-outline btn-block text-ink-soft hover:text-ink sm:w-auto">
            <HiOutlineArrowRightOnRectangle size={18} />
            Sign out
          </button>
        </SignOutButton>
      </div>

      {/* Delete data modal */}
      {showDeleteData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          onClick={() => setShowDeleteData(false)}
        >
          <div className="backdrop backdrop-enter" />
          <div
            className="modal sheet-enter"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Delete all data"
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-hairline bg-panel-soft">
              <HiOutlineTrash size={22} />
            </div>
            <h3 className="t-section text-center">Delete all data?</h3>
            <p className="t-sm mt-2 text-center text-ink-soft">
              This will permanently delete all vehicles, income, expenses and damage records.
              This cannot be undone.
            </p>
            <div className="mt-6 flex gap-2.5">
              <button onClick={() => setShowDeleteData(false)} className="btn btn-secondary flex-1">
                Cancel
              </button>
              <button onClick={handleDeleteData} className="btn btn-primary flex-1">
                Delete all
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
