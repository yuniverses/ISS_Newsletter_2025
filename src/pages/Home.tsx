import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Cover from '../components/Cover'
import TableOfContents from '../components/TableOfContents'
import ChapterReader from '../components/ChapterReader'
import ProgressNav from '../components/ProgressNav'
import BackCover from '../components/BackCover'
// import TextSelection from '../components/TextSelection'
import { Newsletter } from '../types'
import chaptersConfig from '../config/chapters.json'

interface HomeProps {
  isIntroComplete?: boolean
  onCurrentChapterIdChange?: (chapterId: string) => void
}

export default function Home({
  isIntroComplete = true,
  onCurrentChapterIdChange,
}: HomeProps) {
  const { chapterId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [newsletter, setNewsletter] = useState<Newsletter | null>(null)
  const [currentChapterId, setCurrentChapterId] = useState<string>('')
  const [hasMoreChapters, setHasMoreChapters] = useState(true)

  // Capture the initial chapter ID on mount only.
  // This prevents the reader from auto-scrolling when the URL updates during normal scrolling.
  const [initialStartChapterId] = useState(chapterId)

  // Track when user explicitly clicks to navigate to a chapter
  const [scrollToChapterId, setScrollToChapterId] = useState<string | null>(null)
  const isEmbedMode = new URLSearchParams(location.search).get('embed') === '1'
  const embedSearch = isEmbedMode ? location.search || '?embed=1' : ''

  const buildNavigationTarget = useCallback(
    (targetChapterId?: string | null) => {
      const pathname = targetChapterId ? `/chapters/${targetChapterId}` : '/'
      return `${pathname}${embedSearch}`
    },
    [embedSearch]
  )

  
  // Load newsletter configuration
  useEffect(() => {
    // Cast the imported json to Newsletter type
    const data = chaptersConfig as Newsletter
    setNewsletter(data)
    
    // Initialize current chapter from URL
    if (chapterId) {
      // Verify if chapter exists
      const exists = data.chapters.some(c => c.id === chapterId)
      if (exists) {
        setCurrentChapterId(chapterId)
      } else {
        // Invalid chapter ID, redirect to first or home
        navigate(buildNavigationTarget(data.chapters[0].id), { replace: true })
      }
    } 
    // ELSE: Do nothing! Let the user stay on "Home" (Cover) state.
    // The ProgressNav or other components might need to handle empty currentChapterId gracefully.
  }, [buildNavigationTarget, chapterId, navigate])

  useEffect(() => {
    onCurrentChapterIdChange?.(currentChapterId)
  }, [currentChapterId, onCurrentChapterIdChange])

  // Handle chapter change from UI (scroll or click)
  const handleChapterChange = (newChapterId: string) => {
    setCurrentChapterId(newChapterId)
    
    // If no chapter is active (e.g. at cover), revert to root URL
    if (!newChapterId) {
        if (chapterId) { // Only if we currently have a chapter param
            navigate(buildNavigationTarget(), { replace: true })
        }
        return
    }

    // Update URL without page reload
    if (newChapterId !== chapterId) {
       navigate(buildNavigationTarget(newChapterId), { replace: true })
    }
  }

  if (!newsletter) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-400">載入中...</div>
      </div>
    )
  }

  // Find current chapter info for SEO
  const currentChapter = newsletter.chapters.find(c => c.id === currentChapterId)
  const pageTitle = currentChapter ? `${currentChapter.title} | ${newsletter.title}` : newsletter.title
  const pageDescription = currentChapter?.description || `服務科學研究所 2025 電子期刊 - ${currentChapter?.title || ''}`
  const canonicalUrl = currentChapterId
    ? `https://iss-news-0f834ef85b23.herokuapp.com/chapters/${currentChapterId}`
    : 'https://iss-news-0f834ef85b23.herokuapp.com/'
  const ogImage = 'https://iss-news-0f834ef85b23.herokuapp.com/assets/og-image.jpg'
  const authors = currentChapter?.authors?.join(', ') || 'ISS 服務科學研究所'

  return (
    <div className="min-h-screen">
      <Helmet>
        {/* Primary Meta Tags */}
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="author" content={authors} />

        {/* Canonical URL */}
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:site_name" content={newsletter.title} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={canonicalUrl} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={ogImage} />
      </Helmet>

      {/* Cover Page */}
      <Cover startAnimation={isIntroComplete} />

      {/* Table of Contents */}
      <TableOfContents
        chapters={newsletter.chapters}
        onChapterClick={(id) => {
          setScrollToChapterId(id)
          navigate(buildNavigationTarget(id))
        }}
      />

      {/* Progress Navigation - appears after cover */}
      <ProgressNav
        chapters={newsletter.chapters}
        currentChapterId={currentChapterId}
        isEmbedMode={isEmbedMode}
        onChapterClick={(id) => {
          setScrollToChapterId(id)
          navigate(buildNavigationTarget(id))
        }}
      />

      {/* Chapter Reader */}
      <div className="bg-white">
        <ChapterReader
          newsletter={newsletter}
          onChapterChange={handleChapterChange}
          initialChapterId={initialStartChapterId}
          scrollToChapterId={scrollToChapterId}
          onScrollComplete={() => setScrollToChapterId(null)}
          onHasMoreChange={setHasMoreChapters}
        />
      </div>

      {/* Back Cover */}
      {!hasMoreChapters && <BackCover />}

      {/* Text Selection Handler — temporarily hidden, keep code for future use */}
      {/* <TextSelection
        chapters={newsletter.chapters}
        currentChapterId={currentChapterId}
      /> */}
    </div>
  )
}
