import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { SemicolonLogo } from "../ui/SemicolonLogo";
import Noise from "../Noise";
import ScrollReveal from "../ScrollReveal";

gsap.registerPlugin(ScrollTrigger);

interface Sentence {
  id: string;
  text: string;
  createdAt: any;
}

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
    const angle =
      (i * 2 * Math.PI) / sides - Math.PI / 2 + (rotation * Math.PI) / 180;
    const x = 50 + radius * Math.cos(angle);
    const y = 50 + radius * Math.sin(angle);
    points.push(`${x}% ${y}%`);
  }
  return `polygon(${points.join(", ")})`;
};

const lerp = (start: number, end: number, t: number) =>
  start * (1 - t) + end * t;

const CrossfadeLoop = ({
  src,
  className,
  style,
}: {
  src: string;
  className?: string;
  style?: React.CSSProperties;
}) => {
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
      if (
        current.currentTime >= current.duration - TRANSITION_DURATION &&
        !isTransitioning
      ) {
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
    const onTimeUpdate1 = () => {
      if (activeVideo === 1) handleTimeUpdate();
    };
    const onTimeUpdate2 = () => {
      if (activeVideo === 2) handleTimeUpdate();
    };
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
      <video
        ref={video1Ref}
        src={src}
        muted
        playsInline
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-linear ${
          activeVideo === 1 ? "opacity-100 z-10" : "opacity-0 z-0"
        }`}
      />
      <video
        ref={video2Ref}
        src={src}
        muted
        playsInline
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-linear ${
          activeVideo === 2 ? "opacity-100 z-10" : "opacity-0 z-0"
        }`}
      />
    </div>
  );
};

export default function Cover({ onEnter }: CoverProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyWrapperRef = useRef<HTMLDivElement>(null);
  const leftVideoWrapperRef = useRef<HTMLDivElement>(null);
  const leftVideoInnerRef = useRef<HTMLDivElement>(null);
  const rightVideoWrapperRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const cardOverlayRef = useRef<HTMLDivElement>(null);

  const mousePosRef = useRef({ x: 0.5, y: 0.5 });
  const mousePos2Ref = useRef({ x: 0.5, y: 0.5 });
  const scrollProgressRef = useRef(0);
  const isHoveringRef = useRef(false);
  const isHovering2Ref = useRef(false);

  const currentVisualsRef = useRef({
    left: { sides: 4, rotation: 45, scale: 1.1, radius: 80, x: 0 },
    right: { sides: 4, rotation: 45, scale: 1.1, radius: 80 },
  });

  // Text Relay State
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Contribution State
  const [hasContributed, setHasContributed] = useState(false);
  const [userContribution, setUserContribution] = useState<{
    received: string;
    mine: string;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load local state
  useEffect(() => {
    const saved = localStorage.getItem("iss_relay_data");
    if (saved) {
      const data = JSON.parse(saved);
      setHasContributed(true);
      setUserContribution(data);
    }
  }, []);

  // Fetch Sentences
  useEffect(() => {
    const q = query(
      collection(db, "coverSentences"),
      orderBy("createdAt", "asc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Sentence[];
      setSentences(data);
    });
    return () => unsubscribe();
  }, []);

  // Auto-scroll to bottom when opened
  useEffect(() => {
    if (isCardOpen && messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [isCardOpen, sentences]);

  const handleSend = async () => {
    if (!inputText.trim() || isSubmitting) return;

    const lastSentence =
      sentences[sentences.length - 1]?.text || "Start the story...";

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "coverSentences"), {
        text: inputText.trim(),
        createdAt: serverTimestamp(),
      });

      const contributionData = {
        received: lastSentence,
        mine: inputText.trim(),
      };
      localStorage.setItem("iss_relay_data", JSON.stringify(contributionData));

      setHasContributed(true);
      setUserContribution(contributionData);
      setInputText("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("發送失敗，請稍後再試");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMouseMove1 = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mousePosRef.current = {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
    isHoveringRef.current = true;
  };

  const handleMouseLeave1 = () => {
    isHoveringRef.current = false;
    mousePosRef.current = { x: 0.5, y: 0.5 };
  };

  const handleMouseMove2 = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mousePos2Ref.current = {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
    isHovering2Ref.current = true;
  };

  const handleMouseLeave2 = () => {
    isHovering2Ref.current = false;
    mousePos2Ref.current = { x: 0.5, y: 0.5 };
  };

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

      gsap
        .timeline({
          scrollTrigger: {
            trigger: container,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
            onUpdate: (self) => {
              scrollProgressRef.current = self.progress;
            },
          },
        })
        .to(heroContentRef.current, { opacity: 0, y: -50, duration: 0.1 }, 0)
        .to(rightVideoWrapperRef.current, { opacity: 0, duration: 0.1 }, 0);
    }, container);

    const tick = () => {
      const p = scrollProgressRef.current;
      const el = leftVideoInnerRef.current;
      const wrapper = leftVideoWrapperRef.current;
      const cardOverlay = cardOverlayRef.current;
      
      if (!el || !wrapper) return;

      const cv = currentVisualsRef.current.left;

      // --- Card Opacity & Interaction (Scroll Driven) ---
      let cardOpacity = 0;
      if (p > 0.92) {
        cardOpacity = (p - 0.92) / 0.06;
        if (cardOpacity > 1) cardOpacity = 1;
      }
      
      if (cardOverlay) {
        cardOverlay.style.opacity = cardOpacity.toString();
        if (cardOpacity >= 0.95 && !isCardOpen) {
           setIsCardOpen(true);
        } else if (cardOpacity < 0.95 && isCardOpen) {
           setIsCardOpen(false);
        }
      }

      // --- Phase 1 & 2: Hero & Circle Morph (0.0 -> 0.8) ---
      if (p <= 0.8) {
        wrapper.style.zIndex = "10";
        const circleP = Math.min(p / 0.3, 1);
        const circleInfluence = gsap.parseEase("power2.inOut")(circleP);

        let targetSides = 4, targetRotation = 45, targetRadius = 80;

        if (isHoveringRef.current) {
          const { x, y } = mousePosRef.current;
          const dist = Math.sqrt(Math.pow(x - 0.5, 2) + Math.pow(y - 0.5, 2));
          targetSides = 3 + (1 - dist * 2) * 17;
          targetRotation = Math.atan2(y - 0.5, x - 0.5) * (180 / Math.PI);
          targetRadius = 45;
        }

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
      // --- Phase 3: Morph to Small Rectangle (0.8 -> 0.9) ---
      else if (p <= 0.9) {
        wrapper.style.zIndex = "40"; 
        const morphP = Math.min((p - 0.8) / 0.1, 1);
        const easeP = gsap.parseEase("power1.inOut")(morphP);

        const currentInsetY = lerp(15, 25, easeP);
        const currentInsetX = lerp(15, 10, easeP);
        const currentRound = lerp(50, 5, easeP);
        const currentX = lerp(0, 50, easeP);
        const currentScale = lerp(0.8, 1.0, easeP);

        el.style.clipPath = `inset(${currentInsetY}% ${currentInsetX}% ${currentInsetY}% ${currentInsetX}% round ${currentRound}%)`;
        el.style.transform = `scale(${currentScale})`;
        wrapper.style.transform = `translateX(${currentX}%)`;
      }
      // --- Phase 4: Settle as Readable Card (0.9 -> 1.0) ---
      else {
        wrapper.style.zIndex = "50";
        const expandP = Math.min((p - 0.9) / 0.1, 1);
        const easeExpand = gsap.parseEase("power2.out")(expandP);

        // Final stable Card shape (Not full screen)
        const currentInsetY = lerp(25, 15, easeExpand);
        const currentInsetX = lerp(10, 8, easeExpand);
        const currentRound = lerp(5, 40, easeExpand);
        const currentScale = lerp(1.0, 1.05, easeExpand); 

        el.style.clipPath = `inset(${currentInsetY}% ${currentInsetX}% ${currentInsetY}% ${currentInsetX}% round ${currentRound}px)`;
        el.style.transform = `scale(${currentScale})`;
        wrapper.style.transform = `translateX(50%)`; 
      }

      // --- Right Video Logic ---
      if (rightVideoWrapperRef.current && p < 0.1) {
        // (Simplified mouse interaction for right video at top)
        const cvR = currentVisualsRef.current.right;
        const circleP = Math.min(p / 0.3, 1);
        const circleInfluence = gsap.parseEase("power2.inOut")(circleP);
        cvR.sides = lerp(cvR.sides, 50, circleInfluence);
        cvR.radius = lerp(cvR.radius, 35, circleInfluence);
        // ... handled via opacity mostly ...
      }
    };

    gsap.ticker.add(tick);
    return () => { ctx.revert(); gsap.ticker.remove(tick); };
  }, [onEnter, isCardOpen]);

  const backgroundText = `In grammar, a semicolon connects two related but independently standing ideas...`;
  const repeatedText = Array(6).fill(backgroundText).join("");

  return (
    <div ref={containerRef} className="relative w-full bg-black text-white font-sans">
      <div ref={stickyWrapperRef} className="h-screen w-full overflow-hidden flex flex-col md:flex-row absolute top-0 left-0 z-0 pointer-events-auto">
        <div ref={leftVideoWrapperRef} className={`relative w-full h-1/2 md:w-1/2 md:h-full overflow-hidden pointer-events-auto z-10 transition-all duration-500`} onMouseMove={handleMouseMove1} onMouseLeave={handleMouseLeave1}>
          <div ref={leftVideoInnerRef} className="absolute inset-0 transition-none" style={{ transform: "scale(1.1)", clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" }}>
            <CrossfadeLoop src="dist/assets/vul.mp4" className="relative w-full h-full overflow-hidden" style={{ filter: isCardOpen ? "blur(12px) brightness(0.4)" : "blur(8px)" }} />
          </div>

          {/* Embedded Card Content Overlay */}
          <div ref={cardOverlayRef} className={`absolute inset-0 z-20 flex flex-col p-12 md:p-24 transition-none ${isCardOpen ? "pointer-events-auto" : "pointer-events-none translate-y-4"}`} style={{ opacity: 0 }}>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] bg-gradient-to-tr from-purple-500/20 via-blue-500/10 to-transparent rounded-full blur-[80px] pointer-events-none opacity-40" />
            <div className="relative z-10 flex-1 flex flex-col h-full">
              <div className="flex-1 flex flex-col justify-center border-b border-white/10 pb-8">
                {sentences.length > 0 && !hasContributed && (
                  <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <p className="text-xs text-accent tracking-[0.2em] uppercase mb-6 opacity-60 text-center">Previous Thought</p>
                    <div className="relative text-center">
                      <span className="absolute -top-8 left-0 text-6xl text-white/5 font-serif font-bold">“</span>
                      <p className="text-2xl md:text-4xl font-light text-white leading-relaxed tracking-wide font-serif px-10">
                        {sentences[sentences.length - 1].text}
                      </p>
                      <span className="absolute -bottom-8 right-0 text-6xl text-white/5 font-serif font-bold rotate-180">“</span>
                    </div>
                  </div>
                )}
                {hasContributed && (
                  <div className="flex flex-col h-full justify-center space-y-10 animate-in zoom-in-95 duration-700 text-center">
                    <div className="space-y-4"><p className="text-xs tracking-[0.3em] text-white/40 uppercase">Memory Stored</p><SemicolonLogo className="h-12 w-auto mx-auto text-white" /></div>
                    <div className="space-y-8 text-left max-w-lg mx-auto">
                      <div><p className="text-[10px] text-white/30 uppercase tracking-widest mb-2">Received</p><p className="text-lg text-white/70 font-serif font-light leading-relaxed">"{userContribution?.received}"</p></div>
                      <div className="w-12 h-px bg-accent/50" />
                      <div><p className="text-[10px] text-white/30 uppercase tracking-widest mb-2">You Wrote</p><p className="text-2xl text-white font-serif font-medium leading-relaxed">"{userContribution?.mine}"</p></div>
                    </div>
                  </div>
                )}
              </div>
              {!hasContributed && (
                <div className="pt-8 relative text-center">
                  <p className="text-xs text-white/50 tracking-[0.2em] uppercase mb-6 font-light">Continue the story</p>
                  <div className="relative group max-w-xl mx-auto">
                    <textarea className="w-full h-32 bg-transparent border-none p-0 text-xl md:text-2xl font-light text-white/90 placeholder-white/10 focus:ring-0 focus:outline-none transition-all resize-none text-center font-serif leading-relaxed" placeholder="Type your thought..." value={inputText} onChange={(e) => setInputText(e.target.value)} disabled={isSubmitting} />
                    <button onClick={handleSend} disabled={!inputText.trim() || isSubmitting} className={`mt-4 px-8 py-2 text-black bg-white text-[10px] tracking-[0.2em] font-bold rounded-full transition-all duration-300 ${!inputText.trim() || isSubmitting ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`}>
                      {isSubmitting ? "PUBLISHING" : "PUBLISH"} &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div ref={rightVideoWrapperRef} className="relative w-full h-1/2 md:w-1/2 md:h-full overflow-hidden pointer-events-auto z-10"><div className="absolute inset-0 transition-none" style={{ transform: "scale(1.1) scaleY(-1)", clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" }}><CrossfadeLoop src="dist/assets/vul.mp4" className="relative w-full h-full overflow-hidden" style={{ filter: "blur(8px)" }} /></div></div>
        <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-20 z-20"><Noise patternSize={250} patternAlpha={25} patternRefreshInterval={3} /></div>
      </div>
      <div className="relative z-30 w-full pointer-events-none">
        <div ref={heroContentRef} className="h-screen w-full relative flex flex-col box-border"><div className="contents"><div className="pointer-events-auto absolute top-[8vh] left-[6vw] flex flex-col gap-2 z-20"><img src="/assets/title.svg" alt="服務聲" className="h-10 md:h-14 w-auto brightness-0 invert" /><span className="text-white/80 text-[10px] md:text-[13px] tracking-[0.1em] font-light ml-1">ISS Community Annual Newsletter</span></div><div className="pointer-events-none absolute top-[50%] -translate-y-[50%] left-0 w-full px-[8vw]"><div className="hidden md:flex items-start justify-between w-full pointer-events-auto"><div className="text-[32px] font-bold tracking-widest leading-none pt-2">2025</div><div className="absolute left-1/2 -translate-x-1/2 top-0"><SemicolonLogo className="h-[100px] w-auto drop-shadow-2xl" /></div><div className="flex items-start gap-12 ml-auto"><div className="h-[200px] w-auto"><p className="text-white/90 text-[13px] tracking-widest [writing-mode:vertical-rl] h-full text-justify leading-relaxed">Since 2008, the institute...</p></div><div className="flex items-baseline gap-4 pt-2"><span className="text-[24px] font-light tracking-widest">分號</span><span className="text-[24px] font-light tracking-widest opacity-80">semicolon</span></div></div></div></div><div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce opacity-70 z-20 pointer-events-auto"><div className="text-[10px] tracking-[0.2em] uppercase">Scroll</div><div className="w-px h-8 bg-white" /></div></div></div>
        <div className="min-h-screen flex flex-col md:flex-row"><div className="hidden md:block md:w-1/2 pointer-events-none"></div><div className="w-full md:w-1/2 bg-transparent px-8 py-32 md:py-40 z-30 pointer-events-auto"><div className="max-w-xl w-full text-left mx-auto md:mx-0"><div className="mb-24"><ScrollReveal baseOpacity={0.1} enableBlur={true} baseRotation={3} blurStrength={8} containerClassName="mb-8" textClassName="text-[9px] md:text-[11px] text-gray-300 leading-loose font-light">「分號 ;」。</ScrollReveal><ScrollReveal baseOpacity={0.1} enableBlur={true} baseRotation={3} blurStrength={8} containerClassName="mb-8" textClassName="text-[8px] md:text-[10px] text-gray-400 leading-loose font-light">它用來分隔一個複句中，彼此獨立卻又緊密相關的句子。它讓語氣稍作停留，卻同時暗示：後面還會有更多、還能再說下去。它是一種介於「未完」與「延續」之間的流動。 既獨立，又連結；既分開，又仍在一起。 其實，這也是服科所的樣子。</ScrollReveal><ScrollReveal baseOpacity={0.1} enableBlur={true} baseRotation={8} blurStrength={8} containerClassName="mb-8" textClassName="text-[9px] md:text-[11px] text-gray-300 leading-loose font-light">Services continue; Stories continue; And so do we.</ScrollReveal></div><div className="border-t border-gray-800 pt-10"><p className="text-sm text-gray-500 mb-6 font-light uppercase tracking-widest">編輯的話</p><div className="flex flex-wrap justify-start gap-x-8 gap-y-3 text-sm text-gray-400 font-light"><div><span className="text-white">陳冠宇</span> / 主編 設計</div><div><span className="text-white">胡育慈</span> / 主編 設計</div><div><span className="text-white">邱筠婷</span> / 主編 設計</div></div></div></div></div></div>
        <div className="h-[250vh] w-full bg-transparent" />
        <div className="w-full pointer-events-none"><div className="w-full h-2 bg-white opacity-[0.11] mb-10" /><div className="w-full h-2 bg-white opacity-[0.20] mb-8" /><div className="w-full h-3 bg-white opacity-[0.27] mb-7" /><div className="w-full h-4 bg-white opacity-[0.40] mb-5" /><div className="w-full h-5 bg-white opacity-50 mb-4" /><div className="w-full h-6 bg-white opacity-[0.65] mb-3" /><div className="w-full h-8 bg-white opacity-75 mb-2" /><div className="w-full h-32 bg-white" /></div>
      </div>
    </div>
  );
}