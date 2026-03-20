import type { WorkoutPlan, WorkoutSession, ExerciseLog } from '@/types'

export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((+d - +yearStart) / 86400000 + 1) / 7)
}

export function getTodaysWorkouts(plan: WorkoutPlan): WorkoutPlan['workouts'] {
  const today = new Date()
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const
  const todayName = dayNames[today.getDay()]
  const weekNumber = getWeekNumber(today)
  const maxWeekOffset = plan.workouts.reduce((max, workout) => {
    if (typeof workout.week_offset !== 'number') return max
    return Math.max(max, workout.week_offset)
  }, 0)
  const hasCycleOffsets = maxWeekOffset > 0
  const currentCycleOffset = hasCycleOffsets ? (weekNumber - 1) % (maxWeekOffset + 1) : 0

  return plan.workouts.filter(workout => {
    const matchesDay = workout.day_of_week === todayName
    if (!matchesDay) return false

    if (typeof workout.week_offset !== 'number') {
      return true
    }

    if (!hasCycleOffsets) {
      return true
    }

    return workout.week_offset === currentCycleOffset
  })
}

export function kgToLbs(kg: number): number {
  return Math.round(kg * 2.20462)
}

export function lbsToKg(lbs: number): number {
  return Math.round(lbs / 2.20462)
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }).format(new Date(date))
}

export function formatDateFull(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date))
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function calculateVolumeKg(exercises: ExerciseLog[]): number {
  return exercises.reduce((total, exercise) => {
    const exerciseVolume = exercise.sets
      .filter(set => set.completed)
      .reduce((sum, set) => sum + (set.weight_kg * set.reps), 0)
    return total + exerciseVolume
  }, 0)
}

export function calculateVolumeLbs(exercises: ExerciseLog[]): number {
  return exercises.reduce((total, exercise) => {
    const exerciseVolume = exercise.sets
      .filter(set => set.completed)
      .reduce((sum, set) => sum + (set.weight_lbs * set.reps), 0)
    return total + exerciseVolume
  }, 0)
}

export function getWorkoutDuration(session: WorkoutSession): number {
  if (!session.completed_at) return 0
  const start = new Date(session.started_at).getTime()
  const end = new Date(session.completed_at).getTime()
  return Math.floor((end - start) / 1000)
}

export function convertWeight(value: number, from: 'kg' | 'lbs', to: 'kg' | 'lbs'): number {
  if (from === to) return value
  if (from === 'kg' && to === 'lbs') return kgToLbs(value)
  return lbsToKg(value)
}
