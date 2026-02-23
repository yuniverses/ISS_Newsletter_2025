import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import Home from './pages/Home'
import AdminPanel from './components/AdminPanel'
import LayoutsDemo from './pages/LayoutsDemo'
import SemicolonIntro from './components/SemicolonIntro'

function App() {
  const normalizedPath = window.location.pathname.replace(/\/+$/, '') || '/'
  const introDurationMode = normalizedPath === '/' ? 'normal' : 'short'
  const [showIntro, setShowIntro] = useState(true)

  return (
    <HelmetProvider>
      {showIntro && (
        <SemicolonIntro
          durationMode={introDurationMode}
          onComplete={() => setShowIntro(false)}
        />
      )}
      <Router>
        <Routes>
          <Route path="/" element={<Home isIntroComplete={!showIntro} />} />
          <Route path="/chapters/:chapterId" element={<Home isIntroComplete={!showIntro} />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/layouts-demo" element={<LayoutsDemo />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </HelmetProvider>
  )
}

export default App
