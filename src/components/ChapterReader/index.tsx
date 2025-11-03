import { useState, useEffect, useRef, useCallback } from 'react'
import { Newsletter } from '@/types'
import { useChapterPreload } from '@/hooks/useChapterPreload'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { useChapterProgress } from '@/hooks/useChapterProgress'
import ChapterSection from './ChapterSection'

interface ChapterReaderProps {
  newsletter: Newsletter
  onChapterChange: (chapterId: string) => void
}

export default function ChapterReader({
  newsletter,
  onChapterChange,
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
    if (currentChapterId) {
      onChapterChange(currentChapterId)
    }
  }, [currentChapterId, onChapterChange])

  // Load next chapter
  const loadNextChapter = useCallback(async () => {
    const currentIndex = visibleChapterIds.length
    if (currentIndex >= newsletter.chapters.length) return

    const nextChapter = newsletter.chapters[currentIndex]

    // Add to visible chapters
    setVisibleChapterIds((prev) => [...prev, nextChapter.id])

    // Load the chapter content
    await loadChapter(nextChapter.id, nextChapter.htmlFile)

    // Preload the next chapter if available
    if (currentIndex + 1 < newsletter.chapters.length) {
      const afterNext = newsletter.chapters[currentIndex + 1]
      preloadChapter(afterNext.id, afterNext.htmlFile)
    }
  }, [visibleChapterIds, newsletter.chapters, loadChapter, preloadChapter])

  // Initialize with first chapter
  useEffect(() => {
    if (visibleChapterIds.length === 0 && newsletter.chapters.length > 0) {
      const firstChapter = newsletter.chapters[0]
      setVisibleChapterIds([firstChapter.id])
      loadChapter(firstChapter.id, firstChapter.htmlFile)

      // Preload second chapter
      if (newsletter.chapters.length > 1) {
        const secondChapter = newsletter.chapters[1]
        preloadChapter(secondChapter.id, secondChapter.htmlFile)
      }
    }
  }, [newsletter.chapters, visibleChapterIds.length, loadChapter, preloadChapter])

  // Set up infinite scroll
  const sentinelRef = useInfiniteScroll({
    onLoadNext: loadNextChapter,
    threshold: 200,
    enabled: visibleChapterIds.length < newsletter.chapters.length,
  })

  return (
    <div ref={containerRef} className="relative">
      {visibleChapterIds.map((chapterId) => {
        const chapter = newsletter.chapters.find((c) => c.id === chapterId)
        const chapterContent = getChapter(chapterId)

        if (!chapter) return null

        return (
          <ChapterSection
            key={chapterId}
            chapter={chapter}
            content={chapterContent?.content}
            isActive={chapterId === currentChapterId}
          />
        )
      })}

      {/* Sentinel element for infinite scroll */}
      {visibleChapterIds.length < newsletter.chapters.length && (
        <div ref={sentinelRef} className="h-4" />
      )}
    </div>
  )
}
