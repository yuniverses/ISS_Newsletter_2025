import { CSSProperties, ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface ShapeBlurProps {
  shape?: 'circle' | 'square' | 'rectangle' | 'trapezoid'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  blur?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  color?: string
  opacity?: number
  animate?: boolean
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

const sizeMap = {
  sm: 'w-24 h-24',
  md: 'w-40 h-40',
  lg: 'w-60 h-60',
  xl: 'w-80 h-80',
}

const blurMap = {
  none: 'blur-none',
  sm: 'blur-sm',
  md: 'blur-md',
  lg: 'blur-lg',
  xl: 'blur-xl',
}

export function ShapeBlur({
  shape = 'circle',
  size = 'md',
  blur = 'md',
  color = 'white',
  opacity = 0.9,
  animate = true,
  className,
  style,
  children,
}: ShapeBlurProps) {
  const shapeStyles: Record<string, CSSProperties> = {
    circle: {
      borderRadius: '50%',
    },
    square: {
      borderRadius: '0',
    },
    rectangle: {
      borderRadius: '0',
    },
    trapezoid: {
      clipPath: 'polygon(20% 0%, 100% 0%, 80% 100%, 0% 100%)',
    },
  }

  return (
    <div
      className={cn(
        'absolute',
        sizeMap[size],
        blurMap[blur],
        animate && 'animate-float',
        className
      )}
      style={{
        backgroundColor: color,
        opacity,
        ...shapeStyles[shape],
        ...style,
      }}
    >
      {children}
    </div>
  )
}

interface ShapeBlurContainerProps {
  children?: ReactNode
  className?: string
}

export function ShapeBlurContainer({
  children,
  className,
}: ShapeBlurContainerProps) {
  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)}>
      {children}
    </div>
  )
}
