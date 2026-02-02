export interface Credit {
  name: string
  role: string
}

export interface Chapter {
  id: string
  title: string
  description: string
  htmlFile: string
  authors?: string[]
  tag?: string
  theme?: 'light' | 'dark'
  order: number
  coverImage?: string
  preface?: string
  category?: string
  date?: string
  credits?: Credit[]
  fallingElements?: string[]
}

export interface Newsletter {
  title: string
  year: number
  chapters: Chapter[]
}

export interface ChapterContent {
  id: string
  content: string
  loaded: boolean
}

// 閱讀記憶類型
export interface ReadingMemory {
  id: string                    // 唯一 ID
  text: string                  // 選取的文字
  chapterId: string             // 來源章節 ID
  chapterTitle: string          // 來源章節標題
  createdAt: number             // 時間戳
}

// 封面文字接力貢獻
export interface CoverContribution {
  received: string              // 收到的句子
  mine: string                  // 自己寫的句子
}
