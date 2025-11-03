import { useEffect, useRef, useState } from 'react'

interface CoverProps {
  onEnter?: () => void
}

export default function Cover({ onEnter }: CoverProps) {
  const coverRef = useRef<HTMLDivElement>(null)
  const textDisplayRef = useRef<HTMLDivElement>(null)
  const charRefs = useRef<(HTMLSpanElement | null)[]>([])
  const [userInput, setUserInput] = useState('')
  const [sentences, setSentences] = useState<string[]>([
    '服務聲既是一個社群；也是一份期刊',
    '我們不滿意 服務只是一類，不是一顆上帝子殺人如麻 下輩子視機傳道 研究滿意度',
    '我最不滿意 我做觀察被歸因：結果跟發了 服務只是一類，不是一顆上帝子殺人如麻',
    '下輩子視機傳道 研究滿意度，我最不滿意 我做觀察被歸因',
    '服務聲延續你的想法；邀請你一起創作',
  ])
  const [charSpacings, setCharSpacings] = useState<{ letterSpacing: number; marginBottom: number; opacity: number }[]>([])

  // Join all text and split into characters
  const allText = sentences.join('；') + (sentences.length > 0 ? '；' : '')
  const characters = allText.split('')

  useEffect(() => {
    const handleScroll = () => {
      if (!coverRef.current) return

      const rect = coverRef.current.getBoundingClientRect()
      if (rect.bottom <= window.innerHeight && onEnter) {
        onEnter()
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [onEnter])

  useEffect(() => {
    // Calculate spacing based on actual position in viewport
    const calculateSpacings = () => {
      if (!coverRef.current) return

      const viewportHeight = window.innerHeight
      const coverTop = coverRef.current.getBoundingClientRect().top

      const newSpacings = charRefs.current.map((charEl) => {
        if (!charEl) return { letterSpacing: 0.2, marginBottom: 1, opacity: 0.3 }

        const charRect = charEl.getBoundingClientRect()
        const charTop = charRect.top

        // Calculate position relative to cover start (0vh = top of cover)
        const positionFromCoverTop = charTop - coverTop
        const positionInVh = positionFromCoverTop / viewportHeight

        // 0-100vh: fixed dense spacing (spacingRatio = 0)
        // 100-200vh: increasingly sparse (spacingRatio = 0 to 1)
        let spacingRatio = 0
        let opacity = 0.3

        if (positionInVh > 1 && positionInVh <= 2) {
          // In the 100-200vh range
          spacingRatio = (positionInVh - 1) // 0 at 100vh to 1 at 200vh
          opacity = 0.4 + (spacingRatio * 0.6) // 0.4 to 1.0
        } else if (positionInVh > 2) {
          // Beyond 200vh
          spacingRatio = 1 // max spacing
          opacity = 1.0
        }
        // else: positionInVh <= 1 (0-100vh), keep spacingRatio = 0, opacity = 0.3

        const letterSpacing = 0.2 + (spacingRatio * 2.5) // 0.2em (dense) to 2.7em (sparse)
        const marginBottom = 1 + (spacingRatio * 45) // 1px (dense) to 46px (sparse)

        return { letterSpacing, marginBottom, opacity }
      })

      setCharSpacings(newSpacings)
    }

    // Calculate on mount and when characters change
    setTimeout(calculateSpacings, 100)
    // Also recalculate after a bit more time to ensure layout is stable
    setTimeout(calculateSpacings, 500)
  }, [characters.length])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (userInput.trim()) {
      setSentences(prev => [...prev, userInput.trim()])
      setUserInput('')
    }
  }

  return (
    <div ref={coverRef} className="relative w-full bg-black text-white" style={{ height: '200vh' }}>
      {/* Large shared text display - continuous text from bottom */}
      <div
        ref={textDisplayRef}
        className="absolute inset-0 overflow-hidden pointer-events-none z-0"
      >
        <div className="absolute bottom-0 left-0 right-0 pointer-events-auto">
          <div className="inline-block max-w-full">
            <div
              className="text-gray-400 text-sm md:text-base pointer-events-none"
              style={{
                fontFamily: 'Noto Sans TC, sans-serif',
                wordBreak: 'break-all',
                lineHeight: 0,
              }}
            >
              {characters.map((char, index) => {
                const spacing = charSpacings[index] || { letterSpacing: 0.2, marginBottom: 1, opacity: 0.3 }

                return (
                  <span
                    key={index}
                    ref={(el) => {
                      charRefs.current[index] = el
                    }}
                    style={{
                      letterSpacing: `${spacing.letterSpacing}em`,
                      marginBottom: `${spacing.marginBottom}px`,
                      opacity: spacing.opacity,
                      display: 'inline-block',
                      lineHeight: '1.5',
                    }}
                  >
                    {char}
                  </span>
                )
              })}
              <span className="inline-block ml-1 pointer-events-auto">
                <form onSubmit={handleSubmit} className="inline-block align-baseline relative z-30 pointer-events-auto">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="輸入連接你的想法"
                    className="bg-transparent border-b border-gray-600 focus:border-white outline-none py-1 text-sm md:text-base text-white placeholder-gray-500 placeholder-opacity-35 transition-colors relative z-30 pointer-events-auto"
                    style={{
                      fontFamily: 'Noto Sans TC, sans-serif',
                      width: '300px',
                    }}
                  />
                </form>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top section: Main cover area (0-100vh) */}
      <div className="absolute top-0 left-0 right-0 h-screen">
        {/* Decorative connected blocks - stacked pattern */}
        <div className="absolute left-[3%] top-[20vh] w-[85vw] h-auto">
          {/* Row 1 - Bottom layer */}
          <div className="absolute backdrop-blur-md bg-gray-700/40 h-[3vh] left-0 top-0 w-[14.5%]" />
          <div className="absolute backdrop-blur-md bg-gray-500/40 h-[3vh] left-[14.5%] top-0 w-[70.9%]" />
          <div className="absolute backdrop-blur-md bg-gray-600/40 h-[3vh] left-[85.4%] top-0 w-[14.6%]" />

          {/* Row 2 */}
          <div className="absolute backdrop-blur-md bg-gray-600/40 h-[3vh] left-0 top-[3vh] w-[14.5%]" />
          <div className="absolute backdrop-blur-md bg-gray-400/40 h-[3vh] left-[14.5%] top-[3vh] w-[70.9%]" />
          <div className="absolute backdrop-blur-md bg-gray-700/40 h-[3vh] left-[85.4%] top-[3vh] w-[14.6%]" />

          {/* Row 3 */}
          <div className="absolute backdrop-blur-md bg-gray-500/40 h-[3vh] left-0 top-[6vh] w-[14.5%]" />
          <div className="absolute backdrop-blur-md bg-gray-600/40 h-[3vh] left-[14.5%] top-[6vh] w-[70.9%]" />
          <div className="absolute backdrop-blur-md bg-gray-500/40 h-[3vh] left-[85.4%] top-[6vh] w-[14.6%]" />

          {/* Row 4 */}
          <div className="absolute backdrop-blur-md bg-gray-700/40 h-[3vh] left-0 top-[9vh] w-[85.4%]" />
          <div className="absolute backdrop-blur-md bg-gray-600/40 h-[3vh] left-[85.4%] top-[9vh] w-[14.6%]" />

          {/* Row 5 */}
          <div className="absolute backdrop-blur-md bg-gray-400/40 h-[3vh] left-0 top-[12vh] w-[85.4%]" />
          <div className="absolute backdrop-blur-md bg-gray-700/40 h-[3vh] left-[85.4%] top-[12vh] w-[14.6%]" />

          {/* Row 6 */}
          <div className="absolute backdrop-blur-md bg-gray-600/40 h-[3vh] left-0 top-[15vh] w-[14.5%]" />
          <div className="absolute backdrop-blur-md bg-gray-500/40 h-[3vh] left-[14.5%] top-[15vh] w-[70.9%]" />
          <div className="absolute backdrop-blur-md bg-gray-500/40 h-[3vh] left-[85.4%] top-[15vh] w-[14.6%]" />

          {/* Row 7 */}
          <div className="absolute backdrop-blur-md bg-gray-700/40 h-[3vh] left-0 top-[18vh] w-[14.5%]" />
          <div className="absolute backdrop-blur-md bg-gray-600/40 h-[3vh] left-[14.5%] top-[18vh] w-[70.9%]" />
          <div className="absolute backdrop-blur-md bg-gray-600/40 h-[3vh] left-[85.4%] top-[18vh] w-[14.6%]" />

          {/* Row 8 */}
          <div className="absolute backdrop-blur-md bg-gray-500/40 h-[3vh] left-0 top-[21vh] w-[14.5%]" />
          <div className="absolute backdrop-blur-md bg-gray-700/40 h-[3vh] left-[14.5%] top-[21vh] w-[70.9%]" />
          <div className="absolute backdrop-blur-md bg-gray-700/40 h-[3vh] left-[85.4%] top-[21vh] w-[14.6%]" />

          {/* Row 9 */}
          <div className="absolute backdrop-blur-md bg-gray-600/40 h-[3vh] left-0 top-[24vh] w-[85.4%]" />
          <div className="absolute backdrop-blur-md bg-gray-500/40 h-[3vh] left-[85.4%] top-[24vh] w-[14.6%]" />

          {/* Row 10 - Top layer */}
          <div className="absolute backdrop-blur-md bg-gray-400/40 h-[3vh] left-0 top-[27vh] w-[85.4%]" />
          <div className="absolute backdrop-blur-md bg-gray-600/40 h-[3vh] left-[85.4%] top-[27vh] w-[14.6%]" />
        </div>

        {/* Description text */}
        <p
          className="absolute left-[705px] top-[395px] w-[237px] text-[13px] leading-normal text-white whitespace-pre-wrap z-10"
          style={{ fontFamily: 'sans-serif' }}
        >
          Since 2008, the institute has adopted unique educational practices to embed humanity into the learning environment, to involve industries into the educational context, and to generate domain relevant research outputs with theoretical methodologies.
        </p>

        {/* Year 2025 */}
        <p
          className="absolute left-[219px] top-[431px] text-[20px] leading-normal text-white font-bold z-10"
          style={{ fontFamily: 'sans-serif' }}
        >
          2025
        </p>

        {/* Main title image */}
        <div className="absolute left-[221.91px] top-[295.17px] h-[52.982px] w-[239.861px] z-10">
          <img
            src="/assets/title.svg"
            alt="服務聲 ISS Sounds Quarterly 醫"
            className="block w-full h-full"
          />
        </div>

        {/* Semicolon image - rotated */}
        <div
          className="absolute left-[705px] top-[282px] flex items-center justify-center mix-blend-luminosity z-10"
          style={{
            width: '91.212px',
            height: '237px',
          }}
        >
          <div className="rotate-90">
            <img
              src="/assets/semicolon-new.svg"
              alt="semicolon"
              className="w-[237px] h-[91.212px] block"
            />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce z-10">
          <div className="text-xs text-gray-400 tracking-wider">SCROLL</div>
          <div className="w-px h-12 bg-gray-400" />
        </div>
      </div>

    </div>
  )
}
