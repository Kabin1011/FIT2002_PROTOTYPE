export default function FilterBar({ filters, activeFilter, onFilterChange }) {
  return (
    <div className="sticky top-0 z-10 bg-warm-50/95 backdrop-blur-sm py-3 -mx-4 px-4">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {filters.map((filter) => {
          const isActive = activeFilter === filter.id
          return (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={[
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300',
                isActive
                  ? 'bg-sage-600 text-white'
                  : 'bg-white border border-sage-200 text-taupe-600 hover:bg-sage-50 hover:border-moss-400',
              ].join(' ')}
            >
              {filter.icon && <span>{filter.icon}</span>}
              <span>{filter.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
