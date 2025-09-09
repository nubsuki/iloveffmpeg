import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './Component/Navbar'
import Home from './Pages/Home'
import VideoSplitter from './Pages/VideoSplitter'
import './App.css'

function AppContent () {
  return (
    <Router> 
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/video-splitter" element={<VideoSplitter />} />
      </Routes>
    </Router>
  )
};

const App = () => {
  return (
    <AppContent />
  )
}

export default App
