import { z } from 'zod'

export const exerciseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  muscle_group: z.string().optional(),
  sets: z.number().int().positive(),
  target_reps: z.string().min(1),
  rest_seconds: z.number().int().positive().optional(),
  reference_url: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional()
})

export const workoutDaySchema = z.object({
  day_of_week: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
  week_offset: z.number().int().min(0).optional(),
  name: z.string().min(1),
  exercises: z.array(exerciseSchema).min(1)
})

export const workoutPlanSchema = z.object({
  version: z.string(),
  program_name: z.string().min(1),
  description: z.string().optional(),
  workouts: z.array(workoutDaySchema).min(1)
})

export type ValidationResult = 
  | { success: true; data: z.infer<typeof workoutPlanSchema> }
  | { success: false; errors: string[] }

export function validateWorkoutPlan(json: unknown): ValidationResult {
  try {
    const data = workoutPlanSchema.parse(json)
    return { success: true, data }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(e => {
        const path = e.path.length > 0 ? e.path.join('.') : 'root'
        return `${path}: ${e.message}`
      })
      return { success: false, errors }
    }
    return { success: false, errors: ['Invalid JSON format'] }
  }
}