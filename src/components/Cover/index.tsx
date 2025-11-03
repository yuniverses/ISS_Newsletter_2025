import { useEffect, useRef, useState } from 'react'

interface CoverProps {
  onEnter?: () => void
}

export default function Cover({ onEnter }: CoverProps) {
  const coverRef = useRef<HTMLDivElement>(null)
  const textDisplayRef = useRef<HTMLDivElement>(null)
  const [userInput, setUserInput] = useState('')
  const [sentences, setSentences] = useState<string[]>([
    '服務聲既是一個社群；也是一份期刊',
    '我們不滿意 服務只是一類，不是一顆上帝子殺人如麻 下輩子視機傳道 研究滿意度',
    '我最不滿意 我做觀察被歸因：結果跟發了 服務只是一類，不是一顆上帝子殺人如麻',
    '下輩子視機傳道 研究滿意度，我最不滿意 我做觀察被歸因',
    '服務聲延續你的想法；邀請你一起創作',
  ])

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
    // Auto scroll to bottom when new sentence is added
    if (textDisplayRef.current) {
      textDisplayRef.current.scrollTop = textDisplayRef.current.scrollHeight
    }
  }, [sentences])

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
        className="absolute inset-0 overflow-hidden pointer-events-none z-20"
      >
        {/* Gradient overlay for spacing effect */}
        <div className="absolute bottom-0 left-0 right-0" style={{ height: '100vh' }}>
          <div className="absolute bottom-0 left-0 right-0 px-8 md:px-16 pb-24 pointer-events-auto text-compress-container">
            <div className="inline">
              <p
                className="text-gray-400 text-sm md:text-base inline pointer-events-none"
                style={{
                  fontFamily: 'Noto Sans TC, sans-serif',
                  wordBreak: 'break-all',
                }}
              >
                {sentences.join('；')}
                {sentences.length > 0 && '；'}
              </p>
              <form onSubmit={handleSubmit} className="inline-block align-bottom ml-2 relative z-30">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="輸入連接你的想法"
                  className="bg-transparent border-b border-gray-600 focus:border-white outline-none py-1 text-sm md:text-base text-white placeholder-gray-500 placeholder-opacity-35 transition-colors relative z-30"
                  style={{
                    fontFamily: 'Noto Sans TC, sans-serif',
                    width: '300px',
                  }}
                />
              </form>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .text-compress-container p {
          letter-spacing: 0.8em;
          line-height: 3.5;
        }

        @container (min-height: 50vh) {
          .text-compress-container p {
            letter-spacing: 0.5em;
            line-height: 2.5;
          }
        }

        @container (min-height: 100vh) {
          .text-compress-container p {
            letter-spacing: 0.3em;
            line-height: 1.75;
          }
        }
      `}</style>

      {/* Top section: Main cover area (0-100vh) */}
      <div className="absolute top-0 left-0 right-0 h-screen">
        {/* Decorative connected blocks - stacked pattern */}
        <div className="absolute left-[39px] top-[166px] opacity-60">
          {/* Row 1 - Bottom layer */}
          <div className="absolute bg-gray-700 h-[38px] left-0 top-0 w-[167px]" />
          <div className="absolute bg-gray-500 h-[38px] left-[167px] top-0 w-[817px]" />
          <div className="absolute bg-gray-600 h-[38px] left-[984px] top-0 w-[168px]" />

          {/* Row 2 */}
          <div className="absolute bg-gray-600 h-[38px] left-0 top-[38px] w-[167px]" />
          <div className="absolute bg-gray-400 h-[38px] left-[167px] top-[38px] w-[817px]" />
          <div className="absolute bg-gray-700 h-[38px] left-[984px] top-[38px] w-[168px]" />

          {/* Row 3 */}
          <div className="absolute bg-gray-500 h-[38px] left-0 top-[76px] w-[167px]" />
          <div className="absolute bg-gray-600 h-[38px] left-[167px] top-[76px] w-[817px]" />
          <div className="absolute bg-gray-500 h-[38px] left-[984px] top-[76px] w-[168px]" />

          {/* Row 4 */}
          <div className="absolute bg-gray-700 h-[38px] left-0 top-[115px] w-[984px]" />
          <div className="absolute bg-gray-600 h-[38px] left-[984px] top-[115px] w-[168px]" />

          {/* Row 5 */}
          <div className="absolute bg-gray-400 h-[38px] left-0 top-[153px] w-[984px]" />
          <div className="absolute bg-gray-700 h-[38px] left-[984px] top-[153px] w-[168px]" />

          {/* Row 6 */}
          <div className="absolute bg-gray-600 h-[38px] left-0 top-[191px] w-[167px]" />
          <div className="absolute bg-gray-500 h-[38px] left-[167px] top-[191px] w-[817px]" />
          <div className="absolute bg-gray-500 h-[38px] left-[984px] top-[191px] w-[168px]" />

          {/* Row 7 */}
          <div className="absolute bg-gray-700 h-[38px] left-0 top-[229px] w-[167px]" />
          <div className="absolute bg-gray-600 h-[38px] left-[167px] top-[229px] w-[817px]" />
          <div className="absolute bg-gray-600 h-[38px] left-[984px] top-[229px] w-[168px]" />

          {/* Row 8 */}
          <div className="absolute bg-gray-500 h-[38px] left-0 top-[268px] w-[167px]" />
          <div className="absolute bg-gray-700 h-[38px] left-[167px] top-[268px] w-[817px]" />
          <div className="absolute bg-gray-700 h-[38px] left-[984px] top-[268px] w-[168px]" />

          {/* Row 9 */}
          <div className="absolute bg-gray-600 h-[38px] left-0 top-[306px] w-[984px]" />
          <div className="absolute bg-gray-500 h-[38px] left-[984px] top-[306px] w-[168px]" />

          {/* Row 10 - Top layer */}
          <div className="absolute bg-gray-400 h-[38px] left-0 top-[345px] w-[984px]" />
          <div className="absolute bg-gray-600 h-[38px] left-[984px] top-[345px] w-[168px]" />
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

      {/* Bottom section: Logo area (100vh-200vh) */}
      <div className="absolute bottom-0 left-0 right-0 h-screen">
        {/* Small title and icon in top center */}
        <div className="absolute left-1/2 top-[40px] -translate-x-1/2 flex items-center gap-4 z-10">
          <div className="text-center">
            <p className="text-[21px] tracking-[2.5px]" style={{ fontFamily: 'sans-serif' }}>
              服務      聲
            </p>
            <p className="text-[5px] text-gray-400" style={{ fontFamily: 'sans-serif' }}>
              ISS Community Annual Newsletter
            </p>
          </div>
          <div className="rotate-90">
            <img
              src="/assets/semicolon-new.svg"
              alt="semicolon"
              className="w-[62px] h-[24px] block mix-blend-luminosity"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
