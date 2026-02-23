import { useEffect, useMemo, useRef, type CSSProperties } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import * as THREE from 'three'
import { ChapterGroup } from '@/config/chapterGroups'
import { Chapter } from '@/types'

gsap.registerPlugin(ScrollTrigger)

interface GroupTransitionSectionProps {
  group: ChapterGroup
  chapters: Chapter[]
}

interface Point3D {
  x: number
  y: number
  z: number
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)
const mix = (start: number, end: number, t: number) => start + (end - start) * t
const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3)

const toDisplaySymbol = (symbol: string) => (symbol === '...' ? '…' : symbol)

const mixColor = (
  from: [number, number, number],
  to: [number, number, number],
  progress: number
) => {
  const t = clamp(progress, 0, 1)
  const r = Math.round(mix(from[0], to[0], t))
  const g = Math.round(mix(from[1], to[1], t))
  const b = Math.round(mix(from[2], to[2], t))
  return `rgb(${r}, ${g}, ${b})`
}

const mixAlpha = (
  from: [number, number, number, number],
  to: [number, number, number, number],
  progress: number
) => {
  const t = clamp(progress, 0, 1)
  const r = Math.round(mix(from[0], to[0], t))
  const g = Math.round(mix(from[1], to[1], t))
  const b = Math.round(mix(from[2], to[2], t))
  const a = mix(from[3], to[3], t).toFixed(3)
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

const getSymbolAnimationClass = (symbol: string) => {
  if (symbol === '...') return 'group-symbol-motion-ellipsis'
  if (symbol === '/') return 'group-symbol-motion-slash'
  if (symbol === '@') return 'group-symbol-motion-at'
  if (symbol === ':') return 'group-symbol-motion-colon'
  return 'group-symbol-motion-hash'
}

const samplePoints = (points: Point3D[], maxPoints: number) => {
  if (points.length <= maxPoints) return points
  const sampled: Point3D[] = []
  const stride = points.length / maxPoints

  for (let index = 0; index < maxPoints; index += 1) {
    sampled.push(points[Math.floor(index * stride)])
  }

  return sampled
}

const drawSymbolMask = (ctx: CanvasRenderingContext2D, symbol: string, width: number, height: number) => {
  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = '#ffffff'
  ctx.strokeStyle = '#ffffff'
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  if (symbol === '…') {
    const radius = 24
    const spacing = 92
    const centerX = width / 2
    const centerY = height / 2

    ;[-1, 0, 1].forEach((offset) => {
      ctx.beginPath()
      ctx.arc(centerX + offset * spacing, centerY, radius, 0, Math.PI * 2)
      ctx.fill()
    })
    return
  }

  if (symbol === ':') {
    const radius = 28
    const centerX = width / 2
    const centerY = height / 2

    ctx.beginPath()
    ctx.arc(centerX, centerY - 48, radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(centerX, centerY + 48, radius, 0, Math.PI * 2)
    ctx.fill()
    return
  }

  if (symbol === '/') {
    ctx.lineWidth = 56
    ctx.beginPath()
    ctx.moveTo(width * 0.34, height * 0.84)
    ctx.lineTo(width * 0.66, height * 0.16)
    ctx.stroke()
    return
  }

  if (symbol === '#') {
    ctx.lineWidth = 36
    ctx.beginPath()
    ctx.moveTo(width * 0.34, height * 0.16)
    ctx.lineTo(width * 0.24, height * 0.84)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(width * 0.64, height * 0.16)
    ctx.lineTo(width * 0.54, height * 0.84)
    ctx.stroke()

    ctx.lineWidth = 32
    ctx.beginPath()
    ctx.moveTo(width * 0.16, height * 0.38)
    ctx.lineTo(width * 0.78, height * 0.33)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(width * 0.12, height * 0.62)
    ctx.lineTo(width * 0.74, height * 0.57)
    ctx.stroke()
    return
  }

  const fontSize = symbol === '@' ? 190 : 180
  ctx.font = `900 ${fontSize}px "Noto Sans TC", "Arial Black", sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(symbol, width / 2, height / 2)
}

const buildSymbolTargets = (rawSymbol: string) => {
  const symbol = toDisplaySymbol(rawSymbol)
  const canvas = document.createElement('canvas')
  const width = 360
  const height = 220
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) return [{ x: 0, y: 0, z: 0 }]

  drawSymbolMask(ctx, symbol, width, height)

  const imageData = ctx.getImageData(0, 0, width, height).data
  const step = symbol === '@' ? 5 : 6

  const rawPoints: Point3D[] = []
  let minX = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const alpha = imageData[(y * width + x) * 4 + 3]
      if (alpha < 100) continue

      rawPoints.push({
        x,
        y,
        z: (Math.random() - 0.5) * 7,
      })

      minX = Math.min(minX, x)
      maxX = Math.max(maxX, x)
      minY = Math.min(minY, y)
      maxY = Math.max(maxY, y)
    }
  }

  if (!rawPoints.length) return [{ x: 0, y: 0, z: 0 }]

  const centerX = (minX + maxX) / 2
  const centerY = (minY + maxY) / 2
  const scale = symbol === '@' ? 0.23 : symbol === '…' || symbol === ':' ? 0.28 : 0.26

  const normalized = rawPoints.map((point) => ({
    x: (point.x - centerX) * scale,
    y: (centerY - point.y) * scale,
    z: point.z,
  }))

  return samplePoints(normalized, 1200)
}

const buildScatterPoints = (count: number): Point3D[] => {
  return Array.from({ length: count }).map(() => {
    const radius = 34 + Math.random() * 140
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)

    return {
      x: radius * Math.sin(phi) * Math.cos(theta),
      y: radius * Math.sin(phi) * Math.sin(theta),
      z: -150 + Math.random() * 300,
    }
  })
}

export default function GroupTransitionSection({ group, chapters }: GroupTransitionSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const canvasHostRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLParagraphElement>(null)
  const symbolRef = useRef<HTMLSpanElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const descriptionRef = useRef<HTMLParagraphElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const progressRef = useRef(0)

  const chapterEntries = useMemo(() => {
    const chapterMap = new Map(chapters.map((chapter) => [chapter.id, chapter]))
    return group.chapters
      .map((chapterId) => chapterMap.get(chapterId))
      .filter((chapter): chapter is Chapter => Boolean(chapter))
  }, [chapters, group.chapters])

  const displaySymbol = toDisplaySymbol(group.symbol)
  const symbolAnimationClass = getSymbolAnimationClass(group.symbol)

  const initialStyle = {
    backgroundColor: 'rgb(255, 255, 255)',
    '--gt-text-color': 'rgb(20, 20, 20)',
    '--gt-muted-color': 'rgb(92, 92, 92)',
    '--gt-card-bg': 'rgba(0, 0, 0, 0.03)',
    '--gt-card-border': 'rgba(0, 0, 0, 0.12)',
  } as CSSProperties

  useEffect(() => {
    const section = sectionRef.current
    const sticky = stickyRef.current
    const canvasHost = canvasHostRef.current
    const labelEl = labelRef.current
    const symbolEl = symbolRef.current
    const titleEl = titleRef.current
    const descriptionEl = descriptionRef.current
    const listEl = listRef.current
    const glowEl = glowRef.current

    if (
      !section ||
      !sticky ||
      !canvasHost ||
      !labelEl ||
      !symbolEl ||
      !titleEl ||
      !descriptionEl ||
      !listEl ||
      !glowEl
    ) {
      return
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const getDarkness = (progress: number) => {
      const toBlack = clamp((progress - 0.03) / 0.28, 0, 1)
      const toWhite = clamp((progress - 0.84) / 0.16, 0, 1)
      return clamp(toBlack * (1 - toWhite), 0, 1)
    }

    const getTimelineProgress = (rawProgress: number) => {
      // Hold the first part of the pinned section as a static frame.
      // This makes the transition start only after users fully arrive at this page.
      return clamp((rawProgress - 0.12) / 0.88, 0, 1)
    }

    const updateOverlay = (progress: number) => {
      const timelineProgress = getTimelineProgress(progress)
      const darkness = getDarkness(timelineProgress)
      const cardMix = clamp(darkness * 1.15, 0, 1)
      const fadeOut = clamp((timelineProgress - 0.84) / 0.16, 0, 1)
      const stageOpacity = 1 - fadeOut

      const symbolIn = clamp((timelineProgress - 0.52) / 0.16, 0, 1)
      const descriptionIn = clamp((timelineProgress - 0.6) / 0.16, 0, 1)
      const listIn = clamp((timelineProgress - 0.68) / 0.16, 0, 1)

      const symbolProgress = symbolIn
      const descriptionProgress = descriptionIn
      const listProgress = listIn

      const bgColor = mixColor([255, 255, 255], [5, 7, 10], darkness)
      const textColor = 'rgb(255, 255, 255)'
      const mutedColor = 'rgb(232, 232, 232)'
      const cardBg = mixAlpha([0, 0, 0, 0.03], [255, 255, 255, 0.07], cardMix)
      const cardBorder = mixAlpha([0, 0, 0, 0.12], [255, 255, 255, 0.18], cardMix)

      sticky.style.backgroundColor = bgColor
      section.style.setProperty('--gt-text-color', textColor)
      section.style.setProperty('--gt-muted-color', mutedColor)
      section.style.setProperty('--gt-card-bg', cardBg)
      section.style.setProperty('--gt-card-border', cardBorder)
      canvasHost.style.opacity = stageOpacity.toFixed(3)
      glowEl.style.opacity = (0.18 * stageOpacity).toFixed(3)

      labelEl.style.opacity = symbolProgress.toFixed(3)
      labelEl.style.transform = `translateY(${(1 - symbolProgress) * 22}px)`

      symbolEl.style.opacity = symbolProgress.toFixed(3)
      symbolEl.style.transform = `translateY(${(1 - symbolProgress) * 30}px)`

      titleEl.style.opacity = symbolProgress.toFixed(3)
      titleEl.style.transform = `translateY(${(1 - symbolProgress) * 36}px)`

      descriptionEl.style.opacity = descriptionProgress.toFixed(3)
      descriptionEl.style.transform = `translateY(${(1 - descriptionProgress) * 28}px)`

      listEl.style.opacity = listProgress.toFixed(3)
      listEl.style.transform = `translateY(${(1 - listProgress) * 32}px)`
    }

    updateOverlay(0)

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: '+=220%',
      pin: sticky,
      pinSpacing: true,
      scrub: 0.85,
      onUpdate: (self) => {
        progressRef.current = self.progress
        updateOverlay(self.progress)
      },
    })

    if (prefersReducedMotion) {
      return () => {
        trigger.kill()
      }
    }

    canvasHost.innerHTML = ''

    const initialWidth = canvasHost.clientWidth || window.innerWidth
    const initialHeight = canvasHost.clientHeight || window.innerHeight

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      40,
      initialWidth / initialHeight,
      0.1,
      600
    )
    camera.position.set(0, 0, 132)

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(initialWidth, initialHeight)
    renderer.setClearColor(0x000000, 0)
    canvasHost.appendChild(renderer.domElement)

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.25)
    keyLight.position.set(16, 24, 18)
    scene.add(keyLight)

    const fillLight = new THREE.PointLight(0x9bb3ff, 0.9, 220)
    fillLight.position.set(-18, -8, 26)
    scene.add(fillLight)

    const targets = buildSymbolTargets(group.symbol)
    const scatters = buildScatterPoints(targets.length)
    const dummy = new THREE.Object3D()
    const clock = new THREE.Clock()

    const geometry = new THREE.BoxGeometry(0.95, 0.95, 0.95)
    const material = new THREE.MeshStandardMaterial({
      color: 0xc8d4ea,
      emissive: 0x101621,
      emissiveIntensity: 0.14,
      roughness: 0.3,
      metalness: 0.38,
      transparent: true,
      opacity: 1,
    })

    const mesh = new THREE.InstancedMesh(geometry, material, targets.length)
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    scene.add(mesh)

    targets.forEach((_, index) => {
      const start = scatters[index]
      dummy.position.set(start.x, start.y, start.z)
      dummy.rotation.set(0, 0, 0)
      dummy.scale.setScalar(0.75)
      dummy.updateMatrix()
      mesh.setMatrixAt(index, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true

    const render = () => {
      const elapsed = clock.getElapsedTime()
      const progress = progressRef.current
      const timelineProgress = getTimelineProgress(progress)
      const darkness = getDarkness(timelineProgress)
      const fadeOut = clamp((timelineProgress - 0.84) / 0.16, 0, 1)
      const stageOpacity = 1 - fadeOut
      const gather = easeOutCubic(clamp((timelineProgress - 0.16) / 0.48, 0, 1))
      const drift = 1 - gather
      const symbolLife = clamp((timelineProgress - 0.58) / 0.32, 0, 1)
      const release = clamp((timelineProgress - 0.84) / 0.16, 0, 1)
      const retain = 1 - release * 0.55
      const gatherProgress = gather * retain

      material.color.setStyle(mixColor([158, 172, 196], [234, 240, 252], darkness))
      material.emissive.setStyle(mixColor([15, 22, 34], [68, 78, 104], darkness))
      material.opacity = stageOpacity

      targets.forEach((target, index) => {
        const start = scatters[index]

        const driftX = Math.sin(elapsed * 1.72 + index * 0.13) * drift * 6
        const driftY = Math.cos(elapsed * 1.41 + index * 0.11) * drift * 6
        const pulseY = Math.sin(elapsed * 2.35 + index * 0.06) * symbolLife * 0.8

        const x = mix(start.x, target.x, gatherProgress) + driftX * 0.2 + release * Math.sin(elapsed + index) * 1.2
        const y = mix(start.y, target.y, gatherProgress) + driftY * 0.2 + pulseY + release * 2.2
        const z = mix(start.z, target.z, gatherProgress)
        const scale = mix(0.72, 1, gatherProgress)

        dummy.position.set(x, y, z)
        dummy.rotation.set(0, elapsed * 0.12 + index * 0.0014, 0)
        dummy.scale.setScalar(scale)
        dummy.updateMatrix()
        mesh.setMatrixAt(index, dummy.matrix)
      })

      mesh.instanceMatrix.needsUpdate = true

      camera.position.z = mix(132, 74, clamp((timelineProgress - 0.06) / 0.48, 0, 1))
      camera.position.y = Math.sin(elapsed * 0.45) * 1.5
      camera.lookAt(0, 0, 0)

      renderer.render(scene, camera)
    }

    let animationFrameId = 0
    const animate = () => {
      animationFrameId = window.requestAnimationFrame(animate)
      render()
    }
    animate()

    const handleResize = () => {
      const width = canvasHost.clientWidth
      const height = canvasHost.clientHeight
      if (!width || !height) return

      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      trigger.kill()
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      canvasHost.innerHTML = ''
    }
  }, [group.symbol])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[330vh] w-full overflow-hidden"
      style={initialStyle}
    >
      <div ref={stickyRef} className="relative isolate flex h-screen w-full items-center justify-center">
        <div ref={canvasHostRef} className="absolute inset-0 z-0" aria-hidden="true" />
        <div
          ref={glowRef}
          className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.18),transparent_58%)]"
        />

        <div
          className="absolute inset-0 z-20 mx-auto flex flex-col justify-between px-8 py-12 md:px-16 md:py-16 lg:px-24 lg:py-20 xl:px-32"
          style={{ mixBlendMode: 'difference' }}
        >
          <p
            ref={labelRef}
            className="sr-only"
            style={{
              color: 'var(--gt-muted-color)',
              opacity: 0,
              transform: 'translateY(22px)',
            }}
          >
            GROUP TRANSITION
          </p>

          <div className="flex items-start justify-start">
            <ul
              ref={listRef}
              className="max-w-3xl space-y-1 text-left"
              style={{ opacity: 0, transform: 'translateY(32px)', color: 'var(--gt-text-color)' }}
            >
              {chapterEntries.map((chapter, index) => (
                <li key={chapter.id} className="flex items-start gap-2 md:gap-3">
                  <span className="w-7 shrink-0 text-sm font-light tabular-nums md:w-9 md:text-2xl">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="text-sm leading-tight font-normal md:text-2xl">
                    {chapter.title}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-end justify-start gap-6 md:gap-10">
            <span
              ref={symbolRef}
              className={`inline-flex items-center ${symbolAnimationClass}`}
              style={{
                color: 'var(--gt-text-color)',
                opacity: 0,
                transform: 'translateY(30px)',
              }}
            >
              {group.symbol === '...' ? (
                <span className="inline-flex items-center gap-2 md:gap-3" aria-hidden="true">
                  <span className="h-5 w-5 rounded-full bg-current md:h-9 md:w-9" />
                  <span className="h-5 w-5 rounded-full bg-current md:h-9 md:w-9" />
                  <span className="h-5 w-5 rounded-full bg-current md:h-9 md:w-9" />
                </span>
              ) : (
                <span className="text-5xl font-black leading-none md:text-7xl">{displaySymbol}</span>
              )}
            </span>

            <div className="flex flex-col gap-2 md:gap-3">
              <h2
                ref={titleRef}
                className="text-4xl font-medium tracking-tight md:text-6xl"
                style={{
                  color: 'var(--gt-text-color)',
                  opacity: 0,
                  transform: 'translateY(36px)',
                }}
              >
                {group.title.replace(/^[/:@#\s.]+|[/:@#\s.]+$/g, '')}
              </h2>

              <p
                ref={descriptionRef}
                className="max-w-2xl text-sm leading-relaxed md:text-xl"
                style={{
                  color: 'var(--gt-muted-color)',
                  opacity: 0,
                  transform: 'translateY(28px)',
                }}
              >
                {group.transitionDescription}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
