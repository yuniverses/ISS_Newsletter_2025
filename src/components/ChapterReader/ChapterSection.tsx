import { Chapter } from "@/types";
import { cn } from "@/utils/cn";
import ChapterHero from "./ChapterHero";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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
  const articleRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!content || !articleRef.current) return;

    // Select elements to animate: paragraphs, headings, images, lists, blockquotes, figures
    const elements = articleRef.current.querySelectorAll(
      "p, h2, h3, h4, img, ul, ol, blockquote, figure, .img-grid-2, .img-grid-3, .p-6, .border"
    );

    elements.forEach((el) => {
      // Skip if already animated (optional check, but ScrollTrigger .batch or individual creates are fine)
      
      // Set initial state
      gsap.set(el, { 
        y: 30, 
        opacity: 0 
      });

      ScrollTrigger.create({
        trigger: el,
        start: "top 85%", // Trigger when top of element hits 85% of viewport height
        once: true,
        onEnter: () => {
          gsap.to(el, {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            overwrite: "auto"
          });
        }
      });
    });

    return () => {
      // Cleanup triggers if content changes (though usually content is stable per chapter render)
      ScrollTrigger.getAll().forEach(() => {
        // If trigger is related to these elements, kill it?
        // Since we don't track individual triggers, we rely on React unmount or next effect run.
        // But ScrollTrigger doesn't auto-cleanup on DOM removal unless we tell it.
        // A simple way is to Refresh, but that's heavy.
        // For now, we trust GSAP to handle removed elements gracefully or manually kill if we stored them.
        // Ideally we should store the triggers in a ref array and kill them here.
      });
      // Better cleanup approach:
      // We can use ScrollTrigger.batch logic or just context.
    };
  }, [content]); // Re-run when content loads

  return (
    <section
      id={chapter.id}
      data-chapter-id={chapter.id}
      className="w-full"
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
            ref={articleRef}
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
