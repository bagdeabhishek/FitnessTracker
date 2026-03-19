import { useState, useEffect } from 'react'
import { Settings, Volume2, VolumeX, Trash2, Download, Moon, Weight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { db } from '@/lib/db'
import type { AppSettings } from '@/types'

interface SettingsScreenProps {
  onDataCleared: () => void
}

export function SettingsScreen({ onDataCleared }: SettingsScreenProps) {
  const [settings, setSettings] = useState<AppSettings>({
    weight_unit: 'kg',
    default_rest_seconds: 90,
    sound_enabled: true
  })
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    loadSettings()
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  const loadSettings = async () => {
    const s = await db.getSettings()
    setSettings(s)
  }

  const updateSettings = async (updates: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...updates }
    setSettings(newSettings)
    await db.saveSettings(newSettings)
  }

  const toggleDarkMode = () => {
    const newDark = !isDark
    setIsDark(newDark)
    if (newDark) {
      document.documentElement.classList.add('dark')
      localStorage.theme = 'dark'
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.theme = 'light'
    }
  }

  const clearAllData = async () => {
    if (!confirm('WARNING: This will delete ALL data including workout plans and history. This cannot be undone. Are you sure?')) {
      return
    }
    await db.deleteAllData()
    onDataCleared()
  }

  const exportData = async () => {
    const plans = await db.workoutPlans.toArray()
    const sessions = await db.sessions.toArray()
    const data = {
      exportDate: new Date().toISOString(),
      plans,
      sessions,
      settings
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `workout-tracker-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Settings</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mt-1">Customize your workout tracker</p>
      </div>

      {/* Units */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Weight className="w-5 h-5 text-primary-500" />
            Weight Unit
          </CardTitle>
          <CardDescription>Choose your preferred weight unit</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {(['kg', 'lbs'] as const).map((unit) => (
              <button
                key={unit}
                onClick={() => updateSettings({ weight_unit: unit })}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
                  settings.weight_unit === unit
                    ? 'bg-primary-600 text-white'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {unit.toUpperCase()}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rest Timer */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Rest Timer</CardTitle>
          <CardDescription>Default rest duration between sets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2">
            {[30, 60, 90, 120, 150, 180, 240, 300].map((seconds) => (
              <button
                key={seconds}
                onClick={() => updateSettings({ default_rest_seconds: seconds })}
                className={`py-3 px-2 rounded-xl text-sm font-medium transition-colors ${
                  settings.default_rest_seconds === seconds
                    ? 'bg-primary-600 text-white'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {seconds}s
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sound */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            {settings.sound_enabled ? <Volume2 className="w-5 h-5 text-primary-500" /> : <VolumeX className="w-5 h-5" />}
            Sound
          </CardTitle>
          <CardDescription>Play sound when rest timer completes</CardDescription>
        </CardHeader>
        <CardContent>
          <button
            onClick={() => updateSettings({ sound_enabled: !settings.sound_enabled })}
            className={`w-full py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
              settings.sound_enabled
                ? 'bg-primary-600 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
            }`}
          >
            {settings.sound_enabled ? 'Enabled' : 'Disabled'}
          </button>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Moon className="w-5 h-5 text-primary-500" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <button
            onClick={toggleDarkMode}
            className="w-full py-3 px-4 rounded-xl font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            {isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          </button>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={exportData}
          >
            <Download className="w-4 h-4 mr-2" />
            Export All Data
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            onClick={clearAllData}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All Data
          </Button>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardContent className="py-4 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Workout Tracker v1.0.0
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
            Built with React + Dexie.js
          </p>
        </CardContent>
      </Card>
    </div>
  )
}