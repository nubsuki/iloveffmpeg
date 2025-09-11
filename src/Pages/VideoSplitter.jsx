import { useState, useRef } from "react";
import { useFFmpeg } from "../contexts/FFmpegContext";
import {
  FaUpload,
  FaPlay,
  FaPlus,
  FaTrash,
  FaClock,
  FaRocket,
  FaCheck,
} from "react-icons/fa";
import { FaScissors } from "react-icons/fa6";
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

  const handleVideoUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("video/")) {
      setVideo(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
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
      await ffmpeg.writeFile("input.mp4", inputData);

      // Process each split
      for (let i = 0; i < splits.length; i++) {
        const split = splits[i];
        const outputName = `${split.name}.mp4`;

        setProgress(`Processing ${split.name}... (${i + 1}/${splits.length})`);

        // FFmpeg command to split video
        await ffmpeg.exec([
          "-i",
          "input.mp4",
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
      await ffmpeg.deleteFile("input.mp4");
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
      {/* Upload Section - Centered when no video, positioned when video uploaded */}
      <div className={`upload-section ${video ? 'has-video' : ''}`}>
        <div className="upload-card">
          <div className="card-glow"></div>
          <div className="upload-header">
            <div className="upload-icon">
              <FaUpload />
            </div>
            <h2>Upload Video</h2>
          </div>

          <div className="file-upload-area">
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              className="file-input"
              id="video-upload"
            />
            <label htmlFor="video-upload" className="file-label">
              <FaUpload />
              <span>Choose Video File</span>
              <small>Supports MP4, AVI, MOV, and more</small>
            </label>
          </div>

          <div className="status-indicator">
            {loaded && (
              <div className="status success"><FaCheck/> FFmpeg loaded and ready!</div>
            )}
          </div>
        </div>
      </div>

      {/* Video Content - Only shows when video is uploaded */}
      {video && (
        <div className="video-content">
          {/* Video Preview */}
          <div className="preview-card">
            <div className="card-glow"></div>
            <div className="preview-header">
              <div className="preview-icon">
                <FaPlay />
              </div>
              <h2>Video Preview</h2>
            </div>

            <div className="video-container">
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                className="video-player"
              />
              <p className="video-hint">
                Use the video controls to find the timestamps you want to split
              </p>
            </div>
          </div>

          {/* Splits Section */}
          <div className="splits-card">
            <div className="card-glow"></div>
            <div className="splits-header">
              <div className="splits-icon">
                <FaScissors />
              </div>
              <h2>Video Splits</h2>
            </div>

            <div className="splits-list">
              {splits.map((split, index) => (
                <div key={index} className="split-item">
                  <div className="split-item-glow"></div>
                  <div className="split-controls">
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
                          <FaClock />
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
                          <FaClock />
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => removeSplit(index)}
                      className="remove-btn"
                      disabled={splits.length === 1}
                    >
                      <FaTrash />
                    </button>
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
                <FaRocket />
                {processing ? "Processing..." : "Split Video"}
              </button>
            </div>
          </div>
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

export default VideoSplitter;
