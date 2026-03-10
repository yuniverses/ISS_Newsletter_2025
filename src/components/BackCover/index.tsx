import { useRef, useEffect, useState, useCallback } from 'react'
import { useReadingMemories } from '@/hooks/useReadingMemories'

import FallingElements from './FallingElements'
import RelayOverview from './RelayOverview'
import Noise from '@/components/Noise'
import { gsap } from 'gsap'
import { PUBLICATION_ISSUE_MARK } from '@/config/publication'

// --- Polygon clip-path generator (from Cover) ---

const generatePolygonPath = (
  sides: number,
  rotation: number = 0,
  radius: number = 45,
): string => {
  sides = Math.max(3, sides)
  const points: string[] = []
  for (let i = 0; i < sides; i++) {
    const angle =
      (i * 2 * Math.PI) / sides - Math.PI / 2 + (rotation * Math.PI) / 180
    const x = 50 + radius * Math.cos(angle)
    const y = 50 + radius * Math.sin(angle)
    points.push(`${x}% ${y}%`)
  }
  return `polygon(${points.join(', ')})`
}

const lerp = (start: number, end: number, t: number) =>
  start * (1 - t) + end * t

// --- CrossfadeLoop for seamless video looping ---

const CrossfadeLoop = ({
  src,
  className,
  style,
}: {
  src: string
  className?: string
  style?: React.CSSProperties
}) => {
  const video1Ref = useRef<HTMLVideoElement>(null)
  const video2Ref = useRef<HTMLVideoElement>(null)
  const [activeVideo, setActiveVideo] = useState<1 | 2>(1)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    const v1 = video1Ref.current
    const v2 = video2Ref.current
    if (!v1 || !v2) return
    const TRANSITION_DURATION = 1.0
    const handleTimeUpdate = () => {
      const current = activeVideo === 1 ? v1 : v2
      const next = activeVideo === 1 ? v2 : v1
      if (!current.duration) return
      if (
        current.currentTime >= current.duration - TRANSITION_DURATION &&
        !isTransitioning
      ) {
        setIsTransitioning(true)
        next.currentTime = 0
        next.play().catch((e) => console.log(e))
        setActiveVideo((prev) => (prev === 1 ? 2 : 1))
        setTimeout(() => {
          setIsTransitioning(false)
          current.pause()
          current.currentTime = 0
        }, TRANSITION_DURATION * 1000)
      }
    }
    const onTimeUpdate1 = () => {
      if (activeVideo === 1) handleTimeUpdate()
    }
    const onTimeUpdate2 = () => {
      if (activeVideo === 2) handleTimeUpdate()
    }
    v1.addEventListener('timeupdate', onTimeUpdate1)
    v2.addEventListener('timeupdate', onTimeUpdate2)
    v1.play().catch((e) => console.log(e))
    return () => {
      v1.removeEventListener('timeupdate', onTimeUpdate1)
      v2.removeEventListener('timeupdate', onTimeUpdate2)
    }
  }, [activeVideo, isTransitioning])

  return (
    <div className={className} style={style}>
      <video
        ref={video1Ref}
        src={src}
        autoPlay
        muted
        playsInline
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-linear ${
          activeVideo === 1 ? 'opacity-100 z-10' : 'opacity-0 z-0'
        }`}
      />
      <video
        ref={video2Ref}
        src={src}
        autoPlay
        muted
        playsInline
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-linear ${
          activeVideo === 2 ? 'opacity-100 z-10' : 'opacity-0 z-0'
        }`}
      />
    </div>
  )
}

export default function BackCover() {
  const { coverContribution, collectedElements } = useReadingMemories()
  const sectionRef = useRef<HTMLDivElement>(null)
  const videoInnerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [resetKey, setResetKey] = useState(0)

  // Mouse tracking for polygon clip-path
  const mousePosRef = useRef({ x: 0.5, y: 0.5 })
  const isHoveringRef = useRef(false)
  const currentVisualsRef = useRef({
    sides: 4,
    rotation: 45,
    radius: 80,
  })

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      mousePosRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      }
      isHoveringRef.current = true
    },
    [],
  )

  const handleMouseLeave = useCallback(() => {
    isHoveringRef.current = false
    mousePosRef.current = { x: 0.5, y: 0.5 }
  }, [])

  // GSAP ticker for smooth polygon animation
  useEffect(() => {
    const tick = () => {
      const el = videoInnerRef.current
      if (!el) return

      const cv = currentVisualsRef.current
      let targetSides = 4
      let targetRotation = 45
      let targetRadius = 80

      if (isHoveringRef.current) {
        const { x, y } = mousePosRef.current
        targetSides =
          3 +
          (1 -
            Math.sqrt(Math.pow(x - 0.5, 2) + Math.pow(y - 0.5, 2)) * 2) *
            17
        targetRotation = Math.atan2(y - 0.5, x - 0.5) * (180 / Math.PI)
        targetRadius = 45
      }

      cv.sides = lerp(cv.sides, targetSides, 0.1)
      cv.rotation = lerp(cv.rotation, targetRotation, 0.1)
      cv.radius = lerp(cv.radius, targetRadius, 0.1)

      el.style.clipPath = generatePolygonPath(
        Math.round(cv.sides),
        cv.rotation,
        cv.radius,
      )
    }

    gsap.ticker.add(tick)
    return () => {
      gsap.ticker.remove(tick)
    }
  }, [])

  // Intersection observer for visibility
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setResetKey((prev) => prev + 1)
            setIsVisible(true)
          } else {
            setIsVisible(false)
          }
        })
      },
      { threshold: 0.1 },
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative bg-black text-white overflow-hidden"
    >
      {/* ====== Full-screen section ====== */}
      <div className="relative min-h-screen">
        {/* z[1]: Interactive Video Card */}
        <div className="absolute inset-0 flex items-start justify-center pointer-events-none z-[1]">
          <div
            className="relative w-[88%] md:w-[50%] max-w-[900px] h-[72%] md:h-[78%] mt-[3%] md:mt-[5%] rounded-[26px] overflow-hidden pointer-events-auto cursor-crosshair"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div
              ref={videoInnerRef}
              className="absolute inset-0 transition-none"
              style={{
                clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
              }}
            >
              <CrossfadeLoop
                src="/assets/vul.mp4"
                className="relative w-full h-full overflow-hidden"
                style={{ filter: 'blur(8px)' }}
              />
              {/* Green tint overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(30,60,30,0.45) 0%, rgba(38,62,36,0.4) 40%, rgba(46,74,40,0.35) 70%, rgba(53,79,44,0.3) 100%)',
                }}
              />
            </div>
          </div>
        </div>

        {/* z[2]: Branding elements — overlaid on card */}
        <div className="absolute inset-0 flex items-start justify-center pointer-events-none z-[2]">
          <div className="relative w-[88%] md:w-[50%] max-w-[900px] h-[72%] md:h-[78%] mt-[3%] md:mt-[5%]">
            {/* Top-left: title + ISS Community */}
            <div className="absolute top-[8%] left-[6%]">
              <div className="flex items-start gap-4 md:gap-6">
                <img
                  src="/assets/title.svg"
                  alt="服務聲"
                  className="h-12 md:h-16 lg:h-12 w-auto brightness-0 invert opacity-80"
                />
                <div className="pt-1">

                  <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-white backdrop-blur-md">
                    <span
                      className="text-[9px] md:text-[10px] font-medium tracking-[0.24em] text-white/85"
                      style={{
                        fontFamily:
                          "'Zen Kaku Gothic New', 'Noto Sans TC', sans-serif",
                      }}
                    >
                      {PUBLICATION_ISSUE_MARK.label}
                    </span>
                    <span
                      className="text-[8px] md:text-[9px] uppercase tracking-[0.28em] text-white/55"
                      style={{
                        fontFamily:
                          "'Zen Kaku Gothic New', 'Noto Sans TC', sans-serif",
                      }}
                    >
                      {PUBLICATION_ISSUE_MARK.volume}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Left: 2025 */}
            <div className="absolute top-[40%] left-[6%]">
              <p
                className="text-2xl md:text-3xl font-bold text-white/70 tracking-wider"
                style={{
                  fontFamily:
                    "'Zen Kaku Gothic New', 'Noto Sans TC', sans-serif",
                }}
              >
                2025
              </p>
            </div>

            {/* Right: semicolon + vertical text */}
            <div className="hidden md:block absolute top-[40%] right-[6%]">
              <p
                className="text-xl lg:text-2xl text-white/60 mb-4"
                style={{
                  fontFamily:
                    "'ZCOOL QingKe HuangYou', 'Noto Sans TC', sans-serif",
                }}
              >
                分號
              </p>
              <div className="w-[52px] h-[300px] flex items-center justify-center">
                <p
                  className="text-[11px] lg:text-[13px] text-white/40 leading-relaxed whitespace-pre-wrap"
                  style={{
                    writingMode: 'vertical-rl',
                    textOrientation: 'mixed',
                    fontFamily:
                      "'ZCOOL QingKe HuangYou', 'Noto Sans TC', sans-serif",
                  }}
                >
                  Since 2008, the institute has adopted unique educational
                  practices to embed humanity into the learning environment.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* z[3]: RelayOverview — diagonal text ON TOP of card */}
        <div className="absolute inset-0 z-[3] pointer-events-none">
          <RelayOverview
            ownText={coverContribution?.mine}
            receivedText={coverContribution?.received}
          />
        </div>

        {/* z[4]: Falling collected elements */}
        <div className="absolute inset-0 z-[4] pointer-events-none">
          {collectedElements.length > 0 && isVisible && (
            <FallingElements
              key={`elements-${resetKey}`}
              elements={collectedElements}
              isVisible={isVisible}
            />
          )}
        </div>

        {/* z[5]: Noise overlay */}
        <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-15 z-[5]">
          <Noise
            patternSize={250}
            patternAlpha={20}
            patternRefreshInterval={4}
          />
        </div>
      </div>

      {/* ====== Credits Section ====== */}
      <footer className="relative z-20 px-8 py-24 text-center border-t border-white/5">
        <div className="mb-12">
          <img
            src="/assets/title.svg"
            alt="服務聲"
            className="h-6 md:h-8 w-auto mx-auto brightness-0 invert opacity-60 mb-3"
          />
          <p className="text-xl md:text-2xl text-white/50 font-serif mb-1 tracking-wide">
            2025
          </p>
        </div>


        {/* ====== Publication Info ====== */}
        <div className="mt-16 pt-8 border-t border-white/5 max-w-lg mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left text-[11px] text-white/50 leading-relaxed tracking-wide">
            <div className="space-y-1">
              <p className="text-white/60 font-medium">2025年度服務聲電子報編輯團隊</p>
              <p>召集人｜劉軒妏</p>
              <p>編輯團隊｜<a href="https://www.yuniverses.com/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white/80 transition-colors">陳冠宇</a> · 胡育慈 · 邱筠婷</p>
            </div>
            <div className="space-y-1">
              <p>執行單位｜國立清華大學服務科學研究所</p>
              <p>電話｜03-5162116</p>
              <p>信箱｜office@iss.nthu.edu.tw</p>
              <p>地址｜新竹市東區光復路二段101號台積館540室</p>
              <p>出版｜2026.02</p>
            </div>
          </div>
        </div>

        <p className="text-[9px] text-white/10 mt-12 tracking-widest">
          © 2025 Institute of Service Science, NTHU
        </p>
      </footer>
    </section>
  )
}
