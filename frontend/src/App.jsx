import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/clerk-react'
import { ToastProvider } from './components/Toast'
import BottomNav from './components/BottomNav'
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
    <div className="flex flex-col min-h-screen bg-[#0B1120] text-white lg:flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen lg:min-h-0 lg:ml-60">
        <div className="lg:hidden sticky top-0 z-40">
          <AppHeader title={pageInfo.title} subtitle={pageInfo.subtitle} />
        </div>
        <OfflineBanner />
        <div className="flex-1 overflow-y-auto safe-bottom lg:pb-8">
          <div className="max-w-[480px] mx-auto w-full px-5 pt-6">
            {children}
          </div>
        </div>
        {location.pathname !== '/cars/:id' && !location.pathname.startsWith('/cars/') && (
          <div className="lg:hidden">
            <FAB />
          </div>
        )}
        <SyncIndicator />
        <div className="lg:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  )
}

function LoginScreen() {
  return (
    <div className="min-h-screen bg-[#0B1120] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute top-[-200px] right-[-150px] w-[450px] h-[450px] rounded-full bg-teal-500/5 blur-[140px]" />
      <div className="absolute bottom-[-150px] left-[-120px] w-[350px] h-[350px] rounded-full bg-teal-500/4 blur-[120px]" />
      <div className="relative z-10 w-full max-w-[340px]">
        <div className="flex justify-center mb-12">
          <div className="w-[100px] h-[100px] bg-gradient-to-br from-teal-500 to-teal-600 rounded-[28px] flex items-center justify-center shadow-2xl shadow-teal-500/20 ring-1 ring-teal-500/20">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
              <path d="M13 5l3 5m0 0h2.5a1.5 1.5 0 011.423 1.026L21 14H3l1.077-2.974A1.5 1.5 0 015.5 10H8m5 0H8m5 0v5H8V10" />
            </svg>
          </div>
        </div>
        <h1 className="text-center text-[32px] font-bold text-white tracking-tight leading-tight mb-2">Fleet Manager</h1>
        <p className="text-center text-[15px] text-teal-400/80 font-medium mb-16">Track your fleet. Know your profit.</p>
        <SignInButton mode="modal">
          <button className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-2xl h-[56px] text-[15px] transition-all duration-200 mb-3 shadow-lg shadow-teal-500/15 ripple btn-press">Sign In</button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button className="w-full bg-transparent border border-white/10 hover:border-teal-500/40 text-white/80 hover:text-teal-400 font-semibold rounded-2xl h-[56px] text-[15px] hover:bg-teal-500/5 transition-all duration-200 ripple btn-press">Create Account</button>
        </SignUpButton>
        <p className="text-center text-[#64748B] text-xs mt-12 tracking-wide">Manage your fleet. Track every shilling.</p>
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