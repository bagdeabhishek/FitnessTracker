import type { ReactNode } from 'react'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import type { View } from '@/types'

interface LayoutProps {
  children: ReactNode
  currentView: View
  onNavigate: (view: View) => void
}

export function Layout({ children, currentView, onNavigate }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-900">
      <Header />
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-4 pb-28">
        {children}
      </main>
      <BottomNav currentView={currentView} onNavigate={onNavigate} />
    </div>
  )
}