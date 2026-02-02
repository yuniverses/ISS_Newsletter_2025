import { useEffect, useState, useCallback, useRef } from 'react'
import { Chapter } from '@/types'
import { useReadingMemories } from '@/hooks/useReadingMemories'

interface TextSelectionProps {
  chapters: Chapter[]
}

interface ToastState {
  visible: boolean
  exiting: boolean
}

export default function TextSelection({ chapters }: TextSelectionProps) {
  const { addMemory, isDuplicate } = useReadingMemories()
  const [toast, setToast] = useState<ToastState>({ visible: false, exiting: false })
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 獲取章節標題
  const getChapterTitle = useCallback((chapterId: string): string => {
    const chapter = chapters.find(c => c.id === chapterId)
    return chapter?.title || '未知章節'
  }, [chapters])

  // 找到選取文字所屬的章節元素
  const findParentChapter = useCallback((node: Node | null): HTMLElement | null => {
    if (!node) return null

    let current: Node | null = node
    while (current) {
      if (current instanceof HTMLElement) {
        const htmlEl = current as HTMLElement
        // 檢查是否有 data-chapter-id 屬性
        if (htmlEl.dataset?.chapterId) {
          return htmlEl
        }
        // 也檢查 id 是否是章節 ID
        if (htmlEl.id && chapters.some(c => c.id === htmlEl.id)) {
          return htmlEl
        }
      }
      current = current.parentNode
    }
    return null
  }, [chapters])

  // 顯示 Toast 提示
  const showToast = useCallback(() => {
    // 清除之前的 timeout
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current)
    }

    setToast({ visible: true, exiting: false })

    // 1.5 秒後開始退出動畫
    toastTimeoutRef.current = setTimeout(() => {
      setToast({ visible: true, exiting: true })

      // 退出動畫結束後隱藏
      setTimeout(() => {
        setToast({ visible: false, exiting: false })
      }, 300)
    }, 1500)
  }, [])

  // 處理選取事件
  const handleSelection = useCallback(() => {
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed) return

    const text = selection.toString().trim()

    // 驗證長度
    if (text.length < 5 || text.length > 200) {
      selection.removeAllRanges()
      return
    }

    // 檢查是否重複
    if (isDuplicate(text)) {
      selection.removeAllRanges()
      return
    }

    // 找到所屬章節
    const chapterElement = findParentChapter(selection.anchorNode)
    if (!chapterElement) {
      selection.removeAllRanges()
      return
    }

    const chapterId = chapterElement.dataset?.chapterId || chapterElement.id

    // 保存記憶
    addMemory({
      text,
      chapterId,
      chapterTitle: getChapterTitle(chapterId)
    })

    // 顯示提示
    showToast()

    // 清除選取
    selection.removeAllRanges()
  }, [addMemory, isDuplicate, findParentChapter, getChapterTitle, showToast])

  // 註冊事件監聽
  useEffect(() => {
    // 防抖處理
    let timeoutId: NodeJS.Timeout | null = null

    const debouncedHandler = () => {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(handleSelection, 100)
    }

    document.addEventListener('mouseup', debouncedHandler)
    document.addEventListener('touchend', debouncedHandler)

    return () => {
      document.removeEventListener('mouseup', debouncedHandler)
      document.removeEventListener('touchend', debouncedHandler)
      if (timeoutId) clearTimeout(timeoutId)
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    }
  }, [handleSelection])

  // Toast 組件
  if (!toast.visible) return null

  return (
    <div
      className={`fixed bottom-8 right-8 z-50 px-5 py-3 bg-black/80 backdrop-blur-sm
                  text-white text-sm rounded-full shadow-lg border border-white/10
                  flex items-center gap-2
                  ${toast.exiting ? 'toast-exit' : 'toast-enter'}`}
    >
      <svg
        className="w-4 h-4 text-green-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
      <span>已保存</span>
    </div>
  )
}
