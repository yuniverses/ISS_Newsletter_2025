import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SemicolonLogo } from "../ui/SemicolonLogo";
import Noise from "../Noise";
import ScrollReveal from "../ScrollReveal";

gsap.registerPlugin(ScrollTrigger);

interface CoverProps {
  onEnter?: () => void;
  startAnimation?: boolean;
}

const generatePolygonPath = (
  sides: number,
  rotation: number = 0,
  radius: number = 45
): string => {
  sides = Math.max(3, sides);
  if (sides >= 50) return `circle(${radius}% at 50% 50%)`;
  const points: string[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = (i * 2 * Math.PI) / sides - Math.PI / 2 + (rotation * Math.PI) / 180;
    const x = 50 + radius * Math.cos(angle);
    const y = 50 + radius * Math.sin(angle);
    points.push(`${x}% ${y}%`);
  }
  return `polygon(${points.join(", ")})`;
};

const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t;

const CrossfadeLoop = ({ src, className, style }: { src: string; className?: string; style?: React.CSSProperties; }) => {
  const video1Ref = useRef<HTMLVideoElement>(null);
  const video2Ref = useRef<HTMLVideoElement>(null);
  const [activeVideo, setActiveVideo] = useState<1 | 2>(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const v1 = video1Ref.current;
    const v2 = video2Ref.current;
    if (!v1 || !v2) return;
    const TRANSITION_DURATION = 1.0;
    const handleTimeUpdate = () => {
      const current = activeVideo === 1 ? v1 : v2;
      const next = activeVideo === 1 ? v2 : v1;
      if (!current.duration) return;
      if (current.currentTime >= current.duration - TRANSITION_DURATION && !isTransitioning) {
        setIsTransitioning(true);
        next.currentTime = 0;
        next.play().catch((e) => console.log(e));
        setActiveVideo((prev) => (prev === 1 ? 2 : 1));
        setTimeout(() => {
          setIsTransitioning(false);
          current.pause();
          current.currentTime = 0;
        }, TRANSITION_DURATION * 1000);
      }
    };
    const onTimeUpdate1 = () => { if (activeVideo === 1) handleTimeUpdate(); };
    const onTimeUpdate2 = () => { if (activeVideo === 2) handleTimeUpdate(); };
    v1.addEventListener("timeupdate", onTimeUpdate1);
    v2.addEventListener("timeupdate", onTimeUpdate2);
    v1.play().catch((e) => console.log(e));
    return () => {
      v1.removeEventListener("timeupdate", onTimeUpdate1);
      v2.removeEventListener("timeupdate", onTimeUpdate2);
    };
  }, [activeVideo, isTransitioning]);

  return (
    <div className={className} style={style}>
      <video ref={video1Ref} src={src} muted playsInline className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-linear ${activeVideo === 1 ? "opacity-100 z-10" : "opacity-0 z-0"}`} />
      <video ref={video2Ref} src={src} muted playsInline className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-linear ${activeVideo === 2 ? "opacity-100 z-10" : "opacity-0 z-0"}`} />
    </div>
  );
};

export default function Cover({ onEnter }: CoverProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyWrapperRef = useRef<HTMLDivElement>(null);
  const leftVideoWrapperRef = useRef<HTMLDivElement>(null);
  const leftVideoInnerRef = useRef<HTMLDivElement>(null);
  const rightVideoWrapperRef = useRef<HTMLDivElement>(null);
  const rightVideoInnerRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);

  const mousePosRef = useRef({ x: 0.5, y: 0.5 });
  const mousePos2Ref = useRef({ x: 0.5, y: 0.5 });
  const scrollProgressRef = useRef(0);
  const isHoveringRef = useRef(false);
  const isHovering2Ref = useRef(false);

  const currentVisualsRef = useRef({
    left: { sides: 4, rotation: 45, scale: 1.1, radius: 80, x: 0 },
    right: { sides: 4, rotation: 45, scale: 1.1, radius: 80 },
  });

  const handleMouseMove1 = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mousePosRef.current = { x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height };
    isHoveringRef.current = true;
  };

  const handleMouseLeave1 = () => { isHoveringRef.current = false; mousePosRef.current = { x: 0.5, y: 0.5 }; };

  const handleMouseMove2 = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mousePos2Ref.current = { x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height };
    isHovering2Ref.current = true;
  };

  const handleMouseLeave2 = () => { isHovering2Ref.current = false; mousePos2Ref.current = { x: 0.5, y: 0.5 }; };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: "bottom bottom",
        pin: stickyWrapperRef.current,
        pinSpacing: false,
      });

      gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          onUpdate: (self) => { scrollProgressRef.current = self.progress; },
        },
      })
      .to(heroContentRef.current, { opacity: 0, y: -50, duration: 0.1 }, 0)
      .to(rightVideoWrapperRef.current, { opacity: 0, duration: 0.1 }, 0);
    }, container);

    const tick = () => {
      const p = scrollProgressRef.current;
      const el = leftVideoInnerRef.current;
      const wrapper = leftVideoWrapperRef.current;
      if (!el || !wrapper) return;

      const cv = currentVisualsRef.current.left;

      // --- Phase 1 & 2: Hero & Circle Morph (0.0 -> 0.8) ---
      if (p <= 0.8) {
        wrapper.style.zIndex = "10";
        // Calculate influence: 0 at p=0, 1 at p=0.3
        const circleP = Math.min(p / 0.3, 1);
        const circleInfluence = gsap.parseEase("power2.inOut")(circleP);

        // Default: Square
        let targetSides = 4, targetRotation = 45, targetRadius = 80;

        // Interaction: Allow hover to change shape, but scroll dampens it
        if (isHoveringRef.current) {
          const { x, y } = mousePosRef.current;
          const dist = Math.sqrt(Math.pow(x - 0.5, 2) + Math.pow(y - 0.5, 2));
          targetSides = 3 + (1 - dist * 2) * 17;
          targetRotation = Math.atan2(y - 0.5, x - 0.5) * (180 / Math.PI);
          targetRadius = 45;
        }

        // Lerp from Target (Mouse/Square) to Circle (50 sides) based on scroll
        const finalTargetSides = lerp(targetSides, 50, circleInfluence);
        const finalTargetRotation = lerp(targetRotation, 0, circleInfluence);
        const finalTargetScale = lerp(1.1, 0.8, circleInfluence);
        const finalTargetRadius = lerp(targetRadius, 35, circleInfluence);

        cv.sides = lerp(cv.sides, finalTargetSides, 0.1);
        cv.rotation = lerp(cv.rotation, finalTargetRotation, 0.1);
        cv.radius = lerp(cv.radius, finalTargetRadius, 0.1);
        cv.scale = lerp(cv.scale, finalTargetScale, 0.1);
        cv.x = lerp(cv.x, 0, 0.1);

        el.style.clipPath = generatePolygonPath(Math.round(cv.sides), cv.rotation, cv.radius);
        el.style.transform = `scale(${cv.scale})`;
        wrapper.style.transform = `translateX(${cv.x}%)`;
      } 
      // --- Phase 3: Morph to Rectangle & Center (0.8 -> 0.95) ---
      else {
        wrapper.style.zIndex = "40"; // Bring to front
        const morphP = Math.min((p - 0.8) / 0.12, 1);
        const easeP = gsap.parseEase("power1.inOut")(morphP);

        const startInset = 15; const endInsetY = 25; const endInsetX = 10;
        const currentInsetY = lerp(startInset, endInsetY, easeP);
        const currentInsetX = lerp(startInset, endInsetX, easeP);
        const currentRound = lerp(50, 2, easeP);
        const currentX = lerp(0, 50, easeP);
        const currentScale = lerp(0.8, 1.1, easeP);

        el.style.clipPath = `inset(${currentInsetY}% ${currentInsetX}% ${currentInsetY}% ${currentInsetX}% round ${currentRound}%)`;
        el.style.transform = `scale(${currentScale})`;
        wrapper.style.transform = `translateX(${currentX}%)`;
      }

      // --- Right Video Logic (Interactive) ---
      if (rightVideoInnerRef.current) {
        const { x, y } = mousePos2Ref.current;
        let targetSides = 4;
        
        // Only run interactive shape logic if hovering and NOT scrolled down significantly
        // (Even though opacity fades it out, stopping calculation saves perf and avoids confusion)
        if (isHovering2Ref.current && p < 0.1) {
           if (x < 0.5 && y < 0.5) targetSides = 3;
           else if (x >= 0.5 && y < 0.5) targetSides = 6;
           else if (x < 0.5 && y >= 0.5) targetSides = 8;
           else targetSides = 12;
        }
        
        let targetRotation = (isHovering2Ref.current && p < 0.1) ? x * 360 : 45;
        let targetRadius = (isHovering2Ref.current && p < 0.1) ? 45 : 80;

        // Apply
        const cvR = currentVisualsRef.current.right;
        cvR.sides = lerp(cvR.sides, targetSides, 0.1);
        cvR.rotation = lerp(cvR.rotation, targetRotation, 0.1);
        cvR.radius = lerp(cvR.radius, targetRadius, 0.1);

        const roundedSides = Math.round(cvR.sides);
        const poly = generatePolygonPath(roundedSides, cvR.rotation, cvR.radius);
        
        rightVideoInnerRef.current.style.clipPath = poly;
        rightVideoInnerRef.current.style.transform = `scale(1.1) scaleY(-1)`;
      }
    };

    gsap.ticker.add(tick);
    return () => { ctx.revert(); gsap.ticker.remove(tick); };
  }, [onEnter]);

  const backgroundText = `In grammar, a semicolon connects two related but independently standing ideas. Similarly, at Semicolon Design, the semicolon symbolizes the bridge connecting visual art and storytelling. We believe that design is more than just creating aesthetic visuals - it is about conveying a profound story or message. `;
  const repeatedText = Array(6).fill(backgroundText).join("");

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black text-white font-sans"
    >
      {/* Sticky Wrapper - Z-0 */}
      <div
        ref={stickyWrapperRef}
        className="h-screen w-full overflow-hidden flex flex-col md:flex-row absolute top-0 left-0 z-0 pointer-events-auto"
      >
        {/* Top/Left Video */}
        <div
          ref={leftVideoWrapperRef}
          className="relative w-full h-1/2 md:w-1/2 md:h-full overflow-hidden pointer-events-auto cursor-crosshair z-10"
          onMouseMove={handleMouseMove1}
          onMouseLeave={handleMouseLeave1}
        >
          <div
            ref={leftVideoInnerRef}
            className="absolute inset-0 transition-none"
            style={{
              transform: "scale(1.1)",
              clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            }}
          >
            <CrossfadeLoop
              src="dist/assets/vul.mp4"
              className="relative w-full h-full overflow-hidden"
              style={{ filter: "blur(8px)" }}
            />
          </div>
        </div>

        {/* Bottom/Right Video */}
        <div
          ref={rightVideoWrapperRef}
          className={`relative w-full h-1/2 md:w-1/2 md:h-full overflow-hidden pointer-events-auto z-10`}
          onMouseMove={handleMouseMove2}
          onMouseLeave={handleMouseLeave2}
        >
          <div
            ref={rightVideoInnerRef}
            className="absolute inset-0 transition-none"
            style={{
              transform: "scale(1.1) scaleY(-1)",
              clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            }}
          >
            <CrossfadeLoop
              src="dist/assets/vul.mp4"
              className="relative w-full h-full overflow-hidden"
              style={{ filter: "blur(8px)" }}
            />
          </div>
        </div>

        {/* Noise - pointer-events-none */}
        <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-20 z-20">
          <Noise
            patternSize={250}
            patternAlpha={25}
            patternRefreshInterval={3}
          />
        </div>
      </div>

      {/* Content Container - Z-30 */}
      <div className="relative z-30 w-full pointer-events-none">
        {/* Hero Content */}
        <div
          ref={heroContentRef}
          className="h-screen w-full relative flex flex-col box-border"
        >
          <div className="contents">
            <div className="pointer-events-auto absolute top-[8vh] left-[6vw] flex flex-col gap-2 z-20">
              <img
                src="/assets/title.svg"
                alt="服務聲"
                className="h-10 md:h-14 w-auto brightness-0 invert"
              />
              <span className="text-white/80 text-[10px] md:text-[13px] tracking-[0.1em] font-light ml-1">
                ISS Community Annual Newsletter
              </span>
            </div>

            <div className="pointer-events-none absolute top-[50%] -translate-y-[50%] left-0 w-full px-[8vw]">
              {/* Mobile Layout */}
              <div className="flex flex-col items-center gap-8 md:hidden pointer-events-auto">
                <div className="text-4xl font-bold tracking-widest">2025</div>
                <SemicolonLogo className="h-[80px] w-auto drop-shadow-2xl" />
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xl font-light tracking-widest">
                    分號
                  </span>
                  <span className="text-sm tracking-widest opacity-80 uppercase">
                    semicolon
                  </span>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden md:flex items-start justify-between w-full pointer-events-auto">
                <div className="text-[32px] font-bold tracking-widest leading-none pt-2">
                  2025
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 top-0">
                  <SemicolonLogo className="h-[100px] w-auto drop-shadow-2xl" />
                </div>
                <div className="flex items-start gap-12 ml-auto">
                  <div className="h-[200px] w-auto">
                    <p className="text-white/90 text-[13px] tracking-widest [writing-mode:vertical-rl] h-full text-justify leading-relaxed">
                      Since 2008, the institute has adopted unique educational
                      practices to embed humanity into the learning
                      environment...
                    </p>
                  </div>
                  <div className="flex items-baseline gap-4 pt-2">
                    <span className="text-[24px] font-light tracking-widest">
                      分號
                    </span>
                    <span className="text-[24px] font-light tracking-widest opacity-80">
                      semicolon
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-[5vh] left-0 w-full px-[8vw] z-0 pointer-events-auto">
              <p className="text-[10px] md:text-[12px] text-justify leading-[1.6] text-gray-400 opacity-80 mix-blend-color-dodge select-none line-clamp-4 md:line-clamp-none">
                {repeatedText}
              </p>
            </div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce opacity-70 z-20 pointer-events-auto">
              <div className="text-[10px] tracking-[0.2em] uppercase">
                Scroll
              </div>
              <div className="w-px h-8 bg-white" />
            </div>
          </div>
        </div>

        {/* Preface Content */}
        <div className="min-h-screen flex flex-col md:flex-row">
          <div className="hidden md:block md:w-1/2 pointer-events-none"></div>
          <div className="w-full md:w-1/2 bg-transparent px-8 py-32 md:py-40 z-30 pointer-events-auto">
            <div className="max-w-xl w-full text-left mx-auto md:mx-0">
              <div className="mb-24">
                <ScrollReveal
                  baseOpacity={0.1}
                  enableBlur={true}
                  baseRotation={3}
                  blurStrength={8}
                  containerClassName="mb-8"
                  textClassName="text-[9px] md:text-[11px] text-gray-300 leading-loose font-light"
                >
                  「分號 ;」。
                </ScrollReveal>
                <ScrollReveal
                  baseOpacity={0.1}
                  enableBlur={true}
                  baseRotation={3}
                  blurStrength={8}
                  containerClassName="mb-8"
                  textClassName="text-[8px] md:text-[10px] text-gray-400 leading-loose font-light"
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
                  textClassName="text-[8px] md:text-[10px] text-gray-400 leading-loose font-light"
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
                  textClassName="text-[8px] md:text-[10px] text-gray-400 leading-loose font-light"
                >
                  當不同的句子彼此靠近，世界就開始變得更完整、更深刻。
                  《服務聲》第三期以「分號」作為主題，
                  它傳遞了一種服務科學的精神：
                  個體之間保持差異，但在關係中創造價值；
                  片段彼此獨立，但在系統裡形成新的循環。
                </ScrollReveal>
                <ScrollReveal
                  baseOpacity={0.1}
                  enableBlur={true}
                  baseRotation={3}
                  blurStrength={8}
                  containerClassName="mb-8"
                  textClassName="text-[8px] md:text-[10px] text-gray-400 leading-loose font-light"
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
                  textClassName="text-[9px] md:text-[11px] text-gray-300 leading-loose font-light"
                >
                  Services continue; Stories continue; And so do we.
                </ScrollReveal>
              </div>

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
        </div>

        {/* Extended Scroll Spacer - Increased to 250vh */}
        <div className="h-[250vh] w-full bg-transparent" />

        {/* Block Transition */}
        <div className="w-full pointer-events-none">
          <div className="w-full h-2 bg-white opacity-[0.11] mb-10" />
          <div className="w-full h-2 bg-white opacity-[0.20] mb-8" />
          <div className="w-full h-3 bg-white opacity-[0.27] mb-7" />
          <div className="w-full h-4 bg-white opacity-[0.40] mb-5" />
          <div className="w-full h-5 bg-white opacity-50 mb-4" />
          <div className="w-full h-6 bg-white opacity-[0.65] mb-3" />
          <div className="w-full h-8 bg-white opacity-75 mb-2" />
          <div className="w-full h-32 bg-white" />
        </div>
      </div>
    </div>
  );
}