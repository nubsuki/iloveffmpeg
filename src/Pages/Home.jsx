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
              <h3></h3>
              <p></p>
            </div>

            <div className="footer-social">
              <a
                href="https://github.com/nubsuki"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <FaGithubAlt />
                <span>Built by nubsuki</span>
              </a>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2025 All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
