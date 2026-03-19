import { Dumbbell, History, Upload, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { View } from '@/types'

interface BottomNavProps {
  currentView: View
  onNavigate: (view: View) => void
}

export function BottomNav({ currentView, onNavigate }: BottomNavProps) {
  const navItems: { view: View; label: string; icon: typeof Dumbbell }[] = [
    { view: 'today', label: 'Today', icon: Dumbbell },
    { view: 'history', label: 'History', icon: History },
    { view: 'import', label: 'Import', icon: Upload },
    { view: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-800 border-t border-zinc-200 dark:border-zinc-700 z-50 safe-area-bottom">
      <div className="flex justify-around items-center h-20 max-w-lg mx-auto">
        {navItems.map(({ view, label, icon: Icon }) => (
          <button
            key={view}
            onClick={() => onNavigate(view)}
            className={cn(
              'flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-colors',
              currentView === view
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
            )}
          >
            <Icon className="w-6 h-6 mb-1" strokeWidth={currentView === view ? 2.5 : 2} />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}