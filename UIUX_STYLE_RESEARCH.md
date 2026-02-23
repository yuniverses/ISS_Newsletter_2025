# ISS Newsletter UI/UX Style Research

## 1. Visual DNA (What this project feels like)

- **Core style:** editorial publication + experimental motion graphics.
- **Mood:** black/white high contrast, minimal color, cinematic transitions.
- **Narrative shape:** one long scroll journey from cover -> preface -> TOC -> chapters -> memory-based back cover.
- **Design metaphor:** semicolon (`;`) as "pause but continue", reflected in section transitions and storytelling flow.

## 2. Color & Surface Language

- **Primary palette:** neutral monochrome (`white`, `black`, `gray` tiers).
- **Accent usage:** very limited and meaningful only (example: relay highlight `#A6FF00` in back cover).
- **Surface pattern:**
  - Chapter reading area: white background for readability.
  - Transition/back cover areas: dark backgrounds for emotional contrast.
  - Frosted/translucent overlays appear only in specific interaction layers.

Key references:
- `src/styles/index.css`
- `src/components/BackCover/RelayOverview.tsx`
- `src/components/Cover/index.tsx`

## 3. Typography System

- **Reading body:** calm serif/sans mix, long-form friendly line height.
- **Display text:** oversized, compressed tracking, bold hierarchy on hero/title sections.
- **Chinese editorial tone:** lots of spacing rhythm, deliberate contrast between tiny metadata and large headlines.
- **Chapter HTMLs are self-styled:** many chapters import fonts inline (`Noto Sans TC`, `Noto Serif TC`, `Shippori Mincho`) and define local classes.

Key references:
- `src/components/ChapterReader/ChapterSection.tsx`
- `public/chapters/chapter-01.html` (story block pattern)
- `public/chapters/chapter-08.html` (interview/article pattern)

## 4. Layout Grammar

- **Flow order is fixed:**
  1. `Cover`
  2. `TableOfContents`
  3. `ProgressNav`
  4. `ChapterReader`
  5. `BackCover`
- **Chapter composition pattern:**
  - full-screen `ChapterHero` with animated overlay
  - article body (`prose`) in centered readable column
  - large vertical spacing between chapter modules
- **Group transitions:** special in-between full-screen punctuation sections when chapter group changes.

Key references:
- `src/pages/Home.tsx`
- `src/components/ChapterReader/index.tsx`
- `src/config/chapterGroups.ts`

## 5. Motion Language

- **Scroll is the main interaction driver** (GSAP `ScrollTrigger` across cover, chapter hero, transitions).
- **Physics as personality** (Matter.js for falling shapes/memories).
- **Micro-to-macro rhythm:**
  - subtle paragraph reveal in article body
  - medium section-level fades/translates
  - bold hero morphing/pinning behaviors
- **Reduced-motion is partially handled** (not everywhere).

Key references:
- `src/components/Cover/index.tsx`
- `src/components/ChapterReader/ChapterHero.tsx`
- `src/components/ChapterReader/GroupTransitionSection.tsx`
- `src/components/BackCover/FallingMemories.tsx`

## 6. Interaction Patterns You Must Preserve

- **URL + scroll sync:** chapter URL updates while reading, but initial jump behavior is controlled.
- **TOC + side progress nav:** chapter access by group and by chapter.
- **Selection-to-memory loop:** selected text can be collected and later reappears in back cover scene.
- **Cover relay loop:** user reads previous line, contributes new line, sees it reflected later.

Key references:
- `src/components/TextSelection/index.tsx`
- `src/hooks/useReadingMemories.ts`
- `src/components/ProgressNav/index.tsx`
- `src/components/BackCover/index.tsx`

## 7. Rules for Adding New Content (Keep Existing Style)

### 7.1 Content structure rules

- Keep chapter content as HTML in `public/chapters/chapter-xx.html`.
- Use long-form editorial structure:
  - intro paragraph block
  - image or image grid
  - sub-headings + narrative sections
  - optional side notes/keywords module
- Keep high whitespace and reading rhythm; avoid dense UI card stacking.

### 7.2 Class and data-attribute rules

- If you want standard reveal animation, keep semantic tags (`p`, `h2`, `h3`, `img`, `blockquote`, `figure`, lists).
- If you need "story sync" behavior, use `data-story-*` attributes exactly as existing pattern.
- For custom image grids, reuse classes already recognized (`img-grid-2`, `img-grid-3`).

### 7.3 Visual consistency rules

- Prefer monochrome foundation; only one accent per section when needed.
- Keep title contrast strong: large headline + tiny uppercase metadata.
- Do not replace this with generic SaaS cards, gradient-heavy UI, or bright multi-color systems.

## 8. Files You Usually Need to Touch for a New Chapter

1. `public/chapters/chapter-xx.html` (new content)
2. `src/config/chapters.json` (metadata, order, cover, credits)
3. `src/config/chapterGroups.ts` (if group mapping changes)
4. `src/components/TableOfContents/index.tsx` (currently uses hardcoded chapter ID groups)

Optional depending on scope:
- `public/assets/chapter-xx/*` for chapter media
- `public/assets/chapter-covers/*` for hero covers

## 9. Current Style Constraints / Caveats

- TOC grouping is not fully config-driven; adding chapters may require manual ID list updates.
- Some animation cleanup is global; avoid introducing additional global trigger side-effects without testing.
- Year/title metadata has mixed values in some config entries; keep editorial metadata aligned when adding new chapters.

## 10. Quick Checklist Before Merging New Content

- [ ] New chapter feels editorial, not dashboard-like.
- [ ] Hero image + chapter metadata maintain current hierarchy.
- [ ] Body typography and spacing match existing chapters.
- [ ] Group placement and TOC entry are updated correctly.
- [ ] Mobile reading remains usable (image grids collapse as needed).
- [ ] Back cover memory/relay loop still works.

