import { Moon, Sun } from 'lucide-react'
import { useState, useEffect } from 'react'

export function Header() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

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

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-lg mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <img
            src="/brand/reppilot-lockup-horizontal-on-light.png"
            alt="RepPilot"
            className="h-9 w-auto dark:hidden"
          />
          <img
            src="/brand/reppilot-lockup-horizontal-on-dark.png"
            alt="RepPilot"
            className="h-9 w-auto hidden dark:block"
          />
        </div>
        
        <button
          onClick={toggleDarkMode}
          className="p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors"
          aria-label="Toggle dark mode"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </header>
  )
}
