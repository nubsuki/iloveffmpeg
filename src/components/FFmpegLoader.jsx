import React from 'react';
import { useFFmpeg } from '../contexts/FFmpegContext';
import { FaRocket, FaExclamationTriangle, FaCheck } from 'react-icons/fa';
import './FFmpegLoader.css';

const FFmpegLoader = ({ children }) => {
  const { loaded, loading, error } = useFFmpeg();

  if (error) {
    return (
      <div className="ffmpeg-loader-container">
        <div className="ffmpeg-loader-card error">
          <div className="loader-icon error">
            <FaExclamationTriangle />
          </div>
          <h2>Failed to Load FFmpeg</h2>
          <p>There was an error loading the video processing engine.</p>
          <p className="error-message">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="retry-btn"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="ffmpeg-loader-container">
        <div className="ffmpeg-loader-card">
          <div className="loader-icon">
            <FaRocket />
          </div>
          <h2>Loading FFmpeg</h2>
          <p>Preparing the video processing engine...</p>
          <div className="loading-bar">
            <div className="loading-fill"></div>
          </div>
          <small>This may take a moment on first visit</small>
        </div>
      </div>
    );
  }

  if (loaded) {
    return children;
  }

  return null;
};

export default FFmpegLoader;
