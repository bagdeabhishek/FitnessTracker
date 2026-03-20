import { useEffect, useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function FormatPromptPage() {
  const [content, setContent] = useState('Loading prompt guide...')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch('/format/prompt.md', { cache: 'no-store' })
      .then((res) => res.text())
      .then((text) => {
        if (!cancelled) setContent(text)
      })
      .catch(() => {
        if (!cancelled) setContent('Could not load /format/prompt.md')
      })

    return () => {
      cancelled = true
    }
  }, [])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 px-4 py-6">
      <div className="max-w-3xl mx-auto space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Workout Prompt Format</h1>
          <p className="text-zinc-600 dark:text-zinc-400">Canonical instructions and schema for AI workout generation.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleCopy} variant="outline">
            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? 'Copied' : 'Copy Full Guide'}
          </Button>
          <a className="inline-flex items-center justify-center h-14 px-6 py-4 rounded-xl border border-zinc-300 bg-white text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100" href="/format/prompt.md" target="_blank" rel="noreferrer">Open prompt.md</a>
          <a className="inline-flex items-center justify-center h-14 px-6 py-4 rounded-xl border border-zinc-300 bg-white text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100" href="/format/schema.json" target="_blank" rel="noreferrer">Open schema.json</a>
          <a className="inline-flex items-center justify-center h-14 px-6 py-4 rounded-xl border border-zinc-300 bg-white text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100" href="/format/example.json" target="_blank" rel="noreferrer">Open example.json</a>
        </div>

        <pre className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-4 text-xs overflow-auto whitespace-pre-wrap text-zinc-800 dark:text-zinc-100">{content}</pre>
      </div>
    </div>
  )
}
