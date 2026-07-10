export default function EmptyState({ icon, title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-5 text-center">
      {icon && (
        <div className="w-24 h-24 mb-8 rounded-full bg-[#1F2937] flex items-center justify-center border border-white/5">
          {icon}
        </div>
      )}
      <h3 className="text-[20px] font-semibold text-white mb-2">{title}</h3>
      {description && (
        <p className="text-[#94A3B8] text-[15px] mb-8 max-w-[280px]">{description}</p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-2xl h-[56px] px-8 text-[15px] transition-all duration-200 shadow-lg shadow-teal-500/15 ripple btn-press"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}