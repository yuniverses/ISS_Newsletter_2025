import { ReactNode } from 'react'

interface TextImageSplitProps {
  children: ReactNode
  imageSrc?: string
  imageAlt?: string
  imagePosition?: 'left' | 'right'
  imageCaption?: string
}

export default function TextImageSplit({
  children,
  imageSrc,
  imageAlt = '',
  imagePosition = 'right',
  imageCaption
}: TextImageSplitProps) {
  return (
    <div className="w-full px-8 md:px-16 lg:px-32 py-12">
      {/* Content section */}
      {imageSrc ? (
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Text content */}
          <div className={`${imagePosition === 'right' ? 'md:order-1' : 'md:order-2'}`}>
            <div className="prose prose-lg max-w-none prose-headings:font-light prose-p:text-gray-700 prose-p:leading-relaxed">
              {children}
            </div>
          </div>

          {/* Image */}
          <div className={`${imagePosition === 'right' ? 'md:order-2' : 'md:order-1'}`}>
            <div className="relative w-full aspect-[4/5] overflow-hidden bg-gray-100">
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
      ) : (
        /* Pure text - full width */
        <div className="max-w-3xl">
          <div className="prose prose-lg max-w-none prose-headings:font-light prose-p:text-gray-700 prose-p:leading-relaxed">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}
