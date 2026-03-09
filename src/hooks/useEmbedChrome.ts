import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface UseEmbedChromeOptions {
  enabled: boolean
  currentChapterId?: string
  pathname: string
}

const TOP_VISIBILITY_THRESHOLD = 80
const SCROLL_DIRECTION_THRESHOLD = 10
const IDLE_REVEAL_DELAY_MS = 700

export function useEmbedChrome({
  enabled,
  currentChapterId,
  pathname,
}: UseEmbedChromeOptions) {
  const [isVisible, setIsVisible] = useState(enabled)
  const idleTimerRef = useRef<number | null>(null)
  const lastScrollYRef = useRef(0)

  const clearIdleTimer = useCallback(() => {
    if (typeof window === 'undefined') return
    if (idleTimerRef.current !== null) {
      window.clearTimeout(idleTimerRef.current)
      idleTimerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      setIsVisible(false)
      return
    }

    const revealBar = () => setIsVisible(true)

    setIsVisible(true)
    lastScrollYRef.current = window.scrollY
    idleTimerRef.current = window.setTimeout(revealBar, IDLE_REVEAL_DELAY_MS)

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const delta = currentScrollY - lastScrollYRef.current
      const isNearTop = currentScrollY <= TOP_VISIBILITY_THRESHOLD

      if (isNearTop) {
        setIsVisible(true)
      } else if (delta > SCROLL_DIRECTION_THRESHOLD) {
        setIsVisible(false)
      } else if (delta < -SCROLL_DIRECTION_THRESHOLD) {
        setIsVisible(true)
      }

      clearIdleTimer()
      idleTimerRef.current = window.setTimeout(revealBar, IDLE_REVEAL_DELAY_MS)
      lastScrollYRef.current = currentScrollY
    }

    const handleResize = () => {
      if (window.scrollY <= TOP_VISIBILITY_THRESHOLD) {
        setIsVisible(true)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize)

    return () => {
      clearIdleTimer()
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [clearIdleTimer, enabled])

  const fallbackChapterId = useMemo(() => {
    const match = pathname.match(/^\/chapters\/([^/]+)/)
    return match?.[1] ?? ''
  }, [pathname])

  const standaloneUrl = useMemo(() => {
    if (typeof window === 'undefined') return '/'

    const targetChapterId = currentChapterId || fallbackChapterId
    return targetChapterId
      ? `${window.location.origin}/chapters/${targetChapterId}`
      : `${window.location.origin}/`
  }, [currentChapterId, fallbackChapterId])

  const openStandalone = useCallback(() => {
    if (typeof window === 'undefined') return
    window.open(standaloneUrl, '_blank', 'noopener,noreferrer')
  }, [standaloneUrl])

  return {
    isVisible,
    openStandalone,
    standaloneUrl,
  }
}
