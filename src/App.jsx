import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { FFmpegProvider } from './contexts/FFmpegContext'
import FFmpegLoader from './components/FFmpegLoader'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import VideoSplitter from './pages/VideoSplitter'
import AudioExtractor from './pages/AudioExtractor'
import VideoConverter from './pages/VideoConverter'
import './App.css'

function AppContent() {
  return (
    <Router> 
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/video-splitter" element={<VideoSplitter />} />
        <Route path="/video-converter" element={<VideoConverter />} />
        <Route path="/audio-extractor" element={<AudioExtractor />} />
      </Routes>
    </Router>
  )
}

const App = () => {
  return (
    <FFmpegProvider>
      <FFmpegLoader>
        <AppContent />
      </FFmpegLoader>
    </FFmpegProvider>
  )
}

export default App
