import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { useQuests } from '../context/QuestsContext'
import { QUESTS_DATA } from '../data/questsData'
import { INTEREST_CATEGORIES } from '../data/interests'
import { calculateDistance, formatDistance } from '../utils/distance'

export default function QuestDetailPage() {
  const { questId } = useParams()
  const navigate = useNavigate()
  const { user } = useUser()
  const { hasActiveQuest, getActiveQuest, startQuest, isQuestCompleted } = useQuests()

  const [isLoading, setIsLoading] = useState(false)
  const [showConflictModal, setShowConflictModal] = useState(false)
  const [showToast, setShowToast] = useState(false)

  const quest = useMemo(() => {
    return QUESTS_DATA.find((q) => q.questId === questId)
  }, [questId])

  const distance = useMemo(() => {
    if (!quest || !user.location) return null
    return calculateDistance(
      user.location.lat,
      user.location.lng,
      quest.location.lat,
      quest.location.lng
    )
  }, [quest, user.location])

  const activeQuest = getActiveQuest()
  const completed = isQuestCompleted(questId)

  if (!quest) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-warm-50">
        <div className="text-5xl mb-4 text-sage-400">404</div>
        <h1 className="text-2xl font-bold text-forest-800 mb-2">Quest not found</h1>
        <p className="text-taupe-500 mb-6">This quest doesn't exist or has been removed.</p>
        <button
          onClick={() => navigate('/browse')}
          className="px-6 py-2.5 bg-sage-600 hover:bg-sage-700 text-white rounded-xl transition-colors"
        >
          Browse Quests
        </button>
      </div>
    )
  }

  const handleStartQuest = async () => {
    setIsLoading(true)

    if (hasActiveQuest()) {
      setShowConflictModal(true)
      setIsLoading(false)
      return
    }

    startQuest(quest.questId)
    setShowToast(true)

    setTimeout(() => {
      navigate(`/quest/${quest.questId}/navigate`)
    }, 2000)
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-sage-600'
      case 'Medium':
        return 'text-terracotta-500'
      case 'Hard':
        return 'text-clay-600'
      default:
        return 'text-taupe-500'
    }
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'view':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        )
      case 'photo':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )
      case 'task':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
        )
    }
  }

  const getActivityLabel = (type) => {
    switch (type) {
      case 'view':
        return 'View & Observe'
      case 'photo':
        return 'Take Photo'
      case 'task':
        return 'Complete Task'
      default:
        return 'Visit'
    }
  }

  return (
    <div className="min-h-screen pb-40 bg-warm-50">
      {/* Hero Image */}
      <div className="relative h-64 bg-sage-200">
        <img
          src={quest.heroImageUrl}
          alt={quest.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-800/60 via-transparent to-transparent" />

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 p-2 bg-white/90 backdrop-blur-sm rounded-full text-forest-800 hover:bg-white transition-colors shadow-sage-sm"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Title Overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="text-2xl font-bold text-white drop-shadow-lg">{quest.title}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-4">
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {quest.tags.map((tag) => {
            const category = INTEREST_CATEGORIES.find((c) => c.id === tag)
            return (
              <span
                key={tag}
                className="text-sm px-3 py-1 bg-sage-200 text-forest-800 rounded-full"
              >
                {category?.icon} {category?.name || tag}
              </span>
            )
          })}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white border border-sage-200 rounded-xl p-3 text-center shadow-sage-sm">
            <div className="text-taupe-500 text-xs mb-1">Duration</div>
            <div className="text-forest-800 font-semibold">{quest.estimatedDuration} min</div>
          </div>
          <div className="bg-white border border-sage-200 rounded-xl p-3 text-center shadow-sage-sm">
            <div className="text-taupe-500 text-xs mb-1">Difficulty</div>
            <div className={`font-semibold ${getDifficultyColor(quest.difficulty)}`}>
              {quest.difficulty}
            </div>
          </div>
          <div className="bg-white border border-sage-200 rounded-xl p-3 text-center shadow-sage-sm">
            <div className="text-taupe-500 text-xs mb-1">Distance</div>
            <div className="text-forest-800 font-semibold">
              {distance != null ? formatDistance(distance).replace(' away', '') : `${quest.totalDistance} km`}
            </div>
          </div>
        </div>

        {/* Overview */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-forest-800 mb-2">Overview</h2>
          <p className="text-taupe-600 leading-relaxed">{quest.fullDescription}</p>
        </section>

        {/* Stops */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-forest-800 mb-3">
            Stops ({quest.stops.length})
          </h2>
          <div className="space-y-3">
            {quest.stops.map((stop, index) => (
              <div
                key={stop.stopId}
                className="bg-white border border-sage-200 rounded-xl p-4 border-l-4 border-l-terracotta-500 shadow-sage-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-terracotta-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-forest-800 mb-1">{stop.name}</h3>
                    <p className="text-sm text-taupe-500 mb-2">{stop.description}</p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="inline-flex items-center gap-1 text-sage-600">
                        {getActivityIcon(stop.activityType)}
                        {getActivityLabel(stop.activityType)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-taupe-400 mt-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {stop.location.address}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Requirements */}
        {quest.requirements && quest.requirements.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-semibold text-forest-800 mb-2">What to bring</h2>
            <ul className="space-y-2">
              {quest.requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-2 text-taupe-600">
                  <svg className="w-5 h-5 text-sage-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {req}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Accessibility */}
        {quest.accessibility && (
          <section className="mb-6">
            <h2 className="text-lg font-semibold text-forest-800 mb-2">Accessibility</h2>
            <p className="text-taupe-600">{quest.accessibility}</p>
          </section>
        )}
      </div>

      {/* Fixed Footer */}
      {!completed && (
        <div className="fixed bottom-16 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t border-sage-200 shadow-sage-lg">
          <button
            onClick={handleStartQuest}
            disabled={isLoading}
            className={[
              'w-full py-3.5 rounded-xl font-semibold text-white transition-all',
              isLoading
                ? 'bg-sage-300 cursor-not-allowed'
                : 'bg-sage-600 hover:bg-sage-700 shadow-sage-md hover:shadow-sage-lg active:scale-[0.98]',
            ].join(' ')}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Starting...
              </span>
            ) : (
              'Start Quest'
            )}
          </button>
        </div>
      )}

      {completed && (
        <div className="fixed bottom-16 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t border-sage-200">
          <div className="flex items-center justify-center gap-2 py-3.5 bg-sage-100 border border-sage-200 rounded-xl text-sage-600 font-semibold">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Quest Completed
          </div>
        </div>
      )}

      {/* Toast */}
      {showToast && (
        <div className="fixed top-4 left-4 right-4 z-50 animate-slide-down">
          <div className="bg-sage-600 text-white px-4 py-3 rounded-xl shadow-sage-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Quest started! Navigate to your first stop.
          </div>
        </div>
      )}

      {/* Conflict Modal */}
      {showConflictModal && activeQuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-800/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-sage-xl border-2 border-sage-200">
            <h3 className="text-xl font-bold text-forest-800 mb-2">Active Quest Found</h3>
            <p className="text-taupe-600 mb-6">
              You already have an active quest. Complete or cancel it before starting a new one.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/my-quests')}
                className="w-full py-3 bg-sage-600 hover:bg-sage-700 text-white rounded-xl font-medium transition-colors"
              >
                Go to Active Quest
              </button>
              <button
                onClick={() => setShowConflictModal(false)}
                className="w-full py-3 border-2 border-sage-200 hover:bg-sage-50 text-taupe-600 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
