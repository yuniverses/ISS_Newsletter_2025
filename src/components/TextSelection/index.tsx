import { useEffect, useCallback, useRef, useState } from 'react'
import { Chapter } from '@/types'
import { useReadingMemories } from '@/hooks/useReadingMemories'
import { gsap } from 'gsap'

interface TextSelectionProps {
  chapters: Chapter[]
  currentChapterId?: string
}

interface SelectionData {
  text: string
  chapterId: string
  chapterTitle: string
  rect: DOMRect
}

interface HintPosition {
  left: number
  top: number
}

const TEXT_SELECTION_HINT_STORAGE_KEY = 'iss_hint_text_selection_seen'

const getFirstTextNode = (node: Node): Text | null => {
  if (node.nodeType === Node.TEXT_NODE) {
    const textNode = node as Text
    if (textNode.textContent?.trim()) {
      return textNode
    }
  }

  for (const child of Array.from(node.childNodes)) {
    const textNode = getFirstTextNode(child)
    if (textNode) return textNode
  }

  return null
}

export default function TextSelection({ chapters, currentChapterId }: TextSelectionProps) {
  const { addMemory, isDuplicate } = useReadingMemories()
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const selectionDataRef = useRef<SelectionData | null>(null)
  const selectionHintRef = useRef<HTMLDivElement | null>(null)
  const [showSelectionHint, setShowSelectionHint] = useState(false)
  const [hintPosition, setHintPosition] = useState<HintPosition | null>(null)
  const hasPromptedSelectionHintRef = useRef(false)

  const markSelectionHintSeen = useCallback(() => {
    try {
      localStorage.setItem(TEXT_SELECTION_HINT_STORAGE_KEY, '1')
    } catch {
      // noop
    }
  }, [])

  const dismissSelectionHint = useCallback(() => {
    setShowSelectionHint(false)
    setHintPosition(null)
    markSelectionHintSeen()
  }, [markSelectionHintSeen])

  const positionHintNearRect = useCallback((rect: DOMRect) => {
    const viewportWidth = window.innerWidth || 1
    const viewportHeight = window.innerHeight || 1
    const bubbleWidth = selectionHintRef.current?.offsetWidth || Math.min(viewportWidth * 0.72, 240)
    const bubbleHeight = selectionHintRef.current?.offsetHeight || 108
    const gap = 12

    let left = rect.right + gap
    if (left + bubbleWidth > viewportWidth - gap) {
      left = rect.left - bubbleWidth - gap
    }
    if (left < gap) {
      left = gap
    }

    let top = rect.top + rect.height / 2 - bubbleHeight / 2
    top = Math.min(
      Math.max(gap, top),
      viewportHeight - bubbleHeight - gap
    )

    setHintPosition({ left, top })
  }, [])

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
        const currentElement = current
        if (currentElement.dataset?.chapterId) {
          return currentElement
        }
        if (
          currentElement.id &&
          chapters.some(c => c.id === currentElement.id)
        ) {
          return currentElement
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

    gsap.fromTo(
      toast,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.3 }
    )

    window.setTimeout(() => {
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
    const tl = gsap.timeline({
      onComplete: () => floatingText.remove()
    })

    tl.to(floatingText, {
      scale: 1.2,
      y: -100,
      rotation: (Math.random() - 0.5) * 30,
      duration: 0.4,
      ease: 'power2.out',
    })

    tl.to(floatingText, {
      y: windowHeight + 200,
      rotation: (Math.random() - 0.5) * 180,
      scale: 0.8,
      duration: 0.8,
      ease: 'power2.in',
    })

    tl.to(floatingText, {
      opacity: 0,
      duration: 0.2,
    }, '-=0.2')
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

    addMemory({
      text: data.text,
      chapterId: data.chapterId,
      chapterTitle: data.chapterTitle
    })

    createFallingText(data.text, data.rect)
    showToast()
    hideButton()
    window.getSelection()?.removeAllRanges()
  }, [addMemory, createFallingText, showToast, hideButton])

  // 顯示選取按鈕
  const showButton = useCallback((rect: DOMRect) => {
    if (buttonRef.current) {
      buttonRef.current.remove()
    }

    const button = document.createElement('button')
    button.className = 'fixed z-[9999] min-h-[44px] px-4 py-2 bg-black text-white text-sm rounded-full shadow-lg hover:bg-gray-800 transition-colors flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-white'
    button.innerHTML = `
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
      <span>收集</span>
    `

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

    button.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      handleCollect()
    })

    gsap.to(button, {
      opacity: 1,
      scale: 1,
      duration: 0.2,
      ease: 'back.out(1.7)'
    })
  }, [handleCollect])

  const runSelectionDemo = useCallback((): boolean => {
    const selection = window.getSelection()
    if (!selection) return false

    const viewportCenter = (window.innerHeight || 1) / 2
    const paragraphs = Array.from(
      document.querySelectorAll<HTMLElement>('section[data-chapter-id="chapter-01"] article p')
    )
      .filter((paragraph) => (paragraph.textContent || '').trim().length >= 12)
      .sort((a, b) => {
        const rectA = a.getBoundingClientRect()
        const rectB = b.getBoundingClientRect()
        const centerA = (rectA.top + rectA.bottom) / 2
        const centerB = (rectB.top + rectB.bottom) / 2
        return Math.abs(centerA - viewportCenter) - Math.abs(centerB - viewportCenter)
      })

    for (const paragraph of paragraphs) {
      const textNode = getFirstTextNode(paragraph)
      if (!textNode || !textNode.textContent) continue

      const rawText = textNode.textContent
      let start = 0
      while (start < rawText.length && /\s/.test(rawText[start])) {
        start += 1
      }

      const end = Math.min(rawText.length, start + 20)
      if (end - start < 5) continue

      const range = document.createRange()
      try {
        range.setStart(textNode, start)
        range.setEnd(textNode, end)
      } catch {
        continue
      }

      const text = range.toString().trim()
      if (text.length < 5 || text.length > 200 || isDuplicate(text)) {
        continue
      }

      const chapterElement = findParentChapter(textNode)
      if (!chapterElement) {
        continue
      }

      selection.removeAllRanges()
      selection.addRange(range)

      const rect = range.getBoundingClientRect()
      if (!rect.width && !rect.height) {
        selection.removeAllRanges()
        continue
      }

      const chapterId = chapterElement.dataset?.chapterId || chapterElement.id
      selectionDataRef.current = {
        text,
        chapterId,
        chapterTitle: getChapterTitle(chapterId),
        rect
      }

      showButton(rect)
      positionHintNearRect(rect)
      return true
    }

    return false
  }, [findParentChapter, getChapterTitle, isDuplicate, positionHintNearRect, showButton])

  // 處理選取事件
  const handleSelection = useCallback(() => {
    const selection = window.getSelection()

    if (!selection || selection.isCollapsed) {
      hideButton()
      return
    }

    const text = selection.toString().trim()
    if (text.length < 5 || text.length > 200) {
      hideButton()
      return
    }

    if (isDuplicate(text)) {
      hideButton()
      return
    }

    const chapterElement = findParentChapter(selection.anchorNode)
    if (!chapterElement) {
      hideButton()
      return
    }

    const chapterId = chapterElement.dataset?.chapterId || chapterElement.id
    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()

    selectionDataRef.current = {
      text,
      chapterId,
      chapterTitle: getChapterTitle(chapterId),
      rect
    }

    showButton(rect)

    if (showSelectionHint) {
      positionHintNearRect(rect)
    }
  }, [
    findParentChapter,
    getChapterTitle,
    hideButton,
    isDuplicate,
    positionHintNearRect,
    showButton,
    showSelectionHint
  ])

  // 註冊事件監聽
  useEffect(() => {
    let timeoutId: number | null = null

    const debouncedHandler = () => {
      if (timeoutId) window.clearTimeout(timeoutId)
      timeoutId = window.setTimeout(handleSelection, 150)
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        window.setTimeout(() => {
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
      if (timeoutId) window.clearTimeout(timeoutId)
      if (buttonRef.current) buttonRef.current.remove()
    }
  }, [handleSelection, hideButton])

  useEffect(() => {
    let hasSeenHint = false
    try {
      hasSeenHint = localStorage.getItem(TEXT_SELECTION_HINT_STORAGE_KEY) === '1'
    } catch {
      hasSeenHint = true
    }
    if (hasSeenHint) return

    let retryTimerId: number | null = null

    const maybeShowHint = () => {
      if (hasPromptedSelectionHintRef.current) return
      if (currentChapterId !== 'chapter-01') return

      const chapterOneSection = document.getElementById('chapter-01')
      if (!chapterOneSection) return

      const rect = chapterOneSection.getBoundingClientRect()
      const viewportHeight = window.innerHeight || 1
      const chapterOneInView =
        rect.top < viewportHeight * 0.75 &&
        rect.bottom > viewportHeight * 0.2

      if (!chapterOneInView) return

      const didRunDemo = runSelectionDemo()
      if (!didRunDemo) return

      hasPromptedSelectionHintRef.current = true
      setShowSelectionHint(true)

      window.removeEventListener('scroll', maybeShowHint)
      if (retryTimerId) {
        window.clearInterval(retryTimerId)
        retryTimerId = null
      }
    }

    maybeShowHint()
    window.addEventListener('scroll', maybeShowHint, { passive: true })
    retryTimerId = window.setInterval(maybeShowHint, 1200)

    return () => {
      window.removeEventListener('scroll', maybeShowHint)
      if (retryTimerId) window.clearInterval(retryTimerId)
    }
  }, [currentChapterId, markSelectionHintSeen, runSelectionDemo])

  useEffect(() => {
    if (!showSelectionHint) return

    const syncHintPosition = () => {
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return

      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      if (!rect.width && !rect.height) return

      positionHintNearRect(rect)

      if (selectionDataRef.current) {
        selectionDataRef.current = {
          ...selectionDataRef.current,
          rect
        }
      }
    }

    syncHintPosition()
    const initialTimer = window.setTimeout(syncHintPosition, 0)
    window.addEventListener('scroll', syncHintPosition, { passive: true })
    window.addEventListener('resize', syncHintPosition)
    document.addEventListener('selectionchange', syncHintPosition)

    return () => {
      window.clearTimeout(initialTimer)
      window.removeEventListener('scroll', syncHintPosition)
      window.removeEventListener('resize', syncHintPosition)
      document.removeEventListener('selectionchange', syncHintPosition)
    }
  }, [positionHintNearRect, showSelectionHint])

  if (!showSelectionHint || !hintPosition) return null

  return (
    <div
      ref={selectionHintRef}
      className="fixed z-[9998] w-[min(72vw,240px)] rounded-xl border border-white/15 bg-black/80 px-3 py-2 text-white shadow-2xl backdrop-blur-sm"
      style={{
        left: hintPosition.left,
        top: hintPosition.top,
      }}
    >
      <p className="text-[10px] tracking-[0.18em] uppercase text-white/65">新手提示</p>
      <p className="mt-1.5 text-[11px] leading-relaxed md:text-xs">
        我先幫你選了一段文字，直接按旁邊「收集」就能存到封底。
      </p>
      <button
        type="button"
        onClick={dismissSelectionHint}
        className="mt-2 inline-flex min-h-[40px] items-center rounded-full border border-white/30 px-3 py-1 text-[10px] tracking-wide text-white/90 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/80"
      >
        我知道了
      </button>
    </div>
  )
}
