import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Newsletter } from '@/types'
import { useChapterPreload } from '@/hooks/useChapterPreload'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { useChapterProgress } from '@/hooks/useChapterProgress'
import { getGroupByChapterId, isGroupBoundary } from '@/config/chapterGroups'
import ChapterSection from './ChapterSection'
import GroupTransitionSection from './GroupTransitionSection'

interface ChapterReaderProps {
  newsletter: Newsletter
  onChapterChange: (chapterId: string) => void
  initialChapterId?: string
  scrollToChapterId?: string | null
  onScrollComplete?: () => void
}

type ReaderRenderItem =
  | { type: 'group-transition'; key: string; toChapterId: string }
  | { type: 'chapter'; key: string; chapterId: string }

export default function ChapterReader({
  newsletter,
  onChapterChange,
  initialChapterId,
  scrollToChapterId,
  onScrollComplete
}: ChapterReaderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [visibleChapterIds, setVisibleChapterIds] = useState<string[]>([])
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
    // Find the index of the last visible chapter in the full list
    const lastVisibleId = visibleChapterIds[visibleChapterIds.length - 1];
    const lastVisibleIndex = newsletter.chapters.findIndex(c => c.id === lastVisibleId);
    
    // If last visible is the actual last chapter, stop.
    if (lastVisibleIndex === -1 || lastVisibleIndex >= newsletter.chapters.length - 1) return

    const nextChapter = newsletter.chapters[lastVisibleIndex + 1]

    // Add to visible chapters
    setVisibleChapterIds((prev) => [...prev, nextChapter.id])

    // Load the chapter content
    await loadChapter(nextChapter.id, nextChapter.htmlFile)

    // Preload the next chapter if available
    if (lastVisibleIndex + 2 < newsletter.chapters.length) {
      const afterNext = newsletter.chapters[lastVisibleIndex + 2]
      preloadChapter(afterNext.id, afterNext.htmlFile)
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

    const targetIndex = newsletter.chapters.findIndex(c => c.id === scrollToChapterId)
    if (targetIndex === -1) return

    // Ensure all chapters up to the target are in visibleChapterIds
    const chaptersToAdd = newsletter.chapters
      .slice(0, targetIndex + 1)
      .map(c => c.id)
      .filter(id => !visibleChapterIds.includes(id))

    if (chaptersToAdd.length > 0) {
      // Add missing chapters
      setVisibleChapterIds(prev => {
        const newIds = [...prev]
        chaptersToAdd.forEach(id => {
          if (!newIds.includes(id)) {
            // Insert in correct order
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

      // Load content for new chapters
      chaptersToAdd.forEach(id => {
        const ch = newsletter.chapters.find(c => c.id === id)
        if (ch) loadChapter(ch.id, ch.htmlFile)
      })
    }

    // Poll for the element and scroll to it
    const maxAttempts = 30
    let attempts = 0

    const tryScroll = () => {
      const element = document.getElementById(scrollToChapterId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        onScrollComplete?.()
      } else if (attempts < maxAttempts) {
        attempts++
        setTimeout(tryScroll, 100)
      } else {
        onScrollComplete?.()
      }
    }

    setTimeout(tryScroll, 50)
  }, [scrollToChapterId, newsletter.chapters, visibleChapterIds, loadChapter, onScrollComplete])

  // Set up infinite scroll
  // Determine if we have more chapters to load
  const lastVisibleId = visibleChapterIds[visibleChapterIds.length - 1];
  const lastVisibleIndex = newsletter.chapters.findIndex(c => c.id === lastVisibleId);
  const hasMore = lastVisibleIndex !== -1 && lastVisibleIndex < newsletter.chapters.length - 1;

  const sentinelRef = useInfiniteScroll({
    onLoadNext: loadNextChapter,
    threshold: 200,
    enabled: hasMore,
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

          return <GroupTransitionSection key={item.key} group={group} />
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
        <div ref={sentinelRef} className="h-4" />
      )}
    </div>
  )
}
