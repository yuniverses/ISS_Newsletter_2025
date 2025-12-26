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
