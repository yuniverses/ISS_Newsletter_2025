import { useRef, useEffect, useState } from 'react'
import { useReadingMemories } from '@/hooks/useReadingMemories'
import { SemicolonLogo } from '@/components/ui/SemicolonLogo'
import FallingElements from './FallingElements'
import RelayOverview from './RelayOverview'
import Noise from '@/components/Noise'

export default function BackCover() {
  const { coverContribution, collectedElements } = useReadingMemories()
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [resetKey, setResetKey] = useState(0)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setResetKey(prev => prev + 1)
            setIsVisible(true)
          } else {
            setIsVisible(false)
          }
        })
      },
      { threshold: 0.1 }
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative bg-black text-white overflow-hidden"
    >
      {/* ====== SECTION 1: Full-screen Relay Visualization ====== */}
      <div className="relative min-h-screen">
        {/* Noise Overlay */}
        <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-15 z-[5]">
          <Noise
            patternSize={250}
            patternAlpha={20}
            patternRefreshInterval={4}
          />
        </div>

        {/* Green gradient panel — decorative background */}
        <div className="absolute inset-0 flex items-start justify-center pointer-events-none z-[1]">
          <div
            className="w-[55%] max-w-[900px] h-[85%] mt-[5%] rounded-[26px] opacity-60"
            style={{
              background: 'linear-gradient(180deg, rgba(30,60,30,0.7) 0%, rgba(50,80,40,0.5) 40%, rgba(60,90,40,0.4) 70%, rgba(80,110,50,0.3) 100%)',
              filter: 'blur(1px)',
            }}
          />
        </div>

        {/* Background: Falling collected elements */}
        <div className="absolute inset-0 z-[2]">
          {collectedElements.length > 0 && isVisible && (
            <FallingElements
              key={`elements-${resetKey}`}
              elements={collectedElements}
              isVisible={isVisible}
            />
          )}
        </div>

        {/* Relay text visualization (full-screen SVG) */}
        <div className="absolute inset-0 z-[3]">
          <RelayOverview ownText={coverContribution?.mine} />
        </div>

        {/* Foreground: Header branding overlay */}
        <div className="absolute inset-0 z-[10] pointer-events-none">
          {/* Top header — "服務 聲" + ISS Community Annual Newsletter */}
          <div className="absolute top-[8%] left-[8%] md:left-[12%]">
            <div className="flex items-start gap-4 md:gap-6">
              <img
                src="/assets/title.svg"
                alt="服務聲"
                className="h-12 md:h-16 lg:h-20 w-auto brightness-0 invert opacity-80"
              />
              <div className="pt-1">
                <p className="text-[9px] md:text-[11px] leading-tight text-white/50 tracking-wide" style={{ fontFamily: "'ZCOOL QingKe HuangYou', 'Noto Sans TC', sans-serif" }}>
                  ISS Community<br />
                  Annual Newsletter
                </p>
              </div>
            </div>
          </div>

          {/* Year — "2025" */}
          <div className="absolute top-[35%] left-[8%] md:left-[12%]">
            <p className="text-2xl md:text-3xl font-bold text-white/70 tracking-wider" style={{ fontFamily: "'Zen Kaku Gothic New', 'Noto Sans TC', sans-serif" }}>
              2025
            </p>
          </div>

          {/* Right side — "分號" label + ISS description */}
          <div className="hidden md:block absolute top-[35%] right-[8%] lg:right-[10%]">
            <p className="text-xl lg:text-2xl text-white/60 mb-4" style={{ fontFamily: "'ZCOOL QingKe HuangYou', 'Noto Sans TC', sans-serif" }}>
              分號
            </p>
            <div className="w-[52px] h-[300px] flex items-center justify-center">
              <p
                className="text-[11px] lg:text-[13px] text-white/40 leading-relaxed whitespace-pre-wrap"
                style={{
                  writingMode: 'vertical-rl',
                  textOrientation: 'mixed',
                  fontFamily: "'ZCOOL QingKe HuangYou', 'Noto Sans TC', sans-serif",
                }}
              >
                Since 2008, the institute has adopted unique educational practices to embed humanity into the learning environment.
              </p>
            </div>
          </div>

          {/* Bottom CTA — "接龍；下一句要是你" */}
          <div className="absolute bottom-[6%] left-[8%] md:left-[12%] right-[8%]">
            <div className="flex items-baseline gap-1 flex-wrap">
              {coverContribution ? (
                <>
                  <span className="text-[11px] md:text-sm text-white/40" style={{ fontFamily: "'Noto Sans TC', sans-serif" }}>
                    {coverContribution.received ? `${coverContribution.received.slice(0, 15)}…` : ''}
                  </span>
                  <span className="text-sm md:text-base text-white/50 mx-1">;</span>
                  <span className="text-lg md:text-2xl text-white/60" style={{ fontFamily: "'Noto Sans TC', sans-serif" }}>
                    接龍
                  </span>
                  <span className="text-lg md:text-2xl text-white/50 mx-1">;</span>
                  <span className="text-3xl md:text-[50px] font-bold text-white leading-none">
                    下一句要是你
                  </span>
                </>
              ) : (
                <>
                  <span className="text-lg md:text-2xl text-white/60" style={{ fontFamily: "'Noto Sans TC', sans-serif" }}>
                    接龍
                  </span>
                  <span className="text-lg md:text-2xl text-white/50 mx-1">;</span>
                  <span className="text-3xl md:text-[50px] font-bold text-white leading-none">
                    下一句要是你
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ====== SECTION 2: Relay Card + Stats ====== */}
      <div className="relative z-20 px-6 py-20 flex flex-col items-center justify-center">
        {/* Header */}
        <div className="text-center mb-12">
          <SemicolonLogo className="h-10 md:h-12 mb-4 opacity-40 mx-auto" />
          <h2 className="text-xl md:text-2xl font-serif mb-2 tracking-wide">
            閱讀記憶
          </h2>
          <p className="text-[10px] text-white/30 tracking-[0.3em] uppercase">
            Reading Memories
          </p>
        </div>

        {/* Relay card */}
        {coverContribution ? (
          <div className="w-full max-w-lg">
            <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-10 shadow-2xl">
              <p className="text-[10px] text-white/40 tracking-[0.3em] uppercase text-center mb-8">
                文字接力 · Text Relay
              </p>

              <div className="mb-8">
                <p className="text-[10px] text-white/30 uppercase tracking-widest mb-3">
                  你收到的句子
                </p>
                <div className="relative pl-4 border-l-2 border-white/20">
                  <p className="text-base md:text-lg text-white/60 font-serif italic leading-relaxed">
                    &ldquo;{coverContribution.received}&rdquo;
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 my-6">
                <div className="flex-1 h-px bg-white/10" />
                <SemicolonLogo className="h-4 opacity-30" />
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <div>
                <p className="text-[10px] text-white/30 uppercase tracking-widest mb-3">
                  你寫下的句子
                </p>
                <div className="relative pl-4 border-l-2 border-white/40">
                  <p className="text-xl md:text-2xl text-white font-serif leading-relaxed">
                    &ldquo;{coverContribution.mine}&rdquo;
                  </p>
                </div>
              </div>
            </div>

            {collectedElements.length > 0 && (
              <p className="text-[10px] text-white/20 text-center mt-6">
                {collectedElements.length} 個元素已收集
              </p>
            )}
          </div>
        ) : (
          <div className="text-center max-w-md">
            <div className="bg-black/40 backdrop-blur-lg border border-white/10 rounded-2xl p-8">
              <p className="text-white/50 mb-4">
                你還沒有參與文字接力
              </p>
              <p className="text-sm text-white/30">
                回到封面，寫下你的句子吧
              </p>
            </div>

            {collectedElements.length > 0 && (
              <p className="text-[10px] text-white/20 mt-6">
                {collectedElements.length} 個元素已收集
              </p>
            )}
          </div>
        )}
      </div>

      {/* ====== Credits Section ====== */}
      <footer className="relative z-20 px-8 py-24 text-center border-t border-white/5">
        <div className="mb-12">
          <img
            src="/assets/title.svg"
            alt="服務聲"
            className="h-6 md:h-8 w-auto mx-auto brightness-0 invert opacity-60 mb-3"
          />
          <p className="text-xl md:text-2xl font-serif mb-1 tracking-wide">
            2026
          </p>
          <p className="text-[10px] text-white/25 tracking-[0.2em] uppercase">
            ISS Community Annual Newsletter
          </p>
        </div>

        <div className="mb-12">
          <p className="text-[9px] text-white/20 uppercase tracking-widest mb-4">
            主編 設計
          </p>
          <p className="text-xs text-white/50 tracking-wide">
            陳冠宇 · 胡育慈 · 邱筠婷
          </p>
        </div>

        <div className="pt-6 border-t border-white/5">
          <SemicolonLogo className="h-10 mx-auto mb-6 opacity-25" />

          <div className="text-[11px] text-white/15 font-serif italic space-y-1">
            <p>Services continue;</p>
            <p>Stories continue;</p>
            <p>And so do we.</p>
          </div>
        </div>

        <p className="text-[9px] text-white/10 mt-12 tracking-widest">
          © 2026 Institute of Service Science, NTHU
        </p>
      </footer>
    </section>
  )
}
