interface TitleSectionProps {
  title: string
  subtitle?: string
  number?: string
}

export default function TitleSection({ title, subtitle, number }: TitleSectionProps) {
  return (
    <div className="w-full px-8 md:px-16 lg:px-32 py-16">
      <div className="flex items-start gap-8">
        {number && (
          <div className="text-7xl md:text-8xl font-light text-gray-200 flex-shrink-0">
            {number}
          </div>
        )}
        <div className="flex-1">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light mb-4 leading-tight max-w-3xl">
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
