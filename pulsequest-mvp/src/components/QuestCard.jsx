import { INTEREST_CATEGORIES } from '../data/interests'
import { DistanceBadge } from './DistanceBadge'

export function QuestCard({ quest, distanceMeters, showTags = true }) {
  const stopsCount = Array.isArray(quest.stops) ? quest.stops.length : quest.stops
  const description = quest.shortDescription || quest.description

  const getDifficultyStyle = (difficulty) => {
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
    <div className="bg-cream-50 border border-sage-200 rounded-2xl overflow-hidden shadow-sage-sm hover:shadow-sage-lg hover:border-sage-600 hover:-translate-y-1 transition-all duration-300">
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
          {description}
        </p>

        <div className="flex flex-wrap gap-2 mb-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-warm-50 border border-golden-400 rounded-full text-xs text-terracotta-500">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {quest.estimatedDuration} min
          </span>
          <span className={`px-2.5 py-1 rounded-full text-xs ${getDifficultyStyle(quest.difficulty)}`}>
            {quest.difficulty}
          </span>
          {stopsCount && (
            <span className="px-2.5 py-1 bg-sage-50 border border-sage-200 rounded-full text-xs text-sage-600">
              {stopsCount} stops
            </span>
          )}
          {distanceMeters != null && (
            <DistanceBadge meters={distanceMeters} />
          )}
        </div>

        {showTags && quest.tags && (
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
        )}
      </div>
    </div>
  )
}

export default QuestCard
