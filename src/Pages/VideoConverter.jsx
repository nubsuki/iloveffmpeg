import { useState, useRef } from "react";
import { useFFmpeg } from "../contexts/FFmpegContext";
import {
  FaUpload,
  FaPlay,
  FaDownload,
  FaVideo,
  FaCog,
  FaCheck,
  FaExchangeAlt,
} from "react-icons/fa";
import { TbProgressBolt } from "react-icons/tb";
import "./VideoConverter.css";

const VideoConverter = () => {
  const [video, setVideo] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const { ffmpeg, loaded, getLatestLog, clearLogs } = useFFmpeg();
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState("");
  const [outputFormat, setOutputFormat] = useState("mp4");
  const [convertedVideoUrl, setConvertedVideoUrl] = useState("");
  const videoRef = useRef(null);
  const resultVideoRef = useRef(null);

  // Video format options
  const formatOptions = [
    { value: "mp4", label: "MP4", description: "Most compatible" },
    { value: "mkv", label: "MKV", description: "High quality container" },
    { value: "avi", label: "AVI", description: "Legacy support" },
    { value: "mov", label: "MOV", description: "Apple format" },
  ];

  const handleVideoUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("video/")) {
      // Check if it's a compatible format
      const fileName = file.name.toLowerCase();
      const compatibleExtensions = ['.mp4', '.mkv', '.avi', '.mov', '.m4v'];
      const isCompatible = compatibleExtensions.some(ext => fileName.endsWith(ext));
      
      if (isCompatible) {
        setVideo(file);
        const url = URL.createObjectURL(file);
        setVideoUrl(url);
        setConvertedVideoUrl(""); // Reset previous conversion
      } else {
        alert('Please select a compatible video format (MP4, MKV, AVI, MOV, M4V) for lossless conversion.');
      }
    }
  };

  const getFFmpegArgs = () => {
    // Add safety check for video and video.name
    if (!video || !video.name) {
      console.warn('Video or video name is undefined');
      return [];
    }
    
    const nameParts = video.name.split('.');
    if (nameParts.length < 2) {
      console.warn('Video file has no extension');
      return [];
    }
    
    return ["-c", "copy", "-avoid_negative_ts", "make_zero"];
  };

  const convertVideo = async () => {
    if (!video || !ffmpeg || !loaded) return;

    setProcessing(true);
    setProgress("Starting video conversion...");
    clearLogs();

    const progressInterval = setInterval(() => {
      const latestLog = getLatestLog();
      if (latestLog) {
        setProgress(latestLog);
      }
    }, 500);

    try {
      // Write input file to FFmpeg filesystem
      const inputData = new Uint8Array(await video.arrayBuffer());
      const inputExtension = video.name.split('.').pop().toLowerCase();
      const inputFileName = `input.${inputExtension}`;
      await ffmpeg.writeFile(inputFileName, inputData);

      const outputFileName = `output.${outputFormat}`;
      let ffmpegArgs = ["-i", inputFileName];
      
      // Add conversion arguments
      const conversionArgs = getFFmpegArgs();
      if (conversionArgs.length > 0) {
        ffmpegArgs = ffmpegArgs.concat(conversionArgs);
      }
      
      // Add multithreading for better performance
      ffmpegArgs.push("-threads", "0");
      
      // Add output filename
      ffmpegArgs.push(outputFileName);

      console.log("FFmpeg command:", ffmpegArgs.join(" ")); // Debug log

      setProgress("Converting video...");
      await ffmpeg.exec(ffmpegArgs);

      // Read the output file
      const data = await ffmpeg.readFile(outputFileName);
      const mimeType = `video/${outputFormat}`;
      const blob = new Blob([data.buffer], { type: mimeType });
      const url = URL.createObjectURL(blob);
      setConvertedVideoUrl(url);

      // Clean up
      await ffmpeg.deleteFile(inputFileName);
      await ffmpeg.deleteFile(outputFileName);
      
      const conversionType = getFFmpegArgs().length > 0 ? "converted" : "transcoded";
      setProgress(`Video ${conversionType} successfully!`);
    } catch (error) {
      console.error("Error converting video:", error);
      
      // Fix the error message handling
      let errorMessage = "Unknown error occurred";
      if (error && typeof error === 'object') {
        if (error.message) {
          errorMessage = error.message;
        } else if (error.toString && typeof error.toString === 'function') {
          errorMessage = error.toString();
        } else if (typeof error === 'string') {
          errorMessage = error;
        }
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      setProgress(`Error: ${errorMessage}`);
    } finally {
      clearInterval(progressInterval);
      setProcessing(false);
    }
  };

  const downloadVideo = () => {
    if (convertedVideoUrl) {
      const a = document.createElement("a");
      a.href = convertedVideoUrl;
      a.download = `converted_video.${outputFormat}`;
      a.click();
    }
  };

  return (
    <div className="video-converter-page">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Video Converter</h1>
        <p className="page-subtitle">Convert videos between different container formats with lossless quality preservation</p>
      </div>

      {/* Main Content */}
      <div className={`content-wrapper ${video ? 'has-media' : ''}`}>
        {/* Upload Section */}
        <div className="upload-card">
          <div className="card-glow"></div>
          <div className="card-header">
            <div className="card-icon">
              <FaUpload />
            </div>
            <h2 className="card-title">Upload Video</h2>
          </div>

          <div className="file-upload-area">
            <input
              type="file"
              accept=".mp4,.mkv,.avi,.mov,.m4v,.3gp"
              onChange={handleVideoUpload}
              className="file-input"
              id="video-upload"
            />
            <label htmlFor="video-upload" className="file-label">
              <FaUpload />
              <span className="upload-text">Choose Video File</span>
              <small className="upload-hint">Supports MP4, MKV, AVI, MOV (lossless conversion only)</small>
            </label>
          </div>

          {loaded && (
            <div className="status-indicator">
              <div className="status">
                <FaCheck /> FFmpeg loaded and ready!
              </div>
            </div>
          )}
        </div>

        {/* Progress Section*/}
        {progress && video && (
          <div className="progress-card">
            <div className="card-glow"></div>
            <div className="card-header">
              <div className="card-icon">
                <TbProgressBolt />
              </div>
              <h3 className="card-title">Processing Progress</h3>
            </div>
            <div className="progress-content">
              <div className="progress-text">{progress}</div>
              {processing && (
                <div className="progress-bar">
                  <div className="progress-fill"></div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Video Preview & Settings */}
        {video && (
          <>
            {/* Video Preview */}
            <div className="preview-card">
              <div className="card-glow"></div>
              <div className="card-header">
                <div className="card-icon">
                  <FaPlay />
                </div>
                <h2 className="card-title">Video Preview</h2>
              </div>

              <div className="media-container">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  controls
                  className="media-player"
                />
                <p className="media-hint">
                  Preview your video before conversion
                </p>
              </div>
            </div>

            {/* Settings */}
            <div className="settings-card">
              <div className="card-glow"></div>
              <div className="card-header">
                <div className="card-icon">
                  <FaCog />
                </div>
                <h2 className="card-title">Conversion Settings</h2>
              </div>

              <div className="settings-content">
                {/* Format Selection */}
                <div className="setting-group">
                  <label className="setting-label">Output Format</label>
                  <div className="format-options">
                    {formatOptions.map((format) => (
                      <button
                        key={format.value}
                        onClick={() => setOutputFormat(format.value)}
                        className={`format-btn ${outputFormat === format.value ? 'active' : ''}`}
                      >
                        <span className="format-name">{format.label}</span>
                        <span className="format-desc">{format.description}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conversion Info */}
                <div className="conversion-info">
                  <div className="info-item">
                    <span className="info-label">Conversion Type:</span>
                    <span className="info-value">Lossless Container Change</span>
                  </div>
                  <div className="info-note">
                    <small>✨ No quality loss - only changing the container format</small>
                  </div>
                </div>

                {/* Convert Button */}
                <div className="convert-action">
                  <button
                    onClick={convertVideo}
                    disabled={!loaded || processing || !video}
                    className="convert-btn"
                  >
                    <FaExchangeAlt />
                    {processing ? "Converting..." : "Convert Video"}
                  </button>
                </div>
              </div>
            </div>

            {/* Video Result */}
            {convertedVideoUrl && (
              <div className="result-card">
                <div className="card-glow"></div>
                <div className="card-header">
                  <div className="card-icon">
                    <FaVideo />
                  </div>
                  <h2 className="card-title">Converted Video</h2>
                </div>

                <div className="result-content">
                  <video
                    ref={resultVideoRef}
                    src={convertedVideoUrl}
                    controls
                    className="result-video"
                  />
                  
                  <div className="result-actions">
                    <button onClick={downloadVideo} className="download-btn">
                      <FaDownload />
                      Download Video
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VideoConverter;