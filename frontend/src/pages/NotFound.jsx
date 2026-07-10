import { useNavigate } from 'react-router-dom'
import { HiOutlineHome } from 'react-icons/hi2'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center px-5">
      <div className="text-center max-w-sm">
        <div className="text-[80px] font-bold text-[#1F2937] mb-4">404</div>
        <h1 className="text-[22px] font-bold text-white mb-2">Page Not Found</h1>
        <p className="text-[#94A3B8] text-[15px] mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-2xl h-[52px] px-8 text-[15px] transition-all duration-200 inline-flex items-center gap-2"
        >
          <HiOutlineHome size={20} />
          Go Home
        </button>
      </div>
    </div>
  )
}