import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import Home from './pages/Home'
import AdminPanel from './components/AdminPanel'
import LayoutsDemo from './pages/LayoutsDemo'
import SemicolonIntro from './components/SemicolonIntro'
import EmbedTopBar from './components/EmbedTopBar'

function AppShell() {
  const location = useLocation()
  const normalizedPath = location.pathname.replace(/\/+$/, '') || '/'
  const introDurationMode = normalizedPath === '/' ? 'normal' : 'short'
  const [showIntro, setShowIntro] = useState(true)
  const [currentChapterId, setCurrentChapterId] = useState('')
  const isNewsletterRoute =
    normalizedPath === '/' || normalizedPath.startsWith('/chapters/')
  const isEmbedMode =
    isNewsletterRoute &&
    new URLSearchParams(location.search).get('embed') === '1'

  return (
    <>
      {showIntro && (
        <SemicolonIntro
          durationMode={introDurationMode}
          onComplete={() => setShowIntro(false)}
        />
      )}
      <EmbedTopBar
        enabled={isEmbedMode}
        currentChapterId={currentChapterId}
        pathname={location.pathname}
      />
      <Routes>
        <Route
          path="/"
          element={
            <Home
              isIntroComplete={!showIntro}
              onCurrentChapterIdChange={setCurrentChapterId}
            />
          }
        />
        <Route
          path="/chapters/:chapterId"
          element={
            <Home
              isIntroComplete={!showIntro}
              onCurrentChapterIdChange={setCurrentChapterId}
            />
          }
        />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/layouts-demo" element={<LayoutsDemo />} />
        <Route
          path="*"
          element={<Navigate to={{ pathname: '/', search: location.search }} replace />}
        />
      </Routes>
    </>
  )
}

function App() {
  return (
    <HelmetProvider>
      <Router>
        <AppShell />
      </Router>
    </HelmetProvider>
  )
}

export default App
