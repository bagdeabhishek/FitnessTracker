import { useState, useEffect, useCallback } from 'react'
import { Play, Pause, SkipForward, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface RestTimerProps {
  duration: number
  isRunning: boolean
  onComplete: () => void
  onSkip: () => void
}

export function RestTimer({ duration, isRunning, onComplete, onSkip }: RestTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [isPaused, setIsPaused] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)

  useEffect(() => {
    if (isRunning) {
      setTimeLeft(duration)
      setIsPaused(false)
    }
  }, [isRunning, duration])

  useEffect(() => {
    if (!isRunning || isPaused) return

    if (timeLeft <= 0) {
      if (soundEnabled) {
        playBeep()
      }
      onComplete()
      return
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, timeLeft, isPaused, onComplete, soundEnabled])

  const playBeep = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    } catch (e) {
      console.error('Audio play failed:', e)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progress = ((duration - timeLeft) / duration) * 100

  if (!isRunning) return null

  return (
    <div className="fixed inset-x-0 bottom-24 z-50 mx-4">
      <div className="bg-zinc-900 dark:bg-black rounded-2xl shadow-2xl border border-zinc-700 p-4 max-w-md mx-auto">
        <div className="flex items-center justify-between mb-3">
          <span className="text-white font-semibold text-lg">Rest Timer</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <span className={cn(
              "text-4xl font-bold font-mono",
              timeLeft <= 10 ? "text-red-400" : "text-primary-400"
            )}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
        
        <div className="w-full bg-zinc-700 rounded-full h-3 mb-4 overflow-hidden">
          <div 
            className={cn(
              "h-full rounded-full transition-all duration-1000",
              timeLeft <= 10 ? "bg-red-500" : "bg-gradient-to-r from-primary-500 to-primary-400"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => setIsPaused(!isPaused)}
            variant="secondary"
            className="flex-1 h-12"
          >
            {isPaused ? <><Play className="w-5 h-5 mr-2" /> Resume</> : <><Pause className="w-5 h-5 mr-2" /> Pause</>}
          </Button>
          <Button
            onClick={onSkip}
            variant="ghost"
            className="flex-1 h-12 text-white hover:text-white hover:bg-zinc-800"
          >
            <SkipForward className="w-5 h-5 mr-2" />
            Skip
          </Button>
        </div>

        {/* Quick add time buttons */}
        <div className="flex gap-2 mt-3 pt-3 border-t border-zinc-700">
          {[15, 30, 60].map((seconds) => (
            <button
              key={seconds}
              onClick={() => setTimeLeft((prev) => prev + seconds)}
              className="flex-1 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            >
              +{seconds}s
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}