import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { QUESTS_DATA } from '../data/questsData'
import { INTEREST_CATEGORIES } from '../data/interests'
import { calculateDistance } from '../utils/distance'
import FilterBar from '../components/FilterBar'
import SortDropdown from '../components/SortDropdown'
import EmptyState from '../components/EmptyState'
import { DistanceBadge } from '../components/DistanceBadge'

const SORT_OPTIONS = [
  { id: 'distance', label: 'Distance (nearest)' },
  { id: 'duration', label: 'Duration (shortest)' },
  { id: 'difficulty', label: 'Difficulty (easiest)' },
]

const DIFFICULTY_ORDER = { Easy: 1, Medium: 2, Hard: 3 }

export default function QuestBrowsePage() {
  const { user } = useUser()
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState('all')
  const [sortBy, setSortBy] = useState('distance')

  const filters = useMemo(() => {
    return [
      { id: 'all', name: 'All', icon: null },
      ...INTEREST_CATEGORIES,
    ]
  }, [])

  const filteredAndSortedQuests = useMemo(() => {
    let quests = QUESTS_DATA.map((quest) => {
      const distance = user.location
        ? calculateDistance(
            user.location.lat,
            user.location.lng,
            quest.location.lat,
            quest.location.lng
          )
        : null
      return { ...quest, distance }
    })

    if (activeFilter !== 'all') {
      quests = quests.filter((quest) => quest.tags.includes(activeFilter))
    }

    quests.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          if (a.distance == null && b.distance == null) return 0
          if (a.distance == null) return 1
          if (b.distance == null) return -1
          return a.distance - b.distance
        case 'duration':
          return a.estimatedDuration - b.estimatedDuration
        case 'difficulty':
          return (DIFFICULTY_ORDER[a.difficulty] || 2) - (DIFFICULTY_ORDER[b.difficulty] || 2)
        default:
          return 0
      }
    })

    return quests
  }, [activeFilter, sortBy, user.location])

  const clearFilters = () => {
    setActiveFilter('all')
    setSortBy('distance')
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-sage-50 text-sage-600 border border-moss-400'
      case 'Medium':
        return 'bg-amber-50 text-terracotta-500 border border-golden-400'
      case 'Hard':
        return 'bg-red-50 text-clay-600 border border-terracotta-500'
      default:
        return 'bg-warm-50 text-taupe-500 border border-sage-200'
    }
  }

  return (
    <div className="min-h-screen pb-20 bg-warm-50">
      <header className="px-4 pt-6 pb-2">
        <h1 className="text-2xl font-bold text-forest-800">Browse Quests</h1>
        <p className="text-taupe-500 mt-1">Find your next adventure</p>
      </header>

      <div className="px-4">
        <FilterBar
          filters={filters}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        <div className="flex items-center justify-between mt-4 mb-4">
          <p className="text-sm text-taupe-500">
            {filteredAndSortedQuests.length} quest{filteredAndSortedQuests.length !== 1 ? 's' : ''} found
          </p>
          <SortDropdown options={SORT_OPTIONS} value={sortBy} onChange={setSortBy} />
        </div>
      </div>

      {filteredAndSortedQuests.length > 0 ? (
        <div className="px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedQuests.map((quest) => (
            <div
              key={quest.questId}
              onClick={() => navigate(`/quest/${quest.questId}`)}
              className="bg-cream-50 border border-sage-200 rounded-2xl overflow-hidden cursor-pointer hover:bg-sage-50 hover:border-sage-600 hover:-translate-y-1 shadow-sage-sm hover:shadow-sage-lg transition-all duration-300"
            >
              <div className="h-36 bg-sage-100 relative">
                <img
                  src={quest.heroImageUrl}
                  alt={quest.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-800/30 to-transparent" />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-forest-800 line-clamp-2 mb-1">
                  {quest.title}
                </h3>
                <p className="text-sm text-taupe-600 line-clamp-2 mb-3">
                  {quest.shortDescription}
                </p>

                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-warm-50 border border-golden-400 rounded-full text-xs text-terracotta-500">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {quest.estimatedDuration} min
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-xs ${getDifficultyColor(quest.difficulty)}`}>
                    {quest.difficulty}
                  </span>
                  {quest.distance != null && (
                    <DistanceBadge meters={quest.distance} />
                  )}
                </div>

                <div className="flex flex-wrap gap-1">
                  {quest.tags.map((tag) => {
                    const category = INTEREST_CATEGORIES.find((c) => c.id === tag)
                    return (
                      <span
                        key={tag}
                        className="text-xs px-2.5 py-1 bg-sage-200 text-forest-800 rounded-full"
                      >
                        {category?.icon} {category?.name || tag}
                      </span>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="magnifying-glass"
          title="No quests found"
          message="Try different filters or clear them to see all quests."
          actionLabel="Clear Filters"
          onAction={clearFilters}
        />
      )}
    </div>
  )
}
