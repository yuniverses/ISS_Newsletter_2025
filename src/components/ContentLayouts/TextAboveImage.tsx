import { ReactNode } from 'react'

interface TextAboveImageProps {
  children: ReactNode
  imageSrc: string
  imageAlt?: string
  imageCaption?: string
  aspectRatio?: 'video' | 'square' | 'portrait'
}

export default function TextAboveImage({
  children,
  imageSrc,
  imageAlt = '',
  imageCaption,
  aspectRatio = 'video'
}: TextAboveImageProps) {
  const aspectClasses = {
    video: 'aspect-[16/9]',
    square: 'aspect-square',
    portrait: 'aspect-[4/5]'
  }

  return (
    <div className="w-full px-8 md:px-16 lg:px-32 py-12">
      {/* Text content */}
      <div className="max-w-3xl mb-12">
        <div className="prose prose-lg max-w-none prose-headings:font-light prose-p:text-gray-700 prose-p:leading-relaxed">
          {children}
        </div>
      </div>

      {/* Image below */}
      <div className="max-w-5xl">
        <div className={`relative w-full ${aspectClasses[aspectRatio]} overflow-hidden bg-gray-100`}>
          <img
            src={imageSrc}
            alt={imageAlt}
            className="w-full h-full object-cover"
          />
        </div>
        {imageCaption && (
          <p className="text-sm text-gray-500 mt-3">
            {imageCaption}
          </p>
        )}
      </div>
    </div>
  )
}
