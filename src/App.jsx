import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { FFmpegProvider } from './contexts/FFmpegContext'
import FFmpegLoader from './components/FFmpegLoader.jsx'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import VideoSplitter from './pages/VideoSplitter.jsx'
import AudioExtractor from './pages/AudioExtractor.jsx'
import VideoConverter from './pages/VideoConverter.jsx'
import AudioConverter from './pages/AudioConverter.jsx'
import AudioSplitter from './pages/AudioSplitter.jsx'
import './App.css'

function AppContent() {
  return (
    <Router> 
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/video-splitter" element={<VideoSplitter />} />
        <Route path="/video-converter" element={<VideoConverter />} />
        <Route path="/audio-converter" element={<AudioConverter />} />
        <Route path="/audio-extractor" element={<AudioExtractor />} />
        <Route path="/audio-splitter" element={<AudioSplitter />} />
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
