import { useState } from 'react'
import { Upload, CheckCircle, XCircle, FileJson, AlertCircle, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { validateWorkoutPlan, type ValidationResult } from '@/lib/validation'
import { db } from '@/lib/db'
import { cn } from '@/lib/utils'

const aiPromptTemplate = `Generate a workout plan in strict JSON only (no markdown, no explanation).

Use this schema exactly:
{
  "version": "1.0",
  "program_name": "string",
  "description": "string (optional)",
  "workouts": [
    {
      "day_of_week": "Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday",
      "week_offset": 0,
      "name": "string",
      "exercises": [
        {
          "id": "kebab-case-string",
          "name": "string",
          "muscle_group": "string (optional)",
          "sets": number,
          "target_reps": "string like '8-12' or '5'",
          "starting_weight_kg": number (optional),
          "starting_reps": number (optional),
          "rest_seconds": number (optional),
          "reference_url": "https://... (optional)",
          "notes": "string (optional)"
        }
      ]
    }
  ]
}

Rules:
- Output valid parseable JSON object only.
- For normal weekly plans, omit week_offset entirely.
- Use week_offset only for cycling plans (for example 0 and 1 for alternating weeks).
- Use realistic exercises, sets, reps, and rest times.
- Include 3-6 exercises per workout day.
- IDs must be unique lowercase kebab-case.
- Do not include fields outside the schema.

User preferences:
- Goal: [FAT LOSS | HYPERTROPHY | STRENGTH | GENERAL FITNESS]
- Experience level: [BEGINNER | INTERMEDIATE | ADVANCED]
- Days per week: [NUMBER]
- Available equipment: [HOME DUMBBELLS | FULL GYM | BODYWEIGHT | CUSTOM]
- Session duration minutes: [NUMBER]
- Injuries or limitations: [NONE OR DETAILS]
- Biweekly variation needed: [TRUE | FALSE]`

interface ImportScreenProps {
  onImportSuccess: () => void
}

export function ImportScreen({ onImportSuccess }: ImportScreenProps) {
  const [jsonInput, setJsonInput] = useState('')
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [isPromptCopied, setIsPromptCopied] = useState(false)

  const handleValidate = () => {
    try {
      const parsed = JSON.parse(jsonInput)
      const result = validateWorkoutPlan(parsed)
      setValidation(result)
    } catch {
      setValidation({ success: false, errors: ['Invalid JSON format'] })
    }
  }

  const handleImport = async () => {
    if (!validation?.success) return
    
    setIsImporting(true)
    try {
      const planId = await db.importPlan(validation.data)
      await db.setActivePlan(planId)
      setJsonInput('')
      setValidation(null)
      onImportSuccess()
    } catch (error) {
      console.error('Import error:', error)
    } finally {
      setIsImporting(false)
    }
  }

  const loadSample = () => {
    const sample = {
      "version": "1.0",
      "program_name": "Beginner Full Body",
      "description": "3-day full body routine for beginners",
      "workouts": [
        {
          "day_of_week": "Monday",
          "name": "Workout A",
          "exercises": [
            {
              "id": "squat",
              "name": "Barbell Squat",
              "muscle_group": "Legs",
              "sets": 3,
              "target_reps": "8-10",
              "starting_weight_kg": 40,
              "starting_reps": 8,
              "rest_seconds": 180,
              "reference_url": "https://exrx.net/WeightExercises/Quadriceps/BBFullSquat",
              "notes": "Keep chest up, break parallel"
            },
            {
              "id": "bench-press",
              "name": "Bench Press",
              "muscle_group": "Chest",
              "sets": 3,
              "target_reps": "8-10",
              "starting_weight_kg": 30,
              "starting_reps": 8,
              "rest_seconds": 120,
              "reference_url": "https://exrx.net/WeightExercises/PectoralSternal/BBBenchPress"
            },
            {
              "id": "barbell-row",
              "name": "Barbell Row",
              "muscle_group": "Back",
              "sets": 3,
              "target_reps": "8-10",
              "starting_weight_kg": 25,
              "starting_reps": 10,
              "rest_seconds": 120
            }
          ]
        },
        {
          "day_of_week": "Wednesday",
          "name": "Workout B",
          "exercises": [
            {
              "id": "deadlift",
              "name": "Deadlift",
              "muscle_group": "Back",
              "sets": 3,
              "target_reps": "5",
              "rest_seconds": 240,
              "reference_url": "https://exrx.net/WeightExercises/ErectorSpinae/BBDeadlift"
            },
            {
              "id": "overhead-press",
              "name": "Overhead Press",
              "muscle_group": "Shoulders",
              "sets": 3,
              "target_reps": "8-10",
              "rest_seconds": 120
            },
            {
              "id": "lat-pulldown",
              "name": "Lat Pulldown",
              "muscle_group": "Back",
              "sets": 3,
              "target_reps": "10-12",
              "rest_seconds": 90
            }
          ]
        },
        {
          "day_of_week": "Friday",
          "name": "Workout C",
          "exercises": [
            {
              "id": "leg-press",
              "name": "Leg Press",
              "muscle_group": "Legs",
              "sets": 3,
              "target_reps": "10-12",
              "rest_seconds": 120
            },
            {
              "id": "incline-bench",
              "name": "Incline Bench Press",
              "muscle_group": "Chest",
              "sets": 3,
              "target_reps": "8-10",
              "rest_seconds": 120
            },
            {
              "id": "face-pulls",
              "name": "Face Pulls",
              "muscle_group": "Shoulders",
              "sets": 3,
              "target_reps": "12-15",
              "rest_seconds": 60
            }
          ]
        }
      ]
    }
    setJsonInput(JSON.stringify(sample, null, 2))
    setValidation(null)
  }

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(aiPromptTemplate)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = aiPromptTemplate
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.focus()
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }

    setIsPromptCopied(true)
    window.setTimeout(() => setIsPromptCopied(false), 1500)
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Import Workout Plan</h2>
        <p className="text-zinc-600 dark:text-zinc-400">Paste your workout plan JSON below</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileJson className="w-5 h-5 text-primary-500" />
            Workout Plan JSON
          </CardTitle>
          <CardDescription>
            Paste the JSON configuration for your workout program
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder={`{\n  "version": "1.0",\n  "program_name": "My Plan",\n  "workouts": [...]\n}`}
            className="font-mono text-sm min-h-[250px]"
          />

          <div className="flex gap-2">
            <Button 
              onClick={handleValidate}
              variant="outline"
              className="flex-1"
            >
              Validate
            </Button>
            <Button 
              onClick={loadSample}
              variant="ghost"
            >
              Load Sample
            </Button>
          </div>

          {validation && (
            <div className={cn(
              "rounded-xl p-4 border",
              validation.success 
                ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800" 
                : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
            )}>
              <div className="flex items-start gap-3">
                {validation.success ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                )}
                <div className="flex-1">
                  <h4 className={cn(
                    "font-semibold",
                    validation.success 
                      ? "text-emerald-900 dark:text-emerald-300" 
                      : "text-red-900 dark:text-red-300"
                  )}>
                    {validation.success ? 'Valid Workout Plan' : 'Validation Errors'}
                  </h4>
                  
                  {validation.success ? (
                    <div className="mt-2 space-y-1 text-sm text-emerald-800 dark:text-emerald-200">
                      <p><strong>Program:</strong> {validation.data.program_name}</p>
                      <p><strong>Workouts:</strong> {validation.data.workouts.length} days</p>
                      <p><strong>Total Exercises:</strong> {validation.data.workouts.reduce((acc, w) => acc + w.exercises.length, 0)}</p>
                    </div>
                  ) : (
                    <ul className="mt-2 space-y-1 text-sm text-red-800 dark:text-red-200">
                      {validation.errors.map((error, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                          {error}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          {validation?.success && (
            <Button 
              onClick={handleImport}
              disabled={isImporting}
              className="w-full"
            >
              {isImporting ? (
                'Importing...'
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  Import Plan
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">AI Generator Prompt</CardTitle>
          <CardDescription>
            Copy this prompt, customize placeholders, generate JSON with your AI tool, then paste above.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={aiPromptTemplate}
            readOnly
            className="font-mono text-xs min-h-[280px]"
          />
          <Button onClick={handleCopyPrompt} variant="outline" className="w-full">
            {isPromptCopied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy Prompt Template
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">JSON Schema</CardTitle>
          <CardDescription>Reference for creating your workout plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-2 text-zinc-600 dark:text-zinc-400">
            <p><Badge variant="secondary" className="mr-2">Required</Badge>version, program_name, workouts</p>
            <p><Badge variant="outline" className="mr-2">Optional</Badge>description, week_offset, starting_weight_kg, starting_reps, reference_url</p>
            <div className="mt-4 p-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg font-mono text-xs">
              <p className="text-zinc-500">// Simple weekly schedule</p>
              <p>{"{ day_of_week: \"Monday\", name: \"Push\", exercises: [...] } // no week_offset"}</p>
              <p className="text-zinc-500 mt-2">// First-time defaults (used before previous logs exist)</p>
              <p>{"{ id: \"bench-press\", sets: 3, target_reps: \"8-10\", starting_weight_kg: 30, starting_reps: 8 }"}</p>
              <p className="mt-2 text-zinc-500">// Biweekly schedule (Week 2)</p>
              <p>{"{ day_of_week: \"Monday\", week_offset: 1, name: \"Push B\", ... }"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
