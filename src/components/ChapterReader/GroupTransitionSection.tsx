import { useEffect, useMemo, useRef, type CSSProperties } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ChapterGroup } from '@/config/chapterGroups'

gsap.registerPlugin(ScrollTrigger)

interface GroupTransitionSectionProps {
  group: ChapterGroup
}

export default function GroupTransitionSection({ group }: GroupTransitionSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const symbolLayerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const fallingSymbol = group.symbol === '...' ? '…' : group.symbol

  const particles = useMemo(() => {
    return Array.from({ length: 28 }).map((_, index) => {
      const left = ((index * 37) % 100) + ((index % 3) * 2)
      const delay = (index % 7) * 0.2
      const duration = 2.6 + (index % 5) * 0.5
      const size = 26 + (index % 4) * 14

      return { id: index, left, delay, duration, size }
    })
  }, [])

  const typingStyle = {
    '--typing-width': `${Math.max(group.title.length + 4, 18)}ch`,
  } as CSSProperties

  useEffect(() => {
    if (prefersReducedMotion) return
    if (!sectionRef.current || !symbolLayerRef.current || !contentRef.current) return

    const ctx = gsap.context(() => {
      gsap.set([symbolLayerRef.current, contentRef.current], { opacity: 0 })
      gsap.set(contentRef.current, { y: 28 })

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          end: 'bottom 25%',
          scrub: 0.9,
        },
      })

      timeline
        .to([symbolLayerRef.current, contentRef.current], {
          opacity: 1,
          duration: 0.36,
          ease: 'none',
        })
        .to(
          contentRef.current,
          {
            y: 0,
            duration: 0.36,
            ease: 'none',
          },
          0
        )
        .to(
          [symbolLayerRef.current, contentRef.current],
          {
            opacity: 0,
            duration: 0.34,
            ease: 'none',
          },
          0.66
        )
        .to(
          contentRef.current,
          {
            y: -24,
            duration: 0.34,
            ease: 'none',
          },
          0.66
        )
    }, sectionRef)

    return () => ctx.revert()
  }, [prefersReducedMotion])

  return (
    <section
      ref={sectionRef}
      className="relative h-[170vh] w-full overflow-hidden bg-neutral-950 text-white"
    >
      <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden">
        <div
          ref={symbolLayerRef}
          className={`pointer-events-none absolute inset-0 ${
            prefersReducedMotion ? '' : 'opacity-0'
          }`}
        >
          {particles.map((item) => (
            <span
              key={item.id}
              className="group-transition-symbol absolute -top-24 font-black text-white/20"
              style={
                prefersReducedMotion
                  ? {
                      left: `${item.left}%`,
                      top: `${(item.id * 8) % 85}%`,
                      fontSize: `${item.size}px`,
                    }
                  : {
                      left: `${item.left}%`,
                      animationDelay: `${item.delay}s`,
                      animationDuration: `${item.duration}s`,
                      fontSize: `${item.size}px`,
                    }
              }
            >
              {fallingSymbol}
            </span>
          ))}
        </div>

        <div
          ref={contentRef}
          className={`relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 text-center ${
            prefersReducedMotion ? '' : 'opacity-0'
          }`}
        >
          <p className="mb-5 text-xs tracking-[0.45em] text-white/60">GROUP TRANSITION</p>
          <h2
            className={
              prefersReducedMotion
                ? 'text-4xl font-black tracking-wide text-white md:text-6xl'
                : 'group-transition-type text-4xl font-black tracking-wide text-white md:text-6xl'
            }
            style={prefersReducedMotion ? undefined : typingStyle}
          >
            {group.title}
          </h2>
          <p className="mt-8 max-w-2xl text-sm leading-8 text-white/80 md:text-base">
            {group.transitionDescription}
          </p>
        </div>
      </div>
    </section>
  )
}
