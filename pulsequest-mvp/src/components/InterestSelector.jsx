import { useMemo, useState } from 'react'
import { INTEREST_CATEGORIES } from '../data/interests'
import { useUser } from '../context/UserContext'
import { CategoryButton } from './CategoryButton'

const MIN_SELECTIONS = 1
const MAX_SELECTIONS = 5

export function InterestSelector({ onContinue }) {
  const { user, updateInterests } = useUser()
  const [selected, setSelected] = useState(() => user.interests ?? [])
  const [touched, setTouched] = useState(false)

  const selectionCount = selected.length
  const hasError = touched && selectionCount < MIN_SELECTIONS

  const handleToggle = (id) => {
    setTouched(true)
    setSelected((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id)
      }
      if (prev.length >= MAX_SELECTIONS) return prev
      return [...prev, id]
    })
  }

  const canContinue = selectionCount >= MIN_SELECTIONS

  const helperText = useMemo(() => {
    if (selectionCount === 0) return 'Choose at least one interest to continue.'
    if (selectionCount === 1)
      return 'Nice pick. Add a few more for better recommendations.'
    if (selectionCount >= MAX_SELECTIONS)
      return 'Great! You have the maximum number of interests selected.'
    return `You've selected ${selectionCount} interests.`
  }, [selectionCount])

  const handleContinue = () => {
    setTouched(true)
    if (!canContinue) return
    updateInterests(selected)
    onContinue?.()
  }

  return (
    <div className="flex min-h-screen flex-col px-4 py-6 sm:px-6 sm:py-8 bg-warm-50">
      <header className="mx-auto w-full max-w-md">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sage-600">
          Step 1 of 2
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-forest-800 sm:text-3xl">
          What are you into right now?
        </h1>
        <p className="mt-2 text-sm text-taupe-600">
          Pick a few interests so PulseQuest can recommend quests that feel
          personal, not generic.
        </p>
      </header>

      <main className="mx-auto mt-6 flex w-full max-w-md flex-1 flex-col gap-4">
        <div className="grid grid-cols-1 gap-3">
          {INTEREST_CATEGORIES.map((cat) => (
            <CategoryButton
              key={cat.id}
              category={cat}
              selected={selected.includes(cat.id)}
              onToggle={handleToggle}
              disabled={selectionCount >= MAX_SELECTIONS}
            />
          ))}
        </div>

        <div className="mt-1 text-xs text-taupe-500">
          <p>{helperText}</p>
          <p className="mt-1 text-[11px] text-taupe-400">
            You can always update your interests later in settings.
          </p>
        </div>
      </main>

      <footer className="mx-auto mt-4 w-full max-w-md border-t border-sage-200 pt-4">
        {hasError && (
          <p className="mb-2 text-xs font-medium text-clay-600">
            Please select at least one interest.
          </p>
        )}

        <button
          type="button"
          onClick={handleContinue}
          className={[
            'flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold shadow-sage-md transition-all duration-300',
            canContinue
              ? 'bg-sage-600 text-white hover:bg-sage-700 hover:shadow-sage-lg'
              : 'bg-sage-50 text-taupe-400 border border-sage-200 cursor-not-allowed',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          Continue
        </button>
      </footer>
    </div>
  )
}
