import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/clerk-react'
import { ToastProvider } from './components/Toast'
import BottomNav from './components/BottomNav'
import BrandMark from './components/BrandMark'
import Sidebar from './components/Sidebar'
import AppHeader from './components/AppHeader'
import FAB from './components/FAB'
import SyncIndicator from './components/SyncIndicator'
import Dashboard from './pages/Dashboard'
import AddIncome from './pages/AddIncome'
import AddDamage from './pages/AddDamage'
import Cars from './pages/Cars'
import CarHistory from './pages/CarHistory'
import Profile from './pages/Profile'
import Reports from './pages/Reports'
import Notifications from './pages/Notifications'
import OfflineBanner from './components/OfflineBanner'

const pageTitles = {
  '/': { title: 'Dashboard', subtitle: 'Your fleet at a glance' },
  '/add-income': { title: 'Add Income', subtitle: 'Record daily driver collection' },
  '/add-damage': { title: 'Vehicle Health', subtitle: 'Manage damages and expenses' },
  '/cars': { title: 'My Fleet', subtitle: 'Manage all your vehicles' },
  '/profile': { title: 'Profile', subtitle: 'Manage your account' },
  '/reports': { title: 'Reports & Analytics', subtitle: 'Monitor performance and growth' },
  '/notifications': { title: 'Notifications', subtitle: 'Stay updated with your fleet' },
}

function AppLayout({ children }) {
  const location = useLocation()
  const pageInfo = pageTitles[location.pathname] || { title: 'Fleet Manager', subtitle: '' }

  return (
    <div className="flex min-h-screen bg-canvas text-ink">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col md:ml-[236px]">
        <div className="sticky top-0 z-40 md:hidden">
          <AppHeader title={pageInfo.title} subtitle={pageInfo.subtitle} />
        </div>
        <OfflineBanner />
        <main className="flex-1 pb-28 md:pb-12">
          <div className="mx-auto w-full max-w-[1400px] px-4 pt-5 sm:px-6 md:px-8 md:pt-8 lg:px-10 lg:pt-10">
            {children}
          </div>
        </main>
        {location.pathname !== '/cars/:id' && !location.pathname.startsWith('/cars/') && (
          <div className="md:hidden">
            <FAB />
          </div>
        )}
        <SyncIndicator />
        <div className="md:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  )
}

function LoginScreen() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink">
      <header className="px-6 py-6 sm:px-10">
        <div className="flex items-center gap-2.5">
          <BrandMark size={30} iconSize={16} radius={8} />
          <span className="text-[15px] font-semibold tracking-tight">Fleet Manager</span>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-6 pb-16 sm:px-10">
        <div className="w-full max-w-[880px] lg:grid lg:grid-cols-2 lg:items-center lg:gap-20">
          <div className="mb-12 lg:mb-0">
            <p className="t-label mb-5">Fleet operations</p>
            <h1 className="t-display max-w-[12ch] sm:text-[40px]">
              Track your fleet. Know your profit.
            </h1>
            <p className="t-body mt-5 max-w-[36ch] text-ink-soft">
              Income, expenses, repairs and vehicle health — one calm dashboard for the whole
              fleet.
            </p>
            <div className="mt-10 hidden items-center gap-8 lg:flex">
              <div>
                <p className="figure text-[24px]">KES</p>
                <p className="t-xs mt-1 text-ink-faint">Native currency</p>
              </div>
              <div className="h-10 w-px bg-hairline" />
              <div>
                <p className="figure text-[24px]">Offline</p>
                <p className="t-xs mt-1 text-ink-faint">Syncs when back online</p>
              </div>
            </div>
          </div>

          <div className="w-full max-w-[380px] lg:justify-self-end">
            <div className="rounded-[18px] border border-hairline bg-panel p-6 shadow-[var(--card-shadow)] sm:p-7">
              <h2 className="t-cardtitle">Sign in to continue</h2>
              <p className="t-sm mt-1 text-ink-soft">
                Manage your fleet. Track every shilling.
              </p>

              <div className="mt-6 space-y-2.5">
                <SignInButton mode="modal">
                  <button className="btn btn-primary btn-lg btn-block">Sign In</button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="btn btn-outline btn-lg btn-block">Create Account</button>
                </SignUpButton>
              </div>

              <p className="t-xs mt-6 text-ink-faint">
                Secured by Clerk. Your fleet data stays private to your account.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <SignedOut>
        <LoginScreen />
      </SignedOut>
      <SignedIn>
        <Routes>
          <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/add-income" element={<AppLayout><AddIncome /></AppLayout>} />
          <Route path="/add-damage" element={<AppLayout><AddDamage /></AppLayout>} />
          <Route path="/cars" element={<AppLayout><Cars /></AppLayout>} />
          <Route path="/profile" element={<AppLayout><Profile /></AppLayout>} />
          <Route path="/reports" element={<AppLayout><Reports /></AppLayout>} />
          <Route path="/notifications" element={<AppLayout><Notifications /></AppLayout>} />
          <Route path="/cars/:id" element={<CarHistory />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SignedIn>
    </ToastProvider>
  )
}
