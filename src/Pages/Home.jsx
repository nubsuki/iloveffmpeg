import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Home.module.css";
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
      color: '#935fba'
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
      color: '#6f50de'
    },
    {
      id: 'audio-converter',
      title: 'Convert Audio',
      description: 'Transform your audio files between different formats like MP3, WAV, AAC, OGG, and more.',
      icon: <BsArrowLeftRight />,
      path: '/audio-converter',
      color: '#735fba'
    }
  ];

  return (
    <div className={styles.homePage}>
      {/* Hero Section */}
      <div className={styles.heroSection}>
        <div className={styles.heroBackground}>
          <div className={`${styles.heroShape} ${styles.heroShape1}`}></div>
          <div className={`${styles.heroShape} ${styles.heroShape2}`}></div>
          <div className={`${styles.heroShape} ${styles.heroShape3}`}></div>
          <div className={styles.heroGradient}></div>
        </div>
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <div className={styles.heroTitle}>
              <span className={styles.titleMain}>Try Now!</span>
            </div>
            
            <p className={styles.heroDescription}> 
              <strong>Your files stay on your device</strong> – no uploads, no tracking, uses your own hardware.
            </p>

            {/* Tools Grid */}
            <div className={styles.toolsGrid}>
              {tools.map((tool) => (
                <div
                  key={tool.id}
                  className={styles.toolCard}
                  onClick={() => navigate(tool.path)}
                >
                  <div className={styles.toolIcon} style={{ color: tool.color }}>
                    {tool.icon}
                  </div>
                  <h3 className={styles.toolTitle}>{tool.title}</h3>
                  <p className={styles.toolDescription}>{tool.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.footerContent}>
            <div className={styles.footerBrand}>
              <h3>I<span className={styles.heartIcon}><FaHeart /></span>FFmpeg</h3>
              <p>FFmpeg-powered tools for everyone - free forever. Support me keep the website running!</p>
            </div>

            <div className={styles.footerSocial}>
              <a
                href="https://github.com/nubsuki/iloveffmpeg"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
              >
                <FaGithubAlt />
                <span>Source Code</span>
              </a>
              <a
                href="https://buymeacoffee.com/nubsuki"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
              >
                <SiBuymeacoffee />
                <span>Buy Me Coffee</span>
              </a>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <p>&copy; 2025 Made with ❤️ by nubsuki</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
