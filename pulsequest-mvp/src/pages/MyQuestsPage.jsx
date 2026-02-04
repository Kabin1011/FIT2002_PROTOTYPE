import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuests } from '../context/QuestsContext'
import { QUESTS_DATA } from '../data/questsData'
import EmptyState from '../components/EmptyState'

export default function MyQuestsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') || 'active'
  const [activeTab, setActiveTab] = useState(initialTab)
  const { activeQuests, completedQuests, cancelQuest } = useQuests()

  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [questToCancel, setQuestToCancel] = useState(null)

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setSearchParams({ tab })
  }

  const getQuestDetails = (questId) => {
    return QUESTS_DATA.find((q) => q.questId === questId)
  }

  const handleCancelQuest = () => {
    cancelQuest()
    setShowCancelConfirm(false)
    setQuestToCancel(null)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatDuration = (startedAt, completedAt) => {
    const start = new Date(startedAt)
    const end = new Date(completedAt)
    const minutes = Math.round((end - start) / 60000)
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const remainingMins = minutes % 60
    return `${hours}h ${remainingMins}m`
  }

  const timeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  }

  return (
    <div className="min-h-screen pb-20 bg-warm-50">
      <header className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-forest-800">My Quests</h1>
        <p className="text-taupe-500 mt-1">Track your adventure progress</p>
      </header>

      {/* Tabs */}
      <div className="px-4 mb-4">
        <div className="flex bg-sage-100 rounded-xl p-1">
          <button
            onClick={() => handleTabChange('active')}
            className={[
              'flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300',
              activeTab === 'active'
                ? 'bg-sage-600 text-white shadow-sage-sm'
                : 'text-taupe-500 hover:text-forest-800',
            ].join(' ')}
          >
            Active {activeQuests.length > 0 && `(${activeQuests.length})`}
          </button>
          <button
            onClick={() => handleTabChange('completed')}
            className={[
              'flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300',
              activeTab === 'completed'
                ? 'bg-sage-600 text-white shadow-sage-sm'
                : 'text-taupe-500 hover:text-forest-800',
            ].join(' ')}
          >
            Completed {completedQuests.length > 0 && `(${completedQuests.length})`}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4">
        {activeTab === 'active' && (
          <>
            {activeQuests.length > 0 ? (
              <div className="space-y-4">
                {activeQuests.map((activeQuest) => {
                  const quest = getQuestDetails(activeQuest.questId)
                  if (!quest) return null

                  const completedCount = activeQuest.completedStops?.length || 0
                  const totalStops = quest.stops?.length || 1
                  const progress = Math.round((completedCount / totalStops) * 100)
                  const currentStop = quest.stops?.[activeQuest.currentStopIndex]

                  return (
                    <div
                      key={activeQuest.questId}
                      className="bg-white border-2 border-sage-600 rounded-2xl overflow-hidden shadow-sage-md"
                    >
                      <div className="flex gap-4 p-4">
                        <div className="w-24 h-20 rounded-xl bg-sage-100 overflow-hidden flex-shrink-0">
                          <img
                            src={quest.heroImageUrl}
                            alt={quest.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none'
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-forest-800 line-clamp-1 mb-1">
                            {quest.title}
                          </h3>
                          <p className="text-sm text-taupe-500 mb-2">
                            Started {timeAgo(activeQuest.startedAt)}
                          </p>

                          {/* Progress Bar */}
                          <div className="mb-2">
                            <div className="flex items-center justify-between text-xs text-taupe-500 mb-1">
                              <span>{completedCount} of {totalStops} stops</span>
                              <span>{progress}%</span>
                            </div>
                            <div className="h-2 bg-sage-100 border border-sage-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-earth-sage transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>

                          {currentStop && (
                            <p className="text-xs text-taupe-400">
                              Current: Stop {activeQuest.currentStopIndex + 1} - {currentStop.name}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex border-t border-sage-200">
                        <button
                          onClick={() => navigate(`/quest/${activeQuest.questId}/navigate`)}
                          className="flex-1 py-3 text-sm font-medium text-sage-600 hover:bg-sage-50 transition-colors"
                        >
                          Continue Quest
                        </button>
                        <div className="w-px bg-sage-200" />
                        <button
                          onClick={() => {
                            setQuestToCancel(activeQuest)
                            setShowCancelConfirm(true)
                          }}
                          className="flex-1 py-3 text-sm font-medium text-taupe-500 hover:text-clay-600 hover:bg-sage-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <EmptyState
                icon="target"
                title="No active quests"
                message="Browse quests to get started on your next adventure!"
                actionLabel="Browse Quests"
                onAction={() => navigate('/browse')}
              />
            )}
          </>
        )}

        {activeTab === 'completed' && (
          <>
            {completedQuests.length > 0 ? (
              <div className="space-y-4">
                {completedQuests.map((completed, index) => {
                  const quest = getQuestDetails(completed.questId)
                  if (!quest) return null

                  const totalStops = quest.stops?.length || 1

                  return (
                    <div
                      key={`${completed.questId}-${index}`}
                      className="bg-sage-50 border border-moss-400 rounded-2xl p-4 shadow-sage-sm"
                    >
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-full bg-sage-200 flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-forest-800 line-clamp-1 mb-1">
                            {quest.title}
                          </h3>
                          <p className="text-sm text-taupe-500 mb-2">
                            Completed on {formatDate(completed.completedAt)}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-taupe-400">
                            <span>
                              Duration: {formatDuration(completed.startedAt, completed.completedAt)}
                            </span>
                            <span>|</span>
                            <span>
                              Stops: {totalStops}/{totalStops}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => navigate(`/quest/${completed.questId}`)}
                        className="w-full mt-4 py-2.5 text-sm font-medium text-taupe-600 hover:text-forest-800 bg-white border border-sage-200 hover:bg-sage-50 rounded-xl transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <EmptyState
                icon="trophy"
                title="No completed quests yet"
                message="Start your first quest and see your achievements here!"
                actionLabel="Browse Quests"
                onAction={() => navigate('/browse')}
              />
            )}
          </>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && questToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-800/40 backdrop-blur-sm">
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
                onClick={() => {
                  setShowCancelConfirm(false)
                  setQuestToCancel(null)
                }}
                className="w-full py-3 border-2 border-sage-200 hover:bg-sage-50 text-taupe-600 rounded-xl font-medium transition-colors"
              >
                Keep Going
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
