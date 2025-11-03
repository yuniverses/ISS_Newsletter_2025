import { useState, useEffect, useCallback } from 'react'
import { ChapterContent } from '@/types'

export function useChapterPreload() {
  const [loadedChapters, setLoadedChapters] = useState<Map<string, ChapterContent>>(
    new Map()
  )

  const loadChapter = useCallback(async (chapterId: string, htmlFile: string) => {
    // Check if already loaded
    if (loadedChapters.has(chapterId)) {
      return loadedChapters.get(chapterId)!
    }

    try {
      const response = await fetch(htmlFile)
      const content = await response.text()

      const chapterContent: ChapterContent = {
        id: chapterId,
        content,
        loaded: true,
      }

      setLoadedChapters((prev) => new Map(prev).set(chapterId, chapterContent))
      return chapterContent
    } catch (error) {
      console.error(`Failed to load chapter ${chapterId}:`, error)
      const errorContent: ChapterContent = {
        id: chapterId,
        content: '<div class="error">Failed to load chapter content</div>',
        loaded: false,
      }
      return errorContent
    }
  }, [loadedChapters])

  const preloadChapter = useCallback(
    async (chapterId: string, htmlFile: string) => {
      if (!loadedChapters.has(chapterId)) {
        await loadChapter(chapterId, htmlFile)
      }
    },
    [loadChapter, loadedChapters]
  )

  const getChapter = useCallback(
    (chapterId: string) => {
      return loadedChapters.get(chapterId)
    },
    [loadedChapters]
  )

  return {
    loadChapter,
    preloadChapter,
    getChapter,
    loadedChapters,
  }
}
