import { useEffect, useRef, useState } from 'react'
import Matter from 'matter-js'
import { gsap } from 'gsap'
import { CollectedElement } from '@/types'

interface FallingElementsProps {
  elements: CollectedElement[]
  isVisible: boolean
}

export default function FallingElements({ elements, isVisible }: FallingElementsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<Matter.Engine | null>(null)
  const bodiesRef = useRef<{ [key: string]: Matter.Body }>({})
  const elementRefs = useRef<{ [key: string]: HTMLImageElement | null }>({})
  const wallsRef = useRef<Matter.Body[]>([])
  const hasSpawnedRef = useRef(false)
  const [isReady, setIsReady] = useState(false)

  // 初始化物理引擎
  useEffect(() => {
    if (elements.length === 0) return

    const engine = Matter.Engine.create({
      positionIterations: 30,
      velocityIterations: 30,
    })
    engineRef.current = engine
    engine.gravity.y = 0.5

    const updateBoundaries = () => {
      if (!containerRef.current || !engineRef.current) return

      const world = engineRef.current.world

      if (wallsRef.current.length > 0) {
        Matter.World.remove(world, wallsRef.current)
      }

      const width = containerRef.current.offsetWidth
      const height = containerRef.current.offsetHeight
      const wallThickness = 100

      const floor = Matter.Bodies.rectangle(
        width / 2,
        height + wallThickness / 2 - 15,
        width * 2,
        wallThickness,
        { isStatic: true, friction: 1, restitution: 0.1 }
      )

      const leftWall = Matter.Bodies.rectangle(
        -wallThickness / 2 + 5,
        height / 2,
        wallThickness,
        height * 3,
        { isStatic: true, friction: 0.5 }
      )

      const rightWall = Matter.Bodies.rectangle(
        width + wallThickness / 2 - 5,
        height / 2,
        wallThickness,
        height * 3,
        { isStatic: true, friction: 0.5 }
      )

      wallsRef.current = [floor, leftWall, rightWall]
      Matter.World.add(world, wallsRef.current)
    }

    updateBoundaries()
    window.addEventListener('resize', updateBoundaries)

    const ticker = gsap.ticker.add(() => {
      if (engineRef.current) {
        Matter.Engine.update(engineRef.current, 1000 / 60)
      }

      Object.keys(bodiesRef.current).forEach((key) => {
        const body = bodiesRef.current[key]
        const el = elementRefs.current[key]

        if (el && body) {
          el.style.transform = `translate(${body.position.x}px, ${body.position.y}px) rotate(${body.angle}rad) translate(-50%, -50%)`
          el.style.opacity = '0.6'
        }
      })
    })

    setIsReady(true)

    return () => {
      window.removeEventListener('resize', updateBoundaries)
      gsap.ticker.remove(ticker)
      if (engineRef.current) {
        Matter.World.clear(engineRef.current.world, false)
        Matter.Engine.clear(engineRef.current)
      }
    }
  }, [elements.length])

  // 觸發掉落
  useEffect(() => {
    if (!isVisible || !isReady || hasSpawnedRef.current || !engineRef.current || !containerRef.current) {
      return
    }

    hasSpawnedRef.current = true
    const containerWidth = containerRef.current.offsetWidth

    elements.forEach((element, i) => {
      setTimeout(() => {
        if (!engineRef.current) return

        const size = 80 + Math.random() * 60 // 80-140px
        const spawnX = 60 + Math.random() * (containerWidth - 120)
        const spawnY = -80 - Math.random() * 200 - i * 60

        const body = Matter.Bodies.rectangle(
          spawnX,
          spawnY,
          size,
          size,
          {
            restitution: 0.3,
            friction: 0.6,
            frictionAir: 0.015,
            density: 0.002,
            angle: (Math.random() - 0.5) * 0.5,
            chamfer: { radius: 8 },
          }
        )

        Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.06)

        Matter.World.add(engineRef.current.world, body)
        bodiesRef.current[element.id] = body
      }, i * 200)
    })
  }, [isVisible, isReady, elements])

  if (elements.length === 0) {
    return null
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0  pointer-events-none"
    >
      {elements.map((element) => (
        <img
          key={element.id}
          ref={(el) => (elementRefs.current[element.id] = el)}
          src={element.src}
          alt=""
          className="absolute top-0 left-0 opacity-0 w-24 h-24 md:w-32 md:h-32 object-contain"
          style={{ filter: 'brightness(0.7)' }}
        />
      ))}
    </div>
  )
}
