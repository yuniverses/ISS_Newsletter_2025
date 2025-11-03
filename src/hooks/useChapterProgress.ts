import { useState, useEffect, useCallback, RefObject } from 'react'

interface UseChapterProgressOptions {
  chapterIds: string[]
  containerRef: RefObject<HTMLElement>
}

export function useChapterProgress({
  chapterIds,
  containerRef,
}: UseChapterProgressOptions) {
  const [currentChapterId, setCurrentChapterId] = useState<string>(chapterIds[0] || '')

  const updateProgress = useCallback(() => {
    if (!containerRef.current) return

    const chapterElements = containerRef.current.querySelectorAll('[data-chapter-id]')
    const viewportHeight = window.innerHeight
    const scrollTop = window.scrollY

    let closestChapter = chapterIds[0]
    let minDistance = Infinity

    chapterElements.forEach((element) => {
      const rect = element.getBoundingClientRect()
      const elementTop = scrollTop + rect.top
      const distance = Math.abs(elementTop - scrollTop - viewportHeight / 3)

      if (distance < minDistance) {
        minDistance = distance
        closestChapter = element.getAttribute('data-chapter-id') || closestChapter
      }
    })

    setCurrentChapterId(closestChapter)
  }, [chapterIds, containerRef])

  useEffect(() => {
    window.addEventListener('scroll', updateProgress, { passive: true })
    updateProgress() // Initial check

    return () => {
      window.removeEventListener('scroll', updateProgress)
    }
  }, [updateProgress])

  return currentChapterId
}
