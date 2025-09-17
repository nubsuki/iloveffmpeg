import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaHeart, FaScissors } from "react-icons/fa6";
import { LuFileMusic } from "react-icons/lu";
import { BsArrowLeftRight } from "react-icons/bs";
import "./Navbar.css";

const Navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="header">
      <Link to="/" className="logo">
        I<span className="heart-icon"><FaHeart /></span>FFmpeg
      </Link>
    </header>
  );
};

export default Navbar;
