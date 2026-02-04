import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import './App.css'
import { useUser } from './context/UserContext'
import { InterestSelector } from './components/InterestSelector'
import { LocationPermissionModal } from './components/LocationPermissionModal'
import BottomNavigation from './components/BottomNavigation'
import HomePage from './pages/HomePage'
import QuestBrowsePage from './pages/QuestBrowsePage'
import QuestDetailPage from './pages/QuestDetailPage'
import NavigationPage from './pages/NavigationPage'
import MyQuestsPage from './pages/MyQuestsPage'
import SettingsPage from './pages/SettingsPage'

function OnboardingFlow() {
  const { user, completeOnboarding } = useUser()

  if (!user.interests || user.interests.length === 0) {
    return <InterestSelector onContinue={() => {}} />
  }

  return (
    <LocationPermissionModal
      onComplete={() => {
        completeOnboarding()
      }}
    />
  )
}

function ProtectedRoute({ children }) {
  const { user } = useUser()
  const location = useLocation()

  if (!user.onboardingComplete) {
    return <Navigate to="/onboarding" state={{ from: location }} replace />
  }

  return children
}

function App() {
  const { user } = useUser()

  return (
    <div className="min-h-screen">
      <Routes>
        {/* Onboarding */}
        <Route
          path="/onboarding"
          element={
            user.onboardingComplete ? (
              <Navigate to="/home" replace />
            ) : (
              <OnboardingFlow />
            )
          }
        />

        {/* Home */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />

        {/* Browse */}
        <Route
          path="/browse"
          element={
            <ProtectedRoute>
              <QuestBrowsePage />
            </ProtectedRoute>
          }
        />

        {/* Quest Detail */}
        <Route
          path="/quest/:questId"
          element={
            <ProtectedRoute>
              <QuestDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Navigation */}
        <Route
          path="/quest/:questId/navigate"
          element={
            <ProtectedRoute>
              <NavigationPage />
            </ProtectedRoute>
          }
        />

        {/* My Quests */}
        <Route
          path="/my-quests"
          element={
            <ProtectedRoute>
              <MyQuestsPage />
            </ProtectedRoute>
          }
        />

        {/* Settings */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route
          path="/"
          element={
            <Navigate
              to={user.onboardingComplete ? '/home' : '/onboarding'}
              replace
            />
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <BottomNavigation />
    </div>
  )
}

export default App
