export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'h-6 w-6', md: 'h-10 w-10', lg: 'h-16 w-16' }
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full ${sizes[size]} border-[3px] border-white/5 border-t-teal-500`} />
    </div>
  )
}

export function LoadingSkeleton({ lines = 3, className = '', height = 'h-4' }) {
  return (
    <div className={`space-y-4 w-full ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`skeleton ${height}`} style={{ width: `${100 - (i % 3) * 15}%` }} />
      ))}
    </div>
  )
}