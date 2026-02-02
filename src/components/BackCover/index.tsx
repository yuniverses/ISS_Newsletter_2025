import { useRef, useEffect, useState } from 'react'
import { useReadingMemories } from '@/hooks/useReadingMemories'
import { SemicolonLogo } from '@/components/ui/SemicolonLogo'
import FallingMemories from './FallingMemories'
import EmptyState from './EmptyState'
import Noise from '@/components/Noise'

export default function BackCover() {
  const { memories, coverContribution } = useReadingMemories()
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  // 檢測封底是否進入視野
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true)
          }
        })
      },
      { threshold: 0.2 }
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [isVisible])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen bg-[#0a0a0a] text-white overflow-hidden"
    >
      {/* Noise Overlay */}
      <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-15 z-10">
        <Noise
          patternSize={250}
          patternAlpha={20}
          patternRefreshInterval={4}
        />
      </div>

      {/* 主要內容區域 */}
      <div className="relative min-h-screen">

        {/* 背景層：掉落的文字記憶 */}
        <div className="absolute inset-0 z-0">
          {memories.length > 0 ? (
            <FallingMemories memories={memories} isVisible={isVisible} />
          ) : (
            <div className="h-full flex items-center justify-center">
              <EmptyState />
            </div>
          )}
        </div>

        {/* 前景層：文字接龍卡片 */}
        <div className="relative z-20 min-h-screen flex flex-col items-center justify-center px-6 py-20">

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

          {/* 文字接龍卡片 */}
          {coverContribution ? (
            <div className="w-full max-w-lg">
              <div
                className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-10 shadow-2xl"
              >
                {/* 卡片標題 */}
                <p className="text-[10px] text-white/40 tracking-[0.3em] uppercase text-center mb-8">
                  文字接力 · Text Relay
                </p>

                {/* 收到的句子 */}
                <div className="mb-8">
                  <p className="text-[10px] text-white/30 uppercase tracking-widest mb-3">
                    你收到的句子
                  </p>
                  <div className="relative pl-4 border-l-2 border-white/20">
                    <p className="text-base md:text-lg text-white/60 font-serif italic leading-relaxed">
                      "{coverContribution.received}"
                    </p>
                  </div>
                </div>

                {/* 分隔符 */}
                <div className="flex items-center justify-center gap-3 my-6">
                  <div className="flex-1 h-px bg-white/10" />
                  <SemicolonLogo className="h-4 opacity-30" />
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                {/* 自己寫的句子 */}
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest mb-3">
                    你寫下的句子
                  </p>
                  <div className="relative pl-4 border-l-2 border-white/40">
                    <p className="text-xl md:text-2xl text-white font-serif leading-relaxed">
                      "{coverContribution.mine}"
                    </p>
                  </div>
                </div>
              </div>

              {/* 記憶數量提示 */}
              {memories.length > 0 && (
                <p className="text-[10px] text-white/20 text-center mt-6">
                  你收藏了 {memories.length} 段文字
                </p>
              )}
            </div>
          ) : (
            /* 如果沒有參與文字接龍，顯示提示 */
            <div className="text-center max-w-md">
              <div className="bg-black/40 backdrop-blur-lg border border-white/10 rounded-2xl p-8">
                <p className="text-white/50 mb-4">
                  你還沒有參與文字接力
                </p>
                <p className="text-sm text-white/30">
                  回到封面，寫下你的句子吧
                </p>
              </div>

              {memories.length > 0 && (
                <p className="text-[10px] text-white/20 mt-6">
                  你收藏了 {memories.length} 段文字
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Credits Section */}
      <footer className="relative z-20 px-8 py-24 text-center border-t border-white/5">
        {/* Title */}
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

        {/* Team */}
        <div className="mb-12">
          <p className="text-[9px] text-white/20 uppercase tracking-widest mb-4">
            主編 設計
          </p>
          <p className="text-xs text-white/50 tracking-wide">
            陳冠宇 · 胡育慈 · 邱筠婷
          </p>
        </div>

        {/* Logo & Tagline */}
        <div className="pt-6 border-t border-white/5">
          <SemicolonLogo className="h-10 mx-auto mb-6 opacity-25" />

          <div className="text-[11px] text-white/15 font-serif italic space-y-1">
            <p>Services continue;</p>
            <p>Stories continue;</p>
            <p>And so do we.</p>
          </div>
        </div>

        {/* Copyright */}
        <p className="text-[9px] text-white/10 mt-12 tracking-widest">
          © 2026 Institute of Service Science, NTHU
        </p>
      </footer>
    </section>
  )
}
