import { useState, useRef } from "react";
import { useFFmpeg } from "../contexts/FFmpegContext";
import {
  FaUpload,
  FaPlay,
  FaDownload,
  FaMusic,
  FaCog,
  FaRocket,
  FaCheck,
  FaVolumeUp,
} from "react-icons/fa";
import { FaWaveSquare } from "react-icons/fa6";
import "./AudioExtractor.css";

const AudioExtractor = () => {
  const [video, setVideo] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const { ffmpeg, loaded, getLatestLog, clearLogs } = useFFmpeg();
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState("");
  const [audioFormat, setAudioFormat] = useState("mp3");
  const [audioQuality, setAudioQuality] = useState("192k");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [extractFullAudio, setExtractFullAudio] = useState(true);
  const [audioUrl, setAudioUrl] = useState("");
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  // Audio format options
  const formatOptions = [
    { value: "mp3", label: "MP3", description: "Most compatible" },
    { value: "wav", label: "WAV", description: "Uncompressed" },
    { value: "aac", label: "AAC", description: "High efficiency" },
    { value: "flac", label: "FLAC", description: "Lossless" },
    { value: "ogg", label: "OGG", description: "Open source" },
  ];

  // Quality options
  const qualityOptions = {
    mp3: [
      { value: "128k", label: "128 kbps", description: "Good" },
      { value: "192k", label: "192 kbps", description: "High" },
      { value: "256k", label: "256 kbps", description: "Very High" },
      { value: "320k", label: "320 kbps", description: "Maximum" },
    ],
    aac: [
      { value: "128k", label: "128 kbps", description: "Good" },
      { value: "192k", label: "192 kbps", description: "High" },
      { value: "256k", label: "256 kbps", description: "Very High" },
    ],
    ogg: [
      { value: "6", label: "Quality 6", description: "Good" },
      { value: "8", label: "Quality 8", description: "High" },
      { value: "10", label: "Quality 10", description: "Maximum" },
    ],
  };

  const handleVideoUpload = (event) => {
    const file = event.target.files[0];
    if (file && (file.type.startsWith("video/") || file.type.startsWith("audio/"))) {
      setVideo(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setAudioUrl(""); // Reset previous audio
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const setCurrentStartTime = () => {
    if (videoRef.current) {
      const currentTime = formatTime(videoRef.current.currentTime);
      setStartTime(currentTime);
    }
  };

  const setCurrentEndTime = () => {
    if (videoRef.current) {
      const currentTime = formatTime(videoRef.current.currentTime);
      setEndTime(currentTime);
    }
  };

  const extractAudio = async () => {
    if (!video || !ffmpeg || !loaded) return;

    setProcessing(true);
    setProgress("Starting audio extraction...");
    clearLogs(); // Clear previous logs

    // Set up a progress updater
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

      const outputFileName = `output.${audioFormat}`;
      let ffmpegArgs = ["-i", inputFileName];

      // Add time range if not extracting full audio
      if (!extractFullAudio && startTime && endTime) {
        ffmpegArgs.push("-ss", startTime, "-to", endTime);
      }

      // Add format-specific arguments
      switch (audioFormat) {
        case "mp3":
          ffmpegArgs.push("-codec:a", "libmp3lame", "-b:a", audioQuality);
          break;
        case "wav":
          ffmpegArgs.push("-codec:a", "pcm_s16le");
          break;
        case "aac":
          ffmpegArgs.push("-codec:a", "aac", "-b:a", audioQuality);
          break;
        case "flac":
          ffmpegArgs.push("-codec:a", "flac");
          break;
        case "ogg":
          ffmpegArgs.push("-codec:a", "libvorbis", "-q:a", audioQuality);
          break;
      }

      ffmpegArgs.push("-vn", outputFileName); // -vn removes video stream

      setProgress("Extracting audio...");
      await ffmpeg.exec(ffmpegArgs);

      // Read the output file
      const data = await ffmpeg.readFile(outputFileName);
      const mimeType = `audio/${audioFormat === 'ogg' ? 'ogg' : audioFormat}`;
      const blob = new Blob([data.buffer], { type: mimeType });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);

      // Clean up
      await ffmpeg.deleteFile(inputFileName);
      await ffmpeg.deleteFile(outputFileName);
      
      setProgress("Audio extraction completed successfully!");
    } catch (error) {
      console.error("Error extracting audio:", error);
      setProgress(`Error: ${error.message}`);
    } finally {
      clearInterval(progressInterval);
      setProcessing(false);
    }
  };

  const downloadAudio = () => {
    if (audioUrl) {
      const a = document.createElement("a");
      a.href = audioUrl;
      a.download = `extracted_audio.${audioFormat}`;
      a.click();
    }
  };

  return (
    <div className="audio-extractor-page">
      {/* Upload Section */}
      <div className={`upload-section ${video ? 'has-video' : ''}`}>
        <div className="upload-card">
          <div className="card-glow"></div>
          <div className="upload-header">
            <div className="upload-icon">
              <FaUpload />
            </div>
            <h2>Upload Media File</h2>
          </div>

          <div className="file-upload-area">
            <input
              type="file"
              accept="video/*,audio/*"
              onChange={handleVideoUpload}
              className="file-input"
              id="media-upload"
            />
            <label htmlFor="media-upload" className="file-label">
              <FaUpload />
              <span>Choose Video or Audio File</span>
              <small>Supports MP4, AVI, MOV, MP3, WAV, and more</small>
            </label>
          </div>

          <div className="status-indicator">
            {loaded && (
              <div className="status success"><FaCheck/> FFmpeg loaded and ready!</div>
            )}
          </div>
        </div>
      </div>

      {/* Media Content */}
      {video && (
        <div className="media-content">
          {/* Media Preview */}
          <div className="preview-card">
            <div className="card-glow"></div>
            <div className="preview-header">
              <div className="preview-icon">
                <FaPlay />
              </div>
              <h2>Media Preview</h2>
            </div>

            <div className="media-container">
              {video.type.startsWith("video/") ? (
                <video
                  ref={videoRef}
                  src={videoUrl}
                  controls
                  className="media-player"
                />
              ) : (
                <audio
                  ref={videoRef}
                  src={videoUrl}
                  controls
                  className="audio-player"
                />
              )}
              <p className="media-hint">
                Use the controls to preview and find specific timestamps
              </p>
            </div>
          </div>

          {/* Settings Card */}
          <div className="settings-card">
            <div className="card-glow"></div>
            <div className="settings-header">
              <div className="settings-icon">
                <FaCog />
              </div>
              <h2>Audio Settings</h2>
            </div>

            <div className="settings-content">
              {/* Format Selection */}
              <div className="setting-group">
                <label>Output Format</label>
                <div className="format-options">
                  {formatOptions.map((format) => (
                    <button
                      key={format.value}
                      onClick={() => {
                        setAudioFormat(format.value);
                        if (qualityOptions[format.value]) {
                          setAudioQuality(qualityOptions[format.value][1].value);
                        }
                      }}
                      className={`format-btn ${audioFormat === format.value ? 'active' : ''}`}
                    >
                      <span className="format-name">{format.label}</span>
                      <span className="format-desc">{format.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality Selection */}
              {qualityOptions[audioFormat] && (
                <div className="setting-group">
                  <label>Quality</label>
                  <div className="quality-options">
                    {qualityOptions[audioFormat].map((quality) => (
                      <button
                        key={quality.value}
                        onClick={() => setAudioQuality(quality.value)}
                        className={`quality-btn ${audioQuality === quality.value ? 'active' : ''}`}
                      >
                        <span className="quality-name">{quality.label}</span>
                        <span className="quality-desc">{quality.description}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Time Range Selection */}
              <div className="setting-group">
                <div className="extraction-mode">
                  <label className="mode-toggle">
                    <input
                      type="checkbox"
                      checked={extractFullAudio}
                      onChange={(e) => setExtractFullAudio(e.target.checked)}
                    />
                    <span>Extract full audio</span>
                  </label>
                </div>

                {!extractFullAudio && (
                  <div className="time-range">
                    <div className="time-control">
                      <label>Start Time</label>
                      <div className="time-input-group">
                        <input
                          type="text"
                          placeholder="00:00:00"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="time-input"
                        />
                        <button
                          onClick={setCurrentStartTime}
                          className="time-btn"
                          disabled={!video}
                        >
                          Current
                        </button>
                      </div>
                    </div>

                    <div className="time-control">
                      <label>End Time</label>
                      <div className="time-input-group">
                        <input
                          type="text"
                          placeholder="00:01:00"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="time-input"
                        />
                        <button
                          onClick={setCurrentEndTime}
                          className="time-btn"
                          disabled={!video}
                        >
                          Current
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Extract Button */}
              <div className="extract-action">
                <button
                  onClick={extractAudio}
                  disabled={!loaded || processing || !video}
                  className="extract-btn"
                >
                  <FaWaveSquare />
                  {processing ? "Extracting..." : "Extract Audio"}
                </button>
              </div>
            </div>
          </div>

          {/* Audio Result */}
          {audioUrl && (
            <div className="result-card">
              <div className="card-glow"></div>
              <div className="result-header">
                <div className="result-icon">
                  <FaMusic />
                </div>
                <h2>Extracted Audio</h2>
              </div>

              <div className="result-content">
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  controls
                  className="result-audio"
                />
                
                <div className="result-actions">
                  <button onClick={downloadAudio} className="download-btn">
                    <FaDownload />
                    Download Audio
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Progress Section */}
      {progress && (
        <div className="progress-card">
          <div className="card-glow"></div>
          <h3>Processing Progress</h3>
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
    </div>
  );
};

export default AudioExtractor;