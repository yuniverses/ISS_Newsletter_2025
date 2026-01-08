import { Chapter } from "@/types";
import { cn } from "@/utils/cn";
import ChapterHero from "./ChapterHero";

interface ChapterSectionProps {
  chapter: Chapter;
  content?: string;
  isActive: boolean;
}

export default function ChapterSection({
  chapter,
  content,
  isActive,
}: ChapterSectionProps) {
  const chapterNumber = String(chapter.order).padStart(2, "0");

  return (
    <section
      id={chapter.id}
      data-chapter-id={chapter.id}
      className={cn(
        "w-full transition-opacity duration-300",
        isActive ? "opacity-100" : "opacity-80"
      )}
    >
      {/* Hero Section with scroll animation */}
      <ChapterHero
        chapterNumber={chapterNumber}
        title={chapter.title}
        subtitle={chapter.description}
        authors={chapter.authors}
        category={chapter.category || chapter.tag}
        preface={chapter.preface}
        coverImage={chapter.coverImage}
        chapterId={chapter.id}
        date={chapter.date}
        credits={chapter.credits}
        fallingElements={chapter.fallingElements}
      />

      {/* Chapter Content */}
      <div className="bg-white px-8 md:px-16 lg:px-32 mb-72 max-w-6xl mx-auto">
        {/* Chapter Meta Info */}
        <div className="mb-16 max-w-4xl">
          {/* Chapter Description */}
          {/* {chapter.description && (
            <p className="text-lg text-gray-600 mb-6">{chapter.description}</p>
          )} */}
        </div>

        {/* Article Content */}
        {content ? (
          <article
            className={cn(
              "prose prose-lg mx-auto",
              "prose-headings:font-light prose-headings:mt-12 prose-headings:mb-6",
              "prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6",
              "prose-img:rounded-lg prose-img:shadow-lg prose-img:my-8",
              "prose-ul:my-6 prose-ol:my-6",
              "prose-li:my-2"
            )}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <article
            className={cn(
              "prose prose-lg mx-auto",
              "prose-headings:font-light prose-headings:mt-12 prose-headings:mb-6",
              "prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6",
              "prose-img:rounded-lg prose-img:shadow-lg prose-img:my-8",
              "prose-ul:my-6 prose-ol:my-6",
              "prose-li:my-2"
            )}
          >
            <div className="flex items-center justify-center py-24">
              <div className="text-gray-400">載入中...</div>
            </div>
          </article>
        )}
      </div>
    </section>
  );
}
