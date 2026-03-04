import { useEffect, useRef, useMemo, useCallback, useState } from "react";
import { cn } from "@/utils/cn";
import { Link } from "lucide-react";
import { Credit } from "@/types";
import Matter from "matter-js";
import SplitText from "../ui/SplitText";
import AnimatedContent from "../ui/AnimatedContent";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReadingMemories } from "@/hooks/useReadingMemories";

gsap.registerPlugin(ScrollTrigger);

const FALLING_HINT_STORAGE_KEY = "iss_hint_falling_elements_seen";
// Hint shows on any chapter with falling elements (not limited to chapter-01)

interface ChapterHeroProps {
  chapterNumber: string;
  title: string;
  subtitle?: string;
  authors?: string[];
  category?: string;
  preface?: string;
  coverImage?: string;
  chapterId?: string;
  date?: string;
  credits?: Credit[];
  fallingElements?: string[];
  heroVariant?: 'default' | 'scene-html';
  heroSceneHtml?: string;
}

export default function ChapterHero({
  chapterNumber,
  title,
  subtitle,
  authors = [],
  category = "服務聲精選",
  preface,
  coverImage = "/assets/IMG_6561.png",
  chapterId,
  date,
  credits,
  fallingElements = [],
  heroVariant = 'default',
  heroSceneHtml,
}: ChapterHeroProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const imageFrameRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const contentCardRef = useRef<HTMLDivElement>(null);
  const prefaceRef = useRef<HTMLDivElement>(null);
  const copiedRef = useRef(false);
  const copyButtonRef = useRef<HTMLButtonElement>(null);
  const copyLabelRef = useRef<HTMLSpanElement>(null);
  const [showFallingHint, setShowFallingHint] = useState(false);
  const hasSeenFallingHintRef = useRef(true);
  const showFallingHintRef = useRef(false);
  const fallingHintRef = useRef<HTMLDivElement>(null);
  const fallingHintTargetIdRef = useRef<number | null>(null);

  // Physics Refs
  const engineRef = useRef<Matter.Engine | null>(null);
  const bodiesRef = useRef<{ [key: number]: Matter.Body }>({});
  const wallsRef = useRef<Matter.Body[]>([]);
  const shapeRefs = useRef<(HTMLImageElement | null)[]>([]);
  const hasSpawnedRef = useRef(false);
  const collectedIdsRef = useRef<Set<number>>(new Set());

  // Collection
  const { addCollectedElement, isElementCollected } = useReadingMemories();

  // Prepare particles data
  const particles = useMemo(() => {
    return fallingElements.map((src, i) => ({
      id: i,
      src,
    }));
  }, [fallingElements]);

  useEffect(() => {
    if (particles.length === 0) return;

    try {
      hasSeenFallingHintRef.current =
        localStorage.getItem(FALLING_HINT_STORAGE_KEY) === "1";
    } catch {
      hasSeenFallingHintRef.current = true;
    }
  }, [particles.length]);

  useEffect(() => {
    showFallingHintRef.current = showFallingHint;
  }, [showFallingHint]);

  const markFallingHintSeen = useCallback(() => {
    hasSeenFallingHintRef.current = true;
    try {
      localStorage.setItem(FALLING_HINT_STORAGE_KEY, "1");
    } catch {
      // noop
    }
  }, []);

  const dismissFallingHint = useCallback(() => {
    setShowFallingHint(false);
    fallingHintTargetIdRef.current = null;
    markFallingHintSeen();
  }, [markFallingHintSeen]);

  const maybeShowFallingHint = useCallback(() => {
    if (hasSeenFallingHintRef.current) return;

    const firstTarget = particles.find((p) => !collectedIdsRef.current.has(p.id));
    if (!firstTarget) return;

    fallingHintTargetIdRef.current = firstTarget.id;
    setShowFallingHint(true);
  }, [particles]);

  const updateFallingHintPosition = useCallback(() => {
    if (!showFallingHintRef.current) return;

    const container = containerRef.current;
    const hint = fallingHintRef.current;
    if (!container || !hint) return;

    let targetId = fallingHintTargetIdRef.current;
    if (targetId == null || !bodiesRef.current[targetId]) {
      const fallbackId = Object.keys(bodiesRef.current)
        .map((id) => Number(id))
        .find((id) => !collectedIdsRef.current.has(id));
      if (fallbackId == null) return;
      fallingHintTargetIdRef.current = fallbackId;
      targetId = fallbackId;
    }

    const targetBody = bodiesRef.current[targetId];
    if (!targetBody) return;

    // @ts-ignore
    const size = targetBody.plugin?.originalSize || 100;
    const safePadding = 12;
    const gap = 10;
    const hintWidth = hint.offsetWidth || 220;
    const hintHeight = hint.offsetHeight || 110;
    const targetX = targetBody.position.x;
    const targetY = targetBody.position.y - size * 0.45;

    let left = targetX + size * 0.5 + gap;
    if (left + hintWidth > container.offsetWidth - safePadding) {
      left = targetX - size * 0.5 - hintWidth - gap;
    }
    left = Math.min(
      Math.max(safePadding, left),
      container.offsetWidth - hintWidth - safePadding
    );

    let top = targetY - hintHeight * 0.5;
    top = Math.min(
      Math.max(safePadding, top),
      container.offsetHeight - hintHeight - safePadding
    );

    hint.style.transform = `translate(${left}px, ${top}px)`;
  }, []);

  // Initialize collected state (no React state, use ref)
  useEffect(() => {
    particles.forEach((p) => {
      if (isElementCollected(p.src)) {
        collectedIdsRef.current.add(p.id);
      }
    });
  }, [particles, isElementCollected]);

  // Handle hover - shake + glow effect
  const handleMouseEnter = useCallback((id: number) => {
    const el = shapeRefs.current[id];
    if (!el || collectedIdsRef.current.has(id)) return;

    // Shake animation + glow
    gsap.to(el, {
      rotation: "+=15",
      duration: 0.1,
      ease: "power1.inOut",
      yoyo: true,
      repeat: 3,
    });
    gsap.to(el, {
      filter: 'drop-shadow(0 0 16px rgba(255,255,255,0.4))',
      duration: 0.2,
    });
  }, []);

  // Handle hover leave
  const handleMouseLeave = useCallback((id: number) => {
    const el = shapeRefs.current[id];
    if (!el || collectedIdsRef.current.has(id)) return;

    gsap.to(el, {
      filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.15))',
      duration: 0.3,
    });
  }, []);

  // Handle element collection
  const handleCollectElement = useCallback((id: number, src: string) => {
    if (collectedIdsRef.current.has(id) || isElementCollected(src)) return;

    addCollectedElement({
      src,
      chapterId: chapterId || '',
    });

    collectedIdsRef.current.add(id);

    const el = shapeRefs.current[id];
    const body = bodiesRef.current[id];
    const container = containerRef.current;

    if (el && body && container) {
      // Remove physics body so we control the animation
      if (engineRef.current) {
        Matter.World.remove(engineRef.current.world, body);
        delete bodiesRef.current[id];
      }

      const containerHeight = container.offsetHeight;
      const currentY = body.position.y;

      // Animation: bounce up, then fall down and exit screen
      const tl = gsap.timeline({
        onComplete: () => {
          el.style.display = 'none';
          el.style.pointerEvents = 'none';
        }
      });

      // 1. Quick scale pulse (feedback)
      tl.to(el, {
        scale: 1.3,
        duration: 0.15,
        ease: "power2.out",
      });

      // 2. Bounce up
      tl.to(el, {
        y: currentY - 200,
        rotation: "+=360",
        scale: 1,
        duration: 0.4,
        ease: "power2.out",
      }, "<0.1");

      // 3. Fall down and exit through bottom
      tl.to(el, {
        y: containerHeight + 200,
        rotation: "+=180",
        duration: 0.6,
        ease: "power2.in",
      });

      // 4. Fade out near the end
      tl.to(el, {
        opacity: 0,
        duration: 0.2,
      }, "-=0.2");
    }

    // Show toast
    showToast();
  }, [isElementCollected, addCollectedElement, chapterId]);

  // Toast without React state
  const showToast = useCallback(() => {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-8 right-8 z-50 px-5 py-3 bg-black/80 backdrop-blur-sm text-white text-sm rounded-full shadow-lg border border-white/10 flex items-center gap-2';
    toast.innerHTML = `
      <svg class="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      <span>\u5DF2\u6536\u96C6 \u00B7 \u5728\u5C01\u5E95\u7B49\u4F60</span>
    `;
    document.body.appendChild(toast);

    gsap.fromTo(toast,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.3 }
    );

    setTimeout(() => {
      gsap.to(toast, {
        opacity: 0,
        y: -20,
        duration: 0.3,
        onComplete: () => toast.remove()
      });
    }, 2500);
  }, []);

  // Copy link without React state
  const handleCopyLink = useCallback(() => {
    if (!chapterId || copiedRef.current) return;

    const url = `${window.location.origin}/chapters/${chapterId}`;
    navigator.clipboard.writeText(url);
    copiedRef.current = true;

    // Update share button state
    if (copyButtonRef.current) {
      copyButtonRef.current.classList.add("bg-black/15");
      if (copyLabelRef.current) copyLabelRef.current.textContent = "Copied";
    }

    setTimeout(() => {
      copiedRef.current = false;
      if (copyButtonRef.current) {
        copyButtonRef.current.classList.remove("bg-black/15");
        if (copyLabelRef.current) copyLabelRef.current.textContent = "Share";
      }
    }, 2000);
  }, [chapterId]);

  // Main GSAP animation setup
  useEffect(() => {
    const hero = heroRef.current;
    const container = containerRef.current;
    const image = imageRef.current;
    const imageFrame = imageFrameRef.current;
    const content = contentRef.current;
    const contentCard = contentCardRef.current;
    const prefaceEl = prefaceRef.current;

    if (!hero || !container || !image || !imageFrame || !content || !contentCard) return;

    // 響應式設定：手機版需要更早觸發動畫
    const isMobile = window.innerWidth < 768;

    // 手機版：前 40% 顯示內容，後 60% 縮小
    // 電腦版：前 60% 顯示內容，後 40% 縮小
    const contentEndPercent = isMobile ? "25%" : "40%";
    const shrinkStartPercent = isMobile ? "40%" : "60%";

    const ctx = gsap.context(() => {
      // The hero is min-h-[200vh] with a sticky container
      // As user scrolls through the 200vh, the sticky container stays in place

      const finalInset = isMobile
        ? "14% 6% 44% 6%"
        : "10% 18% 40% 18%";

      // Full-bleed image transitions into centered framed image.
      gsap.fromTo(
        imageFrame,
        { inset: "0% 0% 0% 0%" },
        {
          inset: finalInset,
          ease: "none",
          scrollTrigger: {
            trigger: hero,
            start: `${shrinkStartPercent} bottom`,
            end: "bottom bottom",
            scrub: 0.5,
          },
        }
      );

      gsap.fromTo(
        image,
        { scale: 1.06, opacity: 1 },
        {
          scale: 1,
          opacity: 0.4,
          ease: "none",
          scrollTrigger: {
            trigger: hero,
            start: `${shrinkStartPercent} bottom`,
            end: "bottom bottom",
            scrub: 0.5,
          },
        }
      );

      // Content fade in - fade in earlier on mobile
      gsap.fromTo(content,
        { opacity: 0 },
        {
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: hero,
            start: "top bottom",
            end: `${contentEndPercent} bottom`,
            scrub: 0.5,
          }
        }
      );

      gsap.fromTo(
        contentCard,
        { y: 56 },
        {
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: hero,
            start: `${shrinkStartPercent} bottom`,
            end: "bottom bottom",
            scrub: 0.5,
          },
        }
      );

      // Keep white + difference during full-bleed stage, then end as black text on normal blend.
      contentCard.style.setProperty("--hero-text-rgb", "255 255 255");
      contentCard.style.mixBlendMode = "difference";

      ScrollTrigger.create({
        trigger: hero,
        start: `${shrinkStartPercent} bottom`,
        end: "bottom bottom",
        scrub: 0.5,
        onUpdate: (self) => {
          const t = Math.min(Math.max((self.progress - 0.68) / 0.32, 0), 1);
          const channel = Math.round(255 * (1 - t));
          contentCard.style.setProperty("--hero-text-rgb", `${channel} ${channel} ${channel}`);
          contentCard.style.mixBlendMode = t > 0.92 ? "normal" : "difference";
        },
      });

      // Preface fade in - fade in when shrinking starts
      if (prefaceEl) {
        gsap.fromTo(prefaceEl,
          { opacity: 0 },
          {
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: hero,
              start: `${shrinkStartPercent} bottom`,
              end: "bottom bottom",
              scrub: 0.5,
            }
          }
        );
      }

      // Trigger falling elements when shrinking begins
      ScrollTrigger.create({
        trigger: hero,
        start: `${shrinkStartPercent} bottom`,
        onEnter: () => {
          if (!hasSpawnedRef.current && engineRef.current && container) {
            hasSpawnedRef.current = true;
            spawnParticles();
          }
        }
      });
    }, hero);

    // 處理視窗大小變化
    const handleResize = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      ctx.revert();
    };
  }, []);

  // Spawn particles function
  const spawnParticles = useCallback(() => {
    const container = containerRef.current;
    const engine = engineRef.current;
    if (!container || !engine) return;

    maybeShowFallingHint();

    const containerWidth = container.offsetWidth;

    particles.forEach((p, i) => {
      // Skip if already collected
      if (collectedIdsRef.current.has(p.id)) return;

      setTimeout(() => {
        if (!engineRef.current) return;

        const size = 80 + Math.random() * 80;
        const spawnX = containerWidth * 0.4 + Math.random() * containerWidth * 0.5;
        const spawnY = -150 - Math.random() * 200;

        const body = Matter.Bodies.circle(spawnX, spawnY, size * 0.4, {
          restitution: 0.5,
          friction: 0.2,
          frictionAir: 0.01,
          density: 0.001,
          angle: Math.random() * Math.PI * 2,
          plugin: { originalSize: size }
        });

        Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.1);
        Matter.World.add(engineRef.current!.world, body);
        bodiesRef.current[p.id] = body;
      }, i * 150);
    });
  }, [particles, maybeShowFallingHint]);

  // Initialize Physics Engine
  useEffect(() => {
    if (particles.length === 0) return;

    const engine = Matter.Engine.create();
    engineRef.current = engine;
    const world = engine.world;
    engine.gravity.y = 0.8;

    // Setup Boundaries
    const updateBoundaries = () => {
      if (!containerRef.current) return;

      if (wallsRef.current.length > 0) {
        Matter.World.remove(world, wallsRef.current);
      }

      const width = containerRef.current.offsetWidth;
      const height = containerRef.current.offsetHeight;
      const wallThickness = 1000;

      const floor = Matter.Bodies.rectangle(
        width / 2,
        height + wallThickness / 2 - 200,
        width * 2,
        wallThickness,
        { isStatic: true }
      );

      const leftWall = Matter.Bodies.rectangle(
        -wallThickness / 2,
        height / 2,
        wallThickness,
        height * 2,
        { isStatic: true }
      );

      const rightWall = Matter.Bodies.rectangle(
        width + wallThickness / 2,
        height / 2,
        wallThickness,
        height * 2,
        { isStatic: true }
      );

      wallsRef.current = [floor, leftWall, rightWall];
      Matter.World.add(world, wallsRef.current);
    };

    updateBoundaries();
    window.addEventListener("resize", updateBoundaries);

    // Render Loop - using GSAP ticker
    const ticker = gsap.ticker.add(() => {
      if (!engineRef.current) return;

      Matter.Engine.update(engineRef.current, 1000 / 60);

      // Sync DOM elements
      Object.keys(bodiesRef.current).forEach((key) => {
        const index = parseInt(key);
        const body = bodiesRef.current[index];
        const el = shapeRefs.current[index];

        if (el && body) {
          // @ts-ignore
          const size = body.plugin?.originalSize || 100;
          const x = body.position.x;
          const y = body.position.y;
          const angle = body.angle;

          el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${angle}rad) translate(-50%, -50%)`;
          el.style.width = `${size}px`;
          el.style.height = `${size}px`;
          el.style.opacity = '1';
        }
      });

      updateFallingHintPosition();
    });

    return () => {
      window.removeEventListener("resize", updateBoundaries);
      gsap.ticker.remove(ticker);
      Matter.World.clear(world, false);
      Matter.Engine.clear(engine);
    };
  }, [particles.length, updateFallingHintPosition]);

  const useSceneIframe = heroVariant === 'scene-html' && Boolean(heroSceneHtml);

  return (
    <div ref={heroRef} className="relative w-full min-h-[200vh] bg-white">
      {/* Sticky Container */}
      <div
        ref={containerRef}
        className="sticky top-0 h-screen w-full flex flex-col items-center justify-center bg-white overflow-hidden"
      >
        {showFallingHint && (
          <div
            ref={fallingHintRef}
            className="pointer-events-auto absolute left-0 top-0 z-40 w-[min(72vw,220px)] rounded-xl border border-white/25 bg-black/70 px-3 py-2 text-white shadow-xl backdrop-blur-sm"
            style={{ transform: 'translate(-9999px, -9999px)' }}
          >
            <p className="text-[10px] tracking-[0.18em] uppercase text-white/70">
              互動提示
            </p>
            <p className="mt-1.5 text-[11px] leading-relaxed md:text-xs">
              看到掉落的圖片了嗎？點擊它就能收藏，你收集的元素會出現在最後的封底頁面。
            </p>
            <button
              type="button"
              onClick={dismissFallingHint}
              className="mt-2 inline-flex min-h-[40px] items-center rounded-full border border-white/30 px-3 py-1 text-[10px] tracking-wide text-white/90 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/80"
            >
              知道了
            </button>
          </div>
        )}

        {/* Falling Elements Layer */}
        <div className="absolute inset-0 z-30 pointer-events-none">
          {particles.map((p) => (
            <img
              key={p.id}
              ref={(el) => (shapeRefs.current[p.id] = el)}
              src={p.src}
              alt=""
              onClick={() => handleCollectElement(p.id, p.src)}
              onMouseEnter={() => handleMouseEnter(p.id)}
              onMouseLeave={() => handleMouseLeave(p.id)}
              className="absolute opacity-0 object-contain cursor-pointer will-change-transform pointer-events-auto hover:brightness-125 hover:scale-110 transition-all duration-200"
              style={{ top: 0, left: 0, filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.15))' }}
            />
          ))}
        </div>

        {/* Shrinking Image */}
        <div
          ref={imageRef}
          className="absolute inset-0 will-change-transform z-10"
        >
          <div ref={imageFrameRef} className="absolute inset-0 overflow-hidden">
            {useSceneIframe ? (
              <iframe
                src={heroSceneHtml}
                title={`${title} chapter hero scene`}
                className="absolute inset-0 h-full w-full border-0 pointer-events-none"
              />
            ) : (
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${coverImage})` }}
              />
            )}
            {!useSceneIframe && <div className="absolute inset-0 bg-black/10" />}
          </div>
        </div>

        {/* Content Overlay */}
        <div
          ref={contentRef}
          className="absolute inset-0 z-20 flex items-end justify-center px-8 pb-10 md:px-16 md:pb-14 lg:px-24 lg:pb-20 will-change-opacity opacity-0 pointer-events-none"
        >
          <div
            ref={contentCardRef}
            className="pointer-events-auto w-full max-w-[760px]"
            style={{ color: "rgb(var(--hero-text-rgb, 255 255 255))", mixBlendMode: "difference" }}
          >
            <div className="text-center">
              {date && (
                <AnimatedContent
                  distance={30}
                  direction="vertical"
                  reverse={false}
                  duration={0.8}
                  delay={0.4}
                >
                  <div className="text-xl md:text-2xl font-light tracking-widest">
                    {date}
                  </div>
                </AnimatedContent>
              )}

              <SplitText
                text={title}
                className={cn(
                  "mt-6 text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold",
                  "tracking-[-0.04em] leading-[0.95]"
                )}
                delay={80}
                duration={0.6}
                ease="power3.out"
                splitType="chars"
                from={{ opacity: 0, y: 32 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0.1}
                rootMargin="-100px"
                textAlign="center"
                tag="h1"
              />

              {subtitle && (
                <AnimatedContent
                  distance={36}
                  direction="vertical"
                  reverse={false}
                  duration={1.0}
                  ease="power3.out"
                  initialOpacity={0}
                  animateOpacity={true}
                  scale={0.98}
                  threshold={0.1}
                  delay={0.18}
                >
                  <p className={cn(
                    "mx-auto mt-5 max-w-[680px] text-sm md:text-base lg:text-lg",
                    "font-light tracking-[-0.02em] leading-relaxed"
                  )}>
                    {subtitle}
                  </p>
                </AnimatedContent>
              )}
            </div>

            <div
              className="mt-8 border-t pt-5 md:mt-10 md:pt-6"
              style={{ borderColor: "currentColor" }}
            >
              <div className="flex items-end justify-between gap-6">
                <div className="space-y-1 text-sm md:text-base">
                  {credits && credits.length > 0 ? (
                    credits.map((credit, idx) => (
                      <div key={idx} className="flex flex-col md:flex-row gap-1 md:gap-2">
                        <span className="font-bold">{credit.name}</span>
                        <span className="hidden md:inline" style={{ opacity: 0.7 }}>/</span>
                        <span className="font-light" style={{ opacity: 0.85 }}>{credit.role}</span>
                      </div>
                    ))
                  ) : (
                    <>
                      {authors && authors.length > 0 && (
                        <div className="flex flex-col md:flex-row gap-1 md:gap-2">
                          <span className="font-bold">{authors.join(" / ")}</span>
                          <span className="hidden md:inline" style={{ opacity: 0.7 }}>/</span>
                          <span className="font-light" style={{ opacity: 0.85 }}>作者</span>
                        </div>
                      )}
                      <div className="flex flex-col md:flex-row gap-1 md:gap-2">
                        <span className="font-bold">{category}</span>
                        <span className="hidden md:inline" style={{ opacity: 0.7 }}>/</span>
                        <span className="font-light" style={{ opacity: 0.85 }}>章節 {chapterNumber}</span>
                      </div>
                    </>
                  )}
                </div>

                {chapterId && (
                  <button
                    ref={copyButtonRef}
                    onClick={handleCopyLink}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-full px-3 py-2 text-sm transition-colors hover:bg-black/10 md:text-base"
                    title="複製章節連結"
                    aria-label="複製章節連結"
                  >
                    <Link size={18} />
                    <span ref={copyLabelRef}>Share</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preface Section */}
      {preface && (
        <div className="relative bg-white">
          <div
            ref={prefaceRef}
            className="px-8 md:px-16 lg:px-32 py-16 md:py-24 opacity-0"
          >
            <div className="max-w-4xl">
              <AnimatedContent
                distance={40}
                direction="vertical"
                duration={1.0}
                threshold={0.2}
              >
                <p className="text-base md:text-lg lg:text-xl leading-relaxed text-gray-800 font-light">
                  {preface}
                </p>
              </AnimatedContent>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
