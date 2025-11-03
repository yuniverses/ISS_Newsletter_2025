import { useState, useEffect } from 'react'
import Cover from '../components/Cover'
import Preface from '../components/Preface'
import TableOfContents from '../components/TableOfContents'
import ChapterReader from '../components/ChapterReader'
import ProgressNav from '../components/ProgressNav'
import { Newsletter } from '../types'

export default function Home() {
  const [newsletter, setNewsletter] = useState<Newsletter | null>(null)
  const [currentChapterId, setCurrentChapterId] = useState<string>('')

  // Load newsletter configuration
  useEffect(() => {
    fetch('/src/config/chapters.json')
      .then((res) => res.json())
      .then((data: Newsletter) => {
        setNewsletter(data)
        setCurrentChapterId(data.chapters[0]?.id || '')
      })
      .catch((error) => console.error('Failed to load newsletter config:', error))
  }, [])

  if (!newsletter) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-400">載入中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Cover Page */}
      <Cover />

      {/* Preface Section */}
      <Preface />

      {/* Table of Contents */}
      <TableOfContents
        chapters={newsletter.chapters}
        onChapterClick={setCurrentChapterId}
      />

      {/* Progress Navigation - appears after cover */}
      <ProgressNav
        chapters={newsletter.chapters}
        currentChapterId={currentChapterId}
        onChapterClick={setCurrentChapterId}
      />

      {/* Chapter Reader */}
      <div className="bg-white">
        <ChapterReader
          newsletter={newsletter}
          onChapterChange={setCurrentChapterId}
        />
      </div>
    </div>
  )
}
