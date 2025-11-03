import { useEffect, useRef } from 'react'
import { cn } from '@/utils/cn'
import { ShapeBlur, ShapeBlurContainer } from '@/components/ui/shape-blur'

interface CoverProps {
  onEnter?: () => void
}

export default function Cover({ onEnter }: CoverProps) {
  const coverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!coverRef.current) return

      const rect = coverRef.current.getBoundingClientRect()
      // When cover is scrolled past, trigger onEnter
      if (rect.bottom <= 0 && onEnter) {
        onEnter()
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [onEnter])

  return (
    <div
      ref={coverRef}
      className="relative min-h-screen w-full bg-black text-white overflow-hidden flex items-center justify-center"
    >
      {/* Background geometric shapes with blur */}
      <ShapeBlurContainer>
        {/* Main trapezoid - top right */}
        <ShapeBlur
          shape="trapezoid"
          size="xl"
          blur="sm"
          color="white"
          opacity={0.95}
          animate={true}
          className="top-[20%] right-[15%] animate-float-slow"
          style={{ width: '280px', height: '180px' }}
        />

        {/* Circle shape - top right */}
        <ShapeBlur
          shape="circle"
          size="lg"
          blur="sm"
          color="white"
          opacity={0.95}
          animate={true}
          className="top-[20%] right-[8%] animate-float-slower"
        />

        {/* Decorative rectangles - left side */}
        <ShapeBlur
          shape="rectangle"
          blur="none"
          color="#374151"
          opacity={0.4}
          animate={false}
          className="top-[35%] left-[12%]"
          style={{ width: '60px', height: '200px' }}
        />
        <ShapeBlur
          shape="rectangle"
          blur="none"
          color="#4B5563"
          opacity={0.4}
          animate={false}
          className="top-[35%] left-[17%]"
          style={{ width: '60px', height: '200px' }}
        />
        <ShapeBlur
          shape="rectangle"
          blur="none"
          color="#6B7280"
          opacity={0.4}
          animate={false}
          className="top-[35%] left-[22%]"
          style={{ width: '60px', height: '200px' }}
        />
        <ShapeBlur
          shape="rectangle"
          blur="none"
          color="#9CA3AF"
          opacity={0.4}
          animate={false}
          className="top-[35%] left-[27%]"
          style={{ width: '60px', height: '200px' }}
        />

        {/* Right side decorative rectangles */}
        <ShapeBlur
          shape="rectangle"
          blur="none"
          color="#4B5563"
          opacity={0.4}
          animate={false}
          className="top-[35%] right-[18%]"
          style={{ width: '60px', height: '200px' }}
        />
        <ShapeBlur
          shape="rectangle"
          blur="none"
          color="#6B7280"
          opacity={0.4}
          animate={false}
          className="top-[35%] right-[13%]"
          style={{ width: '60px', height: '200px' }}
        />
        <ShapeBlur
          shape="rectangle"
          blur="none"
          color="#9CA3AF"
          opacity={0.4}
          animate={false}
          className="top-[35%] right-[8%]"
          style={{ width: '60px', height: '200px' }}
        />
        <ShapeBlur
          shape="rectangle"
          blur="none"
          color="#D1D5DB"
          opacity={0.4}
          animate={false}
          className="top-[35%] right-[3%]"
          style={{ width: '60px', height: '200px' }}
        />
      </ShapeBlurContainer>

      {/* Main content */}
      <div className="relative z-10 px-8 md:px-16 max-w-7xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Logo and Title */}
          <div>
            {/* Logo */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-2">
                <div className="text-6xl font-bold tracking-tighter">
                  服務聲
                </div>
              </div>
              <div className="text-sm tracking-widest text-gray-400">
                ISS Community Annual Newsletter
              </div>
            </div>

            {/* Year */}
            <div className="text-8xl md:text-9xl font-light tracking-tighter mb-8">
              2025
            </div>
          </div>

          {/* Right side - Description */}
          <div className="text-sm md:text-base leading-relaxed space-y-4 text-gray-300">
            <p>
              Since 2008, the institute has adopted unique educational practices to embed humanity into the learning environment, to involve industries into the educational context, and to generate domain relevant research outputs with theoretical methodologies.
            </p>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <div className="text-xs text-gray-400 tracking-wider">SCROLL</div>
        <div className="w-px h-12 bg-gray-400" />
      </div>
    </div>
  )
}
