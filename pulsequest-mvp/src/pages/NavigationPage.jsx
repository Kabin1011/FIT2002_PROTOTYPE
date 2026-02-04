import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useUser } from '../context/UserContext'
import { useQuests } from '../context/QuestsContext'
import { QUESTS_DATA } from '../data/questsData'
import { calculateDistance, formatDistance } from '../utils/distance'

import 'leaflet/dist/leaflet.css'

// Fix for default marker icons in Leaflet with Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Custom user marker icon (sky-muted blue)
const userIcon = new L.DivIcon({
  className: 'user-marker',
  html: `<div style="width: 20px; height: 20px; background: #7AAAB3; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(122,170,179,0.4);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

// Custom stop marker icon (terracotta)
const createStopIcon = (number) => new L.DivIcon({
  className: 'stop-marker',
  html: `<div style="width: 32px; height: 32px; background: #C17855; border: 2px solid white; border-radius: 50%; box-shadow: 0 3px 10px rgba(193,120,85,0.35); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">${number}</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})

function MapUpdater({ center, bounds }) {
  const map = useMap()

  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] })
    } else if (center) {
      map.setView(center, 15)
    }
  }, [map, center, bounds])

  return null
}

export default function NavigationPage() {
  const { questId } = useParams()
  const navigate = useNavigate()
  const { user } = useUser()
  const { getActiveQuest, markStopComplete, completeQuest, cancelQuest } = useQuests()

  const [showMenu, setShowMenu] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [showDemoComplete, setShowDemoComplete] = useState(false)
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const quest = useMemo(() => {
    return QUESTS_DATA.find((q) => q.questId === questId)
  }, [questId])

  const activeQuest = getActiveQuest()

  const currentStopIndex = activeQuest?.currentStopIndex || 0
  const currentStop = quest?.stops?.[currentStopIndex]
  const completedStopsCount = activeQuest?.completedStops?.length || 0
  const totalStops = quest?.stops?.length || 0
  const progress = totalStops > 0 ? (completedStopsCount / totalStops) * 100 : 0

  const userLocation = useMemo(() => {
    if (user.location) {
      return [user.location.lat, user.location.lng]
    }
    return [-37.8136, 144.9631] // Melbourne CBD fallback
  }, [user.location])

  const stopLocation = useMemo(() => {
    if (currentStop?.location) {
      return [currentStop.location.lat, currentStop.location.lng]
    }
    return null
  }, [currentStop])

  const distanceToStop = useMemo(() => {
    if (!user.location || !currentStop?.location) return null
    return calculateDistance(
      user.location.lat,
      user.location.lng,
      currentStop.location.lat,
      currentStop.location.lng
    )
  }, [user.location, currentStop])

  const estimatedTime = useMemo(() => {
    if (distanceToStop == null) return null
    return Math.max(1, Math.round((distanceToStop / 5000) * 60))
  }, [distanceToStop])

  const canComplete = distanceToStop != null && distanceToStop < 100

  const mapCenter = useMemo(() => {
    if (userLocation && stopLocation) {
      return [
        (userLocation[0] + stopLocation[0]) / 2,
        (userLocation[1] + stopLocation[1]) / 2,
      ]
    }
    return userLocation
  }, [userLocation, stopLocation])

  const mapBounds = useMemo(() => {
    if (userLocation && stopLocation) {
      return [userLocation, stopLocation]
    }
    return null
  }, [userLocation, stopLocation])

  const handleMarkComplete = () => {
    if (!canComplete && distanceToStop != null && distanceToStop >= 100) {
      setToastMessage(`Get closer to mark complete (${formatDistance(distanceToStop)})`)
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
      return
    }

    const updatedQuest = markStopComplete(currentStop.stopId)

    if (updatedQuest && updatedQuest.completedStops.length === totalStops) {
      completeQuest()
      setShowCompletionModal(true)
    } else {
      setToastMessage('Stop completed! On to the next one.')
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    }
  }

  const handleCancelQuest = () => {
    setShowCancelConfirm(false)
    cancelQuest()
    // Navigate after state update completes
    setTimeout(() => {
      navigate('/my-quests')
    }, 0)
  }

  const handleDemoComplete = () => {
    setShowDemoComplete(false)
    const updatedQuest = markStopComplete(currentStop.stopId)

    if (updatedQuest && updatedQuest.completedStops.length === totalStops) {
      completeQuest()
      setShowCompletionModal(true)
    } else {
      setToastMessage('Stop completed (Demo Mode)! On to the next one.')
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    }
  }

  if (!quest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50">
        <p className="text-taupe-500">Quest not found</p>
      </div>
    )
  }

  if (!activeQuest || activeQuest.questId !== questId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-warm-50">
        <p className="text-taupe-500 mb-4">This quest is not active</p>
        <button
          onClick={() => navigate(`/quest/${questId}`)}
          className="px-6 py-2.5 bg-sage-600 hover:bg-sage-700 text-white rounded-xl transition-colors"
        >
          View Quest Details
        </button>
      </div>
    )
  }

  const completionTime = activeQuest.completedAt
    ? Math.round((new Date(activeQuest.completedAt) - new Date(activeQuest.startedAt)) / 60000)
    : null

  return (
    <div className="h-screen flex flex-col bg-warm-50">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-white/95 backdrop-blur-sm border-b border-sage-200 z-[1000] shadow-sage-sm">
        <button
          onClick={() => navigate('/my-quests')}
          className="p-2 -ml-2 text-taupe-500 hover:text-sage-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="font-semibold text-forest-800 truncate mx-4">{quest.title}</h1>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 -mr-2 text-taupe-500 hover:text-sage-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-sage-lg border border-sage-200 py-1 z-[9999]">
              <button
                onClick={() => {
                  setShowMenu(false)
                  setShowDemoComplete(true)
                }}
                className="w-full text-left px-4 py-2 text-sm text-sage-600 hover:bg-sage-50 transition-colors border-b border-sage-100"
              >
                <div className="font-medium">Complete Stop</div>
                <div className="text-xs text-taupe-400">Demo only</div>
              </button>
              <button
                onClick={() => {
                  setShowMenu(false)
                  setShowCancelConfirm(true)
                }}
                className="w-full text-left px-4 py-2 text-sm text-clay-600 hover:bg-sage-50 transition-colors"
              >
                Cancel Quest
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Progress Bar */}
      <div className="flex-shrink-0 px-4 py-2 bg-white/80 border-b border-sage-200">
        <div className="flex items-center justify-between text-xs text-taupe-500 mb-1">
          <span>Progress</span>
          <span>{completedStopsCount} of {totalStops} stops</span>
        </div>
        <div className="h-2 bg-sage-100 border border-sage-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-earth-sage transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={mapCenter}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          <MapUpdater center={mapCenter} bounds={mapBounds} />

          {/* User Marker */}
          <Marker position={userLocation} icon={userIcon}>
            <Popup>You are here</Popup>
          </Marker>

          {/* Stop Marker */}
          {stopLocation && (
            <Marker position={stopLocation} icon={createStopIcon(currentStopIndex + 1)}>
              <Popup>
                Stop {currentStopIndex + 1}: {currentStop?.name}
              </Popup>
            </Marker>
          )}

          {/* Route Line */}
          {stopLocation && (
            <Polyline
              positions={[userLocation, stopLocation]}
              color="#6B8E65"
              weight={4}
              dashArray="12, 6"
              opacity={0.8}
            />
          )}
        </MapContainer>
      </div>

      {/* Directions Panel */}
      <div className="flex-shrink-0 bg-white rounded-t-3xl -mt-6 relative z-10 shadow-sage-xl border-t border-sage-200">
        <div className="w-12 h-1 bg-sage-200 rounded-full mx-auto mt-3 mb-4" />

        <div className="px-4 pb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-sage-600 font-medium">
              Stop {currentStopIndex + 1} of {totalStops}
            </span>
            {distanceToStop != null && (
              <span className="text-sm text-taupe-500">
                {formatDistance(distanceToStop)} - {estimatedTime} min walk
              </span>
            )}
          </div>

          <h2 className="text-xl font-bold text-forest-800 mb-2">{currentStop?.name}</h2>
          <p className="text-taupe-500 text-sm mb-4 line-clamp-2">{currentStop?.description}</p>

          <button
            onClick={handleMarkComplete}
            disabled={!canComplete}
            className={[
              'w-full py-3.5 rounded-xl font-semibold text-white transition-all',
              canComplete
                ? 'bg-sage-600 hover:bg-sage-700 shadow-sage-md hover:shadow-sage-lg active:scale-[0.98]'
                : 'bg-sage-200 text-sage-400 cursor-not-allowed',
            ].join(' ')}
          >
            {canComplete ? 'Mark Complete' : `Get closer (${distanceToStop != null ? formatDistance(distanceToStop) : '...'})`}
          </button>
        </div>
      </div>

      {/* Toast */}
      {showToast && (
        <div className="fixed top-20 left-4 right-4 z-[9999] animate-slide-down">
          <div className="bg-sage-600 text-white px-4 py-3 rounded-xl shadow-sage-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {toastMessage}
          </div>
        </div>
      )}

      {/* Demo Complete Confirmation */}
      {showDemoComplete && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-forest-800/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-sage-xl border-2 border-sage-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-forest-800">Demo Mode</h3>
            </div>
            <p className="text-taupe-600 mb-2">
              Complete <span className="font-medium text-forest-700">"{currentStop?.name}"</span> without being at the location?
            </p>
            <p className="text-xs text-taupe-400 mb-6 bg-amber-50 p-2 rounded-lg">
              This bypasses the location check for demonstration purposes only.
            </p>
            <div className="space-y-3">
              <button
                onClick={handleDemoComplete}
                className="w-full py-3 bg-sage-600 hover:bg-sage-700 text-white rounded-xl font-medium transition-colors"
              >
                Yes, Complete Stop
              </button>
              <button
                onClick={() => setShowDemoComplete(false)}
                className="w-full py-3 border-2 border-sage-200 hover:bg-sage-50 text-taupe-600 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-forest-800/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-sage-xl border-2 border-sage-200">
            <h3 className="text-xl font-bold text-forest-800 mb-2">Cancel Quest?</h3>
            <p className="text-taupe-600 mb-6">
              Are you sure? Your progress will be lost.
            </p>
            <div className="space-y-3">
              <button
                onClick={handleCancelQuest}
                className="w-full py-3 bg-clay-600 hover:bg-clay-700 text-white rounded-xl font-medium transition-colors"
              >
                Yes, Cancel Quest
              </button>
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="w-full py-3 border-2 border-sage-200 hover:bg-sage-50 text-taupe-600 rounded-xl font-medium transition-colors"
              >
                Keep Going
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-forest-800/40 backdrop-blur-sm">
          <div className="bg-completion-bg rounded-3xl p-6 max-w-sm w-full text-center shadow-sage-xl border-2 border-moss-400">
            <div className="w-16 h-16 bg-golden-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-golden-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-forest-800 mb-2">Quest Complete!</h3>
            <p className="text-taupe-600 mb-4">
              Congratulations! You finished {quest.title}
            </p>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-white border border-sage-200 rounded-xl p-3 shadow-sage-sm">
                <div className="text-2xl font-bold text-forest-800">{completionTime || '?'}</div>
                <div className="text-xs text-taupe-500">minutes</div>
              </div>
              <div className="bg-white border border-sage-200 rounded-xl p-3 shadow-sage-sm">
                <div className="text-2xl font-bold text-forest-800">{totalStops}/{totalStops}</div>
                <div className="text-xs text-taupe-500">stops</div>
              </div>
              <div className="bg-white border border-sage-200 rounded-xl p-3 shadow-sage-sm">
                <div className="text-2xl font-bold text-forest-800">{quest.totalDistance}</div>
                <div className="text-xs text-taupe-500">km</div>
              </div>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/browse')}
                className="w-full py-3 bg-sage-600 hover:bg-sage-700 text-white rounded-xl font-medium transition-colors"
              >
                Browse More Quests
              </button>
              <button
                onClick={() => navigate('/my-quests?tab=completed')}
                className="w-full py-3 border-2 border-sage-200 hover:bg-sage-50 text-taupe-600 rounded-xl font-medium transition-colors"
              >
                View My Completed Quests
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
