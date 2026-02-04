import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { useGeolocation } from '../hooks/useGeolocation'
import { INTEREST_CATEGORIES } from '../data/interests'

const MAX_SELECTIONS = 5

export default function SettingsPage() {
  const navigate = useNavigate()
  const { user, updateInterests, updateLocation } = useUser()
  const { location, isRequesting, requestLocation, fallbackLocation } = useGeolocation(false)

  const [selectedInterests, setSelectedInterests] = useState(user.interests || [])
  const [hasChanges, setHasChanges] = useState(false)
  const [showLocationUpdated, setShowLocationUpdated] = useState(false)

  const handleToggleInterest = (id) => {
    setSelectedInterests((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id)
      }
      if (prev.length >= MAX_SELECTIONS) return prev
      return [...prev, id]
    })
    setHasChanges(true)
  }

  const handleSaveInterests = () => {
    updateInterests(selectedInterests)
    setHasChanges(false)
  }

  const handleUpdateLocation = async () => {
    await requestLocation()
  }

  const handleUseFallback = () => {
    updateLocation(fallbackLocation)
    setShowLocationUpdated(true)
    setTimeout(() => setShowLocationUpdated(false), 2000)
  }

  // Update location when geolocation succeeds
  if (location && location !== user.location) {
    updateLocation(location)
    if (!showLocationUpdated) {
      setShowLocationUpdated(true)
      setTimeout(() => setShowLocationUpdated(false), 2000)
    }
  }

  return (
    <div className="min-h-screen pb-20 bg-warm-50">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 pt-6 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-taupe-500 hover:text-sage-600 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-forest-800">Settings</h1>
          <p className="text-taupe-500 text-sm">Update your preferences</p>
        </div>
      </header>

      <div className="px-4 space-y-6">
        {/* Interests Section */}
        <section className="bg-white border border-sage-200 rounded-2xl p-4 shadow-sage-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-forest-800">Your Interests</h2>
              <p className="text-sm text-taupe-500">Select up to {MAX_SELECTIONS} interests</p>
            </div>
            {hasChanges && (
              <button
                onClick={handleSaveInterests}
                className="px-4 py-1.5 bg-sage-600 hover:bg-sage-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Save
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2">
            {INTEREST_CATEGORIES.map((cat) => {
              const isSelected = selectedInterests.includes(cat.id)
              const isDisabled = !isSelected && selectedInterests.length >= MAX_SELECTIONS

              return (
                <button
                  key={cat.id}
                  onClick={() => handleToggleInterest(cat.id)}
                  disabled={isDisabled}
                  className={[
                    'flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left',
                    isSelected
                      ? 'bg-sage-600 border-sage-700 text-white'
                      : 'bg-cream-50 border-sage-200 hover:border-moss-400 hover:bg-sage-50',
                    isDisabled ? 'opacity-40 cursor-not-allowed' : '',
                  ].join(' ')}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <div className="flex-1">
                    <p className={[
                      'font-medium',
                      isSelected ? 'text-white' : 'text-forest-800'
                    ].join(' ')}>{cat.name}</p>
                    <p className={[
                      'text-xs',
                      isSelected ? 'text-white/70' : 'text-taupe-500'
                    ].join(' ')}>{cat.description}</p>
                  </div>
                  {isSelected && (
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>

          <p className="mt-3 text-xs text-taupe-400">
            {selectedInterests.length} of {MAX_SELECTIONS} selected
          </p>
        </section>

        {/* Location Section */}
        <section className="bg-white border border-sage-200 rounded-2xl p-4 shadow-sage-sm">
          <h2 className="text-lg font-semibold text-forest-800 mb-2">Your Location</h2>

          <div className="bg-sage-50 border border-sage-200 rounded-xl p-3 mb-4">
            <div className="flex items-center gap-2 text-forest-800">
              <svg className="w-5 h-5 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>
                {user.location?.city || 'Melbourne'}, {user.location?.suburb || 'CBD'}
              </span>
            </div>
            <p className="text-xs text-taupe-400 mt-1">
              Lat: {user.location?.lat?.toFixed(4) || '-'}, Lng: {user.location?.lng?.toFixed(4) || '-'}
            </p>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleUpdateLocation}
              disabled={isRequesting}
              className="w-full py-2.5 bg-sage-600 hover:bg-sage-700 disabled:bg-sage-300 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {isRequesting ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Updating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  Update My Location
                </>
              )}
            </button>

            <button
              onClick={handleUseFallback}
              className="w-full py-2.5 border-2 border-sage-600 bg-transparent text-sage-600 font-medium rounded-xl transition-colors hover:bg-sage-50"
            >
              Use Melbourne CBD
            </button>
          </div>

          {showLocationUpdated && (
            <p className="mt-3 text-sm text-sage-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Location updated!
            </p>
          )}
        </section>

        {/* Reset Section */}
        <section className="bg-white border border-sage-200 rounded-2xl p-4 shadow-sage-sm">
          <h2 className="text-lg font-semibold text-forest-800 mb-2">Reset App</h2>
          <p className="text-sm text-taupe-500 mb-4">
            Clear all data and start fresh with onboarding.
          </p>
          <button
            onClick={() => {
              if (confirm('This will clear all your data including quest progress. Continue?')) {
                localStorage.clear()
                window.location.href = '/'
              }
            }}
            className="w-full py-2.5 bg-clay-600/10 hover:bg-clay-600/20 text-clay-600 font-medium rounded-xl transition-colors border border-clay-600/30"
          >
            Reset All Data
          </button>
        </section>
      </div>
    </div>
  )
}
