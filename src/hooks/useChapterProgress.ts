import { useState, useEffect, useCallback, RefObject } from 'react'

interface UseChapterProgressOptions {
  chapterIds: string[]
  containerRef: RefObject<HTMLElement>
}

export function useChapterProgress({
  chapterIds,
  containerRef,
}: UseChapterProgressOptions) {
  const [currentChapterId, setCurrentChapterId] = useState<string>('')

  const updateProgress = useCallback(() => {
    if (!containerRef.current) return

    const chapterElements = containerRef.current.querySelectorAll('[data-chapter-id]')
    const viewportHeight = window.innerHeight
    // Use the viewport center as the target line (slightly higher for better reading experience)
    const targetLine = viewportHeight / 3

    let closestChapter = ''
    let minDistance = Infinity

    chapterElements.forEach((element) => {
      const rect = element.getBoundingClientRect()
      // Distance from the target line
      const distance = Math.abs(rect.top - targetLine)

      // Only consider chapters that are somewhat close to the viewport
      // e.g., within 1 viewport height
      if (distance < viewportHeight && distance < minDistance) {
        minDistance = distance
        closestChapter = element.getAttribute('data-chapter-id') || ''
      }
    })

    // If we are at the very top of the page (cover), ensure no chapter is selected
    // Cover is typically 100vh. If we are in the top 80% of the viewport (meaning we are mostly seeing cover), clear it.
    if (window.scrollY < viewportHeight * 0.8) {
        if (currentChapterId !== '') {
             setCurrentChapterId('')
        }
        return
    }

    if (closestChapter && closestChapter !== currentChapterId) {
        setCurrentChapterId(closestChapter)
    }
  }, [chapterIds, containerRef, currentChapterId])

  useEffect(() => {
    window.addEventListener('scroll', updateProgress, { passive: true })
    updateProgress() // Initial check

    return () => {
      window.removeEventListener('scroll', updateProgress)
    }
  }, [updateProgress])

  return currentChapterId
}
