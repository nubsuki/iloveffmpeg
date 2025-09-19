import { useState, useRef } from "react";
import { useFFmpeg } from "../contexts/FFmpegContext";
import {
  FaUpload,
  FaPlay,
  FaDownload,
  FaMusic,
  FaCog,
  FaCheck,
  FaVideo,
} from "react-icons/fa";
import { FaWaveSquare } from "react-icons/fa6";
import { TbProgressBolt } from "react-icons/tb";
import styles from "./AudioExtractor.module.css";

const AudioExtractor = () => {
  const [video, setVideo] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const { ffmpeg, loaded, getLatestLog, clearLogs } = useFFmpeg();
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState("");
  const [audioFormat, setAudioFormat] = useState("mp3");
  const [audioQuality, setAudioQuality] = useState("192k");
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

  // Check if video format is browser-compatible for preview
  const isBrowserCompatible = (fileName) => {
    const name = fileName.toLowerCase();
    const browserCompatibleExtensions = ['.mp4', '.mov', '.m4v', '.webm'];
    return browserCompatibleExtensions.some(ext => name.endsWith(ext));
  };

  const handleVideoUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("video/")) {
      setVideo(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setAudioUrl(""); // Reset previous audio
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

      ffmpegArgs.push("-threads", "0");

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
    <div className={styles.audioExtractorPage}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Audio Extractor</h1>
        <p className={styles.pageSubtitle}>Extract high-quality audio from any video or audio file</p>
      </div>

      {/* Main Content */}
      <div className={`${styles.contentWrapper} ${video ? styles.hasMedia : ''}`}>
        {/* Upload Section */}
        <div className={styles.uploadCard}>
          <div className={styles.cardGlow}></div>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}>
              <FaUpload />
            </div>
            <h2 className={styles.cardTitle}>Upload Media</h2>
          </div>

          <div className={styles.fileUploadArea}>
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              className={styles.fileInput}
              id="media-upload"
            />
            <label htmlFor="media-upload" className={styles.fileLabel}>
              <FaUpload />
              <span className={styles.uploadText}>Choose Video File</span>
              <small className={styles.uploadHint}>Supports MP4, AVI, MOV, MKV, and more video formats</small>
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

        {/* Progress Section*/}
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

        {/* Media Preview & Settings */}
        {video && (
          <>
            {/* Media Preview */}
            <div className={styles.previewCard}>
              <div className={styles.cardGlow}></div>
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>
                  <FaPlay />
                </div>
                <h2 className={styles.cardTitle}>Video Preview</h2>
              </div>

              <div className={styles.mediaContainer}>
                {isBrowserCompatible(video.name) ? (
                  <>
                    <video
                      ref={videoRef}
                      src={videoUrl}
                      controls
                      className={styles.mediaPlayer}
                    />
                    <p className={styles.mediaHint}>
                      Preview your video - full audio will be extracted
                    </p>
                  </>
                ) : (
                  <div className={styles.unsupportedPreview}>
                    <div className={styles.unsupportedIcon}>
                      <FaVideo />
                    </div>
                    <p className={styles.unsupportedText}>
                      <strong>{video.name}</strong>
                    </p>
                    <p className={styles.unsupportedHint}>
                      Browser preview not supported for this format. 
                      Audio will be extracted successfully.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Settings */}
            <div className={styles.settingsCard}>
              <div className={styles.cardGlow}></div>
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>
                  <FaCog />
                </div>
                <h2 className={styles.cardTitle}>Audio Settings</h2>
              </div>

              <div className={styles.settingsContent}>
                {/* Format Selection */}
                <div className={styles.settingGroup}>
                  <label className={styles.settingLabel}>Output Format</label>
                  <div className={styles.formatOptions}>
                    {formatOptions.map((format) => (
                      <button
                        key={format.value}
                        onClick={() => {
                          setAudioFormat(format.value);
                          if (qualityOptions[format.value]) {
                            setAudioQuality(qualityOptions[format.value][1].value);
                          }
                        }}
                        className={`${styles.formatBtn} ${audioFormat === format.value ? styles.active : ''}`}
                      >
                        <span className={styles.formatName}>{format.label}</span>
                        <span className={styles.formatDesc}>{format.description}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quality Selection */}
                {qualityOptions[audioFormat] && (
                  <div className={styles.settingGroup}>
                    <label className={styles.settingLabel}>Quality</label>
                    <div className={styles.qualityOptions}>
                      {qualityOptions[audioFormat].map((quality) => (
                        <button
                          key={quality.value}
                          onClick={() => setAudioQuality(quality.value)}
                          className={`${styles.qualityBtn} ${audioQuality === quality.value ? styles.active : ''}`}
                        >
                          <span className={styles.qualityName}>{quality.label}</span>
                          <span className={styles.qualityDesc}>{quality.description}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Extract Button */}
                <div className={styles.extractAction}>
                  <button
                    onClick={extractAudio}
                    disabled={!loaded || processing || !video}
                    className={styles.extractBtn}
                  >
                    <FaWaveSquare />
                    {processing ? "Extracting..." : "Extract Full Audio"}
                  </button>
                </div>
              </div>
            </div>

            {/* Audio Result */}
            {audioUrl && (
              <div className={styles.resultCard}>
                <div className={styles.cardGlow}></div>
                <div className={styles.cardHeader}>
                  <div className={styles.cardIcon}>
                    <FaMusic />
                  </div>
                  <h2 className={styles.cardTitle}>Extracted Audio</h2>
                </div>

                <div className={styles.resultContent}>
                  <audio
                    ref={audioRef}
                    src={audioUrl}
                    controls
                    className={styles.resultAudio}
                  />
                  
                  <div className={styles.resultActions}>
                    <button onClick={downloadAudio} className={styles.downloadBtn}>
                      <FaDownload />
                      Download Audio
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

export default AudioExtractor;