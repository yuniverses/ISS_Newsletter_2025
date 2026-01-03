import { useEffect, useRef, useState } from "react";
import { cn } from "@/utils/cn";
import { Link, Check } from "lucide-react";

interface ChapterHeroProps {
  chapterNumber: string;
  title: string;
  subtitle?: string;
  authors?: string[];
  category?: string;
  preface?: string;
  coverImage?: string;
  chapterId?: string;
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
}: ChapterHeroProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const rafRef = useRef<number>();
  const [copied, setCopied] = useState(false);

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

  // Calculate transform values based on scroll progress
  // Keep full screen for first 80% of scroll, then shrink from 1 to 0.5 in last 20%
  const scaleProgress = Math.max(0, (scrollProgress - 0.8) / 0.2);
  const scale = 1 - scaleProgress * 0.5;

  // Title elements fade in gradually during the full screen period
  const contentOpacity = Math.min(1, scrollProgress * 1.5);

  // Preface fades in when shrinking starts
  const prefaceOpacity = Math.max(0, (scrollProgress - 0.8) * 5);

  return (
    <div ref={heroRef} className="relative w-full min-h-[200vh] bg-white">
      {/* Image Container - shrinks from full screen */}
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-white">
        {/* Shrinking Image - using transform for GPU acceleration */}
        <div
          className="absolute inset-0 will-change-transform"
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

        {/* Content Overlay - Magazine layout */}
        <div
          className="absolute inset-0 px-8 md:px-16 lg:px-24 xl:px-32 py-12 md:py-16 lg:py-20 will-change-opacity flex flex-col justify-between mx-auto"
          style={{ opacity: contentOpacity }}
        >
          {/* Top section with title */}
          <div className="flex items-start justify-between gap-8">
            {/* Main Title - Top Left */}
            <div className="flex-1">
              <h1
                className={cn(
                  "text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold",
                  "text-gray-900 tracking-[-0.04em] leading-[0.95] mb-4"
                )}
              >
                {title}
              </h1>
            </div>
          </div>
          {/* Subtitle/Description - Top Right */}
          {subtitle && (
            <div className="flex-1 max-w-md max-w-6xl">
              <p
                className={cn(
                  "text-sm md:text-base lg:text-lg",
                  "text-gray-700 font-light tracking-[-0.02em] leading-relaxed"
                )}
              >
                {subtitle}
              </p>
            </div>
          )}

          {/* Bottom section with details */}
          <div className="flex items-end justify-between">
            {/* Project Details - Bottom Left */}
            <div className="text-gray-800 space-y-2">
              {category && (
                <div className="flex gap-3 text-xs md:text-sm">
                  <span className="font-light text-gray-500">分類</span>
                  <span className="font-normal">{category}</span>
                </div>
              )}
              {authors && authors.length > 0 && (
                <div className="flex gap-3 text-xs md:text-sm">
                  <span className="font-light text-gray-500">作者</span>
                  <span className="font-normal">{authors.join(" / ")}</span>
                </div>
              )}
              <div className="flex gap-3 text-xs md:text-sm">
                <span className="font-light text-gray-500">期刊</span>
                <span className="font-normal">服務聲 2025</span>
              </div>
              <div className="flex gap-3 text-xs md:text-sm">
                <span className="font-light text-gray-500">章節</span>
                <span className="font-normal">{chapterNumber}</span>
              </div>
            </div>

            {/* Copy Link Button - Bottom Right */}
            {chapterId && (
              <button
                onClick={handleCopyLink}
                className={cn(
                  "p-3 rounded-full transition-all duration-200",
                  "text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 backdrop-blur-sm",
                  copied && "text-gray-900 bg-gray-100/70"
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
