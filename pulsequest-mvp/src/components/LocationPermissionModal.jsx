import { useEffect } from 'react'
import { useGeolocation } from '../hooks/useGeolocation'
import { useUser } from '../context/UserContext'

export function LocationPermissionModal({ onComplete }) {
  const { user, updateLocation } = useUser()
  const { location, error, isRequesting, hasAttempted, requestLocation, fallbackLocation } =
    useGeolocation(false)

  useEffect(() => {
    if (location) {
      updateLocation(location)
      onComplete?.()
    }
  }, [location, updateLocation, onComplete])

  const handleUseFallback = () => {
    updateLocation(fallbackLocation)
    onComplete?.()
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-6 sm:px-6 bg-warm-50">
      <div className="w-full max-w-md rounded-3xl border-2 border-sage-200 bg-white p-6 shadow-sage-xl">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sage-100 text-sage-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sage-600">
              Step 2 of 2
            </p>
            <h2 className="mt-2 text-xl font-semibold text-forest-800">
              Turn on location for nearby quests
            </h2>
            <p className="mt-2 text-sm text-taupe-600">
              We&apos;ll use your location once to find quests within walking distance.
              No background tracking, no sharing with third parties.
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2 rounded-2xl bg-sage-50 border border-sage-200 p-3 text-xs text-taupe-600">
          <p>- Used to calculate distance to quests in Melbourne.</p>
          <p>- You can continue with a default Melbourne CBD location if you prefer.</p>
        </div>

        {error && (
          <p className="mt-3 text-xs font-medium text-terracotta-500">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={requestLocation}
            disabled={isRequesting}
            className="flex w-full items-center justify-center rounded-xl bg-sage-600 px-4 py-3 text-sm font-semibold text-white shadow-sage-md transition-all duration-300 hover:bg-sage-700 hover:shadow-sage-lg disabled:cursor-not-allowed disabled:bg-sage-300"
          >
            {isRequesting ? 'Requesting location...' : 'Allow location access'}
          </button>

          <button
            type="button"
            onClick={handleUseFallback}
            className="w-full rounded-xl border-2 border-sage-600 bg-transparent px-4 py-3 text-sm font-semibold text-sage-600 transition-all duration-300 hover:bg-sage-50"
          >
            Continue with Melbourne CBD
          </button>

          {hasAttempted && !location && (
            <p className="text-center text-[11px] text-taupe-400">
              If nothing happened, try again or continue with Melbourne CBD.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
