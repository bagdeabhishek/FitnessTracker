import { useState, useEffect } from 'react'
import { Dumbbell, Calendar, Clock, Play, RotateCcw, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { db } from '@/lib/db'
import { getTodaysWorkouts, getWeekNumber, formatDate } from '@/lib/helpers'
import { usePWAInstall } from '@/hooks/usePWAInstall'
import type { WorkoutPlan, WorkoutDay, View } from '@/types'

interface TodaysWorkoutProps {
  onStartWorkout: (workout: WorkoutDay, planId: string, planName: string) => void
  onNavigate: (view: View) => void
}

export function TodaysWorkout({ onStartWorkout, onNavigate }: TodaysWorkoutProps) {
  const [activePlan, setActivePlan] = useState<(WorkoutPlan & { id: string }) | null>(null)
  const [todayWorkouts, setTodayWorkouts] = useState<WorkoutDay[]>([])
  const [loading, setLoading] = useState(true)
  const [weekNumber, setWeekNumber] = useState(1)
  const { isInstallable, isInstalled, isIOS, promptInstall } = usePWAInstall()
  const showInstallCard = !isInstalled && (isInstallable || isIOS)

  const renderInstallCard = (compact = false) => {
    if (!showInstallCard) return null

    if (compact) {
      return (
        <Card className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-primary-200 dark:border-primary-800">
          <CardContent className="flex flex-row items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center">
                <Download className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-white">Install App</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {isInstallable ? 'Add to home screen' : 'Safari: Share > Add to Home Screen'}
                </p>
              </div>
            </div>
            {isInstallable ? (
              <Button size="sm" onClick={promptInstall}>
                Install
              </Button>
            ) : (
              <Button size="sm" variant="outline" disabled>
                iOS Steps
              </Button>
            )}
          </CardContent>
        </Card>
      )
    }

    return (
      <Card className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-primary-200 dark:border-primary-800">
        <CardContent className="flex flex-col items-center justify-center py-6 text-center">
          <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center mb-3">
            <Download className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">Install App</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 max-w-xs">
            {isInstallable
              ? 'Add Workout Tracker to your home screen for quick access'
              : 'On iPhone: open in Safari, tap Share, then Add to Home Screen'}
          </p>
          {isInstallable ? (
            <Button onClick={promptInstall} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Add to Home Screen
            </Button>
          ) : (
            <Button variant="outline" className="w-full" disabled>
              Safari Share Menu Required
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  useEffect(() => {
    loadData()
    setWeekNumber(getWeekNumber(new Date()))
  }, [])

  const loadData = async () => {
    const plan = await db.getActivePlan()
    setActivePlan(plan || null)
    if (plan) {
      const workouts = getTodaysWorkouts(plan)
      setTodayWorkouts(workouts)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!activePlan) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Welcome!</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">{formatDate(new Date())}</p>
        </div>

        {renderInstallCard()}

        <Card className="border-dashed border-2 border-zinc-300 dark:border-zinc-600">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
              <Dumbbell className="w-8 h-8 text-zinc-400" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">No Workout Plan</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 max-w-xs">
              Import a workout plan to get started with tracking your exercises
            </p>
            <Button onClick={() => onNavigate('import')}>
              Import Plan
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (todayWorkouts.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Rest Day</h2>
            <p className="text-zinc-600 dark:text-zinc-400 mt-1">{formatDate(new Date())}</p>
          </div>
          <Badge variant="secondary">Week {weekNumber % 2 === 1 ? '1' : '2'}</Badge>
        </div>

        {renderInstallCard(true)}

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">No Workout Today</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
              Enjoy your rest day! Your next workout is scheduled soon.
            </p>
            <Button variant="outline" onClick={() => onNavigate('history')}>
              View History
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-zinc-900 dark:text-white">{activePlan.program_name}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {activePlan.workouts.length} workouts per cycle
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onNavigate('import')}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Change
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Today's Workout</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">{formatDate(new Date())}</p>
        </div>
        <Badge variant="secondary">Week {weekNumber % 2 === 1 ? '1' : '2'}</Badge>
      </div>

      {renderInstallCard(true)}

      {todayWorkouts.map((workout, index) => (
        <Card key={index} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl">{workout.name}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <span>{workout.exercises.length} exercises</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    ~{Math.round(workout.exercises.reduce((acc, ex) => acc + (ex.rest_seconds || 90) * ex.sets, 0) / 60)} min
                  </span>
                </CardDescription>
              </div>
              {workout.week_offset === 1 && (
                <Badge variant="outline">Week 2</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              {workout.exercises.slice(0, 3).map((exercise) => (
                <div key={exercise.id} className="flex items-center justify-between text-sm">
                  <span className="text-zinc-700 dark:text-zinc-300">{exercise.name}</span>
                  <span className="text-zinc-500 dark:text-zinc-400">
                    {exercise.sets} × {exercise.target_reps}
                  </span>
                </div>
              ))}
              {workout.exercises.length > 3 && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  +{workout.exercises.length - 3} more exercises
                </p>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button 
                onClick={() => onStartWorkout(workout, activePlan.id, activePlan.program_name)}
                className="flex-1"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Workout
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {todayWorkouts.length > 1 && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
          Multiple workouts scheduled today. Choose one to start.
        </p>
      )}
    </div>
  )
}
