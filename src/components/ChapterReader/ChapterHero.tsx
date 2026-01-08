import { useEffect, useRef, useState, useMemo } from "react";
import { cn } from "@/utils/cn";
import { Link, Check } from "lucide-react";
import { Credit } from "@/types";
import Matter from "matter-js";
import SplitText from "../ui/SplitText";
import { gsap } from "gsap";

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
  const containerRef = useRef<HTMLDivElement>(null); // The sticky container
  const [scrollProgress, setScrollProgress] = useState(0);
  const rafRef = useRef<number>();
  const [copied, setCopied] = useState(false);

  // Physics Refs
  const engineRef = useRef<Matter.Engine | null>(null);
  const bodiesRef = useRef<{ [key: number]: Matter.Body }>({});
  const wallsRef = useRef<Matter.Body[]>([]);
  const shapeRefs = useRef<(HTMLImageElement | null)[]>([]);
  const hasSpawnedRef = useRef(false);

  // Prepare particles data
  const particles = useMemo(() => {
    return fallingElements.map((src, i) => ({
      id: i,
      src,
    }));
  }, [fallingElements]);

  const handleCopyLink = () => {
    if (!chapterId) return;
    const url = `${window.location.origin}/chapters/${chapterId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const handleScroll = () => {
      // Cancel previous RAF if it exists
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      // Use RAF for smooth animation
      rafRef.current = requestAnimationFrame(() => {
        if (!heroRef.current) return;

        const rect = heroRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Calculate scroll progress (0 to 1)
        const scrollStart = windowHeight;
        const scrollRange = windowHeight * 1.5;
        const progress = Math.max(
          0,
          Math.min(1, (scrollStart - rect.top) / scrollRange)
        );

        setScrollProgress(progress);
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // Initialize Physics Engine
  useEffect(() => {
    if (particles.length === 0) return;

    const engine = Matter.Engine.create({
      positionIterations: 50, // Ultra precision to prevent tunneling
      velocityIterations: 50,
      constraintIterations: 10,
    });
    engineRef.current = engine;
    const world = engine.world;
    engine.gravity.y = 1;

    // Setup Boundaries
    const updateBoundaries = () => {
      if (!containerRef.current) return;

      if (wallsRef.current.length > 0) {
        Matter.World.remove(world, wallsRef.current);
      }

      const width = containerRef.current.offsetWidth;
      const height = containerRef.current.offsetHeight;
      const wallThickness = 60000; // Extremely thick walls

      const floor = Matter.Bodies.rectangle(
        width / 2,
        height + wallThickness / 2 - 200, // Floor position
        width * 2,
        wallThickness,
        { isStatic: true, label: 'Floor', friction: 0.5, restitution: 0.5 }
      );

      const leftWall = Matter.Bodies.rectangle(
        0 - wallThickness / 2,
        height / 2,
        wallThickness,
        height * 2,
        { isStatic: true, label: 'LeftWall', friction: 0.5 }
      );

      const rightWall = Matter.Bodies.rectangle(
        width + wallThickness / 2,
        height / 2,
        wallThickness,
        height * 2,
        { isStatic: true, label: 'RightWall', friction: 0.5 }
      );

      wallsRef.current = [floor, leftWall, rightWall];
      Matter.World.add(world, wallsRef.current);
    };

    updateBoundaries();
    window.addEventListener("resize", updateBoundaries);

    // Render Loop
    const ticker = gsap.ticker.add(() => {
      if (engineRef.current) {
        Matter.Engine.update(engineRef.current, 1000 / 60);
      }

      // Sync DOM elements
      Object.keys(bodiesRef.current).forEach((key) => {
        const index = parseInt(key);
        const body = bodiesRef.current[index];
        const el = shapeRefs.current[index];

        if (el && body) {
           const x = body.position.x;
           const y = body.position.y;
           const angle = body.angle;
           
           // Retrieve original size stored during creation
           // @ts-ignore
           const size = body.plugin.originalSize || 100;

           el.style.width = `${size}px`;
           el.style.height = `${size}px`;
           el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${angle}rad) translate(-50%, -50%)`;
           el.style.opacity = "1";
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

  // Trigger Falling Logic
  useEffect(() => {
    // When shrinking starts (progress > 0.8) and haven't spawned yet
    if (scrollProgress > 0.8 && !hasSpawnedRef.current && engineRef.current && containerRef.current) {
      hasSpawnedRef.current = true;
      const containerWidth = containerRef.current.offsetWidth;
      // Spawn particles
      particles.forEach((p, i) => {
        setTimeout(() => {
          if (!engineRef.current) return;
          
          // Size between 80 and 160 px (visual size)
          // Physics body size will match this
          const size = 80 + Math.random() * 80; 
          
          // Spawn more towards the right side (40% - 90% range)
          const spawnX = containerWidth * 0.4 + Math.random() * containerWidth * 0.5;
          const spawnY = -150 - Math.random() * 200; // Start above viewport

          // Use Rectangle (Square) instead of Circle to match DOM element bounding box
          const body = Matter.Bodies.rectangle(spawnX, spawnY, size, size, {
            restitution: 0.5,
            friction: 0.1,
            density: 0.002, 
            angle: Math.random() * Math.PI * 2,
            // Chamfer gives rounded corners, helping them roll slightly and look more natural
            chamfer: { radius: size * 0.1 },
            plugin: {
              originalSize: size // Store original size for rendering
            }
          });

          // Add random force/spin
          Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.1);
          
          Matter.World.add(engineRef.current.world, body);
          bodiesRef.current[p.id] = body;
        }, i * 200); // Staggered spawn
      });
    } else if (scrollProgress < 0.5 && hasSpawnedRef.current) {
      // Reset if scrolled back up significantly? 
      // Optional: Remove bodies to replay effect? 
      // For now, let's keep them on the floor to avoid jarring disappearances.
      // If we want to replay, we'd need to clear bodiesRef and remove from world.
    }
  }, [scrollProgress, particles]);


  // Calculate transform values based on scroll progress
  // Keep full screen for first 80% of scroll, then shrink from 1 to 0.5 in last 20%
  const scaleProgress = Math.max(0, (scrollProgress - 0.8) / 0.2);
  const scale = 1 - scaleProgress * 0.5;

  // Title elements fade in gradually during the full screen period
  const contentOpacity = Math.min(1, scrollProgress * 1.5);

  // Preface fades in when shrinking starts
  const prefaceOpacity = Math.max(0, (scrollProgress - 0.8) * 5);

  return (
    <div ref={heroRef} className="relative w-full min-h-[200vh] bg-white overflow-hidde">
      {/* Sticky Container */}
      <div 
        ref={containerRef}
        className="sticky top-0 h-screen w-full flex flex-col items-center justify-center bg-white overflow-hidden"
      >
        {/* Falling Elements Layer - Move to back */}
        <div className="absolute inset-0 z-0 pointer-events-none ">
          {particles.map((p) => (
             <img
              key={p.id}
              ref={(el) => (shapeRefs.current[p.id] = el)}
              src={p.src}
              alt=""
              className="absolute opacity-0 w-32 h-32 md:w-48 md:h-48 object-contain"
              style={{ top: 0, left: 0 }}
             />
          ))}
        </div>

        {/* Shrinking Image - Move to front of elements */}
        <div
          className="absolute inset-0 will-change-transform z-10"
          style={{
            transform: `scale(${scale})`,
          }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${coverImage})`,
            }}
          />
        </div>

        {/* Content Overlay - Keep at very front */}
        <div
          className="absolute inset-0 px-8 md:px-16 lg:px-24 xl:px-32 py-12 md:py-16 lg:py-20 will-change-opacity flex flex-col justify-between mx-auto z-20 mix-blend-difference text-white"
          style={{ opacity: contentOpacity }}
        >
          {/* Top section with title */}
          <div className="flex items-start justify-between gap-8">
            {/* Main Title - Top Left */}
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
          {/* Subtitle/Description - Top Right */}
          {subtitle && (
            <div className="flex-1 max-w-md max-w-6xl">
              <p
                className={cn(
                  "text-sm md:text-base lg:text-lg",
                  "font-light tracking-[-0.02em] leading-relaxed"
                )}
              >
                {subtitle}
              </p>
            </div>
          )}

          {/* Bottom section with details */}
          <div className="flex items-end justify-between">
            {/* Project Details - Bottom Left */}
            <div className="space-y-4">
               {/* Date Row */}
               {date && (
                 <div className="text-xl md:text-2xl font-light tracking-widest">
                   {date}
                 </div>
               )}
               
               {/* Credits Rows */}
               {credits && credits.length > 0 ? (
                 <div className="space-y-1">
                   {credits.map((credit, idx) => (
                     <div key={idx} className="flex flex-col md:flex-row gap-1 md:gap-3 text-sm md:text-base">
                       <span className="font-bold">{credit.name}</span>
                       <span className="hidden md:inline text-white/60">/</span>
                       <span className="font-light text-white/80">{credit.role}</span>
                     </div>
                   ))}
                 </div>
               ) : (
                 // Fallback to old format if no credits/date provided
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
                      <span className="font-normal">服務聲 2025</span>
                    </div>
                    <div className="flex gap-3 text-xs md:text-sm">
                      <span className="font-light text-white/60">章節</span>
                      <span className="font-normal">{chapterNumber}</span>
                    </div>
                 </div>
               )}
            </div>

            {/* Copy Link Button - Bottom Right */}
            {chapterId && (
              <button
                onClick={handleCopyLink}
                className={cn(
                  "p-3 rounded-full transition-all duration-200",
                  "text-white hover:text-white/80 hover:bg-white/10 backdrop-blur-sm",
                  copied && "text-white bg-white/20"
                )}
                title="複製章節連結"
                aria-label="複製章節連結"
              >
                {copied ? <Check size={20} /> : <Link size={20} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Preface Section - appears below */}
      {preface && (
        <div className="relative bg-white">
          <div
            className="px-8 md:px-16 lg:px-32 py-16 md:py-24 will-change-opacity"
            style={{ opacity: prefaceOpacity }}
          >
            <div className="max-w-4xl">
              <p className="text-base md:text-lg lg:text-xl leading-relaxed text-gray-800 font-light">
                {preface}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
