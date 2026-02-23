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
  isActive: _isActive,
}: ChapterSectionProps) {
  const chapterNumber = String(chapter.order).padStart(2, "0");
  const articleRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!content || !articleRef.current) return;

    // Select elements to animate: paragraphs, headings, images, lists, blockquotes, figures
    const elements = Array.from(
      articleRef.current.querySelectorAll<HTMLElement>(
        "p, h2, h3, h4, img, ul, ol, blockquote, figure, .img-grid-2, .img-grid-3, .p-6, .border"
      )
    ).filter(
      (el) => !el.closest("[data-story-sync], [data-teacher-stack]")
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

  useEffect(() => {
    if (!content || !articleRef.current) return;

    const syncBlocks = Array.from(
      articleRef.current.querySelectorAll<HTMLElement>("[data-story-sync]")
    );
    if (!syncBlocks.length) return;

    const cleanups: Array<() => void> = [];

    syncBlocks.forEach((block) => {
      const frames = Array.from(
        block.querySelectorAll<HTMLElement>("[data-story-frame]")
      );
      const entries = Array.from(
        block.querySelectorAll<HTMLElement>("[data-story-entry]")
      );
      const markers = entries.map((entry) => {
        const marker = entry.querySelector<HTMLElement>("[data-story-marker]");
        return marker ?? entry;
      });
      const chips = Array.from(
        block.querySelectorAll<HTMLElement>("[data-story-goto]")
      );
      const storyLabel = block.querySelector<HTMLElement>("[data-story-label]");
      const progressBars = Array.from(
        block.querySelectorAll<HTMLElement>("[data-story-progress]")
      );
      const nextButton = block.querySelector<HTMLElement>("[data-story-next]");
      const storyTitles = entries.map((entry, index) => {
        const titleFromData = entry.getAttribute("data-story-title");
        if (titleFromData?.trim()) return titleFromData.trim();

        const markerTitle = markers[index]?.textContent?.trim();
        if (markerTitle) return markerTitle;

        return `Story ${index + 1}`;
      });

      const maxIndex = Math.min(frames.length, entries.length) - 1;
      if (maxIndex < 0) return;

      let currentIndex = 0;

      const clampIndex = (index: number) =>
        Math.max(0, Math.min(maxIndex, index));

      const setActive = (index: number, options?: { scrollTo?: boolean }) => {
        const nextIndex = clampIndex(index);
        currentIndex = nextIndex;

        frames.forEach((frame, frameIndex) => {
          frame.classList.toggle("is-active", frameIndex === nextIndex);
        });
        entries.forEach((entry, entryIndex) => {
          entry.classList.toggle("is-active", entryIndex === nextIndex);
        });
        chips.forEach((chip, chipIndex) => {
          chip.classList.toggle("is-active", chipIndex === nextIndex);
        });
        progressBars.forEach((bar, barIndex) => {
          bar.classList.toggle("is-active", barIndex <= nextIndex);
        });
        if (storyLabel) {
          storyLabel.textContent = storyTitles[nextIndex] ?? "";
        }

        if (options?.scrollTo) {
          entries[nextIndex].scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      };

      setActive(0);

      const observer = new IntersectionObserver(
        (observedEntries) => {
          const visibleEntries = observedEntries.filter(
            (entry) => entry.isIntersecting
          );
          if (!visibleEntries.length) return;

          const viewportCenter = window.innerHeight / 2;
          const targetEntry = visibleEntries.sort((a, b) => {
            const distanceA = Math.abs(a.boundingClientRect.top - viewportCenter);
            const distanceB = Math.abs(b.boundingClientRect.top - viewportCenter);
            return distanceA - distanceB;
          })[0];

          const index = markers.indexOf(targetEntry.target as HTMLElement);
          if (index !== -1 && index !== currentIndex) {
            setActive(index);
          }
        },
        {
          threshold: 0,
          rootMargin: "-45% 0px -45% 0px",
        }
      );

      markers.forEach((marker) => observer.observe(marker));
      cleanups.push(() => observer.disconnect());

      chips.forEach((chip) => {
        const onChipClick = () => {
          const targetIndex = Number(chip.getAttribute("data-story-goto"));
          if (!Number.isNaN(targetIndex)) {
            setActive(targetIndex, { scrollTo: true });
          }
        };

        chip.addEventListener("click", onChipClick);
        cleanups.push(() => chip.removeEventListener("click", onChipClick));
      });

      if (storyLabel) {
        const onStoryLabelClick = () => {
          const targetIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
          setActive(targetIndex, { scrollTo: true });
        };

        storyLabel.addEventListener("click", onStoryLabelClick);
        cleanups.push(() =>
          storyLabel.removeEventListener("click", onStoryLabelClick)
        );
      }

      if (nextButton) {
        const onNextClick = () => {
          const targetIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
          setActive(targetIndex, { scrollTo: true });
        };

        nextButton.addEventListener("click", onNextClick);
        cleanups.push(() => nextButton.removeEventListener("click", onNextClick));
      }
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [content]);

  useEffect(() => {
    if (!content || !articleRef.current) return;

    const stacks = Array.from(
      articleRef.current.querySelectorAll<HTMLElement>("[data-teacher-stack]")
    );
    if (!stacks.length) return;

    const cleanups: Array<() => void> = [];

    stacks.forEach((stack) => {
      const scrollArea = stack.querySelector<HTMLElement>("[data-teacher-scroll]");
      const windows = Array.from(
        stack.querySelectorAll<HTMLElement>("[data-teacher-window]")
      );

      if (!scrollArea || !windows.length) return;

      const closeButtons = windows.map((windowItem) =>
        windowItem.querySelector<HTMLButtonElement>("[data-teacher-close]")
      );
      const total = windows.length;
      const maxDismissed = Math.max(total - 1, 0);
      let scrollDismissed = 0;

      const clamp = (value: number, min: number, max: number) =>
        Math.min(max, Math.max(min, value));

      const syncSizing = () => {
        const viewportHeight = window.innerHeight || 800;
        const windowHeight = clamp(viewportHeight * 0.74, 480, 760);
        const scrollHeight = windowHeight + total * (windowHeight * 0.55);

        stack.style.setProperty("--teacher-window-height", `${Math.round(windowHeight)}px`);
        stack.style.setProperty("--teacher-scroll-height", `${Math.round(scrollHeight)}px`);
      };

      const renderStack = () => {
        const dismissedCount = scrollDismissed;

        windows.forEach((windowItem, index) => {
          const relative = index - dismissedCount;
          const stackDepth = clamp(relative, 0, 4);

          windowItem.classList.remove("is-top", "is-behind", "is-dismissed");
          windowItem.style.removeProperty("--stack-index");

          if (relative < 0) {
            windowItem.classList.add("is-dismissed");
            windowItem.style.zIndex = String(total - index);
            return;
          }

          if (relative === 0) {
            windowItem.classList.add("is-top");
            windowItem.style.zIndex = String(total + 4);
            return;
          }

          windowItem.classList.add("is-behind");
          windowItem.style.setProperty("--stack-index", String(stackDepth));
          windowItem.style.zIndex = String(total - stackDepth);
        });

        closeButtons.forEach((button, index) => {
          if (!button) return;
          const canClose = index === dismissedCount && dismissedCount <= maxDismissed;
          button.disabled = !canClose;
          button.tabIndex = canClose ? 0 : -1;
        });
      };

      const syncWithScroll = () => {
        const rect = scrollArea.getBoundingClientRect();
        const viewportHeight = window.innerHeight || 1;
        const travelDistance = rect.height - viewportHeight * 0.6;

        if (travelDistance <= 0) {
          scrollDismissed = 0;
          renderStack();
          return;
        }

        const progress = (-rect.top + viewportHeight * 0.16) / travelDistance;
        const nextDismissed = clamp(
          Math.floor(progress * (maxDismissed + 1 + 0.001)),
          0,
          maxDismissed
        );

        if (nextDismissed !== scrollDismissed) {
          scrollDismissed = nextDismissed;
          renderStack();
        }
      };

      const closeHandlers: Array<() => void> = [];

      closeButtons.forEach((button, index) => {
        if (!button) return;

        const handleClose = () => {
          const dismissedCount = scrollDismissed;
          if (index !== dismissedCount) return;

          const viewportHeight = window.innerHeight || 1;
          const travelDistance = scrollArea.offsetHeight - viewportHeight * 0.6;

          if (travelDistance <= 0) return;

          if (dismissedCount < maxDismissed) {
            const targetDismissed = dismissedCount + 1;
            const targetProgress = (targetDismissed + 0.02) / (maxDismissed + 1);
            const scrollAreaTop = window.scrollY + scrollArea.getBoundingClientRect().top;
            const targetRectTop = viewportHeight * 0.16 - targetProgress * travelDistance;
            const targetY = scrollAreaTop - targetRectTop;

            window.scrollTo({
              top: Math.max(0, targetY),
              behavior: "smooth",
            });
            return;
          }

          const exitY = window.scrollY + Math.max(220, viewportHeight * 0.42);
          window.scrollTo({
            top: exitY,
            behavior: "smooth",
          });
        };

        button.addEventListener("click", handleClose);
        closeHandlers.push(() => button.removeEventListener("click", handleClose));
      });

      const handleResize = () => {
        syncSizing();
        syncWithScroll();
      };

      const handleScroll = () => {
        syncWithScroll();
      };

      syncSizing();
      renderStack();
      syncWithScroll();

      window.addEventListener("resize", handleResize);
      window.addEventListener("scroll", handleScroll, { passive: true });

      cleanups.push(() => window.removeEventListener("resize", handleResize));
      cleanups.push(() => window.removeEventListener("scroll", handleScroll));
      closeHandlers.forEach((cleanup) => cleanups.push(cleanup));
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [content]);

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
        heroVariant={chapter.heroVariant}
        heroSceneHtml={chapter.heroSceneHtml}
      />

      {/* Chapter Content */}
      <div className="bg-white md:px-16 lg:px-32 mb-72 max-w-6xl mx-auto">
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
