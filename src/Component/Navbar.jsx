import React from 'react'
import { Link } from 'react-router-dom'
import './Navbar.css'

const Navbar = () => {
  return (
    <header className='header'>
      <Link to="/" className='logo'>Multimedia</Link>
      <nav className='navbar'>
        <Link to="/">Home</Link>
        <Link to="/video-splitter">Video Splitter</Link>
      </nav>
    </header>
  )
};

export default Navbar