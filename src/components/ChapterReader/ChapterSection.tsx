import { useState } from 'react'
import { Chapter } from '@/types'
import { cn } from '@/utils/cn'
import { Link, Check } from 'lucide-react'

interface ChapterSectionProps {
  chapter: Chapter
  content?: string
  isActive: boolean
}

export default function ChapterSection({
  chapter,
  content,
  isActive,
}: ChapterSectionProps) {
  const chapterNumber = String(chapter.order).padStart(2, '0')
  const [copied, setCopied] = useState(false)

  const handleCopyLink = () => {
    const url = `${window.location.origin}/chapters/${chapter.id}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section
      id={chapter.id}
      data-chapter-id={chapter.id}
      className={cn(
        'min-h-screen w-full transition-opacity duration-300',
        'px-8 md:px-16 lg:px-32 py-24',
        isActive ? 'opacity-100' : 'opacity-80'
      )}
    >
      {/* Chapter Header */}
      <header className="mb-16">
        <div className="flex items-start justify-between mb-8">
          {/* Chapter Number - Large Display */}
          <div className="text-8xl md:text-9xl font-light tracking-tighter">
            {chapterNumber}
          </div>
        </div>

        {/* Chapter Title with Link Button */}
        <div className="flex items-center gap-4 mb-4 max-w-3xl group">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-light">
            {chapter.title}
          </h1>
          <button
            onClick={handleCopyLink}
            className={cn(
              "p-2 rounded-full transition-all duration-200",
              "text-gray-400 hover:text-black hover:bg-gray-100",
              "opacity-0 group-hover:opacity-100 focus:opacity-100", // Show on hover/focus
              copied && "opacity-100 text-green-600 hover:text-green-700 bg-green-50"
            )}
            title="複製章節連結"
            aria-label="複製章節連結"
          >
            {copied ? <Check size={20} /> : <Link size={20} />}
          </button>
        </div>

        {/* Chapter Description */}
        {chapter.description && (
          <p className="text-lg text-gray-600 max-w-2xl mb-6">
            {chapter.description}
          </p>
        )}

        {/* Authors */}
        {chapter.authors && chapter.authors.length > 0 && (
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            {chapter.authors.map((author, index) => (
              <span key={index}>{author}</span>
            ))}
          </div>
        )}
      </header>

      {/* Chapter Content */}
      {content ? (
        <article
          className={cn(
            'prose prose-lg max-w-none',
            'prose-headings:font-light',
            'prose-p:text-gray-700 prose-p:leading-relaxed',
            'prose-img:rounded-lg prose-img:shadow-lg'
          )}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ) : (
        <article
          className={cn(
            'prose prose-lg max-w-none',
            'prose-headings:font-light',
            'prose-p:text-gray-700 prose-p:leading-relaxed',
            'prose-img:rounded-lg prose-img:shadow-lg'
          )}
        >
          <div className="flex items-center justify-center py-24">
            <div className="text-gray-400">載入中...</div>
          </div>
        </article>
      )}
    </section>
  )
}
