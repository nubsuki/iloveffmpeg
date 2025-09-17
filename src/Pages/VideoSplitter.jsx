import { useState, useRef } from "react";
import { useFFmpeg } from "../contexts/FFmpegContext";
import {
  FaUpload,
  FaPlay,
  FaPlus,
  FaTrash,
  FaClock,
  FaCheck,
  FaCog,
} from "react-icons/fa";
import { FaScissors } from "react-icons/fa6";
import { TbProgressBolt } from "react-icons/tb";
import "./VideoSplitter.css";

const VideoSplitter = () => {
  const [video, setVideo] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const { ffmpeg, loaded, getLatestLog, clearLogs } = useFFmpeg();
  const [splits, setSplits] = useState([
    { startTime: "00:00:00", endTime: "00:00:10", name: "segment_1" },
  ]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState("");
  const videoRef = useRef(null);

  // Check if video format is compatible for preview
  const isBrowserCompatible = (fileName) => {
    const name = fileName.toLowerCase();
    const browserCompatibleExtensions = ['.mp4', '.mov', '.m4v', '.webm'];
    return browserCompatibleExtensions.some(ext => name.endsWith(ext));
  };

  const handleVideoUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("video/")) {
      // Check if it's a compatible format
      if (isBrowserCompatible(file.name)) {
        setVideo(file);
        const url = URL.createObjectURL(file);
        setVideoUrl(url);
      } else {
        alert('Please select a browser-compatible video format (MP4, MOV, M4V, WebM) for video splitting with preview.');
      }
    }
  };

  const addSplit = () => {
    const newSplit = {
      startTime: "00:00:00",
      endTime: "00:00:10",
      name: `segment_${splits.length + 1}`,
    };
    setSplits([...splits, newSplit]);
  };

  const updateSplit = (index, field, value) => {
    const updatedSplits = splits.map((split, i) =>
      i === index ? { ...split, [field]: value } : split
    );
    setSplits(updatedSplits);
  };

  const removeSplit = (index) => {
    setSplits(splits.filter((_, i) => i !== index));
  };

  const timeToSeconds = (timeString) => {
    const [hours, minutes, seconds] = timeString.split(":").map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const setCurrentTime = (index) => {
    if (videoRef.current) {
      const currentTime = formatTime(videoRef.current.currentTime);
      updateSplit(index, "startTime", currentTime);
    }
  };

  const setCurrentEndTime = (index) => {
    if (videoRef.current) {
      const currentTime = formatTime(videoRef.current.currentTime);
      updateSplit(index, "endTime", currentTime);
    }
  };

  const processVideo = async () => {
    if (!video || !ffmpeg || !loaded) return;

    setProcessing(true);
    setProgress("Starting video processing...");
    clearLogs(); // Clear previous logs

    // Set up a progress updater
    const progressInterval = setInterval(() => {
      const latestLog = getLatestLog();
      if (latestLog) {
        setProgress(latestLog);
      }
    }, 500);

    try {
      // Write input video to FFmpeg filesystem
      const inputData = new Uint8Array(await video.arrayBuffer());
      const inputExtension = video.name.split(".").pop().toLowerCase();
      const inputFileName = `input.${inputExtension}`;
      await ffmpeg.writeFile(inputFileName, inputData);

      // Process each split
      for (let i = 0; i < splits.length; i++) {
        const split = splits[i];
        const outputName = `${split.name}.mp4`;

        setProgress(`Processing ${split.name}... (${i + 1}/${splits.length})`);

        // FFmpeg command to split video
        await ffmpeg.exec([
          "-i",
          inputFileName,
          "-ss",
          split.startTime,
          "-to",
          split.endTime,
          "-c",
          "copy",
          "-avoid_negative_ts",
          "make_zero",
          outputName,
        ]);

        // Read the output file and create download
        const data = await ffmpeg.readFile(outputName);
        const blob = new Blob([data.buffer], { type: "video/mp4" });
        const url = URL.createObjectURL(blob);

        // Trigger download
        const a = document.createElement("a");
        a.href = url;
        a.download = outputName;
        a.click();
        URL.revokeObjectURL(url);

        // Clean up
        await ffmpeg.deleteFile(outputName);
      }

      // Clean up input file
      await ffmpeg.deleteFile(inputFileName);
      setProgress("All segments processed successfully!");
    } catch (error) {
      console.error("Error processing video:", error);
      setProgress(`Error: ${error.message}`);
    } finally {
      clearInterval(progressInterval);
      setProcessing(false);
    }
  };

  return (
    <div className="video-splitter-page">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Video Splitter</h1>
        <p className="page-subtitle">
          Split your videos into multiple segments with precise timing
        </p>
      </div>

      {/* Main Content */}
      <div className={`content-wrapper ${video ? "has-media" : ""}`}>
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
              accept=".mp4,.mov,.m4v,.webm"
              onChange={handleVideoUpload}
              className="file-input"
              id="video-upload"
            />
            <label htmlFor="video-upload" className="file-label">
              <FaUpload />
              <span className="upload-text">Choose Video File</span>
              <small className="upload-hint">
                Supports MP4, MOV, M4V, WebM (compatible formats only)
              </small>
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

        {/* Progress Section */}
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

        {/* Video Content */}
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
                  Use the controls to find the timestamps you want to split
                </p>
              </div>
            </div>

            {/* Splits Settings */}
            <div className="settings-card">
              <div className="card-glow"></div>
              <div className="card-header">
                <div className="card-icon">
                  <FaScissors />
                </div>
                <h2 className="card-title">Video Splits</h2>
              </div>

              <div className="settings-content">
                <div className="splits-list">
                  {splits.map((split, index) => (
                    <div key={index} className="split-item">
                      <div className="split-item-glow"></div>
                      <div className="split-controls">
                        <button
                          onClick={() => removeSplit(index)}
                          className="remove-btn"
                          disabled={splits.length === 1}
                          title="Remove split"
                        >
                          <FaTrash />
                        </button>

                        <div className="split-name">
                          <label>Segment Name</label>
                          <input
                            type="text"
                            placeholder="Segment name"
                            value={split.name}
                            onChange={(e) =>
                              updateSplit(index, "name", e.target.value)
                            }
                            className="name-input"
                          />
                        </div>

                        <div className="time-controls-row">
                          <div className="time-control">
                            <label>Start Time</label>
                            <div className="time-input-group">
                              <input
                                type="text"
                                placeholder="00:00:00"
                                value={split.startTime}
                                onChange={(e) =>
                                  updateSplit(index, "startTime", e.target.value)
                                }
                                className="time-input"
                              />
                              <button
                                onClick={() => setCurrentTime(index)}
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
                                placeholder="00:00:10"
                                value={split.endTime}
                                onChange={(e) =>
                                  updateSplit(index, "endTime", e.target.value)
                                }
                                className="time-input"
                              />
                              <button
                                onClick={() => setCurrentEndTime(index)}
                                className="time-btn"
                                disabled={!video}
                              >
                                Current
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="splits-actions">
                  <button onClick={addSplit} className="add-btn">
                    <FaPlus />
                    Add Split
                  </button>
                  <button
                    onClick={processVideo}
                    disabled={!loaded || processing || !video}
                    className="process-btn"
                  >
                    <FaScissors />
                    {processing ? "Processing..." : "Split Video"}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VideoSplitter;
