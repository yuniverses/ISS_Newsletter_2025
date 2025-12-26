import { Chapter } from '@/types'
import { cn } from '@/utils/cn'
import ChapterHero from './ChapterHero'

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

  return (
    <section
      id={chapter.id}
      data-chapter-id={chapter.id}
      className={cn(
        'w-full transition-opacity duration-300',
        isActive ? 'opacity-100' : 'opacity-80'
      )}
    >
      {/* Hero Section with scroll animation */}
      <ChapterHero
        chapterNumber={chapterNumber}
        title={chapter.title}
        category={chapter.category}
        preface={chapter.preface}
        coverImage={chapter.coverImage}
        chapterId={chapter.id}
      />

      {/* Chapter Content */}
      <div className="bg-white px-8 md:px-16 lg:px-32 py-16">
        {/* Chapter Meta Info */}
        <div className="mb-12 max-w-4xl">
          {/* Chapter Description */}
          {chapter.description && (
            <p className="text-lg text-gray-600 mb-6">
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
        </div>

        {/* Article Content */}
        {content ? (
          <article
            className={cn(
              'prose prose-lg max-w-4xl mx-auto',
              'prose-headings:font-light',
              'prose-p:text-gray-700 prose-p:leading-relaxed',
              'prose-img:rounded-lg prose-img:shadow-lg'
            )}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <article
            className={cn(
              'prose prose-lg max-w-4xl mx-auto',
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
      </div>
    </section>
  )
}
