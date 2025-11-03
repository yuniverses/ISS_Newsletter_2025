interface FullWidthImageProps {
  src: string
  alt?: string
  caption?: string
  aspectRatio?: 'video' | 'square' | 'portrait' | 'wide'
}

export default function FullWidthImage({
  src,
  alt = '',
  caption,
  aspectRatio = 'video'
}: FullWidthImageProps) {
  const aspectClasses = {
    video: 'aspect-[16/9]',
    square: 'aspect-square',
    portrait: 'aspect-[4/5]',
    wide: 'aspect-[21/9]'
  }

  return (
    <div className="w-full px-8 md:px-16 lg:px-32 py-12">
      <div className={`relative w-full ${aspectClasses[aspectRatio]} overflow-hidden bg-gray-100`}>
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
        />
      </div>
      {caption && (
        <p className="text-sm text-gray-500 mt-4 max-w-3xl">
          {caption}
        </p>
      )}
    </div>
  )
}
