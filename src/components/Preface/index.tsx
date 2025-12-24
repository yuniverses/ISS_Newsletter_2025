import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ScrollReveal from "../ScrollReveal";

gsap.registerPlugin(ScrollTrigger);

export default function Preface() {
  const containerRef = useRef<HTMLElement>(null);
  const videoWrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const videoWrapper = videoWrapperRef.current;
    
    if (!container || !videoWrapper) return;

    // Create a context for GSAP to easily clean up later
    const ctx = gsap.context(() => {
      // Animation for the video clip-path
      // Starts as full rectangle, morphs to circle
      gsap.fromTo(
        videoWrapper,
        {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", // Full rectangle
          borderRadius: "0%",
        },
        {
          clipPath: "circle(35% at 50% 50%)", // Circle
          borderRadius: "50%", // Optional: adds smooth border radius transition if clip-path is jagged
          ease: "none",
          scrollTrigger: {
            trigger: container,
            start: "top top", // Start animation when container hits top
            end: "center center", // Finish animation when scrolled halfway
            scrub: 1, // Smooth scrubbing
            pin: false, // We rely on sticky positioning CSS, but could use pin here if needed
          },
        }
      );
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative w-full bg-black text-white flex flex-col md:flex-row">
      
      {/* Left Column: Sticky Video (Desktop only) */}
      <div className="hidden md:block md:w-1/2 h-screen sticky top-0 overflow-hidden z-0">
        <div 
          ref={videoWrapperRef} 
          className="w-full h-full relative"
          style={{ willChange: "clip-path" }}
        >
          <video
            ref={videoRef}
            src="dist/assets/vul.mp4"
            muted
            loop
            playsInline
            autoPlay
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Overlay to dim video slightly so text pops if it were over it, but here it's side-by-side. 
              Maybe we don't need it, but consistent with dark theme. */}
          <div className="absolute inset-0 bg-black/20" />
        </div>
      </div>

      {/* Right Column: Content (Scrolls) */}
      <div className="w-full md:w-1/2 min-h-screen relative z-10 bg-black">
        {/* Main content - centered and focused like a slogan */}
        <div className="flex flex-col items-start justify-center px-8 py-32 md:py-40">
          <div className="max-w-xl w-full text-left">
            
            {/* Content paragraphs - with scroll reveal effect */}
            <div className="mb-24">
              <ScrollReveal
                baseOpacity={0.1}
                enableBlur={true}
                baseRotation={3}
                blurStrength={8}
                containerClassName="mb-8"
                textClassName="text-xs md:text-sm text-gray-300 leading-loose font-light"
              >
                「分號 ;」。
              </ScrollReveal>
              <ScrollReveal
                baseOpacity={0.1}
                enableBlur={true}
                baseRotation={3}
                blurStrength={8}
                containerClassName="mb-8"
                textClassName="text-xs md:text-sm text-gray-300 leading-loose font-light"
              >
                它用來分隔一個複句中，彼此獨立卻又緊密相關的句子。
                它讓語氣稍作停留，卻同時暗示：後面還會有更多、還能再說下去。
                它是一種介於「未完」與「延續」之間的流動。 既獨立，又連結；
                既分開，又仍在一起。 其實，這也是服科所的樣子。
              </ScrollReveal>

              <ScrollReveal
                baseOpacity={0.1}
                enableBlur={true}
                baseRotation={3}
                blurStrength={8}
                containerClassName="mb-8"
                textClassName="text-xs md:text-sm text-gray-300 leading-loose font-light"
              >
                我們來自不同的城市、科系與生命背景，
                體驗不同的經歷、擁有不同的能力、帶著不同的故事。
                單獨看，每個人都是一個完整、有重量的句子；
                然而，在服科這個場域裡，我們相遇—— 並在並列之間產生新的語意。
              </ScrollReveal>

              <ScrollReveal
                baseOpacity={0.1}
                enableBlur={true}
                baseRotation={3}
                blurStrength={8}
                containerClassName="mb-8"
                textClassName="text-xs md:text-sm text-gray-300 leading-loose font-light"
              >
                當不同的句子彼此靠近，世界就開始變得更完整、更深刻。
                《服務聲》第三期以「分號」作為主題， 它傳遞了一種服務科學的精神：
                個體之間保持差異，但在關係中創造價值；
                片段彼此獨立，但在系統裡形成新的循環。
              </ScrollReveal>
              <ScrollReveal
                baseOpacity={0.1}
                enableBlur={true}
                baseRotation={3}
                blurStrength={8}
                containerClassName="mb-8"
                textClassName="text-xs md:text-sm text-gray-300 leading-loose font-light"
              >
                在這本刊物裡，我們邀請你一起走入分號之間。
                你會看到學長姐的故事未完待續；
                看到策展、創業、職涯的道路仍持續延展； 看到
                AI、服務設計、系統思維在新的脈絡中牽引更多連結。
                願這本《服務聲》， 成為所有讀者生命中一個小小的分號；
                讓你在這裡暫停、呼吸、思考，
                但同時，也準備走向下一個更豐富的句子。
              </ScrollReveal>

              <ScrollReveal
                baseOpacity={0.1}
                enableBlur={true}
                baseRotation={8}
                blurStrength={8}
                containerClassName="mb-8"
                textClassName="text-xs md:text-sm text-gray-300 leading-loose font-light"
              >
                Services continue; Stories continue; And so do we.
              </ScrollReveal>
            </div>

            {/* Editors section - centered */}
            <div className="border-t border-gray-800 pt-10">
              <p className="text-sm text-gray-500 mb-6 font-light uppercase tracking-widest">
                編輯的話
              </p>

              <div className="flex flex-wrap justify-start gap-x-8 gap-y-3 text-sm text-gray-400 font-light">
                <div>
                  <span className="text-white">陳冠宇</span> / 主編 設計
                </div>
                <div>
                  <span className="text-white">胡育慈</span> / 主編 設計
                </div>
                <div>
                  <span className="text-white">邱筠婷</span> / 主編 設計
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Block-style transition from black to white with progressive sizing 
            Kept inside the right column so it scrolls with the content
        */}
        <div className="w-full">
          {/* Darkest blocks: smallest height, largest gaps */}
          <div className="w-full h-2 bg-white opacity-[0.11] mb-10" />
          <div className="w-full h-2 bg-white opacity-[0.20] mb-8" />
          <div className="w-full h-3 bg-white opacity-[0.27] mb-7" />

          {/* Mid-tone blocks: progressive increase in height, decrease in gap */}
          <div className="w-full h-4 bg-white opacity-[0.40] mb-5" />
          <div className="w-full h-5 bg-white opacity-50 mb-4" />
          <div className="w-full h-6 bg-white opacity-[0.65] mb-3" />
          <div className="w-full h-8 bg-white opacity-75 mb-2" />

          {/* Brightest block: largest height (2x larger), no gap */}
          <div className="w-full h-32 bg-white" />
        </div>
      </div>

    </section>
  );
}
