import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import AdminPanel from './components/AdminPanel'
import LayoutsDemo from './pages/LayoutsDemo'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/layouts-demo" element={<LayoutsDemo />} />
      </Routes>
    </Router>
  )
}

export default App
