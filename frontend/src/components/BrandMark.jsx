export default function BrandMark({ size = 32, iconSize = 17, radius = 9 }) {
  return (
    <span
      className="inline-flex flex-shrink-0 items-center justify-center bg-solid text-solid-ink"
      style={{ width: size, height: size, borderRadius: radius }}
      aria-hidden="true"
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
        <path d="M13 5l3 5m0 0h2.5a1.5 1.5 0 011.423 1.026L21 14H3l1.077-2.974A1.5 1.5 0 015.5 10H8m5 0H8m5 0v5H8V10" />
      </svg>
    </span>
  )
}
