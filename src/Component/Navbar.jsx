import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaHeart,FaScissors } from "react-icons/fa6";
import { FaPlay , FaVolumeUp, FaExchangeAlt } from "react-icons/fa";
import "./Navbar.css";

const Navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="header">
      <Link to="/" className="logo">
        I<span className="heart-icon"><FaHeart /></span>FFmpeg
      </Link>
      <nav className="navbar">
        <div
          className="dropdown-container"
          onMouseEnter={() => setShowDropdown(true)}
          onMouseLeave={() => setShowDropdown(false)}
        >
          <span className="dropdown-trigger">Tools</span>
          {showDropdown && (
            <div className="dropdown-menu">
              <div className="dropdown-columns">
                <div className="dropdown-column">
                  <h3 className="column-title">Video</h3>
                  <Link to="/video-splitter" className="dropdown-item">
                    <span className="tool-icon"><FaScissors /></span>
                    Video Splitter
                  </Link>
                  <Link to="/video-converter" className="dropdown-item">
                    <span className="tool-icon"><FaExchangeAlt /></span>
                    Video Converter
                  </Link>
                  <Link to="/video-compressor" className="dropdown-item">
                    <span className="tool-icon"><FaPlay /></span>
                    Video Compressor
                  </Link>
                </div>
                
                <div className="dropdown-column">
                  <h3 className="column-title">Audio</h3>
                  <Link to="/audio-converter" className="dropdown-item">
                    <span className="tool-icon"><FaExchangeAlt /></span>
                    Audio Converter
                  </Link>
                  <Link to="/audio-compressor" className="dropdown-item">
                    <span className="tool-icon"><FaVolumeUp /></span>
                    Audio Compressor
                  </Link>
                  <Link to="/audio-splitter" className="dropdown-item">
                    <span className="tool-icon"><FaScissors /></span>
                    Audio Splitter
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
