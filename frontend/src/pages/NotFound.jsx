import { useNavigate } from 'react-router-dom'
import { HiOutlineHome } from 'react-icons/hi2'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-5 text-ink">
      <div className="max-w-sm text-center">
        <p className="mono text-[72px] font-semibold leading-none tracking-tight text-ink-faint">404</p>
        <h1 className="t-page mt-4">Page not found</h1>
        <p className="t-sm mt-2 text-ink-soft">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button onClick={() => navigate('/')} className="btn btn-primary btn-lg mt-7">
          <HiOutlineHome size={18} />
          Go home
        </button>
      </div>
    </div>
  )
}
