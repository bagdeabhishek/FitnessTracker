export interface Exercise {
  id: string
  name: string
  muscle_group?: string
  sets: number
  target_reps: string
  starting_weight_kg?: number
  starting_reps?: number
  rest_seconds?: number
  reference_url?: string
  notes?: string
}

export interface WorkoutDay {
  day_of_week: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'
  week_offset?: number
  name: string
  exercises: Exercise[]
}

export interface WorkoutPlan {
  version: string
  program_name: string
  description?: string
  workouts: WorkoutDay[]
}

export interface CompletedSet {
  set_number: number
  weight_kg: number
  weight_lbs: number
  reps: number
  completed: boolean
  timestamp: Date
}

export interface ExerciseLog {
  exercise_id: string
  exercise_name: string
  reference_url?: string
  target_reps: string
  sets: CompletedSet[]
}

export interface WorkoutSession {
  id?: number
  plan_id: string
  program_name: string
  scheduled_day: string
  week_offset: number
  workout_name: string
  started_at: Date
  completed_at?: Date
  exercises: ExerciseLog[]
  notes?: string
}

export type WeightUnit = 'kg' | 'lbs'

export interface AppSettings {
  weight_unit: WeightUnit
  default_rest_seconds: number
  sound_enabled: boolean
}

export type View = 'today' | 'active' | 'history' | 'import' | 'settings' | 'session-detail'
