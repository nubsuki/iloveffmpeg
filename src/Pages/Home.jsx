import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import {
  FaGithubAlt,
  FaMusic,
  FaHeart,
} from "react-icons/fa";
import { SiBuymeacoffee } from "react-icons/si";
import { FaScissors } from "react-icons/fa6";
import { BsArrowLeftRight } from "react-icons/bs";

const Home = () => {
  const navigate = useNavigate();

  const tools = [
    {
      id: 'video-splitter',
      title: 'Split Video',
      description: 'Trim or Separate one video into multiple parts for easy conversion into independent video files.',
      icon: <FaScissors />,
      path: '/video-splitter',
      color: '#ff6b6b'
    },
    {
      id: 'video-converter',
      title: 'Convert Video',
      description: 'Transform your video files between different formats like MP4, AVI, MOV, and more.',
      icon: <BsArrowLeftRight />,
      path: '/video-converter',
      color: '#4ecdc4'
    },
    {
      id: 'audio-extractor',
      title: 'Extract Audio',
      description: 'Pull audio tracks from video files and save them as MP3, WAV, or other audio formats.',
      icon: <FaMusic />,
      path: '/audio-extractor',
      color: '#45b7d1'
    },
    {
      id: 'audio-splitter',
      title: 'Split Audio',
      description: 'Trim or Split one audio file into multiple parts for easy conversion into independent audio files.',
      icon: <FaScissors />,
      path: '/audio-splitter',
      color: '#45b7d1'
    }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-background">
          <div className="hero-shape hero-shape-1"></div>
          <div className="hero-shape hero-shape-2"></div>
          <div className="hero-shape hero-shape-3"></div>
          <div className="hero-gradient"></div>
        </div>
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-title">
              <span className="title-main">Try Now!</span>
            </div>
            
            <p className="hero-description"> 
              <strong>Your files stay on your device</strong> – no uploads, no tracking, uses your own hardware.
            </p>

            {/* Tools Grid */}
            <div className="tools-grid">
              {tools.map((tool) => (
                <div
                  key={tool.id}
                  className="tool-card"
                  onClick={() => navigate(tool.path)}
                >
                  <div className="tool-icon" style={{ color: tool.color }}>
                    {tool.icon}
                  </div>
                  <h3 className="tool-title">{tool.title}</h3>
                  <p className="tool-description">{tool.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3>I<span className="heart-icon"><FaHeart /></span>FFmpeg</h3>
              <p>FFmpeg-powered tools for everyone - free forever. Support me keep the website running!</p>
            </div>

            <div className="footer-social">
              <a
                href="https://github.com/nubsuki/iloveffmpeg"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <FaGithubAlt />
                <span>Source Code</span>
              </a>
              <a
                href="https://buymeacoffee.com/nubsuki"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <SiBuymeacoffee />
                <span>Buy Me Coffee</span>
              </a>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2025 Made with ❤️ by nubsuki</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
