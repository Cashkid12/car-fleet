export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' }
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-2 border-hairline border-t-ink ${sizes[size]}`}
      />
    </div>
  )
}

export function LoadingSkeleton({ lines = 3, className = '', height = 'h-4' }) {
  return (
    <div className={`w-full space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`skeleton ${height}`} style={{ width: `${100 - (i % 3) * 15}%` }} />
      ))}
    </div>
  )
}
