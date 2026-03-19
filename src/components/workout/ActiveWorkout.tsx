import { useState, useEffect, useCallback } from 'react'
import { Play, Pause, RotateCcw, CheckCircle2, ExternalLink, Plus, Minus, Trash2, Save } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { RestTimer } from './RestTimer'
import { db } from '@/lib/db'
import { formatDuration, calculateVolumeKg, calculateVolumeLbs, convertWeight } from '@/lib/helpers'
import type { WorkoutDay, WorkoutSession, ExerciseLog, CompletedSet, AppSettings } from '@/types'

interface ActiveWorkoutProps {
  workout: WorkoutDay
  planId: string
  planName: string
  onComplete: () => void
  onCancel: () => void
}

export function ActiveWorkout({ workout, planId, planName, onComplete, onCancel }: ActiveWorkoutProps) {
  const [exercises, setExercises] = useState<ExerciseLog[]>([])
  const [startTime] = useState(new Date())
  const [elapsed, setElapsed] = useState(0)
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [restTimer, setRestTimer] = useState<{ isRunning: boolean; duration: number }>({
    isRunning: false,
    duration: 90
  })
  const [notes, setNotes] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadSettings()
    initializeExercises()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime.getTime()) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [startTime])

  const loadSettings = async () => {
    const s = await db.getSettings()
    setSettings(s)
  }

  const initializeExercises = () => {
    const initialExercises: ExerciseLog[] = workout.exercises.map(ex => ({
      exercise_id: ex.id,
      exercise_name: ex.name,
      reference_url: ex.reference_url,
      target_reps: ex.target_reps,
      sets: Array.from({ length: ex.sets }, (_, i) => ({
        set_number: i + 1,
        weight_kg: 0,
        weight_lbs: 0,
        reps: 0,
        completed: false,
        timestamp: new Date()
      }))
    }))
    setExercises(initialExercises)
  }

  const updateSet = (exerciseIndex: number, setIndex: number, updates: Partial<CompletedSet>) => {
    setExercises(prev => {
      const newExercises = [...prev]
      const set = newExercises[exerciseIndex].sets[setIndex]
      newExercises[exerciseIndex].sets[setIndex] = { 
        ...set, 
        ...updates,
        timestamp: new Date()
      }
      return newExercises
    })
  }

  const handleWeightChange = (exerciseIndex: number, setIndex: number, value: string, unit: 'kg' | 'lbs') => {
    const numValue = parseFloat(value) || 0
    const kgValue = unit === 'kg' ? numValue : Math.round(numValue / 2.20462)
    const lbsValue = unit === 'lbs' ? numValue : Math.round(numValue * 2.20462)
    
    updateSet(exerciseIndex, setIndex, { 
      weight_kg: kgValue,
      weight_lbs: lbsValue
    })
  }

  const handleRepsChange = (exerciseIndex: number, setIndex: number, value: string) => {
    const numValue = parseInt(value) || 0
    updateSet(exerciseIndex, setIndex, { reps: numValue })
  }

  const toggleSetComplete = (exerciseIndex: number, setIndex: number) => {
    const exercise = exercises[exerciseIndex]
    const set = exercise.sets[setIndex]
    const newCompleted = !set.completed
    
    updateSet(exerciseIndex, setIndex, { completed: newCompleted })
    
    if (newCompleted) {
      // Start rest timer
      const workoutExercise = workout.exercises[exerciseIndex]
      setRestTimer({
        isRunning: true,
        duration: workoutExercise.rest_seconds || settings?.default_rest_seconds || 90
      })
    }
  }

  const addSet = (exerciseIndex: number) => {
    setExercises(prev => {
      const newExercises = [...prev]
      const exercise = newExercises[exerciseIndex]
      const lastSet = exercise.sets[exercise.sets.length - 1]
      
      exercise.sets.push({
        set_number: exercise.sets.length + 1,
        weight_kg: lastSet?.weight_kg || 0,
        weight_lbs: lastSet?.weight_lbs || 0,
        reps: lastSet?.reps || 0,
        completed: false,
        timestamp: new Date()
      })
      return newExercises
    })
  }

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    setExercises(prev => {
      const newExercises = [...prev]
      newExercises[exerciseIndex].sets.splice(setIndex, 1)
      // Renumber sets
      newExercises[exerciseIndex].sets.forEach((set, i) => {
        set.set_number = i + 1
      })
      return newExercises
    })
  }

  const adjustWeight = (exerciseIndex: number, setIndex: number, delta: number) => {
    const set = exercises[exerciseIndex].sets[setIndex]
    const currentWeight = settings?.weight_unit === 'lbs' ? set.weight_lbs : set.weight_kg
    const newWeight = Math.max(0, currentWeight + delta)
    handleWeightChange(exerciseIndex, setIndex, newWeight.toString(), settings?.weight_unit || 'kg')
  }

  const adjustReps = (exerciseIndex: number, setIndex: number, delta: number) => {
    const set = exercises[exerciseIndex].sets[setIndex]
    const newReps = Math.max(0, set.reps + delta)
    handleRepsChange(exerciseIndex, setIndex, newReps.toString())
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const session: Omit<WorkoutSession, 'id'> = {
        plan_id: planId,
        program_name: planName,
        scheduled_day: workout.day_of_week,
        week_offset: workout.week_offset || 0,
        workout_name: workout.name,
        started_at: startTime,
        completed_at: new Date(),
        exercises,
        notes
      }
      
      await db.createSession(session)
      onComplete()
    } catch (error) {
      console.error('Error saving workout:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const completedSets = exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0)
  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets.length, 0)
  const volumeKg = calculateVolumeKg(exercises)
  const volumeLbs = calculateVolumeLbs(exercises)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="sticky top-16 z-30 -mx-4 px-4 py-3 bg-zinc-50/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">{workout.name}</h2>
            <p className="text-sm text-primary-600 dark:text-primary-400">
              {completedSets}/{totalSets} sets • {formatDuration(elapsed)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              size="sm" 
              onClick={handleSave}
              disabled={isSaving || completedSets === 0}
            >
              {isSaving ? 'Saving...' : <><Save className="w-4 h-4 mr-2" />Finish</>}
            </Button>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3 w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-primary-500 to-primary-400 h-full rounded-full transition-all duration-300"
            style={{ width: `${(completedSets / totalSets) * 100}%` }}
          />
        </div>
      </div>

      {/* Exercises */}
      <div className="space-y-4">
        {exercises.map((exercise, exerciseIndex) => {
          const workoutExercise = workout.exercises[exerciseIndex]
          const completedCount = exercise.sets.filter(s => s.completed).length
          
          return (
            <Card key={exercise.exercise_id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{exercise.exercise_name}</CardTitle>
                    <div className="flex items-center gap-3 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        Target: {exercise.target_reps}
                      </Badge>
                      {workoutExercise.muscle_group && (
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          {workoutExercise.muscle_group}
                        </span>
                      )}
                    </div>
                  </div>
                  {exercise.reference_url && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="shrink-0"
                      onClick={() => window.open(exercise.reference_url, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Sets */}
                <div className="space-y-2">
                  {exercise.sets.map((set, setIndex) => (
                    <div 
                      key={setIndex}
                      className={`flex items-center gap-2 p-3 rounded-xl transition-colors ${
                        set.completed 
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' 
                          : 'bg-zinc-50 dark:bg-zinc-800/50'
                      }`}
                    >
                      <span className="w-8 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                        {set.set_number}
                      </span>
                      
                      {/* Weight */}
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10"
                          onClick={() => adjustWeight(exerciseIndex, setIndex, settings?.weight_unit === 'lbs' ? -5 : -2.5)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <div className="relative">
                          <Input
                            type="number"
                            value={settings?.weight_unit === 'lbs' ? set.weight_lbs || '' : set.weight_kg || ''}
                            onChange={(e) => handleWeightChange(exerciseIndex, setIndex, e.target.value, settings?.weight_unit || 'kg')}
                            className="w-20 h-10 text-center"
                            placeholder="0"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-400">
                            {settings?.weight_unit || 'kg'}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10"
                          onClick={() => adjustWeight(exerciseIndex, setIndex, settings?.weight_unit === 'lbs' ? 5 : 2.5)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <span className="text-zinc-400">×</span>
                      
                      {/* Reps */}
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10"
                          onClick={() => adjustReps(exerciseIndex, setIndex, -1)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <Input
                          type="number"
                          value={set.reps || ''}
                          onChange={(e) => handleRepsChange(exerciseIndex, setIndex, e.target.value)}
                          className="w-16 h-10 text-center"
                          placeholder="0"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10"
                          onClick={() => adjustReps(exerciseIndex, setIndex, 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {/* Complete checkbox */}
                      <Checkbox
                        checked={set.completed}
                        onCheckedChange={() => toggleSetComplete(exerciseIndex, setIndex)}
                        className="ml-auto"
                      />
                      
                      {/* Delete set button (only for bonus sets) */}
                      {setIndex >= workoutExercise.sets && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 text-red-500 hover:text-red-600"
                          onClick={() => removeSet(exerciseIndex, setIndex)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Add set button */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full"
                  onClick={() => addSet(exerciseIndex)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Set
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Workout Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How did the workout feel? Any observations?"
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>

      {/* Volume summary */}
      <Card className="bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-primary-900 dark:text-primary-300">Total Volume</span>
            <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {settings?.weight_unit === 'lbs' 
                ? `${volumeLbs.toLocaleString()} lbs` 
                : `${volumeKg.toLocaleString()} kg`}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Rest Timer */}
      <RestTimer
        duration={restTimer.duration}
        isRunning={restTimer.isRunning}
        onComplete={() => setRestTimer({ ...restTimer, isRunning: false })}
        onSkip={() => setRestTimer({ ...restTimer, isRunning: false })}
      />
    </div>
  )
}