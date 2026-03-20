import { useState, useEffect, useCallback } from 'react'
import { Layout } from './components/layout/Layout'
import { TodaysWorkout } from './components/workout/TodaysWorkout'
import { ActiveWorkout } from './components/workout/ActiveWorkout'
import { ImportScreen } from './components/workout/ImportScreen'
import { HistoryView } from './components/history/HistoryView'
import { SessionDetail } from './components/history/SessionDetail'
import { SettingsScreen } from './components/settings/SettingsScreen'
import { db } from './lib/db'
import type { View, WorkoutDay, WorkoutSession, AppSettings } from './types'
import './index.css'

function App() {
  const [currentView, setCurrentView] = useState<View>('today')
  const [activeWorkout, setActiveWorkout] = useState<{
    workout: WorkoutDay
    planId: string
    planName: string
  } | null>(null)
  const [selectedSession, setSelectedSession] = useState<WorkoutSession | null>(null)
  const [settings, setSettings] = useState<AppSettings | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    const s = await db.getSettings()
    setSettings(s)
  }

  const handleStartWorkout = useCallback((workout: WorkoutDay, planId: string, planName: string) => {
    setActiveWorkout({ workout, planId, planName })
    setCurrentView('active')
  }, [])

  const handleCompleteWorkout = useCallback(() => {
    setActiveWorkout(null)
    setCurrentView('today')
  }, [])

  const handleCancelWorkout = useCallback(() => {
    if (confirm('Are you sure you want to cancel this workout? Your progress will be lost.')) {
      setActiveWorkout(null)
      setCurrentView('today')
    }
  }, [])

  const handleViewSession = useCallback((session: WorkoutSession) => {
    setSelectedSession(session)
    setCurrentView('session-detail')
  }, [])

  const handleBackFromDetail = useCallback(() => {
    setSelectedSession(null)
    setCurrentView('history')
  }, [])

  const handleImportSuccess = useCallback(() => {
    setCurrentView('today')
  }, [])

  const handleDataCleared = useCallback(() => {
    setCurrentView('today')
    window.location.reload()
  }, [])

  const handleNavigate = useCallback((view: View) => {
    if (currentView === 'active' && view !== 'active') {
      if (!confirm('You have an active workout. Leave without saving?')) {
        return
      }
      setActiveWorkout(null)
    }
    setCurrentView(view)
  }, [currentView])

  const renderContent = () => {
    switch (currentView) {
      case 'today':
        return (
          <TodaysWorkout 
            onStartWorkout={handleStartWorkout}
            onNavigate={setCurrentView}
          />
        )
      
      case 'active':
        if (!activeWorkout) {
          setCurrentView('today')
          return null
        }
        return (
          <ActiveWorkout
            workout={activeWorkout.workout}
            planId={activeWorkout.planId}
            planName={activeWorkout.planName}
            onComplete={handleCompleteWorkout}
            onCancel={handleCancelWorkout}
          />
        )
      
      case 'history':
        return (
          <HistoryView
            onViewSession={handleViewSession}
          />
        )
      
      case 'session-detail':
        if (!selectedSession || !settings) {
          setCurrentView('history')
          return null
        }
        return (
          <SessionDetail
            session={selectedSession}
            settings={settings}
            onBack={handleBackFromDetail}
          />
        )
      
      case 'import':
        return (
          <ImportScreen
            onImportSuccess={handleImportSuccess}
          />
        )
      
      case 'settings':
        return (
          <SettingsScreen
            onDataCleared={handleDataCleared}
          />
        )
      
      default:
        return (
          <TodaysWorkout 
            onStartWorkout={handleStartWorkout}
            onNavigate={setCurrentView}
          />
        )
    }
  }

  return (
    <Layout currentView={currentView} onNavigate={handleNavigate}>
      {renderContent()}
    </Layout>
  )
}

export default App
