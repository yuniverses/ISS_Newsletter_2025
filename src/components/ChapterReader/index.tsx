import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Newsletter } from '@/types'
import { useChapterPreload } from '@/hooks/useChapterPreload'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { useChapterProgress } from '@/hooks/useChapterProgress'
import { getGroupByChapterId, isGroupBoundary } from '@/config/chapterGroups'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ChapterSection from './ChapterSection'
import GroupTransitionSection from './GroupTransitionSection'

interface ChapterReaderProps {
  newsletter: Newsletter
  onChapterChange: (chapterId: string) => void
  initialChapterId?: string
  scrollToChapterId?: string | null
  onScrollComplete?: () => void
  onHasMoreChange?: (hasMore: boolean) => void
}

type ReaderRenderItem =
  | { type: 'group-transition'; key: string; toChapterId: string }
  | { type: 'chapter'; key: string; chapterId: string }

export default function ChapterReader({
  newsletter,
  onChapterChange,
  initialChapterId,
  scrollToChapterId,
  onScrollComplete,
  onHasMoreChange
}: ChapterReaderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [visibleChapterIds, setVisibleChapterIds] = useState<string[]>([])
  const [isLoadingNext, setIsLoadingNext] = useState(false)
  const isLoadingNextRef = useRef(false)
  const { loadChapter, preloadChapter, getChapter } = useChapterPreload()

  // Track current chapter based on scroll position
  const currentChapterId = useChapterProgress({
    chapterIds: visibleChapterIds,
    containerRef,
  })

  // Notify parent of chapter change
  useEffect(() => {
    onChapterChange(currentChapterId)
  }, [currentChapterId, onChapterChange])

  // Load next chapter
  const loadNextChapter = useCallback(async () => {
    if (isLoadingNextRef.current) return

    // Find the index of the last visible chapter in the full list
    const lastVisibleId = visibleChapterIds[visibleChapterIds.length - 1]
    const lastVisibleIndex = newsletter.chapters.findIndex((c) => c.id === lastVisibleId)
    
    // If last visible is the actual last chapter, stop.
    if (lastVisibleIndex === -1 || lastVisibleIndex >= newsletter.chapters.length - 1) return

    const nextChapter = newsletter.chapters[lastVisibleIndex + 1]
    const afterNext = newsletter.chapters[lastVisibleIndex + 2]

    isLoadingNextRef.current = true
    setIsLoadingNext(true)

    try {
      // Add to visible chapters (dedupe to avoid duplicate ids and unstable scrolling)
      setVisibleChapterIds((prev) => {
        if (prev.includes(nextChapter.id)) return prev
        return [...prev, nextChapter.id]
      })

      // Load the chapter content
      await loadChapter(nextChapter.id, nextChapter.htmlFile)

      // Preload the next chapter if available
      if (afterNext) {
        await preloadChapter(afterNext.id, afterNext.htmlFile)
      }
    } finally {
      isLoadingNextRef.current = false
      setIsLoadingNext(false)
    }
  }, [visibleChapterIds, newsletter.chapters, loadChapter, preloadChapter])

  // Initialize with initialChapterId or first chapter
  useEffect(() => {
    // Only initialize if we haven't loaded anything yet
    if (visibleChapterIds.length === 0 && newsletter.chapters.length > 0) {
      let startChapterIndex = 0;
      
      if (initialChapterId) {
        const index = newsletter.chapters.findIndex(c => c.id === initialChapterId);
        if (index !== -1) startChapterIndex = index;
      }

      // Include all chapters from 0 up to startChapterIndex
      const initialIds = newsletter.chapters.slice(0, startChapterIndex + 1).map(c => c.id);
      setVisibleChapterIds(initialIds)

      // Load content for all initial chapters
      // We prioritize the target chapter, then load others
      const targetChapter = newsletter.chapters[startChapterIndex];
      loadChapter(targetChapter.id, targetChapter.htmlFile);

      // Load previous chapters in background
      initialIds.slice(0, startChapterIndex).forEach(id => {
         const ch = newsletter.chapters.find(c => c.id === id);
         if (ch) loadChapter(ch.id, ch.htmlFile);
      });

      // Preload next chapter relative to the start chapter
      if (startChapterIndex + 1 < newsletter.chapters.length) {
        const nextChapter = newsletter.chapters[startChapterIndex + 1]
        preloadChapter(nextChapter.id, nextChapter.htmlFile)
      }
    }
  }, [newsletter.chapters, initialChapterId, visibleChapterIds.length, loadChapter, preloadChapter])

  // Auto-scroll to initial chapter when content loads
  const hasScrolledToInitial = useRef(false)
  
  useEffect(() => {
    if (initialChapterId && !hasScrolledToInitial.current) {
        // Check if the chapter element exists in DOM
        const element = document.getElementById(initialChapterId)
        if (element) {
            // Wait a small tick for layout to stabilize (e.g. images or content rendering)
            // But content might be still "Loading..." if preloading is slow.
            // Check if content is loaded via getChapter?
            const loaded = getChapter(initialChapterId)
            
            if (loaded?.content) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'auto', block: 'start' }) // Use 'auto' for instant jump, 'smooth' for animation
                    hasScrolledToInitial.current = true
                }, 100)
            }
        }
    }
  }, [initialChapterId, visibleChapterIds, getChapter])

  // Handle scrollToChapterId - when user clicks navigation to jump to a chapter
  useEffect(() => {
    if (!scrollToChapterId) return

    let cancelled = false

    const targetIndex = newsletter.chapters.findIndex(c => c.id === scrollToChapterId)
    if (targetIndex === -1) return

    // Ensure all chapters up to the target are in visibleChapterIds
    const allIdsNeeded = newsletter.chapters.slice(0, targetIndex + 1).map(c => c.id)
    const chaptersToAdd = allIdsNeeded.filter(id => !visibleChapterIds.includes(id))

    if (chaptersToAdd.length > 0) {
      setVisibleChapterIds(prev => {
        const newIds = [...prev]
        chaptersToAdd.forEach(id => {
          if (!newIds.includes(id)) {
            const idx = newsletter.chapters.findIndex(c => c.id === id)
            const insertIdx = newIds.findIndex(existingId => {
              const existingIdx = newsletter.chapters.findIndex(c => c.id === existingId)
              return existingIdx > idx
            })
            if (insertIdx === -1) {
              newIds.push(id)
            } else {
              newIds.splice(insertIdx, 0, id)
            }
          }
        })
        return newIds
      })
    }

    // Load ALL chapters up to the target and wait for them to finish
    const loadPromises = allIdsNeeded.map(id => {
      const ch = newsletter.chapters.find(c => c.id === id)
      if (ch) return loadChapter(ch.id, ch.htmlFile)
      return Promise.resolve(null)
    })

    Promise.all(loadPromises).then(() => {
      if (cancelled) return

      // Wait one frame for React to render the loaded content into the DOM
      requestAnimationFrame(() => {
        if (cancelled) return

        const element = document.getElementById(scrollToChapterId)
        if (element) {
          // Instant jump (not smooth) — content is loaded, position is stable
          element.scrollIntoView({ behavior: 'auto', block: 'start' })
          ScrollTrigger.refresh()

          // Re-scroll loop to correct for images / lazy layout shifts
          let correctionAttempts = 0
          const maxCorrections = 4
          const correctScroll = () => {
            if (cancelled || correctionAttempts >= maxCorrections) {
              onScrollComplete?.()
              return
            }
            correctionAttempts++
            const el = document.getElementById(scrollToChapterId)
            if (el) {
              el.scrollIntoView({ behavior: 'auto', block: 'start' })
              ScrollTrigger.refresh()
            }
            setTimeout(correctScroll, 250)
          }
          setTimeout(correctScroll, 250)
        } else {
          onScrollComplete?.()
        }
      })
    })

    return () => {
      cancelled = true
    }
  }, [scrollToChapterId, newsletter.chapters, visibleChapterIds, loadChapter, onScrollComplete])

  // Set up infinite scroll
  // Determine if we have more chapters to load
  const lastVisibleId = visibleChapterIds[visibleChapterIds.length - 1];
  const lastVisibleIndex = newsletter.chapters.findIndex(c => c.id === lastVisibleId);
  const hasMore = visibleChapterIds.length === 0
    ? newsletter.chapters.length > 0
    : lastVisibleIndex !== -1 && lastVisibleIndex < newsletter.chapters.length - 1

  useEffect(() => {
    onHasMoreChange?.(hasMore)
  }, [hasMore, onHasMoreChange])

  const sentinelRef = useInfiniteScroll({
    onLoadNext: loadNextChapter,
    threshold: 200,
    enabled: hasMore && !isLoadingNext,
  })

  const chapterMap = useMemo(
    () => new Map(newsletter.chapters.map((chapter) => [chapter.id, chapter])),
    [newsletter.chapters]
  )

  const renderSequence = useMemo<ReaderRenderItem[]>(() => {
    const items: ReaderRenderItem[] = []

    visibleChapterIds.forEach((chapterId, index) => {
      if (index > 0) {
        const prevChapterId = visibleChapterIds[index - 1]

        if (isGroupBoundary(prevChapterId, chapterId)) {
          items.push({
            type: 'group-transition',
            key: `group-transition-${prevChapterId}-${chapterId}`,
            toChapterId: chapterId,
          })
        }
      }

      items.push({
        type: 'chapter',
        key: `chapter-${chapterId}`,
        chapterId,
      })
    })

    return items
  }, [visibleChapterIds])

  return (
    <div ref={containerRef} className="relative">
      {renderSequence.map((item) => {
        if (item.type === 'group-transition') {
          const group = getGroupByChapterId(item.toChapterId)
          if (!group) return null

          return (
            <GroupTransitionSection
              key={item.key}
              group={group}
              chapters={newsletter.chapters}
            />
          )
        }

        const chapter = chapterMap.get(item.chapterId)
        const chapterContent = getChapter(item.chapterId)

        if (!chapter) return null

        return (
          <ChapterSection
            key={item.key}
            chapter={chapter}
            content={chapterContent?.content}
            isActive={item.chapterId === currentChapterId}
          />
        )
      })}

      {/* Sentinel element for infinite scroll */}
      {hasMore && (
        <>
          <div ref={sentinelRef} className="h-4" />
          <div className="flex min-h-[28vh] items-center justify-center px-6 pb-10 pt-6">
            <div className="text-sm tracking-wide text-black/35">
              正在載入下一章…
            </div>
          </div>
        </>
      )}
    </div>
  )
}
