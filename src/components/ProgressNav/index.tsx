import { Chapter } from '@/types'
import { useCallback, useEffect, useRef, useState, type FocusEvent } from 'react'
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
  const [isAlumniExpanded, setIsAlumniExpanded] = useState(false)
  const [isAlumniAutoExpanded, setIsAlumniAutoExpanded] = useState(false)
  const [displayTrackId, setDisplayTrackId] = useState<string | null>(null)
  const alumniSwitchTimerRef = useRef<number | null>(null)
  const alumniCollapseTimerRef = useRef<number | null>(null)
  const chapterMap = new Map(chapters.map((chapter) => [chapter.id, chapter]))
  const activeGroup = getGroupByChapterId(currentChapterId)
  const activeGroupId = activeGroup?.id
  const showNav = Boolean(currentChapterId)

  const handleChapterClick = (chapterId: string) => {
    onChapterClick(chapterId)
  }

  const handleGroupClick = (groupChapterIds: string[]) => {
    if (groupChapterIds.length === 0) return
    onChapterClick(groupChapterIds[0])
  }

  const showAlumniTrack = activeGroupId === 'alumni'
  const activeTrackItem =
    ALUMNI_TRACK.find((item) => item.chapterId === currentChapterId) || ALUMNI_TRACK[0]
  const showAllTrackItems = isAlumniExpanded || isAlumniAutoExpanded
  const highlightedTrackId = displayTrackId || activeTrackItem?.chapterId
  const displayedTrackItems = showAllTrackItems
    ? ALUMNI_TRACK
    : highlightedTrackId
      ? ALUMNI_TRACK.filter((item) => item.chapterId === highlightedTrackId)
      : []
  const showExpanded = showNav && isExpanded

  const handleBlurCapture = (event: FocusEvent<HTMLElement>) => {
    const nextFocused = event.relatedTarget as Node | null
    if (!nextFocused || !event.currentTarget.contains(nextFocused)) {
      setIsExpanded(false)
    }
  }

  const clearAlumniTimers = useCallback(() => {
    if (alumniSwitchTimerRef.current) {
      window.clearTimeout(alumniSwitchTimerRef.current)
      alumniSwitchTimerRef.current = null
    }
    if (alumniCollapseTimerRef.current) {
      window.clearTimeout(alumniCollapseTimerRef.current)
      alumniCollapseTimerRef.current = null
    }
  }, [])

  const handleAlumniBlurCapture = (event: FocusEvent<HTMLElement>) => {
    const nextFocused = event.relatedTarget as Node | null
    if (!nextFocused || !event.currentTarget.contains(nextFocused)) {
      setIsAlumniExpanded(false)
    }
  }

  useEffect(() => {
    if (!activeTrackItem) return

    if (!displayTrackId) {
      setDisplayTrackId(activeTrackItem.chapterId)
      return
    }

    if (displayTrackId === activeTrackItem.chapterId) return

    if (isAlumniExpanded) {
      setDisplayTrackId(activeTrackItem.chapterId)
      return
    }

    clearAlumniTimers()
    setIsAlumniAutoExpanded(true)

    alumniSwitchTimerRef.current = window.setTimeout(() => {
      setDisplayTrackId(activeTrackItem.chapterId)
      alumniSwitchTimerRef.current = null
    }, 180)

    alumniCollapseTimerRef.current = window.setTimeout(() => {
      setIsAlumniAutoExpanded(false)
      alumniCollapseTimerRef.current = null
    }, 760)
  }, [
    activeTrackItem,
    clearAlumniTimers,
    displayTrackId,
    isAlumniExpanded,
  ])

  useEffect(() => {
    return () => {
      clearAlumniTimers()
    }
  }, [clearAlumniTimers])

  return (
    <>
      <nav
        className={`hidden md:block fixed right-6 top-1/2 z-[60] -translate-y-1/2 transition-opacity duration-300 ${
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
              ? 'w-[300px] max-h-[calc(100vh-3rem)] overflow-y-auto border border-black/10 bg-white/90 p-4 shadow-sm backdrop-blur'
              : 'w-[72px] border border-transparent bg-transparent p-3 shadow-none backdrop-blur-none'
          }`}
        >
          <div className={`flex flex-col gap-2 ${showExpanded ? 'items-stretch' : 'items-center'}`}>
            {CHAPTER_GROUPS.map((group) => {
              const isActive = group.id === activeGroupId
              const groupChapters = group.chapters
                .map((chapterId) => chapterMap.get(chapterId))
                .filter((chapter): chapter is Chapter => Boolean(chapter))
              const expandedGroupClass = isActive
                ? 'bg-black text-white'
                : 'text-black/65 hover:bg-black/5 hover:text-black'
              const collapsedGroupClass = isActive
                ? 'bg-black text-white'
                : 'text-black/45 hover:text-black'

              return (
                <div key={group.id} className="space-y-1.5">
                  <button
                    onClick={() => handleGroupClick(group.chapters)}
                    className={`transition-colors duration-200 ${
                      showExpanded
                        ? `w-full flex min-h-[44px] items-center justify-between rounded-lg px-3 py-2 text-left ${expandedGroupClass}`
                        : `flex h-10 w-10 items-center justify-center rounded-full ${collapsedGroupClass}`
                    }`}
                    aria-label={`前往分組 ${group.title}`}
                  >
                    {showExpanded ? (
                      <>
                        <span className="text-lg font-black leading-none">{group.symbol}</span>
                        <span className="ml-3 flex-1 text-sm font-semibold tracking-wide">{group.title}</span>
                      </>
                    ) : (
                      <span className="text-lg font-black leading-none">{group.symbol}</span>
                    )}
                  </button>

                  {showExpanded && groupChapters.length > 0 && (
                    <div className="ml-7 space-y-1 border-l border-black/10 pl-2">
                      {groupChapters.map((chapter) => {
                        const isCurrent = chapter.id === currentChapterId

                        return (
                          <button
                            key={chapter.id}
                            onClick={() => handleChapterClick(chapter.id)}
                            className={`block min-h-[40px] w-full rounded-md px-2 py-1.5 text-left transition-colors ${
                              isCurrent
                                ? 'bg-black/10 text-black'
                                : 'text-black/65 hover:bg-black/5 hover:text-black'
                            }`}
                            aria-label={`前往 ${chapter.title}`}
                          >
                            <span className="text-[11px] leading-relaxed">{chapter.title}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </nav>

      {showAlumniTrack && (
        <div
          className="hidden md:flex fixed bottom-6 right-6 z-40"
          onMouseEnter={() => {
            clearAlumniTimers()
            setIsAlumniAutoExpanded(false)
            setIsAlumniExpanded(true)
          }}
          onMouseLeave={() => setIsAlumniExpanded(false)}
          onFocusCapture={() => {
            clearAlumniTimers()
            setIsAlumniAutoExpanded(false)
            setIsAlumniExpanded(true)
          }}
          onBlurCapture={handleAlumniBlurCapture}
        >
          <div
            className={`flex items-stretch gap-2 rounded-full transition-all duration-300 ${
              showAllTrackItems
                ? 'border border-black/15 bg-white/95 p-2 shadow-lg backdrop-blur'
                : 'border border-transparent bg-transparent p-0 shadow-none backdrop-blur-none'
            }`}
          >
            {displayedTrackItems.map((item) => {
              const isCurrent = item.chapterId === highlightedTrackId

              return (
                <button
                  key={item.chapterId}
                  onClick={() => handleChapterClick(item.chapterId)}
                  className={`min-h-[44px] min-w-[92px] rounded-full px-3 py-2 transition-colors duration-200 ${
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
