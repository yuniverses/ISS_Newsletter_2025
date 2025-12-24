import { useRef, useEffect, useMemo } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Chapter } from '../../types'

gsap.registerPlugin(ScrollTrigger)

interface TableOfContentsProps {
  chapters: Chapter[]
  onChapterClick: (chapterId: string) => void
}

const SHAPES = [
  '/assets/menu-shapes/shape-1.png',
  '/assets/menu-shapes/shape-2.png',
  '/assets/menu-shapes/shape-3.png',
  '/assets/menu-shapes/shape-4.png',
  '/assets/menu-shapes/shape-5.png',
  '/assets/menu-shapes/shape-6.png',
  '/assets/menu-shapes/shape-7.png',
  '/assets/menu-shapes/shape-8.png',
]

export default function TableOfContents({ chapters, onChapterClick }: TableOfContentsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const shapesContainerRef = useRef<HTMLDivElement>(null)
  const shapeRefs = useRef<(HTMLImageElement | null)[]>([])
  
  // Track which particle to spawn next (0 to 7)
  const nextParticleIndex = useRef(0)
  
  // Track batched fires
  const hasFiredBatch1 = useRef(false) // 0.4
  const hasFiredBatch2 = useRef(false) // 0.55
  const hasFiredBatch3 = useRef(false) // 0.7
  
  // Floor/Ground Offset from bottom (Set to 0 for absolute bottom edge)
  const GROUND_OFFSET = 0
  
  // Create shuffled slots for landing positions to avoid overlap
  const particleSlots = useRef<number[]>([])

  useEffect(() => {
    // Initialize shuffled slots for 8 particles
    const slots = Array.from({ length: 8 }, (_, i) => i)
    for (let i = slots.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [slots[i], slots[j]] = [slots[j], slots[i]];
    }
    particleSlots.current = slots
  }, [])

  const handleChapterClick = (chapterId: string) => {
    onChapterClick(chapterId)
    setTimeout(() => {
      const chapterElement = document.getElementById(chapterId)
      if (chapterElement) {
        chapterElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  // Exact 8 particles
  const particles = useMemo(() => {
    return Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      src: SHAPES[i % SHAPES.length],
    }))
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      const menu = menuRef.current
      const container = containerRef.current
      if (!menu || !container) return

      ScrollTrigger.create({
        trigger: container,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const velocity = self.getVelocity() / 300
          
          if (velocity > 0) {
             // Spray logic: Batched
             // Batch 1: > 0.4 (Fire 3)
             if (!hasFiredBatch1.current && self.progress > 0.4) {
               spawnBatch(3, velocity)
               hasFiredBatch1.current = true
             }
             // Batch 2: > 0.55 (Fire 3)
             if (!hasFiredBatch2.current && self.progress > 0.55) {
               spawnBatch(3, velocity)
               hasFiredBatch2.current = true
             }
             // Batch 3: > 0.7 (Fire 2, remainder)
             if (!hasFiredBatch3.current && self.progress > 0.7) {
               spawnBatch(2, velocity)
               hasFiredBatch3.current = true
             }
          }
        }
      })

      // 2. Menu Lift (Climb from below to the bottom edge)
      // Starts at y: 600 (off-screen bottom) and ends at y: 0 (touching bottom edge)
      gsap.fromTo(menu, 
        { y: 600 },
        { 
          y: 0, 
          ease: "power1.out",
          scrollTrigger: {
            trigger: container,
            start: "top bottom",
            end: "bottom center",
            scrub: 1
          }
        }
      )

    }, containerRef)

    return () => ctx.revert()
  }, [])

  const spawnBatch = (count: number, velocity: number) => {
    for (let i = 0; i < count; i++) {
       setTimeout(() => {
         spawnParticle(velocity)
       }, i * 150)
    }
  }

  const spawnParticle = (velocity: number) => {
    if (nextParticleIndex.current >= 8) return

    const index = nextParticleIndex.current
    const slotIndex = particleSlots.current[index]
    nextParticleIndex.current++

    const el = shapeRefs.current[index]
    const menu = menuRef.current
    const container = containerRef.current
    
    if (!el || !menu || !container) return

    const menuRect = menu.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()
    
    const relativeLeft = menuRect.left - containerRect.left
    const relativeTop = (menuRect.top - containerRect.top) + menuRect.height
    
    // Spawn point
    const spawnX = relativeLeft + (menuRect.width * 0.5)
    const spawnY = relativeTop - 30 

    // Ground level for particles:
    // Sitting ON the absolute bottom line.
    const groundY = container.offsetHeight - 130
    
    // Non-overlapping X slots
    const startX = relativeLeft + menuRect.width + 100
    const availableWidth = Math.max(container.offsetWidth - startX - 200, 800)
    const slotWidth = availableWidth / 8
    const targetX = startX + (slotIndex * slotWidth) + (Math.random() * (slotWidth * 0.3))

    gsap.killTweensOf(el)
    
    gsap.set(el, {
      x: spawnX,
      y: spawnY,
      opacity: 1,
      scale: 0.9 + Math.random() * 0.3, 
      rotation: Math.random() * 360,
      display: 'block'
    })

    const duration = 1.3 + Math.random() * 0.5
    
    gsap.to(el, {
      x: targetX,
      duration: duration,
      ease: "power1.out",
    })

    const jumpHeight = 150 + Math.random() * 100
    const jumpDuration = 0.4
    const fallDuration = duration - jumpDuration
    
    gsap.to(el, {
      y: spawnY - jumpHeight,
      duration: jumpDuration,
      ease: "power2.out",
      onComplete: () => {
         gsap.to(el, {
            y: groundY,
            duration: fallDuration,
            ease: "bounce.out",
         })
      }
    })

    gsap.to(el, {
       rotation: `+=${Math.random() * 360}`,
       duration: duration,
       ease: "power1.out"
    })
  }

  return (
    <section 
      ref={containerRef} 
      className="relative min-h-screen w-full bg-white text-black pt-64 pb-0 flex flex-col justify-end"
    >
      {/* Background Shapes Container */}
      <div 
        ref={shapesContainerRef} 
        className="absolute inset-0 pointer-events-none z-0"
      >
        {particles.map((p, i) => (
          <img
            key={p.id}
            ref={(el) => (shapeRefs.current[i] = el)}
            src={p.src}
            alt=""
            className="absolute hidden w-40 h-40 object-contain origin-center opacity-0"
            style={{ left: 0, top: 0 }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full pl-[5%] md:pl-[10%] lg:pl-[15%] pr-8 flex justify-start">
        {/* Simplified Paper Card */}
        <div 
          ref={menuRef} 
          className="w-full max-w-[500px] bg-[#dedede] p-6 md:p-10 origin-top transform-gpu mb-0 rounded-t-sm"
        >
          {/* Table of Contents List Only */}
          <div className="space-y-0">
            {chapters.map((chapter, index) => (
              <button
                key={chapter.id}
                onClick={() => handleChapterClick(chapter.id)}
                className="w-full text-left group block transition-all hover:bg-black/5 -mx-4 px-4 py-5"
              >
                {/* Row 1: Title & Author */}
                <div className="flex justify-between items-baseline mb-2 gap-4">
                   <h3 className="text-lg md:text-xl font-bold leading-tight group-hover:translate-x-1 transition-transform duration-300">
                     {chapter.title}
                   </h3>
                   <span className="text-xs md:text-sm text-gray-600 font-medium whitespace-nowrap flex-shrink-0">
                     {chapter.authors?.[0] || '特邀嘉賓'}
                   </span>
                </div>
                
                {/* Row 2: Divider Line */}
                <div className="w-full h-px bg-black opacity-20 group-hover:opacity-100 transition-opacity mt-1 mb-2 relative">
                    <div className="absolute right-0 -top-1.5 w-1 h-1 bg-black rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Row 3: Description & ID */}
                <div className="flex justify-between items-start text-[10px] md:text-xs text-gray-500 font-mono mt-1">
                   <p className="line-clamp-1 max-w-[80%] opacity-70">
                     {chapter.description}
                   </p>
                   <span>{String(index + 1).padStart(2, '0')}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
