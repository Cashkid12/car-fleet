export default function EmptyState({ icon, title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      {icon && (
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-hairline bg-panel-soft text-ink-faint">
          {icon}
        </div>
      )}
      <h3 className="t-cardtitle text-ink">{title}</h3>
      {description && (
        <p className="t-sm mt-1.5 max-w-[280px] text-ink-faint">{description}</p>
      )}
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn btn-primary mt-6">
          {actionLabel}
        </button>
      )}
    </div>
  )
}
