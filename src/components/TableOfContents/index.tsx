import { Chapter } from '../../types'

interface TableOfContentsProps {
  chapters: Chapter[]
  onChapterClick: (chapterId: string) => void
}

export default function TableOfContents({ chapters, onChapterClick }: TableOfContentsProps) {
  const handleChapterClick = (chapterId: string) => {
    onChapterClick(chapterId)

    // Scroll to the chapter reader section (after a small delay to allow state update)
    setTimeout(() => {
      const chapterElement = document.getElementById(chapterId)
      if (chapterElement) {
        chapterElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  return (
    <section className="min-h-screen w-full bg-white text-black px-8 md:px-16 lg:px-32 py-32 md:py-40">
      <div className="max-w-4xl mx-auto">
        {/* Section label */}
        <div className="text-sm text-gray-400 mb-12 tracking-wider">
          目錄
        </div>

        {/* Table of Contents */}
        <div className="space-y-12">
          {chapters.map((chapter, index) => (
            <button
              key={chapter.id}
              onClick={() => handleChapterClick(chapter.id)}
              className="w-full text-left group transition-opacity hover:opacity-60"
            >
              <div className="flex gap-8 items-start border-b border-gray-200 pb-8">
                {/* Chapter number */}
                <div className="text-6xl md:text-7xl font-light tracking-tighter flex-shrink-0 text-gray-300 group-hover:text-black transition-colors">
                  {String(index + 1).padStart(2, '0')}
                </div>

                {/* Chapter info */}
                <div className="flex-1 pt-4">
                  {/* Title */}
                  <h3 className="text-xl md:text-2xl font-light mb-3 leading-tight">
                    {chapter.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {chapter.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
