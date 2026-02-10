import { Chapter } from '@/types'
import { useState, type FocusEvent } from 'react'
import {
  ALUMNI_TRACK,
  CHAPTER_GROUPS,
  getGroupByChapterId,
} from '@/config/chapterGroups'

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
  const [isExpanded, setIsExpanded] = useState(false)
  const chapterMap = new Map(chapters.map((chapter) => [chapter.id, chapter]))
  const activeGroup = getGroupByChapterId(currentChapterId)
  const activeGroupId = activeGroup?.id
  const showNav = Boolean(currentChapterId)

  const activeGroupChapters =
    CHAPTER_GROUPS.find((group) => group.id === activeGroupId)?.chapters
      .map((chapterId) => chapterMap.get(chapterId))
      .filter((chapter): chapter is Chapter => Boolean(chapter)) || []

  const handleChapterClick = (chapterId: string) => {
    onChapterClick(chapterId)
  }

  const handleGroupClick = (groupChapterIds: string[]) => {
    if (groupChapterIds.length === 0) return
    onChapterClick(groupChapterIds[0])
  }

  const showAlumniTrack = activeGroupId === 'alumni'
  const showExpanded = showNav && isExpanded

  const handleBlurCapture = (event: FocusEvent<HTMLElement>) => {
    const nextFocused = event.relatedTarget as Node | null
    if (!nextFocused || !event.currentTarget.contains(nextFocused)) {
      setIsExpanded(false)
    }
  }

  return (
    <>
      <nav
        className={`hidden md:block fixed right-8 top-8 z-50 transition-opacity duration-300 ${
          showNav ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-label="章節分組導覽"
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        onFocusCapture={() => setIsExpanded(true)}
        onBlurCapture={handleBlurCapture}
      >
        <div
          className={`rounded-2xl transition-all duration-300 ${
            showExpanded
              ? 'w-[292px] border border-black/10 bg-white/90 p-4 shadow-sm backdrop-blur'
              : 'w-[72px] border border-transparent bg-transparent p-3 shadow-none backdrop-blur-none'
          }`}
        >
          <div className={`flex flex-col gap-2 ${showExpanded ? 'items-end' : 'items-center'}`}>
            {CHAPTER_GROUPS.map((group) => {
              const isActive = group.id === activeGroupId
              const showFullTitle = showExpanded && isActive
              const expandedStateClass = isActive
                ? 'bg-black text-white'
                : 'text-black/55 hover:bg-black/5 hover:text-black'
              const collapsedStateClass = isActive
                ? 'bg-black text-white'
                : 'text-black/45 hover:text-black'

              return (
                <button
                  key={group.id}
                  onClick={() => handleGroupClick(group.chapters)}
                  className={`transition-colors duration-200 ${
                    showExpanded
                      ? 'rounded-lg px-3 py-2 text-right'
                      : 'flex h-10 w-10 items-center justify-center rounded-full'
                  } ${showExpanded ? expandedStateClass : collapsedStateClass}`}
                  aria-label={`前往分組 ${group.title}`}
                >
                  {showFullTitle ? (
                    <span className="text-sm font-bold tracking-wide">{group.title}</span>
                  ) : (
                    <span className="text-lg font-black leading-none">{group.symbol}</span>
                  )}
                </button>
              )
            })}
          </div>

          {showExpanded && activeGroupChapters.length > 0 && (
            <div className="mt-4 space-y-2 border-t border-black/10 pt-3">
              {activeGroupChapters.map((chapter) => {
                const isCurrent = chapter.id === currentChapterId

                return (
                  <button
                    key={chapter.id}
                    onClick={() => handleChapterClick(chapter.id)}
                    className={`block w-full rounded-md px-2 py-2 text-left transition-colors ${
                      isCurrent
                        ? 'bg-black/10 text-black'
                        : 'text-black/65 hover:bg-black/5 hover:text-black'
                    }`}
                    aria-label={`前往 ${chapter.title}`}
                  >
                    <span className="text-xs leading-relaxed">{chapter.title}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </nav>

      {showAlumniTrack && (
        <div className="hidden md:flex fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
          <div className="flex items-stretch gap-2 rounded-full border border-black/15 bg-white/95 p-2 shadow-lg backdrop-blur">
            {ALUMNI_TRACK.map((item) => {
              const isCurrent = item.chapterId === currentChapterId

              return (
                <button
                  key={item.chapterId}
                  onClick={() => handleChapterClick(item.chapterId)}
                  className={`min-h-[44px] min-w-[92px] rounded-full px-3 py-2 transition-colors ${
                    isCurrent
                      ? 'bg-black text-white'
                      : 'bg-transparent text-black/75 hover:bg-black/10 hover:text-black'
                  }`}
                  aria-label={`前往 ${item.code} ${item.label}`}
                >
                  <span className="block text-[11px] font-semibold tracking-[0.18em]">{item.code}</span>
                  <span className="block text-[11px]">{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}
