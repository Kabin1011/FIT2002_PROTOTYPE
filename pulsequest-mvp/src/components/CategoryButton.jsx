export function CategoryButton({ category, selected, onToggle, disabled }) {
  return (
    <button
      type="button"
      onClick={() => onToggle(category.id)}
      disabled={disabled && !selected}
      className={[
        'flex flex-col items-start justify-between rounded-2xl border-2 p-4 text-left transition-all duration-300',
        selected
          ? 'bg-sage-600 border-sage-700 text-white shadow-sage-md'
          : 'bg-white border-sage-200 hover:bg-sage-50 hover:border-moss-400',
        disabled && !selected ? 'opacity-40 cursor-not-allowed' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex items-center gap-3">
        <div className={[
          'flex h-10 w-10 items-center justify-center rounded-2xl text-2xl',
          selected ? 'bg-sage-700/50' : 'bg-sage-100'
        ].join(' ')}>
          <span aria-hidden>{category.icon}</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className={[
              'text-sm font-semibold',
              selected ? 'text-white' : 'text-charcoal-800'
            ].join(' ')}>
              {category.name}
            </p>
            {selected && (
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
                Selected
              </span>
            )}
          </div>
          <p className={[
            'mt-1 text-xs',
            selected ? 'text-white/70' : 'text-taupe-500'
          ].join(' ')}>{category.description}</p>
        </div>
      </div>
    </button>
  )
}
