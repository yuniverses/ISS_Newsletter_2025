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
