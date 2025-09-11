import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaHeart, FaScissors } from "react-icons/fa6";
import { LuFileMusic } from "react-icons/lu";
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
                </div>
                
                <div className="dropdown-column">
                  <h3 className="column-title">Audio</h3>
                  <Link to="/audio-extractor" className="dropdown-item">
                    <span className="tool-icon"><LuFileMusic /></span>
                    Audio Extractor
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
