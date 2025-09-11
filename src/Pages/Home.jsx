import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import {
  FaGithubAlt,
  FaRobot,
  FaLinux,
  FaUsers,
  FaMicrochip,
  FaArrowRight,
  FaStar,
  FaGamepad,
} from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";
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
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3>I<span className="heart-icon"><FaHeart /></span>FFmpeg</h3>
              <p>FFmpeg-powered tools for everyone - free forever. Support me with a coffee!</p>
            </div>

            <div className="footer-social">
              <a
                href="https://github.com/nubsuki/iloveffmpeg"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <FaGithubAlt />
                <span>Open-source</span>
              </a>
              <a
                href="https://buymeacoffee.com/nubsuki"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <SiBuymeacoffee />
                <span>Donate</span>
              </a>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; iLoveFFmpeg 2025 All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
