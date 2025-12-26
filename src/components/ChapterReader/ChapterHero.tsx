import { useEffect, useRef, useState } from 'react'
import { cn } from '@/utils/cn'
import { Link, Check } from 'lucide-react'

interface ChapterHeroProps {
  chapterNumber: string
  title: string
  category?: string
  preface?: string
  coverImage?: string
  chapterId?: string
}

export default function ChapterHero({
  chapterNumber,
  title,
  category = '服務聲精選',
  preface,
  coverImage = '/assets/IMG_6561.png',
  chapterId,
}: ChapterHeroProps) {
  const heroRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const rafRef = useRef<number>()
  const [copied, setCopied] = useState(false)

  const handleCopyLink = () => {
    if (!chapterId) return
    const url = `${window.location.origin}/chapters/${chapterId}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    const handleScroll = () => {
      // Cancel previous RAF if it exists
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }

      // Use RAF for smooth animation
      rafRef.current = requestAnimationFrame(() => {
        if (!heroRef.current) return

        const rect = heroRef.current.getBoundingClientRect()
        const windowHeight = window.innerHeight

        // Calculate scroll progress (0 to 1)
        const scrollStart = windowHeight
        const scrollRange = windowHeight * 1.5
        const progress = Math.max(0, Math.min(1, (scrollStart - rect.top) / scrollRange))

        setScrollProgress(progress)
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial check

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])

  // Calculate transform values based on scroll progress
  // Scale from 0.5 to 0.95 (留出边距，不要满版)
  const scale = 0.5 + scrollProgress * 0.45

  // Title elements fade in as image grows
  const contentOpacity = Math.min(1, scrollProgress * 1.5)

  // Preface fades in after image is mostly expanded
  const prefaceOpacity = Math.max(0, (scrollProgress - 0.6) * 2.5)

  return (
    <div ref={heroRef} className="relative w-full min-h-[200vh] bg-white">
      {/* Image Container - grows from small to max with margin */}
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-white">
        {/* Growing Image - using transform for GPU acceleration with padding */}
        <div
          className="relative w-[95%] h-[92%] will-change-transform"
          style={{
            transform: `scale(${scale})`,
          }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${coverImage})`,
            }}
          />
        </div>

        {/* Content Overlay - Japanese magazine layout */}
        <div
          className="absolute inset-0 px-12 md:px-20 lg:px-32 xl:px-40 py-20 md:py-24 lg:py-28 will-change-opacity flex flex-col justify-between"
          style={{ opacity: contentOpacity }}
        >
          {/* Top section with number and title */}
          <div className="flex items-start justify-between">
            {/* Chapter Number - Top Left */}
            <div
              className={cn(
                'text-[48px] md:text-[64px] lg:text-[80px] leading-none font-medium',
                'text-white tracking-[-0.08em]'
              )}
            >
              {chapterNumber}
            </div>

            {/* Title and Category - Top Right */}
            <div className="text-right mt-2 md:mt-4">
              <p
                className={cn(
                  'text-base md:text-lg lg:text-xl font-light mb-1',
                  'text-white tracking-[-0.08em]'
                )}
              >
                {category}
              </p>
              <h1
                className={cn(
                  'text-lg md:text-xl lg:text-2xl xl:text-3xl font-medium',
                  'text-white tracking-[-0.08em] leading-tight'
                )}
              >
                {title}
              </h1>
            </div>
          </div>

          {/* Bottom section */}
          <div className="flex items-end justify-between">
            {/* Subtitle text - Bottom Left */}
            <p
              className={cn(
                'text-xs md:text-sm lg:text-base max-w-xl',
                'text-white font-light tracking-[-0.08em] leading-relaxed'
              )}
            >
              lon connects two related but independently standing ideas. Similarly, at Semicolon Design
            </p>

            {/* Copy Link Button - Bottom Right */}
            {chapterId && (
              <button
                onClick={handleCopyLink}
                className={cn(
                  "p-2 rounded-full transition-all duration-200",
                  "text-white/70 hover:text-white hover:bg-white/10",
                  copied && "text-white bg-white/20"
                )}
                title="複製章節連結"
                aria-label="複製章節連結"
              >
                {copied ? <Check size={20} /> : <Link size={20} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Preface Section - appears below */}
      {preface && (
        <div className="relative bg-white">
          <div
            className="px-8 md:px-16 lg:px-32 py-16 md:py-24 will-change-opacity"
            style={{ opacity: prefaceOpacity }}
          >
            <div className="max-w-4xl">
              <p className="text-base md:text-lg lg:text-xl leading-relaxed text-gray-800 font-light">
                {preface}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
