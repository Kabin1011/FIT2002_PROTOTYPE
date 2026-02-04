import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { QUESTS_DATA } from '../data/questsData'
import { calculateDistance } from '../utils/distance'
import { QuestCard } from '../components/QuestCard'

const MAX_DISTANCE_METERS = 5000
const MAX_RESULTS = 5

export default function HomePage() {
  const { user } = useUser()
  const navigate = useNavigate()

  const recommendedQuests = useMemo(() => {
    if (!user.location) return QUESTS_DATA.slice(0, MAX_RESULTS)

    const questsWithDistance = QUESTS_DATA.map((quest) => {
      const distance = calculateDistance(
        user.location.lat,
        user.location.lng,
        quest.location.lat,
        quest.location.lng
      )
      return { ...quest, distance }
    })

    const filtered = questsWithDistance
      .filter((quest) => {
        if (user.interests.length === 0) return true
        return quest.tags.some((tag) => user.interests.includes(tag))
      })
      .filter((quest) => quest.distance <= MAX_DISTANCE_METERS)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, MAX_RESULTS)

    if (filtered.length === 0) {
      return questsWithDistance
        .filter((quest) => {
          if (user.interests.length === 0) return true
          return quest.tags.some((tag) => user.interests.includes(tag))
        })
        .sort((a, b) => a.distance - b.distance)
        .slice(0, MAX_RESULTS)
    }

    return filtered
  }, [user.location, user.interests])

  return (
    <div className="min-h-screen pb-20 bg-warm-50">
      <header className="px-4 pt-6 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-forest-800">Welcome back!</h1>
            <p className="text-taupe-500 mt-1">
              {user.interests.length > 0
                ? `Quests for you: ${user.interests.join(', ')}`
                : 'Discover quests near you'}
            </p>
          </div>
          <button
            onClick={() => navigate('/settings')}
            className="p-2 text-taupe-500 hover:text-sage-600 hover:bg-sage-50 rounded-lg transition-colors"
            aria-label="Settings"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </header>

      <section className="px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-forest-800">Recommended for you</h2>
          <button
            onClick={() => navigate('/browse')}
            className="text-sm text-sage-600 hover:text-sage-700 font-medium"
          >
            View all
          </button>
        </div>

        <div className="space-y-4">
          {recommendedQuests.map((quest) => (
            <div
              key={quest.questId}
              onClick={() => navigate(`/quest/${quest.questId}`)}
              className="cursor-pointer"
            >
              <QuestCard quest={quest} distanceMeters={quest.distance} />
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 mt-8">
        <button
          onClick={() => navigate('/browse')}
          className="w-full py-3 bg-sage-600 hover:bg-sage-700 text-white font-medium rounded-xl transition-all duration-300 shadow-sage-md hover:shadow-sage-lg"
        >
          Browse All Quests
        </button>
      </section>
    </div>
  )
}
