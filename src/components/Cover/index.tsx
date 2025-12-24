import { useEffect, useRef, useState } from 'react'
import { SemicolonLogo } from '../ui/SemicolonLogo'
import Noise from '../Noise'
import GridDistortion from '../GridDistortion'

interface CoverProps {
  onEnter?: () => void
}

// Helper function to generate polygon clip-path based on number of sides
const generatePolygonPath = (sides: number, rotation: number = 0): string => {
  if (sides < 3) sides = 3;
  if (sides > 50) return 'circle(45% at 50% 50%)'; // Becomes circle at high sides

  const points: string[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = (i * 2 * Math.PI / sides) - Math.PI / 2 + (rotation * Math.PI / 180);
    const x = 50 + 45 * Math.cos(angle);
    const y = 50 + 45 * Math.sin(angle);
    points.push(`${x}% ${y}%`);
  }
  return `polygon(${points.join(', ')})`;
};

// Helper component for smooth crossfade looping
const CrossfadeLoop = ({ src, className, style }: { src: string, className?: string, style?: React.CSSProperties }) => {
  const video1Ref = useRef<HTMLVideoElement>(null);
  const video2Ref = useRef<HTMLVideoElement>(null);
  const [activeVideo, setActiveVideo] = useState<1 | 2>(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const v1 = video1Ref.current;
    const v2 = video2Ref.current;
    if (!v1 || !v2) return;

    const TRANSITION_DURATION = 1.0; // Seconds

    const handleTimeUpdate = () => {
      const current = activeVideo === 1 ? v1 : v2;
      const next = activeVideo === 1 ? v2 : v1;

      if (!current.duration) return;

      // Start transition before end
      if (current.currentTime >= current.duration - TRANSITION_DURATION && !isTransitioning) {
        setIsTransitioning(true);
        next.currentTime = 0;
        next.play().catch(e => console.log(e));
        
        // Toggle active state to trigger fade
        setActiveVideo(prev => prev === 1 ? 2 : 1);
        
        // Reset old video after transition
        setTimeout(() => {
          setIsTransitioning(false);
          current.pause();
          current.currentTime = 0;
        }, TRANSITION_DURATION * 1000);
      }
    };

    // Attach listeners
    const onTimeUpdate1 = () => { if(activeVideo === 1) handleTimeUpdate() };
    const onTimeUpdate2 = () => { if(activeVideo === 2) handleTimeUpdate() };

    v1.addEventListener('timeupdate', onTimeUpdate1);
    v2.addEventListener('timeupdate', onTimeUpdate2);

    // Initial play
    v1.play().catch(e => console.log(e));

    return () => {
      v1.removeEventListener('timeupdate', onTimeUpdate1);
      v2.removeEventListener('timeupdate', onTimeUpdate2);
    };
  }, [activeVideo, isTransitioning]);

  return (
    <div className={className} style={style}>
      <video
        ref={video1Ref}
        src={src}
        muted
        playsInline
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-linear ${activeVideo === 1 ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
      />
      <video
        ref={video2Ref}
        src={src}
        muted
        playsInline
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-linear ${activeVideo === 2 ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
      />
    </div>
  );
};

export default function Cover({ onEnter }: CoverProps) {
  const coverRef = useRef<HTMLDivElement>(null)
  const video1Ref = useRef<HTMLDivElement>(null)
  const video2Ref = useRef<HTMLDivElement>(null)
  const [clipPath1, setClipPath1] = useState('polygon(0 0, 100% 0, 100% 100%, 0 100%)')
  const [clipPath2, setClipPath2] = useState('polygon(0 0, 100% 0, 100% 100%, 0 100%)')

  useEffect(() => {
    const handleScroll = () => {
      if (!coverRef.current) return
      const rect = coverRef.current.getBoundingClientRect()
      // Trigger when the top of the *next* section is visible
      if (rect.top <= 0 && onEnter) {
        onEnter()
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [onEnter])

  // Handle mouse movement for dynamic shape morphing
  const handleMouseMove1 = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width // 0 to 1
    const y = (e.clientY - rect.top) / rect.height // 0 to 1

    // Calculate distance from center
    const centerX = 0.5, centerY = 0.5
    const distanceFromCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2))

    // Map distance to number of sides (3 to 20, then circle)
    // Close to center = more sides (smoother, closer to circle)
    // Far from center = fewer sides (sharper polygon)
    const sides = Math.round(3 + (1 - distanceFromCenter * 2) * 17)

    // Calculate rotation based on mouse angle from center
    const angle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI)

    const newClipPath = generatePolygonPath(Math.max(3, Math.min(50, sides)), angle)
    setClipPath1(newClipPath)
  }

  const handleMouseMove2 = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height

    // Different logic for second video: use quadrants
    let sides = 4
    if (x < 0.5 && y < 0.5) sides = 3  // Top-left: Triangle
    else if (x >= 0.5 && y < 0.5) sides = 6  // Top-right: Hexagon
    else if (x < 0.5 && y >= 0.5) sides = 8  // Bottom-left: Octagon
    else sides = 12  // Bottom-right: Dodecagon

    const angle = (x * 360) // Rotate based on horizontal position
    const newClipPath = generatePolygonPath(sides, angle)
    setClipPath2(newClipPath)
  }

  const handleMouseLeave1 = () => {
    setClipPath1('polygon(0 0, 100% 0, 100% 100%, 0 100%)')
  }

  const handleMouseLeave2 = () => {
    setClipPath2('polygon(0 0, 100% 0, 100% 100%, 0 100%)')
  }

  const backgroundText = `In grammar, a semicolon connects two related but independently standing ideas. Similarly, at Semicolon Design, the semicolon symbolizes the bridge connecting visual art and storytelling. We believe that design is more than just creating aesthetic visuals - it is about conveying a profound story or message. `
  const repeatedText = Array(6).fill(backgroundText).join('')

  return (
    <div ref={coverRef} className="relative w-full h-screen bg-black text-white overflow-hidden font-sans">
      
      {/* Background Video Layer with Blur and Noise */}
      <div className="absolute inset-0 z-0 overflow-hidden opacity-60 bg-gray-900 flex flex-col md:flex-row pointer-events-auto">
          {/* Top/Left Video - Dynamic polygon based on distance from center */}
          <div
            ref={video1Ref}
            className="relative w-full h-1/2 md:w-1/2 md:h-full overflow-hidden pointer-events-auto cursor-crosshair"
            onMouseMove={handleMouseMove1}
            onMouseLeave={handleMouseLeave1}
          >
            <div
              className="absolute inset-0 transition-all duration-300 ease-out"
              style={{
                transform: 'scale(1.1)',
                clipPath: clipPath1
              }}
            >
              <CrossfadeLoop
                src="dist/assets/vul.mp4"
                className="relative w-full h-full overflow-hidden"
                style={{ filter: 'blur(8px)' }}
              />
            </div>
          </div>
          {/* Bottom/Right Video - Quadrant-based shapes */}
          <div
            ref={video2Ref}
            className="relative w-full h-1/2 md:w-1/2 md:h-full overflow-hidden pointer-events-auto cursor-crosshair"
            onMouseMove={handleMouseMove2}
            onMouseLeave={handleMouseLeave2}
          >
            <div
              className="absolute inset-0 transition-all duration-300 ease-out"
              style={{
                transform: 'scale(1.1) scaleY(-1)',
                clipPath: clipPath2
              }}
            >
              <CrossfadeLoop
                src="dist/assets/vul.mp4"
                className="relative w-full h-full overflow-hidden"
                style={{ filter: 'blur(8px)' }}
              />
            </div>
          </div>

          {/* Animated Noise Overlay - Applied after blur and crop */}
          <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-20 z-10">
            <Noise
              patternSize={250}
              patternAlpha={25}
              patternRefreshInterval={3}
            />
          </div>
      </div>

      {/* Content Layer - pointer-events-none on container, auto on children */}
      <div className="relative z-10 h-full w-full flex flex-col box-border pointer-events-none">
        <div className="pointer-events-auto contents">

          {/* Top Left: Logo & Subtitle */}
          <div className="absolute top-[8vh] left-[6vw] flex flex-col gap-2 z-20">
              <img src="/assets/title.svg" alt="服務聲" className="h-10 md:h-14 w-auto brightness-0 invert" />
              <span className="text-white/80 text-[10px] md:text-[13px] tracking-[0.1em] font-light ml-1">
                  ISS Community Annual Newsletter
              </span>
          </div>
          
          {/* Main Content Area */}
          <div className="absolute top-[50%] -translate-y-[50%] left-0 w-full px-[8vw]">
              
              {/* Mobile Layout (Stacked) */}
              <div className="flex flex-col items-center gap-8 md:hidden">
                  <div className="text-4xl font-bold tracking-widest">
                      2025
                  </div>
                  <SemicolonLogo className="h-[80px] w-auto drop-shadow-2xl" />
                  <div className="flex flex-col items-center gap-1">
                      <span className="text-xl font-light tracking-widest">分號</span>
                      <span className="text-sm tracking-widest opacity-80 uppercase">semicolon</span>
                  </div>
              </div>

              {/* Desktop Layout (Horizontal Band) */}
              <div className="hidden md:flex items-start justify-between w-full">
                  {/* Left: Year */}
                  <div className="text-[32px] font-bold tracking-widest leading-none pt-2">
                      2025
                  </div>

                  {/* Center: Icon */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-0">
                      <SemicolonLogo className="h-[100px] w-auto drop-shadow-2xl" />
                  </div>

                  {/* Right Side Group */}
                  <div className="flex items-start gap-12 ml-auto">
                       {/* Vertical Text */}
                       <div className="h-[200px] w-auto">
                            <p className="text-white/90 text-[13px] tracking-widest [writing-mode:vertical-rl] h-full text-justify leading-relaxed">
                                Since 2008, the institute has adopted unique educational practices to embed humanity into the learning environment...
                            </p>
                       </div>
                       {/* Labels */}
                       <div className="flex items-baseline gap-4 pt-2">
                           <span className="text-[24px] font-light tracking-widest">分號</span>
                           <span className="text-[24px] font-light tracking-widest opacity-80">semicolon</span>
                       </div>
                  </div>
              </div>
          </div>
          
          {/* Bottom Text Block */}
          <div className="absolute bottom-[5vh] left-0 w-full px-[8vw] z-0">
             <p className="text-[10px] md:text-[12px] text-justify leading-[1.6] text-gray-400 opacity-80 mix-blend-color-dodge select-none line-clamp-4 md:line-clamp-none">
                 {repeatedText}
             </p>
          </div>
          
          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce opacity-70 z-20">
            <div className="text-[10px] tracking-[0.2em] uppercase">Scroll</div>
            <div className="w-px h-8 bg-white" />
          </div>
        </div>
      </div>

    </div>
  )
}