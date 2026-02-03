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

  // 根據數量計算縮放倍數
  // 1個 = 2倍, 逐漸遞減到 14+ 個 = 1倍
  const sizeMultiplier = useMemo(() => {
    const count = memories.length
    if (count <= 1) return 2
    if (count === 2) return 1.85
    if (count === 3) return 1.7
    if (count === 4) return 1.6
    if (count === 5) return 1.5
    if (count === 6) return 1.4
    if (count === 7) return 1.3
    if (count === 8) return 1.25
    if (count === 9) return 1.2
    if (count === 10) return 1.15
    if (count === 11) return 1.1
    if (count === 12) return 1.07
    if (count === 13) return 1.03
    return 1
  }, [memories.length])

  // 計算每個文字塊的尺寸
  const textBlocks = useMemo<TextBlock[]>(() => {
    return memories.map((memory) => {
      const len = memory.text.length

      let baseFontSize: number
      let baseWidth: number
      let baseHeight: number

      if (len <= 10) {
        baseFontSize = 16
        baseWidth = 100
        baseHeight = 45
      } else if (len <= 20) {
        baseFontSize = 14
        baseWidth = 130
        baseHeight = 50
      } else if (len <= 40) {
        baseFontSize = 13
        baseWidth = 150
        baseHeight = 60
      } else if (len <= 60) {
        baseFontSize = 12
        baseWidth = 170
        baseHeight = 75
      } else if (len <= 100) {
        baseFontSize = 11
        baseWidth = 190
        baseHeight = 90
      } else {
        baseFontSize = 10
        baseWidth = 210
        baseHeight = 105
      }

      return {
        id: memory.id,
        text: memory.text,
        width: Math.round(baseWidth * sizeMultiplier),
        height: Math.round(baseHeight * sizeMultiplier),
        fontSize: Math.round(baseFontSize * sizeMultiplier),
      }
    })
  }, [memories, sizeMultiplier])

  // 初始化物理引擎
  useEffect(() => {
    if (textBlocks.length === 0) return

    const engine = Matter.Engine.create({
      positionIterations: 10,
      velocityIterations: 10,
    })
    engineRef.current = engine
    engine.gravity.y = 0.4

    const updateBoundaries = () => {
      if (!containerRef.current || !engineRef.current) return

      const world = engineRef.current.world

      if (wallsRef.current.length > 0) {
        Matter.World.remove(world, wallsRef.current)
      }

      const width = containerRef.current.offsetWidth
      const height = containerRef.current.offsetHeight
      const wallThickness = 200

      // 地板 - 確保在可見區域內
      const floor = Matter.Bodies.rectangle(
        width / 2,
        height - 50,
        width + 200,
        wallThickness,
        { isStatic: true, friction: 1, restitution: 0.1, label: 'floor' }
      )

      // 左牆 - 加厚並延伸
      const leftWall = Matter.Bodies.rectangle(
        -wallThickness / 2,
        height / 2,
        wallThickness,
        height * 2,
        { isStatic: true, friction: 0.8, restitution: 0.2, label: 'leftWall' }
      )

      // 右牆 - 加厚並延伸
      const rightWall = Matter.Bodies.rectangle(
        width + wallThickness / 2,
        height / 2,
        wallThickness,
        height * 2,
        { isStatic: true, friction: 0.8, restitution: 0.2, label: 'rightWall' }
      )

      wallsRef.current = [floor, leftWall, rightWall]
      Matter.World.add(world, wallsRef.current)
    }

    updateBoundaries()
    window.addEventListener('resize', updateBoundaries)

    const ticker = gsap.ticker.add(() => {
      if (!engineRef.current || !containerRef.current) return

      Matter.Engine.update(engineRef.current, 1000 / 60)

      const containerWidth = containerRef.current.offsetWidth
      const containerHeight = containerRef.current.offsetHeight

      Object.keys(bodiesRef.current).forEach((key) => {
        const body = bodiesRef.current[key]
        const el = textRefs.current[key]

        if (el && body) {
          // 邊界檢查 - 如果元素超出邊界，將其拉回
          let x = body.position.x
          let y = body.position.y

          const halfWidth = 100 // 大約的半寬
          const halfHeight = 50 // 大約的半高

          // 限制在可見區域內
          if (x < halfWidth) {
            Matter.Body.setPosition(body, { x: halfWidth, y })
            Matter.Body.setVelocity(body, { x: Math.abs(body.velocity.x) * 0.5, y: body.velocity.y })
          }
          if (x > containerWidth - halfWidth) {
            Matter.Body.setPosition(body, { x: containerWidth - halfWidth, y })
            Matter.Body.setVelocity(body, { x: -Math.abs(body.velocity.x) * 0.5, y: body.velocity.y })
          }
          if (y > containerHeight - halfHeight - 50) {
            Matter.Body.setPosition(body, { x, y: containerHeight - halfHeight - 50 })
            Matter.Body.setVelocity(body, { x: body.velocity.x * 0.8, y: 0 })
          }

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

    // 計算生成位置，避免重疊
    const columns = Math.min(textBlocks.length, 4)
    const columnWidth = (containerWidth - 100) / columns

    textBlocks.forEach((block, i) => {
      setTimeout(() => {
        if (!engineRef.current) return

        // 分散在不同列生成
        const column = i % columns
        const spawnX = 50 + column * columnWidth + columnWidth / 2 + (Math.random() - 0.5) * 40
        const spawnY = -100 - Math.floor(i / columns) * 80 - Math.random() * 50

        // 使用圓形碰撞體，更穩定
        const radius = Math.max(block.width, block.height) / 2
        const body = Matter.Bodies.circle(
          spawnX,
          spawnY,
          radius * 0.6,
          {
            restitution: 0.3,
            friction: 0.5,
            frictionAir: 0.02,
            density: 0.001,
            label: `text-${block.id}`,
          }
        )

        // 存儲尺寸信息
        // @ts-ignore
        body.plugin = { width: block.width, height: block.height }

        Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.03)

        Matter.World.add(engineRef.current.world, body)
        bodiesRef.current[block.id] = body
      }, i * 150)
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
          className="absolute top-0 left-0 opacity-0 pointer-events-none select-none px-3 py-2"
          style={{
            width: block.width,
            height: block.height,
            willChange: 'transform',
          }}
        >
          <p
            className="font-serif text-white/80 leading-snug text-center h-full flex items-center justify-center"
            style={{ fontSize: block.fontSize }}
          >
            {block.text}
          </p>
        </div>
      ))}
    </div>
  )
}
