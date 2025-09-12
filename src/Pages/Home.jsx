import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import {
  FaGithubAlt,
  FaShieldAlt,
  FaMusic,
} from "react-icons/fa";
import { FaHeart, FaScissors } from "react-icons/fa6";
import { SiBuymeacoffee } from "react-icons/si";

const Home = () => {
  const navigate = useNavigate();

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
            <div className="hero-badge">
              <FaShieldAlt />
              <span>Privacy-First • Ad-Free</span>
            </div>
            
            <div className="hero-title">
              <span className="title-main">I<FaHeart className="heart-inline"/>FFmpeg</span>
              <span className="title-subtitle">Video Tools That Don't Suck</span>
            </div>
            
            <p className="hero-description">
              Hey! I built this because I was tired loosing quality when splitting videos. 
              <strong> Your files stay on your device</strong> – no uploads, no tracking, uses your own hardware just good tools.
            </p>
            <div className="available-tools">
              <h3>What You Can Do:</h3>
              <div className="tools-list">
                <div className="tool-item" onClick={() => navigate('/video-splitter')}>
                  <FaScissors />
                  <span>Split Videos</span>
                </div>
                <div className="tool-item" onClick={() => navigate('/audio-extractor')}>
                  <FaMusic />
                  <span>Extract Audio</span>
                </div>
              </div>
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
