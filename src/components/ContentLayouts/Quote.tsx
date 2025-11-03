interface QuoteProps {
  text: string
  author?: string
}

export default function Quote({ text, author }: QuoteProps) {
  return (
    <div className="w-full px-8 md:px-16 lg:px-32 py-16">
      <div className="max-w-2xl">
        <blockquote className="text-2xl md:text-3xl font-light text-gray-600 leading-relaxed mb-4 border-l-2 border-gray-300 pl-6">
          {text}
        </blockquote>
        {author && (
          <p className="text-sm text-gray-500 pl-6">
            — {author}
          </p>
        )}
      </div>
    </div>
  )
}
