import { useState, useEffect, useCallback } from 'react'
import { ReadingMemory, CoverContribution } from '@/types'

const MEMORIES_STORAGE_KEY = 'iss_reading_memories'
const RELAY_STORAGE_KEY = 'iss_relay_data'

interface UseReadingMemoriesReturn {
  memories: ReadingMemory[]
  coverContribution: CoverContribution | null
  addMemory: (memory: Omit<ReadingMemory, 'id' | 'createdAt'>) => void
  removeMemory: (id: string) => void
  clearMemories: () => void
  isDuplicate: (text: string) => boolean
}

// 生成唯一 ID
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

export function useReadingMemories(): UseReadingMemoriesReturn {
  const [memories, setMemories] = useState<ReadingMemory[]>([])
  const [coverContribution, setCoverContribution] = useState<CoverContribution | null>(null)

  // 初始化：從 localStorage 讀取數據
  useEffect(() => {
    // 讀取閱讀記憶
    try {
      const savedMemories = localStorage.getItem(MEMORIES_STORAGE_KEY)
      if (savedMemories) {
        const parsed = JSON.parse(savedMemories)
        if (Array.isArray(parsed)) {
          setMemories(parsed)
        }
      }
    } catch (error) {
      console.error('Failed to load reading memories:', error)
    }

    // 讀取封面文字接力貢獻
    try {
      const savedRelay = localStorage.getItem(RELAY_STORAGE_KEY)
      if (savedRelay) {
        const parsed = JSON.parse(savedRelay)
        if (parsed.received && parsed.mine) {
          setCoverContribution(parsed)
        }
      }
    } catch (error) {
      console.error('Failed to load cover contribution:', error)
    }
  }, [])

  // 保存記憶到 localStorage
  const saveMemories = useCallback((newMemories: ReadingMemory[]) => {
    try {
      localStorage.setItem(MEMORIES_STORAGE_KEY, JSON.stringify(newMemories))
    } catch (error) {
      console.error('Failed to save reading memories:', error)
    }
  }, [])

  // 添加新記憶
  const addMemory = useCallback((memoryData: Omit<ReadingMemory, 'id' | 'createdAt'>) => {
    const newMemory: ReadingMemory = {
      ...memoryData,
      id: generateId(),
      createdAt: Date.now()
    }

    setMemories(prev => {
      const updated = [...prev, newMemory]
      saveMemories(updated)
      return updated
    })
  }, [saveMemories])

  // 刪除記憶
  const removeMemory = useCallback((id: string) => {
    setMemories(prev => {
      const updated = prev.filter(m => m.id !== id)
      saveMemories(updated)
      return updated
    })
  }, [saveMemories])

  // 清空所有記憶
  const clearMemories = useCallback(() => {
    setMemories([])
    try {
      localStorage.removeItem(MEMORIES_STORAGE_KEY)
    } catch (error) {
      console.error('Failed to clear reading memories:', error)
    }
  }, [])

  // 檢查是否重複
  const isDuplicate = useCallback((text: string): boolean => {
    const normalizedText = text.trim().toLowerCase()
    return memories.some(m => m.text.trim().toLowerCase() === normalizedText)
  }, [memories])

  return {
    memories,
    coverContribution,
    addMemory,
    removeMemory,
    clearMemories,
    isDuplicate
  }
}
