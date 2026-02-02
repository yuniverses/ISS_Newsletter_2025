import { useEffect, useRef, useMemo, useState } from 'react'
import Matter from 'matter-js'
import { gsap } from 'gsap'
import { ReadingMemory } from '@/types'

interface FallingMemoriesProps {
  memories: ReadingMemory[]
  isVisible: boolean
}

interface TextBlock {
  id: string
  text: string
  width: number
  height: number
  fontSize: number
}

export default function FallingMemories({ memories, isVisible }: FallingMemoriesProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<Matter.Engine | null>(null)
  const bodiesRef = useRef<{ [key: string]: Matter.Body }>({})
  const textRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const wallsRef = useRef<Matter.Body[]>([])
  const hasSpawnedRef = useRef(false)
  const [isReady, setIsReady] = useState(false)

  // 計算每個文字塊的尺寸 - 簡單直接的方式
  const textBlocks = useMemo<TextBlock[]>(() => {
    return memories.map((memory) => {
      const len = memory.text.length

      // 根據長度決定尺寸，保持方正的比例
      let fontSize: number
      let width: number
      let height: number

      if (len <= 10) {
        fontSize = 18
        width = 120
        height = 50
      } else if (len <= 20) {
        fontSize = 16
        width = 160
        height = 55
      } else if (len <= 40) {
        fontSize = 15
        width = 180
        height = 70
      } else if (len <= 60) {
        fontSize = 14
        width = 200
        height = 85
      } else if (len <= 100) {
        fontSize = 13
        width = 220
        height = 100
      } else {
        fontSize = 12
        width = 240
        height = 120
      }

      return {
        id: memory.id,
        text: memory.text,
        width,
        height,
        fontSize,
      }
    })
  }, [memories])

  // 初始化物理引擎
  useEffect(() => {
    if (textBlocks.length === 0) return

    const engine = Matter.Engine.create({
      positionIterations: 50,
      velocityIterations: 50,
    })
    engineRef.current = engine
    engine.gravity.y = 0.6

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
        const el = textRefs.current[key]

        if (el && body) {
          el.style.transform = `translate(${body.position.x}px, ${body.position.y}px) rotate(${body.angle}rad) translate(-50%, -50%)`
          el.style.opacity = '1'
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
  }, [textBlocks.length])

  // 觸發掉落
  useEffect(() => {
    if (!isVisible || !isReady || hasSpawnedRef.current || !engineRef.current || !containerRef.current) {
      return
    }

    hasSpawnedRef.current = true
    const containerWidth = containerRef.current.offsetWidth

    textBlocks.forEach((block, i) => {
      setTimeout(() => {
        if (!engineRef.current) return

        const spawnX = 80 + Math.random() * (containerWidth - 160)
        const spawnY = -60 - Math.random() * 200 - i * 50

        // 碰撞體尺寸比視覺稍大一點，防止重疊
        const body = Matter.Bodies.rectangle(
          spawnX,
          spawnY,
          block.width + 10,
          block.height + 10,
          {
            restitution: 0.2,
            friction: 0.8,
            frictionAir: 0.02,
            density: 0.002,
            angle: (Math.random() - 0.5) * 0.4,
            chamfer: { radius: 6 },
          }
        )

        Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.05)

        Matter.World.add(engineRef.current.world, body)
        bodiesRef.current[block.id] = body
      }, i * 130)
    })
  }, [isVisible, isReady, textBlocks])

  if (textBlocks.length === 0) {
    return null
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-screen overflow-hidden"
    >
      {textBlocks.map((block) => (
        <div
          key={block.id}
          ref={(el) => (textRefs.current[block.id] = el)}
          className="absolute top-0 left-0 opacity-0 pointer-events-none select-none"
          style={{
            width: block.width,
            height: block.height,
            willChange: 'transform',
          }}
        >
          <p
            className="font-serif text-white/90 leading-relaxed text-center h-full flex items-center justify-center"
            style={{ fontSize: block.fontSize }}
          >
            {block.text}
          </p>
        </div>
      ))}
    </div>
  )
}
