import Dexie, { Table } from 'dexie'
import type { WorkoutPlan, WorkoutSession, AppSettings } from '@/types'

export class WorkoutDatabase extends Dexie {
  workoutPlans!: Table<WorkoutPlan & { id: string; imported_at: Date; is_active: number }>
  sessions!: Table<WorkoutSession>
  settings!: Table<AppSettings & { id: number }>

  constructor() {
    super('WorkoutTrackerDB')
    this.version(1).stores({
      workoutPlans: 'id, imported_at, is_active',
      sessions: '++id, started_at, scheduled_day, plan_id',
      settings: '++id'
    })
  }

  async getActivePlan(): Promise<(WorkoutPlan & { id: string }) | undefined> {
    return await this.workoutPlans.where('is_active').equals(1).first()
  }

  async setActivePlan(planId: string): Promise<void> {
    await this.transaction('rw', this.workoutPlans, async () => {
      await this.workoutPlans.toCollection().modify(p => { p.is_active = 0 })
      await this.workoutPlans.update(planId, { is_active: 1 })
    })
  }

  async importPlan(plan: WorkoutPlan): Promise<string> {
    const id = crypto.randomUUID()
    await this.workoutPlans.add({
      ...plan,
      id,
      imported_at: new Date(),
      is_active: 0
    })
    return id
  }

  async getSettings(): Promise<AppSettings> {
    const settings = await this.settings.get(1)
    return settings || { weight_unit: 'kg', default_rest_seconds: 90, sound_enabled: true }
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    await this.settings.put({ ...settings, id: 1 })
  }

  async createSession(session: Omit<WorkoutSession, 'id'>): Promise<number> {
    return (await this.sessions.add(session as WorkoutSession)) as number
  }

  async updateSession(id: number, updates: Partial<WorkoutSession>): Promise<void> {
    await this.sessions.update(id, updates)
  }

  async getSessions(limit?: number): Promise<WorkoutSession[]> {
    let query = this.sessions.orderBy('started_at').reverse()
    if (limit) {
      query = query.limit(limit)
    }
    return await query.toArray()
  }

  async getSession(id: number): Promise<WorkoutSession | undefined> {
    return await this.sessions.get(id)
  }

  async deleteAllData(): Promise<void> {
    await this.transaction('rw', [this.workoutPlans, this.sessions, this.settings], async () => {
      await this.workoutPlans.clear()
      await this.sessions.clear()
      await this.settings.clear()
    })
  }
}

export const db = new WorkoutDatabase()