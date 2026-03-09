import { Maximize2 } from 'lucide-react'
import { useEmbedChrome } from '@/hooks/useEmbedChrome'
import { cn } from '@/utils/cn'

interface EmbedTopBarProps {
  enabled: boolean
  currentChapterId?: string
  pathname: string
}

export default function EmbedTopBar({
  enabled,
  currentChapterId,
  pathname,
}: EmbedTopBarProps) {
  const { isVisible, openStandalone } = useEmbedChrome({
    enabled,
    currentChapterId,
    pathname,
  })

  if (!enabled) return null

  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-x-0 top-0 z-[90] flex justify-center px-3 pt-3 transition-all duration-300 motion-reduce:transition-none sm:px-6 sm:pt-4',
        isVisible
          ? 'translate-y-0 opacity-100'
          : '-translate-y-[calc(100%+1rem)] opacity-0'
      )}
    >
      <nav
        aria-label="內嵌模式控制列"
        className="pointer-events-auto flex min-h-[56px] w-full max-w-4xl items-center justify-between gap-3 rounded-full border border-white/15 bg-black/65 px-3 py-2 text-white shadow-[0_18px_60px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:px-5"
      >
        <div className="min-w-0">
          <span className="block text-[10px] tracking-[0.32em] text-white/45">
            預覽
          </span>
          <span className="block truncate text-sm font-semibold tracking-[0.08em] text-white/90">
            服科所年度電子報　ISS Community Annual Newsletter
          </span>
        </div>

        <button
          type="button"
          onClick={openStandalone}
          className="inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition duration-200 hover:bg-[#f3f1eb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none"
          aria-label="在新分頁開啟全螢幕檢視"
        >
          <Maximize2 size={16} className="shrink-0" aria-hidden="true" />
          <span className="sm:hidden">全螢幕</span>
          <span className="hidden sm:inline">全螢幕檢視</span>
        </button>
      </nav>
    </div>
  )
}
