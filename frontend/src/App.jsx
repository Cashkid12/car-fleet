import { Routes, Route, Navigate } from 'react-router-dom'
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react'
import { ToastProvider } from './components/Toast'
import BottomNav from './components/BottomNav'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import AddIncome from './pages/AddIncome'
import AddDamage from './pages/AddDamage'
import Cars from './pages/Cars'
import CarHistory from './pages/CarHistory'
import Profile from './pages/Profile'
import OfflineBanner from './components/OfflineBanner'

function AppLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-bg-deepest text-text-primary lg:flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen lg:min-h-0 lg:ml-60">
        <header className="lg:hidden flex items-center justify-between px-4 h-14 bg-bg-card border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path d="M13 5l3 5m0 0h2.5a1.5 1.5 0 011.423 1.026L21 14H3l1.077-2.974A1.5 1.5 0 015.5 10H8m5 0H8m5 0v5H8V10" />
              </svg>
            </div>
            <span className="text-text-primary font-semibold text-base">Fleet Manager</span>
          </div>
          <UserButton />
        </header>
        <OfflineBanner />
        <div className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          {children}
        </div>
        <div className="lg:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  )
}

function LoginScreen() {
  return (
    <div className="min-h-screen bg-bg-deepest flex flex-col items-center justify-center px-5 relative overflow-hidden">
      <div className="absolute top-[-180px] right-[-120px] w-[400px] h-[400px] rounded-full bg-teal-500/6 blur-[120px]" />
      <div className="absolute bottom-[-120px] left-[-100px] w-[300px] h-[300px] rounded-full bg-cyan-accent/4 blur-[100px]" />

      <div className="relative z-10 w-full max-w-[340px]">
        <div className="flex justify-center mb-10">
          <div className="w-[96px] h-[96px] bg-gradient-to-br from-teal-500 to-teal-600 rounded-[26px] flex items-center justify-center shadow-2xl shadow-teal-500/20 ring-1 ring-teal-500/20">
            <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
              <path d="M13 5l3 5m0 0h2.5a1.5 1.5 0 011.423 1.026L21 14H3l1.077-2.974A1.5 1.5 0 015.5 10H8m5 0H8m5 0v5H8V10" />
            </svg>
          </div>
        </div>

        <h1 className="text-center text-[34px] font-bold text-white tracking-tight leading-tight mb-1.5">
          Fleet Manager
        </h1>

        <p className="text-center text-[15px] text-teal-400 font-medium mb-12">
          Track your fleet. Know your profit.
        </p>

        <SignInButton mode="modal">
          <button className="w-full bg-teal-500 hover:bg-teal-600 active:bg-teal-700 text-white font-semibold rounded-xl h-[54px] text-[15px] transition-colors duration-150 mb-3 shadow-lg shadow-teal-500/15">
            Sign In
          </button>
        </SignInButton>

        <SignUpButton mode="modal">
          <button className="w-full bg-transparent border border-teal-500/30 hover:border-teal-500/60 text-teal-400 hover:text-teal-300 font-semibold rounded-xl h-[54px] text-[15px] hover:bg-teal-500/5 active:bg-teal-500/10 transition-all duration-150">
            Create Account
          </button>
        </SignUpButton>

        <p className="text-center text-text-muted text-xs mt-10">
          Manage your fleet. Track every shilling.
        </p>
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
          <Route path="/cars/:id" element={<CarHistory />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SignedIn>
    </ToastProvider>
  )
}