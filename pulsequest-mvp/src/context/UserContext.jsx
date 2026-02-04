import { createContext, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'pulsequest_user'

const defaultUser = {
  userId: 'demo-user-001',
  interests: [],
  location: null,
  onboardingComplete: false,
  createdAt: new Date().toISOString(),
}

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (typeof window === 'undefined') return defaultUser
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : defaultUser
    } catch {
      return defaultUser
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } catch {
      // ignore storage errors in MVP
    }
  }, [user])

  const updateInterests = (interests) => {
    setUser((prev) => ({
      ...prev,
      interests,
    }))
  }

  const updateLocation = (location) => {
    setUser((prev) => ({
      ...prev,
      location,
    }))
  }

  const completeOnboarding = () => {
    setUser((prev) => ({
      ...prev,
      onboardingComplete: true,
    }))
  }

  return (
    <UserContext.Provider
      value={{
        user,
        updateInterests,
        updateLocation,
        completeOnboarding,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return ctx
}

