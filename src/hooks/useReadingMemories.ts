import { useCallback, useSyncExternalStore } from 'react'
import { ReadingMemory, CoverContribution, CollectedElement } from '@/types'

const MEMORIES_STORAGE_KEY = 'iss_reading_memories'
const RELAY_STORAGE_KEY = 'iss_relay_data'
const ELEMENTS_STORAGE_KEY = 'iss_collected_elements'

// 全局狀態存儲
let memoriesCache: ReadingMemory[] = []
let elementsCache: CollectedElement[] = []
let coverContributionCache: CoverContribution | null = null

// 訂閱者列表
const subscribers = new Set<() => void>()

// 通知所有訂閱者
const notifySubscribers = () => {
  subscribers.forEach(callback => callback())
}

// 初始化緩存（只執行一次）
let initialized = false
const initializeCache = () => {
  if (initialized) return
  initialized = true

  // 讀取閱讀記憶
  try {
    const savedMemories = localStorage.getItem(MEMORIES_STORAGE_KEY)
    if (savedMemories) {
      const parsed = JSON.parse(savedMemories)
      if (Array.isArray(parsed)) {
        memoriesCache = parsed
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
        coverContributionCache = parsed
      }
    }
  } catch (error) {
    console.error('Failed to load cover contribution:', error)
  }

  // 讀取收集的元素
  try {
    const savedElements = localStorage.getItem(ELEMENTS_STORAGE_KEY)
    if (savedElements) {
      const parsed = JSON.parse(savedElements)
      if (Array.isArray(parsed)) {
        elementsCache = parsed
      }
    }
  } catch (error) {
    console.error('Failed to load collected elements:', error)
  }
}

// 生成唯一 ID
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// 全局操作函數
const globalAddMemory = (memoryData: Omit<ReadingMemory, 'id' | 'createdAt'>) => {
  const newMemory: ReadingMemory = {
    ...memoryData,
    id: generateId(),
    createdAt: Date.now()
  }

  memoriesCache = [...memoriesCache, newMemory]

  try {
    localStorage.setItem(MEMORIES_STORAGE_KEY, JSON.stringify(memoriesCache))
  } catch (error) {
    console.error('Failed to save reading memories:', error)
  }

  notifySubscribers()
}

const globalRemoveMemory = (id: string) => {
  memoriesCache = memoriesCache.filter(m => m.id !== id)

  try {
    localStorage.setItem(MEMORIES_STORAGE_KEY, JSON.stringify(memoriesCache))
  } catch (error) {
    console.error('Failed to save reading memories:', error)
  }

  notifySubscribers()
}

const globalClearMemories = () => {
  memoriesCache = []

  try {
    localStorage.removeItem(MEMORIES_STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear reading memories:', error)
  }

  notifySubscribers()
}

const globalAddCollectedElement = (elementData: Omit<CollectedElement, 'id' | 'collectedAt'>) => {
  const newElement: CollectedElement = {
    ...elementData,
    id: generateId(),
    collectedAt: Date.now()
  }

  elementsCache = [...elementsCache, newElement]

  try {
    localStorage.setItem(ELEMENTS_STORAGE_KEY, JSON.stringify(elementsCache))
  } catch (error) {
    console.error('Failed to save collected elements:', error)
  }

  notifySubscribers()
}

interface UseReadingMemoriesReturn {
  memories: ReadingMemory[]
  coverContribution: CoverContribution | null
  collectedElements: CollectedElement[]
  addMemory: (memory: Omit<ReadingMemory, 'id' | 'createdAt'>) => void
  removeMemory: (id: string) => void
  clearMemories: () => void
  isDuplicate: (text: string) => boolean
  addCollectedElement: (element: Omit<CollectedElement, 'id' | 'collectedAt'>) => void
  isElementCollected: (src: string) => boolean
}

export function useReadingMemories(): UseReadingMemoriesReturn {
  // 確保緩存已初始化
  initializeCache()

  // 使用 useSyncExternalStore 訂閱全局狀態
  const subscribe = useCallback((callback: () => void) => {
    subscribers.add(callback)
    return () => {
      subscribers.delete(callback)
    }
  }, [])

  const getMemoriesSnapshot = useCallback(() => memoriesCache, [])
  const getElementsSnapshot = useCallback(() => elementsCache, [])
  const getCoverContributionSnapshot = useCallback(() => coverContributionCache, [])

  const memories = useSyncExternalStore(subscribe, getMemoriesSnapshot, getMemoriesSnapshot)
  const collectedElements = useSyncExternalStore(subscribe, getElementsSnapshot, getElementsSnapshot)
  const coverContribution = useSyncExternalStore(subscribe, getCoverContributionSnapshot, getCoverContributionSnapshot)

  // 檢查是否重複
  const isDuplicate = useCallback((text: string): boolean => {
    const normalizedText = text.trim().toLowerCase()
    return memoriesCache.some(m => m.text.trim().toLowerCase() === normalizedText)
  }, [])

  // 檢查元素是否已收集
  const isElementCollected = useCallback((src: string): boolean => {
    return elementsCache.some(e => e.src === src)
  }, [])

  return {
    memories,
    coverContribution,
    collectedElements,
    addMemory: globalAddMemory,
    removeMemory: globalRemoveMemory,
    clearMemories: globalClearMemories,
    isDuplicate,
    addCollectedElement: globalAddCollectedElement,
    isElementCollected
  }
}
