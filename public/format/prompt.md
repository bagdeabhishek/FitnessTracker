# Workout Tracker Prompt Guide

Use this file as the single source of truth when generating plans with any AI tool.

## What the model must return

- Return JSON only.
- Do not wrap output in markdown.
- Output must parse as one JSON object.
- Follow the format exactly.

## JSON format (v1.0)

```json
{
  "version": "1.0",
  "program_name": "Program name",
  "description": "Optional description",
  "workouts": [
    {
      "day_of_week": "Monday",
      "name": "Workout name",
      "week_offset": 1,
      "exercises": [
        {
          "id": "barbell-bench-press",
          "name": "Barbell Bench Press",
          "muscle_group": "Chest",
          "sets": 3,
          "target_reps": "8-12",
          "starting_weight_kg": 30,
          "starting_reps": 8,
          "rest_seconds": 90,
          "reference_url": "https://example.com/exercise",
          "notes": "Optional coaching cue"
        }
      ]
    }
  ]
}
```

## Field rules

- `version` required string.
- `program_name` required string.
- `workouts` required array with at least one workout.
- `day_of_week` required enum: Monday..Sunday.
- `name` required string for each workout.
- `exercises` required array with at least one exercise.
- `id` required lowercase kebab-case and unique per exercise in plan.
- `sets` required positive integer.
- `target_reps` required string like `"5"` or `"8-12"`.
- `starting_weight_kg` optional number >= 0.
- `starting_reps` optional integer > 0.
- `rest_seconds` optional integer > 0.
- `reference_url` optional valid URL.

## Scheduling rules

- Weekly plans: omit `week_offset`.
- Alternating plans: use `week_offset` values (e.g. `0` and `1`).

## App behavior

- Starting values come from JSON on first run.
- On later sessions, weight/reps are prefilled from the latest logged session for the same `exercise_id`.

## Minimal user prompt template

Copy this and replace placeholders:

```text
Create my workout plan JSON.

Follow instructions at:
https://fitness.abhishekdoesstuff.com/format/prompt

Output requirements:
- JSON only (no markdown)
- Must parse successfully

Details:
- Goal: [FAT LOSS | HYPERTROPHY | STRENGTH | GENERAL FITNESS]
- Experience level: [BEGINNER | INTERMEDIATE | ADVANCED]
- Days per week: [NUMBER]
- Available equipment: [HOME DUMBBELLS | FULL GYM | BODYWEIGHT | CUSTOM]
- Session duration minutes: [NUMBER]
- Injuries or limitations: [NONE OR DETAILS]
- Biweekly variation needed: [TRUE | FALSE]
```
