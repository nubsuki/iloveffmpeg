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
import styles from "./VideoConverter.module.css";

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

  // Check if video format is browser-compatible for preview
  const isBrowserCompatible = (fileName) => {
    const name = fileName.toLowerCase();
    const browserCompatibleExtensions = ['.mp4', '.mov', '.m4v', '.webm'];
    return browserCompatibleExtensions.some(ext => name.endsWith(ext));
  };

  // Check if output format is browser-compatible
  const isOutputFormatCompatible = (format) => {
    const browserCompatibleFormats = ['mp4', 'mov', 'm4v', 'webm'];
    return browserCompatibleFormats.includes(format.toLowerCase());
  };

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
    <div className={styles.videoConverterPage}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Video Converter</h1>
        <p className={styles.pageSubtitle}>Convert videos between different container formats with lossless quality preservation</p>
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
            <h2 className={styles.cardTitle}>Upload Video</h2>
          </div>

          <div className={styles.fileUploadArea}>
            <input
              type="file"
              accept=".mp4,.mkv,.avi,.mov,.m4v,.3gp"
              onChange={handleVideoUpload}
              className={styles.fileInput}
              id="video-upload"
            />
            <label htmlFor="video-upload" className={styles.fileLabel}>
              <FaUpload />
              <span className={styles.uploadText}>Choose Video File</span>
              <small className={styles.uploadHint}>Supports MP4, MKV, AVI, MOV (lossless conversion only)</small>
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

        {/* Video Preview & Settings */}
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
                {isBrowserCompatible(video.name) ? (
                  <>
                    <video
                      ref={videoRef}
                      src={videoUrl}
                      controls
                      className={styles.mediaPlayer}
                    />
                    <p className={styles.mediaHint}>
                      Preview your video before conversion
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
                      The video will be converted successfully.
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
                <h2 className={styles.cardTitle}>Conversion Settings</h2>
              </div>

              <div className={styles.settingsContent}>
                {/* Format Selection */}
                <div className={styles.settingGroup}>
                  <label className={styles.settingLabel}>Output Format</label>
                  <div className={styles.formatOptions}>
                    {formatOptions.map((format) => (
                      <button
                        key={format.value}
                        onClick={() => setOutputFormat(format.value)}
                        className={`${styles.formatBtn} ${outputFormat === format.value ? styles.active : ''}`}
                      >
                        <span className={styles.formatName}>{format.label}</span>
                        <span className={styles.formatDesc}>{format.description}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conversion Info */}
                <div className={styles.conversionInfo}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Conversion Type:</span>
                    <span className={styles.infoValue}>Lossless Container Change</span>
                  </div>
                  <div className={styles.infoNote}>
                    <small>✨ No quality loss - only changing the container format</small>
                  </div>
                </div>

                {/* Convert Button */}
                <div className={styles.convertAction}>
                  <button
                    onClick={convertVideo}
                    disabled={!loaded || processing || !video}
                    className={styles.convertBtn}
                  >
                    <FaExchangeAlt />
                    {processing ? "Converting..." : "Convert Video"}
                  </button>
                </div>
              </div>
            </div>

            {/* Video Result */}
            {convertedVideoUrl && (
              <div className={styles.resultCard}>
                <div className={styles.cardGlow}></div>
                <div className={styles.cardHeader}>
                  <div className={styles.cardIcon}>
                    <FaVideo />
                  </div>
                  <h2 className={styles.cardTitle}>Converted Video</h2>
                </div>

                <div className={styles.resultContent}>
                  {isOutputFormatCompatible(outputFormat) ? (
                    <video
                      ref={resultVideoRef}
                      src={convertedVideoUrl}
                      controls
                      className={styles.resultVideo}
                    />
                  ) : (
                    <div className={styles.unsupportedPreview}>
                      <div className={styles.unsupportedIcon}>
                        <FaVideo />
                      </div>
                      <p className={styles.unsupportedText}>
                        <strong>converted_video.{outputFormat}</strong>
                      </p>
                      <p className={styles.unsupportedHint}>
                        Browser preview not supported for {outputFormat.toUpperCase()} format. 
                        Download the file to view it in a media player.
                      </p>
                    </div>
                  )}
                  
                  <div className={styles.resultActions}>
                    <button onClick={downloadVideo} className={styles.downloadBtn}>
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