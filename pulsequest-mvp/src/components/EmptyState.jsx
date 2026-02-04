export default function EmptyState({ icon, title, message, actionLabel, onAction }) {
  const renderIcon = () => {
    if (icon === 'magnifying-glass') {
      return (
        <svg className="w-12 h-12 text-sage-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    }
    if (icon === 'target') {
      return (
        <svg className="w-12 h-12 text-sage-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
    if (icon === 'trophy') {
      return (
        <svg className="w-12 h-12 text-golden-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      )
    }
    return <div className="text-5xl text-sage-400">{icon}</div>
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 bg-sage-100 rounded-full flex items-center justify-center mb-4">
        {renderIcon()}
      </div>
      <h3 className="text-xl font-semibold text-forest-800 mb-2">{title}</h3>
      <p className="text-taupe-500 mb-6 max-w-sm">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2.5 bg-sage-600 hover:bg-sage-700 text-white font-medium rounded-xl transition-all duration-300 shadow-sage-md hover:shadow-sage-lg"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
