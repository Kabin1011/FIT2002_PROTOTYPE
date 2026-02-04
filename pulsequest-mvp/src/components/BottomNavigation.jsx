import { NavLink, useLocation } from 'react-router-dom'
import { useQuests } from '../context/QuestsContext'

export default function BottomNavigation() {
  const location = useLocation()
  const { activeQuests } = useQuests()

  const hiddenPaths = ['/', '/onboarding']
  const isNavigating = location.pathname.includes('/navigate')

  if (hiddenPaths.includes(location.pathname) || isNavigating) {
    return null
  }

  const navItems = [
    { path: '/home', icon: 'home', label: 'Home' },
    { path: '/browse', icon: 'search', label: 'Browse' },
    { path: '/my-quests', icon: 'target', label: 'My Quests', badge: activeQuests.length },
  ]

  const icons = {
    home: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    search: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    target: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-cream-50 border-t border-sage-200 px-2 pb-safe z-50 shadow-sage-sm">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              [
                'flex flex-col items-center justify-center px-4 py-2 rounded-lg transition-all duration-300 relative',
                isActive
                  ? 'text-sage-600'
                  : 'text-taupe-400 hover:text-sage-500',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-sage-600 rounded-full" />
                )}
                <span className="relative">
                  {icons[item.icon]}
                  {item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-sage-600 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                      {item.badge}
                    </span>
                  )}
                </span>
                <span className="text-xs mt-1">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
