import { Chapter } from '@/types'
import { cn } from '@/utils/cn'

interface ProgressNavProps {
  chapters: Chapter[]
  currentChapterId: string
  onChapterClick: (chapterId: string) => void
}

export default function ProgressNav({
  chapters,
  currentChapterId,
  onChapterClick,
}: ProgressNavProps) {
  return (
    <nav className="fixed right-8 top-1/2 -translate-y-1/2 z-50">
      <div className="flex flex-col gap-6">
        {chapters.map((chapter) => {
          const isActive = chapter.id === currentChapterId
          const chapterNumber = String(chapter.order).padStart(2, '0')

          return (
            <button
              key={chapter.id}
              onClick={() => onChapterClick(chapter.id)}
              className={cn(
                "group relative text-right transition-all duration-300",
                "hover:opacity-100",
                isActive ? "opacity-100" : "opacity-30"
              )}
              aria-label={`前往章節 ${chapterNumber}: ${chapter.title}`}
            >
              {/* Chapter Number */}
              <div
                className={cn(
                  "text-sm font-light tracking-wider transition-all duration-300",
                  isActive ? "text-black scale-110" : "text-gray-400"
                )}
              >
                {chapterNumber}
              </div>

              {/* Chapter Title - Vertical Text */}
              {isActive && (
                <div className="absolute right-8 top-0 -translate-y-1/4">
                  <div
                    className="text-xs font-light tracking-wide whitespace-nowrap"
                    style={{
                      writingMode: 'vertical-rl',
                      textOrientation: 'upright'
                    }}
                  >
                    {chapter.title}
                  </div>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
