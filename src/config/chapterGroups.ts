export interface ChapterGroup {
  id: string
  title: string
  symbol: string
  chapters: string[]
  transitionDescription: string
}

export interface AlumniTrackItem {
  chapterId: string
  code: string
  label: string
}

export const CHAPTER_GROUPS: ChapterGroup[] = [
  {
    id: 'entry',
    title: '/ 服科的入口 /',
    symbol: '/',
    chapters: ['chapter-01'],
    transitionDescription: '從入口出發，先看見服科的課程脈絡與師資樣貌。',
  },
  {
    id: 'campus',
    title: '...在校服科人...',
    symbol: '...',
    chapters: ['chapter-02', 'chapter-03'],
    transitionDescription: '走進在校服科人的日常，從校園場景延伸到真實問題現場。',
  },
  {
    id: 'alumni',
    title: '@服科前輩們@',
    symbol: '@',
    chapters: ['chapter-04', 'chapter-05', 'chapter-06', 'chapter-07'],
    transitionDescription: '連接前輩職涯軌跡，拆解跨域能力如何落地在不同產業。',
  },
  {
    id: 'feature',
    title: ': 展開專訪 :',
    symbol: ':',
    chapters: ['chapter-08', 'chapter-09', 'chapter-10'],
    transitionDescription: '展開長篇訪談，深入每位受訪者的方法與現場判斷。',
  },
  {
    id: 'events',
    title: '# 活動現場 #',
    symbol: '#',
    chapters: ['chapter-11'],
    transitionDescription: '回到活動現場，整合觀察與實作片段。',
  },
]

export const ALUMNI_TRACK: AlumniTrackItem[] = [
  { chapterId: 'chapter-04', code: 'IS', label: '資訊組' },
  { chapterId: 'chapter-05', code: 'SID', label: '服務創新設計' },
  { chapterId: 'chapter-06', code: 'BA', label: '商業分析' },
  { chapterId: 'chapter-07', code: 'SMM', label: '社群媒體管理' },
]

export function getGroupByChapterId(chapterId?: string | null) {
  if (!chapterId) return undefined
  return CHAPTER_GROUPS.find((group) => group.chapters.includes(chapterId))
}

export function isGroupBoundary(prevChapterId: string, nextChapterId: string) {
  const prevGroup = getGroupByChapterId(prevChapterId)
  const nextGroup = getGroupByChapterId(nextChapterId)
  return Boolean(prevGroup && nextGroup && prevGroup.id !== nextGroup.id)
}
