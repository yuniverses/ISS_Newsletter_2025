import { useState, useCallback, useRef } from 'react'
import { ChapterContent } from '@/types'

export function useChapterPreload() {
  const [loadedChapters, setLoadedChapters] = useState<Map<string, ChapterContent>>(
    new Map()
  )

  // Deduplicate in-flight requests so concurrent calls for the same chapter
  // share a single fetch instead of firing multiple times.
  const inflightRef = useRef<Map<string, Promise<ChapterContent>>>(new Map())

  const loadChapter = useCallback(async (chapterId: string, htmlFile: string): Promise<ChapterContent> => {
    // Already fetched and stored in state
    const existing = inflightRef.current.get(chapterId)
    if (existing) return existing

    const promise = (async () => {
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
      } finally {
        inflightRef.current.delete(chapterId)
      }
    })()

    inflightRef.current.set(chapterId, promise)
    return promise
  }, [])

  const preloadChapter = useCallback(
    async (chapterId: string, htmlFile: string) => {
      await loadChapter(chapterId, htmlFile)
    },
    [loadChapter]
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
