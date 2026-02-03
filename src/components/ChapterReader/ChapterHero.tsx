import { useEffect, useRef, useMemo, useCallback } from "react";
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
}: ChapterHeroProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const prefaceRef = useRef<HTMLDivElement>(null);
  const copiedRef = useRef(false);
  const copyButtonRef = useRef<HTMLButtonElement>(null);

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

  // Initialize collected state (no React state, use ref)
  useEffect(() => {
    particles.forEach((p) => {
      if (isElementCollected(p.src)) {
        collectedIdsRef.current.add(p.id);
      }
    });
  }, [particles, isElementCollected]);

  // Handle element collection
  const handleCollectElement = useCallback((id: number, src: string) => {
    if (collectedIdsRef.current.has(id) || isElementCollected(src)) return;

    addCollectedElement({
      src,
      chapterId: chapterId || '',
    });

    collectedIdsRef.current.add(id);

    // Animate element out
    const el = shapeRefs.current[id];
    if (el) {
      gsap.to(el, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          el.style.pointerEvents = 'none';
        }
      });
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
      <span>已收集</span>
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
    }, 1500);
  }, []);

  // Copy link without React state
  const handleCopyLink = useCallback(() => {
    if (!chapterId || copiedRef.current) return;

    const url = `${window.location.origin}/chapters/${chapterId}`;
    navigator.clipboard.writeText(url);
    copiedRef.current = true;

    // Update button icon
    if (copyButtonRef.current) {
      copyButtonRef.current.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      copyButtonRef.current.classList.add('text-white', 'bg-white/20');
    }

    setTimeout(() => {
      copiedRef.current = false;
      if (copyButtonRef.current) {
        copyButtonRef.current.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`;
        copyButtonRef.current.classList.remove('text-white', 'bg-white/20');
      }
    }, 2000);
  }, [chapterId]);

  // Main GSAP animation setup
  useEffect(() => {
    const hero = heroRef.current;
    const container = containerRef.current;
    const image = imageRef.current;
    const content = contentRef.current;
    const prefaceEl = prefaceRef.current;

    if (!hero || !container || !image || !content) return;

    const ctx = gsap.context(() => {
      // The hero is min-h-[200vh] with a sticky container
      // As user scrolls through the 200vh, the sticky container stays in place
      // We want: first 60% = full screen, last 40% = shrink to 0.5

      // Image scale animation - stays full for first 60%, shrinks in last 40%
      gsap.fromTo(image,
        { scale: 1 },
        {
          scale: 0.5,
          ease: "none",
          scrollTrigger: {
            trigger: hero,
            start: "60% bottom", // Start shrinking when 60% of hero has scrolled
            end: "bottom bottom", // End when hero bottom reaches viewport bottom
            scrub: 0.5,
          }
        }
      );

      // Content fade in - fade in during first part of scroll (0-60%)
      gsap.fromTo(content,
        { opacity: 0 },
        {
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: hero,
            start: "top bottom",    // Start when hero enters viewport
            end: "40% bottom",      // Fully visible by 40%
            scrub: 0.5,
          }
        }
      );

      // Preface fade in - fade in when shrinking starts (60%-100%)
      if (prefaceEl) {
        gsap.fromTo(prefaceEl,
          { opacity: 0 },
          {
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: hero,
              start: "60% bottom",
              end: "bottom bottom",
              scrub: 0.5,
            }
          }
        );
      }

      // Trigger falling elements when shrinking begins (at 60%)
      ScrollTrigger.create({
        trigger: hero,
        start: "60% bottom",
        onEnter: () => {
          if (!hasSpawnedRef.current && engineRef.current && container) {
            hasSpawnedRef.current = true;
            spawnParticles();
          }
        }
      });
    }, hero);

    return () => ctx.revert();
  }, []);

  // Spawn particles function
  const spawnParticles = useCallback(() => {
    const container = containerRef.current;
    const engine = engineRef.current;
    if (!container || !engine) return;

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
  }, [particles]);

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
    });

    return () => {
      window.removeEventListener("resize", updateBoundaries);
      gsap.ticker.remove(ticker);
      Matter.World.clear(world, false);
      Matter.Engine.clear(engine);
    };
  }, [particles.length]);

  return (
    <div ref={heroRef} className="relative w-full min-h-[200vh] bg-white">
      {/* Sticky Container */}
      <div
        ref={containerRef}
        className="sticky top-0 h-screen w-full flex flex-col items-center justify-center bg-white overflow-hidden"
      >
        {/* Falling Elements Layer */}
        <div className="absolute inset-0 z-30 pointer-events-none">
          {particles.map((p) => (
            <img
              key={p.id}
              ref={(el) => (shapeRefs.current[p.id] = el)}
              src={p.src}
              alt=""
              onClick={() => handleCollectElement(p.id, p.src)}
              className="absolute opacity-0 object-contain cursor-pointer will-change-transform pointer-events-auto"
              style={{ top: 0, left: 0 }}
            />
          ))}
        </div>

        {/* Shrinking Image */}
        <div
          ref={imageRef}
          className="absolute inset-0 will-change-transform z-10"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${coverImage})` }}
          />
        </div>

        {/* Content Overlay */}
        <div
          ref={contentRef}
          className="absolute inset-0 px-8 md:px-16 lg:px-24 xl:px-32 py-12 md:py-16 lg:py-20 will-change-opacity flex flex-col justify-between mx-auto z-20 mix-blend-difference text-white opacity-0"
        >
          {/* Top section with title */}
          <div className="flex items-start justify-between gap-8">
            <div className="flex-1">
              <SplitText
                text={title}
                className={cn(
                  "text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold",
                  "tracking-[-0.04em] leading-[0.95] mb-4"
                )}
                delay={100}
                duration={0.6}
                ease="power3.out"
                splitType="chars"
                from={{ opacity: 0, y: 40 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0.1}
                rootMargin="-100px"
                textAlign="start"
                tag="h1"
              />
            </div>
          </div>

          {/* Subtitle */}
          {subtitle && (
            <div className="flex-1 max-w-md max-w-6xl">
              <AnimatedContent
                distance={50}
                direction="vertical"
                reverse={false}
                duration={1.0}
                ease="power3.out"
                initialOpacity={0}
                animateOpacity={true}
                scale={0.95}
                threshold={0.1}
                delay={0.2}
              >
                <p className={cn(
                  "text-sm md:text-base lg:text-lg",
                  "font-light tracking-[-0.02em] leading-relaxed"
                )}>
                  {subtitle}
                </p>
              </AnimatedContent>
            </div>
          )}

          {/* Bottom section with details */}
          <div className="flex items-end justify-between">
            <div className="space-y-4">
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

              {credits && credits.length > 0 ? (
                <AnimatedContent
                  distance={30}
                  direction="vertical"
                  reverse={false}
                  duration={0.8}
                  delay={0.5}
                >
                  <div className="space-y-1">
                    {credits.map((credit, idx) => (
                      <div key={idx} className="flex flex-col md:flex-row gap-1 md:gap-3 text-sm md:text-base">
                        <span className="font-bold">{credit.name}</span>
                        <span className="hidden md:inline text-white/60">/</span>
                        <span className="font-light text-white/80">{credit.role}</span>
                      </div>
                    ))}
                  </div>
                </AnimatedContent>
              ) : (
                <AnimatedContent
                  distance={30}
                  direction="vertical"
                  reverse={false}
                  duration={0.8}
                  delay={0.5}
                >
                  <div className="space-y-2 text-white/80">
                    {category && (
                      <div className="flex gap-3 text-xs md:text-sm">
                        <span className="font-light text-white/60">分類</span>
                        <span className="font-normal">{category}</span>
                      </div>
                    )}
                    {authors && authors.length > 0 && (
                      <div className="flex gap-3 text-xs md:text-sm">
                        <span className="font-light text-white/60">作者</span>
                        <span className="font-normal">{authors.join(" / ")}</span>
                      </div>
                    )}
                    <div className="flex gap-3 text-xs md:text-sm">
                      <span className="font-light text-white/60">期刊</span>
                      <span className="font-normal">服務聲 2026</span>
                    </div>
                    <div className="flex gap-3 text-xs md:text-sm">
                      <span className="font-light text-white/60">章節</span>
                      <span className="font-normal">{chapterNumber}</span>
                    </div>
                  </div>
                </AnimatedContent>
              )}
            </div>

            {/* Copy Link Button */}
            {chapterId && (
              <button
                ref={copyButtonRef}
                onClick={handleCopyLink}
                className="p-3 rounded-full transition-all duration-200 text-white hover:text-white/80 hover:bg-white/10 backdrop-blur-sm"
                title="複製章節連結"
                aria-label="複製章節連結"
              >
                <Link size={20} />
              </button>
            )}
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
