import { createContext, useContext, useEffect, useState } from 'react'

const ACTIVE_QUESTS_KEY = 'pulsequest_active'
const COMPLETED_QUESTS_KEY = 'pulsequest_completed'

const QuestsContext = createContext(null)

export function QuestsProvider({ children }) {
  const [activeQuests, setActiveQuests] = useState(() => {
    if (typeof window === 'undefined') return []
    try {
      const stored = window.localStorage.getItem(ACTIVE_QUESTS_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  const [completedQuests, setCompletedQuests] = useState(() => {
    if (typeof window === 'undefined') return []
    try {
      const stored = window.localStorage.getItem(COMPLETED_QUESTS_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(ACTIVE_QUESTS_KEY, JSON.stringify(activeQuests))
    } catch {
      // ignore storage errors
    }
  }, [activeQuests])

  useEffect(() => {
    try {
      window.localStorage.setItem(COMPLETED_QUESTS_KEY, JSON.stringify(completedQuests))
    } catch {
      // ignore storage errors
    }
  }, [completedQuests])

  const startQuest = (questId) => {
    const activeQuest = {
      questId,
      userId: 'demo-user',
      status: 'active',
      startedAt: new Date().toISOString(),
      currentStopIndex: 0,
      completedStops: [],
      pausedAt: null,
      completedAt: null,
    }
    setActiveQuests([activeQuest])
    return activeQuest
  }

  const hasActiveQuest = () => {
    return activeQuests.length > 0
  }

  const getActiveQuest = () => {
    return activeQuests[0] || null
  }

  const updateActiveQuest = (updatedQuest) => {
    setActiveQuests([updatedQuest])
  }

  const markStopComplete = (stopId) => {
    const current = getActiveQuest()
    if (!current) return null

    const updatedQuest = {
      ...current,
      completedStops: [...current.completedStops, stopId],
      currentStopIndex: current.currentStopIndex + 1,
    }
    setActiveQuests([updatedQuest])
    return updatedQuest
  }

  const completeQuest = () => {
    const current = getActiveQuest()
    if (!current) return

    const completedQuest = {
      ...current,
      status: 'completed',
      completedAt: new Date().toISOString(),
    }

    setCompletedQuests((prev) => [...prev, completedQuest])
    setActiveQuests([])
  }

  const cancelQuest = () => {
    setActiveQuests([])
    // Immediately persist to localStorage to prevent race conditions
    try {
      window.localStorage.setItem(ACTIVE_QUESTS_KEY, JSON.stringify([]))
    } catch {
      // ignore storage errors
    }
  }

  const isQuestCompleted = (questId) => {
    return completedQuests.some((q) => q.questId === questId)
  }

  return (
    <QuestsContext.Provider
      value={{
        activeQuests,
        completedQuests,
        startQuest,
        hasActiveQuest,
        getActiveQuest,
        updateActiveQuest,
        markStopComplete,
        completeQuest,
        cancelQuest,
        isQuestCompleted,
      }}
    >
      {children}
    </QuestsContext.Provider>
  )
}

export function useQuests() {
  const ctx = useContext(QuestsContext)
  if (!ctx) {
    throw new Error('useQuests must be used within a QuestsProvider')
  }
  return ctx
}
