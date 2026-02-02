import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Cover from '../components/Cover'
import TableOfContents from '../components/TableOfContents'
import ChapterReader from '../components/ChapterReader'
import ProgressNav from '../components/ProgressNav'
import BackCover from '../components/BackCover'
import TextSelection from '../components/TextSelection'
import { Newsletter } from '../types'
import chaptersConfig from '../config/chapters.json'

interface HomeProps {
  isIntroComplete?: boolean
}

export default function Home({ isIntroComplete = true }: HomeProps) {
  const { chapterId } = useParams()
  const navigate = useNavigate()
  const [newsletter, setNewsletter] = useState<Newsletter | null>(null)
  const [currentChapterId, setCurrentChapterId] = useState<string>('')
  
  // Capture the initial chapter ID on mount only.
  // This prevents the reader from auto-scrolling when the URL updates during normal scrolling.
  const [initialStartChapterId] = useState(chapterId)

  
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
        navigate(`/chapters/${data.chapters[0].id}`, { replace: true })
      }
    } 
    // ELSE: Do nothing! Let the user stay on "Home" (Cover) state.
    // The ProgressNav or other components might need to handle empty currentChapterId gracefully.
  }, [chapterId, navigate])

  // Handle chapter change from UI (scroll or click)
  const handleChapterChange = (newChapterId: string) => {
    setCurrentChapterId(newChapterId)
    
    // If no chapter is active (e.g. at cover), revert to root URL
    if (!newChapterId) {
        if (chapterId) { // Only if we currently have a chapter param
            navigate('/', { replace: true })
        }
        return
    }

    // Update URL without page reload
    if (newChapterId !== chapterId) {
       navigate(`/chapters/${newChapterId}`, { replace: true })
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
  const pageDescription = currentChapter?.description || `服務科學研究所 2026 電子期刊 - ${currentChapter?.title || ''}`
  const canonicalUrl = currentChapterId
    ? `https://iss-newsletter-2026.web.app/chapters/${currentChapterId}`
    : 'https://iss-newsletter-2026.web.app/'
  const ogImage = 'https://iss-newsletter-2026.web.app/assets/og-image.jpg'
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
          navigate(`/chapters/${id}`)
        }}
      />

      {/* Progress Navigation - appears after cover */}
      <ProgressNav
        chapters={newsletter.chapters}
        currentChapterId={currentChapterId}
        onChapterClick={(id) => {
             navigate(`/chapters/${id}`)
        }}
      />

      {/* Chapter Reader */}
      <div className="bg-white">
        <ChapterReader
          newsletter={newsletter}
          onChapterChange={handleChapterChange}
          initialChapterId={initialStartChapterId}
        />
      </div>

      {/* Back Cover */}
      <BackCover />

      {/* Text Selection Handler */}
      <TextSelection chapters={newsletter.chapters} />
    </div>
  )
}
