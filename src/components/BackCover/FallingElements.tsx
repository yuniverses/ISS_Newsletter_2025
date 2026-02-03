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
      positionIterations: 10,
      velocityIterations: 10,
    })
    engineRef.current = engine
    engine.gravity.y = 0.3

    const updateBoundaries = () => {
      if (!containerRef.current || !engineRef.current) return

      const world = engineRef.current.world

      if (wallsRef.current.length > 0) {
        Matter.World.remove(world, wallsRef.current)
      }

      const width = containerRef.current.offsetWidth
      const height = containerRef.current.offsetHeight
      const wallThickness = 200

      // 地板
      const floor = Matter.Bodies.rectangle(
        width / 2,
        height - 50,
        width + 200,
        wallThickness,
        { isStatic: true, friction: 1, restitution: 0.1, label: 'floor' }
      )

      // 左牆
      const leftWall = Matter.Bodies.rectangle(
        -wallThickness / 2,
        height / 2,
        wallThickness,
        height * 2,
        { isStatic: true, friction: 0.8, restitution: 0.2, label: 'leftWall' }
      )

      // 右牆
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
        const el = elementRefs.current[key]

        if (el && body) {
          // 邊界檢查
          let x = body.position.x
          let y = body.position.y

          // @ts-ignore
          const size = body.plugin?.size || 80
          const halfSize = size / 2

          // 限制在可見區域內
          if (x < halfSize) {
            Matter.Body.setPosition(body, { x: halfSize, y })
            Matter.Body.setVelocity(body, { x: Math.abs(body.velocity.x) * 0.5, y: body.velocity.y })
          }
          if (x > containerWidth - halfSize) {
            Matter.Body.setPosition(body, { x: containerWidth - halfSize, y })
            Matter.Body.setVelocity(body, { x: -Math.abs(body.velocity.x) * 0.5, y: body.velocity.y })
          }
          if (y > containerHeight - halfSize - 50) {
            Matter.Body.setPosition(body, { x, y: containerHeight - halfSize - 50 })
            Matter.Body.setVelocity(body, { x: body.velocity.x * 0.8, y: 0 })
          }

          el.style.transform = `translate(${body.position.x}px, ${body.position.y}px) rotate(${body.angle}rad) translate(-50%, -50%)`
          el.style.width = `${size}px`
          el.style.height = `${size}px`
          el.style.opacity = '0.5'
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

  // 根據數量計算縮放倍數
  // 1個 = 2倍, 逐漸遞減到 14+ 個 = 1倍
  const sizeMultiplier = (() => {
    const count = elements.length
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
  })()

  // 觸發掉落
  useEffect(() => {
    if (!isVisible || !isReady || hasSpawnedRef.current || !engineRef.current || !containerRef.current) {
      return
    }

    hasSpawnedRef.current = true
    const containerWidth = containerRef.current.offsetWidth

    // 計算生成位置，避免重疊
    const columns = Math.min(elements.length, 3)
    const columnWidth = (containerWidth - 80) / columns

    elements.forEach((element, i) => {
      setTimeout(() => {
        if (!engineRef.current) return

        // 基礎大小 60-100px，乘以倍數
        const baseSize = 60 + Math.random() * 40
        const size = Math.round(baseSize * sizeMultiplier)

        // 分散在不同列生成
        const column = i % columns
        const spawnX = 40 + column * columnWidth + columnWidth / 2 + (Math.random() - 0.5) * 30
        const spawnY = -80 - Math.floor(i / columns) * 100 - Math.random() * 50

        const body = Matter.Bodies.circle(
          spawnX,
          spawnY,
          size * 0.4,
          {
            restitution: 0.4,
            friction: 0.4,
            frictionAir: 0.02,
            density: 0.001,
            label: `element-${element.id}`,
          }
        )

        // @ts-ignore
        body.plugin = { size }

        Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.04)

        Matter.World.add(engineRef.current.world, body)
        bodiesRef.current[element.id] = body
      }, i * 250)
    })
  }, [isVisible, isReady, elements])

  if (elements.length === 0) {
    return null
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
    >
      {elements.map((element) => (
        <img
          key={element.id}
          ref={(el) => (elementRefs.current[element.id] = el)}
          src={element.src}
          alt=""
          className="absolute top-0 left-0 opacity-0 object-contain"
          style={{ filter: 'brightness(0.6)' }}
        />
      ))}
    </div>
  )
}
