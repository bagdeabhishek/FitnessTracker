import { useState, useEffect } from 'react'
import { History, ChevronRight, Calendar, Clock, Dumbbell, TrendingUp, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { db } from '@/lib/db'
import { formatDate, formatDuration, calculateVolumeKg, calculateVolumeLbs, getWorkoutDuration } from '@/lib/helpers'
import type { WorkoutSession, AppSettings } from '@/types'

interface HistoryViewProps {
  onViewSession: (session: WorkoutSession) => void
}

export function HistoryView({ onViewSession }: HistoryViewProps) {
  const [sessions, setSessions] = useState<WorkoutSession[]>([])
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [filter, setFilter] = useState<'all' | '7' | '30' | '90'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [filter])

  const loadData = async () => {
    const allSessions = await db.getSessions()
    const s = await db.getSettings()
    setSettings(s)
    
    let filtered = allSessions
    if (filter !== 'all') {
      const days = parseInt(filter)
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - days)
      filtered = allSessions.filter(session => new Date(session.started_at) >= cutoff)
    }
    
    setSessions(filtered)
    setLoading(false)
  }

  const clearAllHistory = async () => {
    if (!confirm('Are you sure you want to delete ALL workout history? This cannot be undone.')) return
    await db.sessions.clear()
    loadData()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Workout History</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">Track your progress over time</p>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
              <History className="w-8 h-8 text-zinc-400" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">No Workouts Yet</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs">
              Complete your first workout to see it here
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Workout History</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mt-1">{sessions.length} workouts logged</p>
      </div>

      {/* Filter buttons */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { value: 'all', label: 'All Time' },
          { value: '7', label: 'Last 7 Days' },
          { value: '30', label: 'Last 30 Days' },
          { value: '90', label: 'Last 90 Days' },
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value as any)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === option.value
                ? 'bg-primary-600 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Stats summary */}
      <Card className="bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
        <CardContent className="py-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{sessions.length}</p>
              <p className="text-xs text-primary-800 dark:text-primary-300">Workouts</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {Math.round(sessions.reduce((acc, s) => acc + getWorkoutDuration(s), 0) / 60)}
              </p>
              <p className="text-xs text-primary-800 dark:text-primary-300">Minutes</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {settings?.weight_unit === 'lbs'
                  ? Math.round(sessions.reduce((acc, s) => acc + calculateVolumeLbs(s.exercises), 0) / 1000)
                  : Math.round(sessions.reduce((acc, s) => acc + calculateVolumeKg(s.exercises), 0) / 1000)}
              </p>
              <p className="text-xs text-primary-800 dark:text-primary-300">
                k{settings?.weight_unit === 'lbs' ? 'lbs' : 'g'} Volume
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions list */}
      <div className="space-y-3">
        {sessions.map((session) => {
          const duration = getWorkoutDuration(session)
          const volumeKg = calculateVolumeKg(session.exercises)
          const volumeLbs = calculateVolumeLbs(session.exercises)
          const completedSets = session.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0)
          const totalSets = session.exercises.reduce((acc, ex) => acc + ex.sets.length, 0)

          return (
            <Card 
              key={session.id} 
              className="overflow-hidden cursor-pointer hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
              onClick={() => onViewSession(session)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-zinc-400" />
                      <span className="font-semibold text-zinc-900 dark:text-white">
                        {formatDate(session.started_at)}
                      </span>
                      {session.week_offset === 1 && (
                        <Badge variant="outline" className="text-xs">Week 2</Badge>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">
                      {session.workout_name}
                    </h3>
                    
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
                      {session.program_name}
                    </p>

                    <div className="flex flex-wrap gap-3 text-sm">
                      <span className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
                        <Clock className="w-4 h-4" />
                        {formatDuration(duration)}
                      </span>
                      <span className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
                        <Dumbbell className="w-4 h-4" />
                        {completedSets}/{totalSets} sets
                      </span>
                      <span className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
                        <TrendingUp className="w-4 h-4" />
                        {settings?.weight_unit === 'lbs' 
                          ? `${volumeLbs.toLocaleString()} lbs`
                          : `${volumeKg.toLocaleString()} kg`}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <ChevronRight className="w-5 h-5 text-zinc-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Clear history button */}
      <Button 
        variant="ghost" 
        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
        onClick={clearAllHistory}
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Clear All History
      </Button>
    </div>
  )
}