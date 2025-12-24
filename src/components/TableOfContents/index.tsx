import { useRef, useEffect, useMemo } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Matter from 'matter-js'
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
  
  // Physics Refs
  const engineRef = useRef<Matter.Engine | null>(null)
  const bodiesRef = useRef<{ [key: number]: Matter.Body }>({})
  const wallsRef = useRef<Matter.Body[]>([])
  
  // Track which particle to spawn next
  const nextParticleIndex = useRef(0)
  
  // Track batched fires (5 stages)
  const hasFiredBatch1 = useRef(false)
  const hasFiredBatch2 = useRef(false)
  const hasFiredBatch3 = useRef(false)
  const hasFiredBatch4 = useRef(false)
  const hasFiredBatch5 = useRef(false)

  const handleChapterClick = (chapterId: string) => {
    onChapterClick(chapterId)
    setTimeout(() => {
      const chapterElement = document.getElementById(chapterId)
      if (chapterElement) {
        chapterElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  // Exact 12 particles
  const particles = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      src: SHAPES[i % SHAPES.length],
    }))
  }, [])

  useEffect(() => {
    // 1. Setup Matter.js Engine
    const engine = Matter.Engine.create()
    engineRef.current = engine
    const world = engine.world
    
    engine.gravity.y = 1

    // 2. Setup Boundaries (Walls & Floor)
    const updateBoundaries = () => {
      if (!containerRef.current) return
      
      if (wallsRef.current.length > 0) {
        Matter.World.remove(world, wallsRef.current)
      }

      const width = containerRef.current.offsetWidth
      const height = containerRef.current.offsetHeight
      const wallThickness = 1000

      // Floor
      const floor = Matter.Bodies.rectangle(width / 2, height + (wallThickness / 2) - 20, width * 2, wallThickness, { 
        isStatic: true,
        render: { visible: false }
      })

      // Left Wall
      const leftWall = Matter.Bodies.rectangle(0 - (wallThickness / 2), height / 2, wallThickness, height * 2, { 
        isStatic: true,
        render: { visible: false }
      })

      // Right Wall
      const rightWall = Matter.Bodies.rectangle(width + (wallThickness / 2), height / 2, wallThickness, height * 2, { 
        isStatic: true,
        render: { visible: false }
      })

      wallsRef.current = [floor, leftWall, rightWall]
      Matter.World.add(world, wallsRef.current)
    }

    updateBoundaries()
    window.addEventListener('resize', updateBoundaries)

    // 3. Render Loop
    const ticker = gsap.ticker.add((time, deltaTime, frame) => {
      Matter.Engine.update(engine, 1000 / 60)

      // Sync DOM elements
      Object.keys(bodiesRef.current).forEach((key) => {
        const index = parseInt(key)
        const body = bodiesRef.current[index]
        const el = shapeRefs.current[index]
        
        if (el && body) {
          // Sync Position & Rotation (w-56 = 224px. Half = 112px)
          const x = body.position.x - 112
          const y = body.position.y - 112
          const angle = body.angle 

          el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${angle}rad)`
          el.style.opacity = '1'
          el.style.display = 'block'
        }
      })
    })

    // 4. GSAP ScrollTrigger Logic
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
             // Spray logic: 5 Batches (Advanced timings)
             // Batch 1: > 0.2
             if (!hasFiredBatch1.current && self.progress > 0.2) {
               spawnBatch(1, 0.1)
               hasFiredBatch1.current = true
             }
             // Batch 2: > 0.35
             if (!hasFiredBatch2.current && self.progress > 0.35) {
               spawnBatch(2, 0.3)
               hasFiredBatch2.current = true
             }
             // Batch 3: > 0.5
             if (!hasFiredBatch3.current && self.progress > 0.5) {
               spawnBatch(5, 0.5)
               hasFiredBatch3.current = true
             }
             // Batch 4: > 0.65
             if (!hasFiredBatch4.current && self.progress > 0.65) {
               spawnBatch(2, 0.7)
               hasFiredBatch4.current = true
             }
             // Batch 5: > 0.8
             if (!hasFiredBatch5.current && self.progress > 0.8) {
               spawnBatch(2, 0.9)
               hasFiredBatch5.current = true
             }
          }
        }
      })

      // Menu Lift Animation
      gsap.fromTo(menu, 
        { y: 1200 },
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

    return () => {
      ctx.revert()
      window.removeEventListener('resize', updateBoundaries)
      gsap.ticker.remove(ticker)
      Matter.World.clear(world, false)
      Matter.Engine.clear(engine)
    }
  }, [])

  const spawnBatch = (count: number, yRatio: number) => {
    for (let i = 0; i < count; i++) {
       setTimeout(() => {
         spawnParticle(yRatio)
       }, i * 100)
    }
  }

  const spawnParticle = (yRatio: number) => {
    if (nextParticleIndex.current >= 12) return
    const index = nextParticleIndex.current
    nextParticleIndex.current++

    const menu = menuRef.current
    const container = containerRef.current
    const engine = engineRef.current
    if (!menu || !container || !engine) return

    const menuRect = menu.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()
    
    const relativeLeft = menuRect.left - containerRect.left
    const relativeTop = (menuRect.top - containerRect.top)
    
    const spawnX = relativeLeft + (menuRect.width * 0.5)
    const spawnY = relativeTop + (menuRect.height * yRatio)

    // Physics Body (Increased radius for w-56)
    const radius = 100 
    
    const body = Matter.Bodies.circle(spawnX, spawnY, radius, {
      restitution: 0.6,
      friction: 0.1,
      density: 0.001,
      angle: Math.random() * Math.PI * 2
    })

    const forceX = 0.1 + Math.random() * 0.1
    const forceY = -0.06 - Math.random() * 0.06 
    
    Matter.Body.applyForce(body, body.position, { x: forceX, y: forceY })
    Matter.World.add(engine.world, body)
    
    bodiesRef.current[index] = body
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
            // w-56 = 224px (approx 1.2x bigger than w-48)
            className="absolute hidden w-56 h-56 object-contain origin-center opacity-0 will-change-transform"
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
          {/* Table of Contents List */}
          <div className="space-y-10">
            
            {/* Group 1: Intro */}
            <div className="relative">
               <div className="flex justify-between items-baseline border-b-2 border-black pb-2 mb-6">
                 <h2 className="text-xl font-bold">服科的入口</h2>
                 <span className="text-xs font-light">GROUP 01</span>
               </div>
               {chapters.filter(c => ['chapter-01'].includes(c.id)).map(chapter => (
                 <ChapterItem key={chapter.id} chapter={chapter} onClick={() => handleChapterClick(chapter.id)} />
               ))}
            </div>

            {/* Group 2: AI */}
            <div className="relative">
               <div className="flex justify-between items-baseline border-b-2 border-black pb-2 mb-6">
                 <h2 className="text-xl font-bold">AI</h2>
                 <span className="text-xs font-light">GROUP 02</span>
               </div>
               {chapters.filter(c => ['chapter-02', 'chapter-03'].includes(c.id)).map(chapter => (
                 <ChapterItem key={chapter.id} chapter={chapter} onClick={() => handleChapterClick(chapter.id)} />
               ))}
            </div>

            {/* Group 3: Alumni */}
            <div className="relative">
               <div className="flex justify-between items-baseline border-b-2 border-black pb-2 mb-6">
                 <h2 className="text-xl font-bold">學長姐 救我</h2>
                 <span className="text-xs font-light">GROUP 03</span>
               </div>
               {chapters.filter(c => ['chapter-04', 'chapter-05', 'chapter-06', 'chapter-07'].includes(c.id)).map(chapter => (
                 <ChapterItem key={chapter.id} chapter={chapter} onClick={() => handleChapterClick(chapter.id)} />
               ))}
            </div>

            {/* Group 4: Behind Scenes */}
            <div className="relative">
               <div className="flex justify-between items-baseline border-b-2 border-black pb-2 mb-6">
                 <h2 className="text-xl font-bold">展開 幕後</h2>
                 <span className="text-xs font-light">GROUP 04</span>
               </div>
               {chapters.filter(c => ['chapter-08', 'chapter-09'].includes(c.id)).map(chapter => (
                 <ChapterItem key={chapter.id} chapter={chapter} onClick={() => handleChapterClick(chapter.id)} />
               ))}
            </div>

            {/* Group 5: Events */}
            <div className="relative">
               <div className="flex justify-between items-baseline border-b-2 border-black pb-2 mb-6">
                 <h2 className="text-xl font-bold">活動現場</h2>
                 <span className="text-xs font-light">GROUP 05</span>
               </div>
               {chapters.filter(c => ['chapter-10', 'chapter-11'].includes(c.id)).map(chapter => (
                 <ChapterItem key={chapter.id} chapter={chapter} onClick={() => handleChapterClick(chapter.id)} />
               ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}

// Sub-component for individual chapter item
function ChapterItem({ chapter, onClick }: { chapter: Chapter, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left group block mb-8 last:mb-0 relative"
    >
      {/* Top Row: Title + Tag */}
      <div className="flex justify-between items-start mb-1">
        <h3 className="text-base md:text-lg font-bold leading-tight max-w-[75%] group-hover:translate-x-1 transition-transform duration-300">
          {chapter.title}
        </h3>
        {chapter.tag && (
          <span className="text-[10px] md:text-xs font-light text-gray-500 whitespace-nowrap uppercase tracking-wider">
            {chapter.tag}
          </span>
        )}
      </div>

      {/* Bottom Row: Description + Author */}
      <div className="flex justify-between items-end gap-4">
        <p className="text-[11px] md:text-xs text-gray-600 leading-relaxed max-w-[70%] line-clamp-2">
          {chapter.description}
        </p>
        <span className="text-xs md:text-sm font-bold text-gray-900 text-right whitespace-nowrap">
          {chapter.authors?.[0]}
        </span>
      </div>
      
      {/* Divider Line */}
      <div className="w-full h-px bg-black/5 mt-5 group-hover:bg-black/20 transition-colors" />
    </button>
  )
}
