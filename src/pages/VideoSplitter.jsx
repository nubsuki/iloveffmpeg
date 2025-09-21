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
import styles from "./VideoSplitter.module.css";

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
    <div className={styles.videoSplitterPage}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Video Splitter</h1>
        <p className={styles.pageSubtitle}>
          Split your videos into multiple segments with precise timing
        </p>
      </div>

      {/* Main Content */}
      <div className={`${styles.contentWrapper} ${video ? styles.hasMedia : ""}`}>
        {/* Upload Section */}
        <div className={styles.uploadCard}>
          <div className={styles.cardGlow}></div>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}>
              <FaUpload />
            </div>
            <h2 className={styles.cardTitle}>Upload Video</h2>
          </div>

          <div className={styles.fileUploadArea}>
            <input
              type="file"
              accept=".mp4,.mov,.m4v,.webm"
              onChange={handleVideoUpload}
              className={styles.fileInput}
              id="video-upload"
            />
            <label htmlFor="video-upload" className={styles.fileLabel}>
              <FaUpload />
              <span className={styles.uploadText}>Choose Video File</span>
              <small className={styles.uploadHint}>
                Supports MP4, MOV, M4V, WebM (compatible formats only)
              </small>
            </label>
          </div>

          {loaded && (
            <div className={styles.statusIndicator}>
              <div className={styles.status}>
                <FaCheck /> FFmpeg loaded and ready!
              </div>
            </div>
          )}
        </div>

        {/* Progress Section */}
        {progress && video && (
          <div className={styles.progressCard}>
            <div className={styles.cardGlow}></div>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}>
                <TbProgressBolt />
              </div>
              <h3 className={styles.cardTitle}>Processing Progress</h3>
            </div>
            <div className={styles.progressContent}>
              <div className={styles.progressText}>{progress}</div>
              {processing && (
                <div className={styles.progressBar}>
                  <div className={styles.progressFill}></div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Video Content */}
        {video && (
          <>
            {/* Video Preview */}
            <div className={styles.previewCard}>
              <div className={styles.cardGlow}></div>
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>
                  <FaPlay />
                </div>
                <h2 className={styles.cardTitle}>Video Preview</h2>
              </div>

              <div className={styles.mediaContainer}>
                <video
                  ref={videoRef}
                  src={videoUrl}
                  controls
                  className={styles.mediaPlayer}
                />
                <p className={styles.mediaHint}>
                  Use the controls to find the timestamps you want to split
                </p>
              </div>
            </div>

            {/* Splits Settings */}
            <div className={styles.settingsCard}>
              <div className={styles.cardGlow}></div>
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>
                  <FaScissors />
                </div>
                <h2 className={styles.cardTitle}>Video Splits</h2>
              </div>

              <div className={styles.settingsContent}>
                <div className={styles.splitsList}>
                  {splits.map((split, index) => (
                    <div key={index} className={styles.splitItem}>
                      <div className={styles.splitItemGlow}></div>
                      <div className={styles.splitControls}>
                        <button
                          onClick={() => removeSplit(index)}
                          className={styles.removeBtn}
                          disabled={splits.length === 1}
                          title="Remove split"
                        >
                          <FaTrash />
                        </button>

                        <div className={styles.splitName}>
                          <label>Segment Name</label>
                          <input
                            type="text"
                            placeholder="Segment name"
                            value={split.name}
                            onChange={(e) =>
                              updateSplit(index, "name", e.target.value)
                            }
                            className={styles.nameInput}
                          />
                        </div>

                        <div className={styles.timeControlsRow}>
                          <div className={styles.timeControl}>
                            <label>Start Time</label>
                            <div className={styles.timeInputGroup}>
                              <input
                                type="text"
                                placeholder="00:00:00"
                                value={split.startTime}
                                onChange={(e) =>
                                  updateSplit(index, "startTime", e.target.value)
                                }
                                className={styles.timeInput}
                              />
                              <button
                                onClick={() => setCurrentTime(index)}
                                className={styles.timeBtn}
                                disabled={!video}
                              >
                                Current
                              </button>
                            </div>
                          </div>

                          <div className={styles.timeControl}>
                            <label>End Time</label>
                            <div className={styles.timeInputGroup}>
                              <input
                                type="text"
                                placeholder="00:00:10"
                                value={split.endTime}
                                onChange={(e) =>
                                  updateSplit(index, "endTime", e.target.value)
                                }
                                className={styles.timeInput}
                              />
                              <button
                                onClick={() => setCurrentEndTime(index)}
                                className={styles.timeBtn}
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

                <div className={styles.splitsActions}>
                  <button onClick={addSplit} className={styles.addBtn}>
                    <FaPlus />
                    Add Split
                  </button>
                  <button
                    onClick={processVideo}
                    disabled={!loaded || processing || !video}
                    className={styles.processBtn}
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
