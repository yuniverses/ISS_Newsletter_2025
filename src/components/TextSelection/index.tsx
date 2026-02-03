import { useEffect, useCallback, useRef } from 'react'
import { Chapter } from '@/types'
import { useReadingMemories } from '@/hooks/useReadingMemories'
import { gsap } from 'gsap'

interface TextSelectionProps {
  chapters: Chapter[]
}

interface SelectionData {
  text: string
  chapterId: string
  chapterTitle: string
  rect: DOMRect
}

export default function TextSelection({ chapters }: TextSelectionProps) {
  const { addMemory, isDuplicate } = useReadingMemories()
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const selectionDataRef = useRef<SelectionData | null>(null)

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
        if (htmlEl.dataset?.chapterId) {
          return htmlEl
        }
        if (htmlEl.id && chapters.some(c => c.id === htmlEl.id)) {
          return htmlEl
        }
      }
      current = current.parentNode
    }
    return null
  }, [chapters])

  // 顯示 Toast
  const showToast = useCallback(() => {
    const toast = document.createElement('div')
    toast.className = 'fixed bottom-8 right-8 z-50 px-5 py-3 bg-black/80 backdrop-blur-sm text-white text-sm rounded-full shadow-lg border border-white/10 flex items-center gap-2'
    toast.innerHTML = `
      <svg class="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      <span>已收集</span>
    `
    document.body.appendChild(toast)

    gsap.fromTo(toast,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.3 }
    )

    setTimeout(() => {
      gsap.to(toast, {
        opacity: 0,
        y: -20,
        duration: 0.3,
        onComplete: () => toast.remove()
      })
    }, 1500)
  }, [])

  // 創建飄落的文字動畫
  const createFallingText = useCallback((text: string, rect: DOMRect) => {
    // 創建一個漂浮的文字元素
    const floatingText = document.createElement('div')
    floatingText.className = 'fixed z-[9999] pointer-events-none px-3 py-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200 text-sm text-gray-800 max-w-[200px] line-clamp-3'
    floatingText.style.cssText = `
      left: ${rect.left + rect.width / 2}px;
      top: ${rect.top}px;
      transform: translate(-50%, -50%);
    `
    floatingText.textContent = text.length > 50 ? text.slice(0, 50) + '...' : text
    document.body.appendChild(floatingText)

    const windowHeight = window.innerHeight

    // 動畫時間線
    const tl = gsap.timeline({
      onComplete: () => floatingText.remove()
    })

    // 1. 放大 + 彈起
    tl.to(floatingText, {
      scale: 1.2,
      y: -100,
      rotation: (Math.random() - 0.5) * 30,
      duration: 0.4,
      ease: "power2.out",
    })

    // 2. 落下穿過螢幕底部
    tl.to(floatingText, {
      y: windowHeight + 200,
      rotation: (Math.random() - 0.5) * 180,
      scale: 0.8,
      duration: 0.8,
      ease: "power2.in",
    })

    // 3. 淡出
    tl.to(floatingText, {
      opacity: 0,
      duration: 0.2,
    }, "-=0.2")
  }, [])

  // 隱藏選取按鈕
  const hideButton = useCallback(() => {
    if (buttonRef.current) {
      gsap.to(buttonRef.current, {
        opacity: 0,
        scale: 0.8,
        duration: 0.15,
        onComplete: () => {
          if (buttonRef.current) {
            buttonRef.current.remove()
            buttonRef.current = null
          }
        }
      })
    }
    selectionDataRef.current = null
  }, [])

  // 處理收集點擊
  const handleCollect = useCallback(() => {
    const data = selectionDataRef.current
    if (!data) return

    // 保存記憶
    addMemory({
      text: data.text,
      chapterId: data.chapterId,
      chapterTitle: data.chapterTitle
    })

    // 創建飄落動畫
    createFallingText(data.text, data.rect)

    // 顯示提示
    showToast()

    // 隱藏按鈕
    hideButton()

    // 清除選取
    window.getSelection()?.removeAllRanges()
  }, [addMemory, createFallingText, showToast, hideButton])

  // 顯示選取按鈕
  const showButton = useCallback((rect: DOMRect) => {
    // 移除舊按鈕
    if (buttonRef.current) {
      buttonRef.current.remove()
    }

    // 創建新按鈕
    const button = document.createElement('button')
    button.className = 'fixed z-[9999] px-4 py-2 bg-black text-white text-sm rounded-full shadow-lg hover:bg-gray-800 transition-colors flex items-center gap-2'
    button.innerHTML = `
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
      <span>收集</span>
    `

    // 定位在選取文字上方
    const buttonX = rect.left + rect.width / 2
    const buttonY = rect.top - 10
    button.style.cssText = `
      left: ${buttonX}px;
      top: ${buttonY}px;
      transform: translate(-50%, -100%);
      opacity: 0;
    `

    document.body.appendChild(button)
    buttonRef.current = button

    // 點擊事件
    button.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      handleCollect()
    })

    // 動畫顯示
    gsap.to(button, {
      opacity: 1,
      scale: 1,
      duration: 0.2,
      ease: "back.out(1.7)"
    })
  }, [handleCollect])

  // 處理選取事件
  const handleSelection = useCallback(() => {
    const selection = window.getSelection()

    // 如果沒有選取或選取為空
    if (!selection || selection.isCollapsed) {
      hideButton()
      return
    }

    const text = selection.toString().trim()

    // 驗證長度
    if (text.length < 5 || text.length > 200) {
      hideButton()
      return
    }

    // 檢查是否重複
    if (isDuplicate(text)) {
      hideButton()
      return
    }

    // 找到所屬章節
    const chapterElement = findParentChapter(selection.anchorNode)
    if (!chapterElement) {
      hideButton()
      return
    }

    const chapterId = chapterElement.dataset?.chapterId || chapterElement.id
    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()

    // 保存選取數據
    selectionDataRef.current = {
      text,
      chapterId,
      chapterTitle: getChapterTitle(chapterId),
      rect
    }

    // 顯示按鈕
    showButton(rect)
  }, [isDuplicate, findParentChapter, getChapterTitle, showButton, hideButton])

  // 註冊事件監聽
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null

    const debouncedHandler = () => {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(handleSelection, 150)
    }

    // 點擊其他地方隱藏按鈕
    const handleClickOutside = (e: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        // 延遲檢查，讓選取事件先處理
        setTimeout(() => {
          const selection = window.getSelection()
          if (!selection || selection.isCollapsed) {
            hideButton()
          }
        }, 50)
      }
    }

    document.addEventListener('mouseup', debouncedHandler)
    document.addEventListener('touchend', debouncedHandler)
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mouseup', debouncedHandler)
      document.removeEventListener('touchend', debouncedHandler)
      document.removeEventListener('mousedown', handleClickOutside)
      if (timeoutId) clearTimeout(timeoutId)
      if (buttonRef.current) buttonRef.current.remove()
    }
  }, [handleSelection, hideButton])

  // 這個組件不渲染任何東西（按鈕直接加到 body）
  return null
}
