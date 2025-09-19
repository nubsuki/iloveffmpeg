import { useState, useRef } from "react";
import { useFFmpeg } from "../contexts/FFmpegContext";
import {
  FaUpload,
  FaPlus,
  FaTrash,
  FaCheck,
  FaMusic,
  FaVolumeUp,
} from "react-icons/fa";
import { FaScissors } from "react-icons/fa6";
import { TbProgressBolt } from "react-icons/tb";
import styles from "./AudioSplitter.module.css";

const AudioSplitter = () => {
  const [audio, setAudio] = useState(null);
  const [audioUrl, setAudioUrl] = useState("");
  const { ffmpeg, loaded, getLatestLog, clearLogs } = useFFmpeg();
  const [splits, setSplits] = useState([
    { startTime: "00:00:00", endTime: "00:00:10", name: "segment_1" },
  ]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState("");
  const audioRef = useRef(null);

  // Check if audio format is compatible for preview
  const isBrowserCompatible = (fileName) => {
    const name = fileName.toLowerCase();
    const browserCompatibleExtensions = ['.mp3', '.wav', '.m4a', '.aac', '.ogg'];
    return browserCompatibleExtensions.some(ext => name.endsWith(ext));
  };

  const handleAudioUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("audio/")) {
      setAudio(file);
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
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
    if (audioRef.current) {
      const currentTime = formatTime(audioRef.current.currentTime);
      updateSplit(index, "startTime", currentTime);
    }
  };

  const setCurrentEndTime = (index) => {
    if (audioRef.current) {
      const currentTime = formatTime(audioRef.current.currentTime);
      updateSplit(index, "endTime", currentTime);
    }
  };

  const processAudio = async () => {
    if (!audio || !ffmpeg || !loaded) return;

    setProcessing(true);
    setProgress("Starting audio processing...");
    clearLogs(); // Clear previous logs

    // Set up a progress updater
    const progressInterval = setInterval(() => {
      const latestLog = getLatestLog();
      if (latestLog) {
        setProgress(latestLog);
      }
    }, 500);

    try {
      // Write input audio to FFmpeg filesystem
      const inputData = new Uint8Array(await audio.arrayBuffer());
      const inputExtension = audio.name.split(".").pop().toLowerCase();
      const inputFileName = `input.${inputExtension}`;
      await ffmpeg.writeFile(inputFileName, inputData);

      // Process each split
      for (let i = 0; i < splits.length; i++) {
        const split = splits[i];
        const outputName = `${split.name}.mp3`;

        setProgress(`Processing ${split.name}... (${i + 1}/${splits.length})`);

        // FFmpeg command to split audio
        await ffmpeg.exec([
          "-i",
          inputFileName,
          "-ss",
          split.startTime,
          "-to",
          split.endTime,
          "-c:a",
          "libmp3lame",
          "-b:a",
          "192k",
          "-avoid_negative_ts",
          "make_zero",
          outputName,
        ]);

        // Read the output file and create download
        const data = await ffmpeg.readFile(outputName);
        const blob = new Blob([data.buffer], { type: "audio/mp3" });
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
      console.error("Error processing audio:", error);
      setProgress(`Error: ${error.message}`);
    } finally {
      clearInterval(progressInterval);
      setProcessing(false);
    }
  };

  return (
    <div className={styles.audioSplitterPage}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Audio Splitter</h1>
        <p className={styles.pageSubtitle}>
          Split your audio files into multiple segments with precise timing
        </p>
      </div>

      {/* Main Content */}
      <div className={`${styles.contentWrapper} ${audio ? styles.hasMedia : ""}`}>
        {/* Upload Section */}
        <div className={styles.uploadCard}>
          <div className={styles.cardGlow}></div>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}>
              <FaUpload />
            </div>
            <h2 className={styles.cardTitle}>Upload Audio</h2>
          </div>

          <div className={styles.fileUploadArea}>
            <input
              type="file"
              accept="audio/*"
              onChange={handleAudioUpload}
              className={styles.fileInput}
              id="audio-upload"
            />
            <label htmlFor="audio-upload" className={styles.fileLabel}>
              <FaMusic />
              <span className={styles.uploadText}>Choose Audio File</span>
              <small className={styles.uploadHint}>
                Supports MP3, WAV, AAC, M4A, OGG, FLAC and other audio formats
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
        {progress && audio && (
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

        {/* Audio Content */}
        {audio && (
          <>
            {/* Audio Preview */}
            <div className={styles.previewCard}>
              <div className={styles.cardGlow}></div>
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>
                  <FaVolumeUp />
                </div>
                <h2 className={styles.cardTitle}>Audio Preview</h2>
              </div>

              <div className={styles.mediaContainer}>
                {isBrowserCompatible(audio.name) || audio.type.startsWith("audio/") ? (
                  <>
                    <audio
                      ref={audioRef}
                      src={audioUrl}
                      controls
                      className={styles.audioSplitterMediaPlayer}
                    />
                    <p className={styles.mediaHint}>
                      Use the controls to find the timestamps you want to split
                    </p>
                  </>
                ) : (
                  <div className={styles.unsupportedPreview}>
                    <div className={styles.unsupportedIcon}>
                      <FaMusic />
                    </div>
                    <p className={styles.unsupportedText}>
                      <strong>{audio.name}</strong>
                    </p>
                    <p className={styles.unsupportedHint}>
                      Browser preview not supported for this format. 
                      Audio will be split successfully.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Splits Settings */}
            <div className={styles.settingsCard}>
              <div className={styles.cardGlow}></div>
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>
                  <FaScissors />
                </div>
                <h2 className={styles.cardTitle}>Audio Splits</h2>
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
                                disabled={!audio}
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
                                disabled={!audio}
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
                    onClick={processAudio}
                    disabled={!loaded || processing || !audio}
                    className={styles.processBtn}
                  >
                    <FaScissors />
                    {processing ? "Processing..." : "Split Audio"}
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

export default AudioSplitter;
