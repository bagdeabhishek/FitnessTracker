import { ArrowLeft, Calendar, Clock, Dumbbell, TrendingUp, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDateFull, formatDuration, calculateVolumeKg, calculateVolumeLbs, getWorkoutDuration } from '@/lib/helpers'
import type { WorkoutSession, AppSettings } from '@/types'

interface SessionDetailProps {
  session: WorkoutSession
  settings: AppSettings
  onBack: () => void
}

export function SessionDetail({ session, settings, onBack }: SessionDetailProps) {
  const duration = getWorkoutDuration(session)
  const volumeKg = calculateVolumeKg(session.exercises)
  const volumeLbs = calculateVolumeLbs(session.exercises)
  const completedSets = session.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0)
  const totalSets = session.exercises.reduce((acc, ex) => acc + ex.sets.length, 0)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Workout Details</h2>
        </div>
      </div>

      {/* Summary Card */}
      <Card className="bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{session.workout_name}</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{session.program_name}</p>
            </div>
            {session.week_offset === 1 && (
              <Badge variant="outline">Week 2</Badge>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              <span className="text-zinc-700 dark:text-zinc-300">{formatDateFull(session.started_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              <span className="text-zinc-700 dark:text-zinc-300">{formatDuration(duration)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              <span className="text-zinc-700 dark:text-zinc-300">{completedSets}/{totalSets} sets</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              <span className="text-zinc-700 dark:text-zinc-300">
                {settings.weight_unit === 'lbs' 
                  ? `${volumeLbs.toLocaleString()} lbs`
                  : `${volumeKg.toLocaleString()} kg`}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {session.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">{session.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Exercises */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Exercises</h3>
        
        {session.exercises.map((exercise) => {
          const completedCount = exercise.sets.filter(s => s.completed).length
          const exerciseVolumeKg = exercise.sets
            .filter(s => s.completed)
            .reduce((acc, s) => acc + (s.weight_kg * s.reps), 0)
          const exerciseVolumeLbs = exercise.sets
            .filter(s => s.completed)
            .reduce((acc, s) => acc + (s.weight_lbs * s.reps), 0)

          return (
            <Card key={exercise.exercise_id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{exercise.exercise_name}</CardTitle>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      Target: {exercise.target_reps} • {completedCount}/{exercise.sets.length} sets completed
                    </p>
                  </div>
                  {exercise.reference_url && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => window.open(exercise.reference_url, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {/* Sets table */}
                <div className="space-y-2">
                  {exercise.sets.map((set) => (
                    <div 
                      key={set.set_number}
                      className={`flex items-center justify-between p-3 rounded-xl ${
                        set.completed 
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' 
                          : 'bg-zinc-50 dark:bg-zinc-800/50'
                      }`}
                    >
                      <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 w-8">
                        Set {set.set_number}
                      </span>
                      
                      {set.completed ? (
                        <div className="flex items-center gap-4">
                          <span className="text-zinc-700 dark:text-zinc-300">
                            {settings.weight_unit === 'lbs' ? set.weight_lbs : set.weight_kg}
                            {settings.weight_unit} × {set.reps} reps
                          </span>
                          <Badge variant="secondary" className="text-xs">Done</Badge>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-xs">Not completed</Badge>
                      )}
                    </div>
                  ))}
                </div>

                {/* Exercise volume */}
                {exerciseVolumeKg > 0 && (
                  <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 text-right">
                      Volume: {settings.weight_unit === 'lbs' 
                        ? `${exerciseVolumeLbs.toLocaleString()} lbs`
                        : `${exerciseVolumeKg.toLocaleString()} kg`}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}