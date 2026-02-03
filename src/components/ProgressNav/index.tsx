import { Chapter } from '@/types'

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
  // Find current chapter index
  const currentChapter = chapters.find(ch => ch.id === currentChapterId)
  const currentOrder = currentChapter?.order || 1

  // Split chapters into completed, current, and upcoming
  const completedChapters = chapters.filter(ch => ch.order < currentOrder)
  const upcomingChapters = chapters.filter(ch => ch.order > currentOrder)

  // Handle chapter navigation - scrolling is handled by ChapterReader
  const handleNavClick = (chapterId: string) => {
    onChapterClick(chapterId)
  }

  return (
    // Hidden on mobile (hidden), visible on medium screens and up (md:block)
    <nav className="hidden md:block fixed right-8 top-8 z-50">
      <div className="flex flex-col gap-4">
        {/* Completed chapters - at top */}
        {completedChapters.map((chapter) => {
          const chapterNumber = String(chapter.order).padStart(2, '0')

          return (
            <button
              key={chapter.id}
              onClick={() => handleNavClick(chapter.id)}
              className="group relative text-right transition-all duration-300 hover:opacity-100 opacity-40 cursor-pointer"
              aria-label={`前往章節 ${chapterNumber}: ${chapter.title}`}
            >
              <div className="text-xs font-light tracking-wider text-gray-400 transition-all duration-300 group-hover:text-black">
                {chapterNumber}
              </div>
            </button>
          )
        })}

        {/* Current chapter - also at top, after completed */}
        {currentChapter && (
          <button
            onClick={() => handleNavClick(currentChapter.id)}
            className="group relative text-right transition-all duration-300 cursor-pointer"
            aria-label={`當前章節 ${String(currentChapter.order).padStart(2, '0')}: ${currentChapter.title}`}
          >
            {/* Chapter Title - Vertical Text (only) */}
            <div
              className="text-xs font-light tracking-wide text-black whitespace-nowrap"
              style={{
                writingMode: 'vertical-rl',
                textOrientation: 'mixed'
              }}
            >
              {currentChapter.title}
            </div>
          </button>
        )}

        {/* Upcoming chapters - at bottom */}
        <div className="mt-6 flex flex-col gap-4">
          {upcomingChapters.map((chapter) => {
            const chapterNumber = String(chapter.order).padStart(2, '0')

            return (
              <button
                key={chapter.id}
                onClick={() => handleNavClick(chapter.id)}
                className="group relative text-right transition-all duration-300 hover:opacity-100 opacity-40 cursor-pointer"
                aria-label={`前往章節 ${chapterNumber}: ${chapter.title}`}
              >
                <div className="text-xs font-light tracking-wider text-gray-400 transition-all duration-300 group-hover:text-black">
                  {chapterNumber}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
