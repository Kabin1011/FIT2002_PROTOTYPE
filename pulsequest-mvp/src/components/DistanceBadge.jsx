import { formatDistance } from '../utils/distance'

export function DistanceBadge({ meters }) {
  if (meters == null) return null
  return (
    <span className="inline-flex items-center rounded-full bg-sky-muted-400/10 border border-sky-muted-400 px-2.5 py-1 text-xs font-medium text-sky-muted-400">
      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      {formatDistance(meters)}
    </span>
  )
}

export default DistanceBadge

