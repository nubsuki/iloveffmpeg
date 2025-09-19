import { useState, useRef } from "react";
import { useFFmpeg } from "../contexts/FFmpegContext";
import {
  FaUpload,
  FaPlay,
  FaDownload,
  FaMusic,
  FaCog,
  FaCheck,
  FaExchangeAlt,
} from "react-icons/fa";
import { TbProgressBolt } from "react-icons/tb";
import styles from "./AudioConverter.module.css";

const AudioConverter = () => {
  const [audio, setAudio] = useState(null);
  const [audioUrl, setAudioUrl] = useState("");
  const { ffmpeg, loaded, getLatestLog, clearLogs } = useFFmpeg();
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState("");
  const [outputFormat, setOutputFormat] = useState("mp3");
  const [audioQuality, setAudioQuality] = useState("192k");
  const [convertedAudioUrl, setConvertedAudioUrl] = useState("");
  const audioRef = useRef(null);
  const resultAudioRef = useRef(null);

  // Audio format options
  const formatOptions = [
    { value: "mp3", label: "MP3", description: "Most compatible" },
    { value: "wav", label: "WAV", description: "Uncompressed" },
    { value: "aac", label: "AAC", description: "High efficiency" },
    { value: "flac", label: "FLAC", description: "Lossless" },
    { value: "ogg", label: "OGG", description: "Open source" },
    { value: "m4a", label: "M4A", description: "Apple format" },
  ];

  // Quality options for lossy formats
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
    m4a: [
      { value: "128k", label: "128 kbps", description: "Good" },
      { value: "192k", label: "192 kbps", description: "High" },
      { value: "256k", label: "256 kbps", description: "Very High" },
    ],
    ogg: [
      { value: "6", label: "Quality 6", description: "Good (~192k)" },
      { value: "8", label: "Quality 8", description: "High (~256k)" },
      { value: "10", label: "Quality 10", description: "Maximum (~320k)" },
    ],
  };

  // Check if audio format is browser-compatible for preview
  const isBrowserCompatible = (fileName) => {
    const name = fileName.toLowerCase();
    const browserCompatibleExtensions = ['.mp3', '.wav', '.m4a', '.aac', '.ogg'];
    return browserCompatibleExtensions.some(ext => name.endsWith(ext));
  };

  // Check if output format is browser-compatible
  const isOutputFormatCompatible = (format) => {
    const browserCompatibleFormats = ['mp3', 'wav', 'm4a', 'aac', 'ogg'];
    return browserCompatibleFormats.includes(format.toLowerCase());
  };

  const handleAudioUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("audio/")) {
      // Check if it's a compatible audio format
      const fileName = file.name.toLowerCase();
      const compatibleExtensions = ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a'];
      const isCompatible = compatibleExtensions.some(ext => fileName.endsWith(ext));
      
      if (isCompatible) {
        setAudio(file);
        const url = URL.createObjectURL(file);
        setAudioUrl(url);
        setConvertedAudioUrl(""); // Reset previous conversion
      } else {
        alert('Please select a compatible audio file (MP3, WAV, FLAC, AAC, OGG, M4A).');
      }
    } else {
      alert('Please select an audio file.');
    }
  };

  const getFFmpegArgs = () => {
    if (!audio || !audio.name) {
      console.warn('Audio or audio name is undefined');
      return [];
    }
    
    const args = [];
    
    // Add format-specific arguments
    switch (outputFormat) {
      case "mp3":
        args.push("-codec:a", "libmp3lame", "-b:a", audioQuality);
        break;
      case "wav":
        args.push("-codec:a", "pcm_s16le");
        break;
      case "aac":
        args.push("-codec:a", "aac", "-b:a", audioQuality);
        break;
      case "flac":
        args.push("-codec:a", "flac");
        break;
      case "ogg":
        args.push("-codec:a", "libvorbis", "-q:a", audioQuality);
        break;
      case "m4a":
        args.push("-codec:a", "aac", "-b:a", audioQuality);
        break;
    }
    
    return args;
  };

  const convertAudio = async () => {
    if (!audio || !ffmpeg || !loaded) return;

    setProcessing(true);
    setProgress("Starting audio conversion...");
    clearLogs();

    const progressInterval = setInterval(() => {
      const latestLog = getLatestLog();
      if (latestLog) {
        setProgress(latestLog);
      }
    }, 500);

    try {
      // Write input file to FFmpeg filesystem
      const inputData = new Uint8Array(await audio.arrayBuffer());
      const inputExtension = audio.name.split('.').pop().toLowerCase();
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

      setProgress("Converting audio...");
      await ffmpeg.exec(ffmpegArgs);

      // Read the output file
      const data = await ffmpeg.readFile(outputFileName);
      const mimeType = `audio/${outputFormat === 'ogg' ? 'ogg' : outputFormat}`;
      const blob = new Blob([data.buffer], { type: mimeType });
      const url = URL.createObjectURL(blob);
      setConvertedAudioUrl(url);

      // Clean up
      await ffmpeg.deleteFile(inputFileName);
      await ffmpeg.deleteFile(outputFileName);
      
      setProgress("Audio conversion completed successfully!");
    } catch (error) {
      console.error("Error converting audio:", error);
      
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

  const downloadAudio = () => {
    if (convertedAudioUrl) {
      const a = document.createElement("a");
      a.href = convertedAudioUrl;
      a.download = `converted_audio.${outputFormat}`;
      a.click();
    }
  };

  const isLossless = (format) => {
    return ['wav', 'flac'].includes(format);
  };

  const getConversionType = () => {
    const inputExt = audio?.name?.split('.').pop().toLowerCase();
    const isInputLossless = ['wav', 'flac'].includes(inputExt);
    const isOutputLossless = isLossless(outputFormat);
    
    if (isInputLossless && isOutputLossless) {
      return "Lossless to Lossless";
    } else if (isInputLossless && !isOutputLossless) {
      return "Lossless to Compressed";
    } else if (!isInputLossless && isOutputLossless) {
      return "Compressed to Lossless";
    } else {
      return "Compressed to Compressed";
    }
  };

  return (
    <div className={styles.audioConverterPage}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Audio Converter</h1>
        <p className={styles.pageSubtitle}>Convert audio files between different formats with quality control</p>
      </div>

      {/* Main Content */}
      <div className={`${styles.contentWrapper} ${audio ? styles.hasMedia : ''}`}>
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
              <FaUpload />
              <span className={styles.uploadText}>Choose Audio File</span>
              <small className={styles.uploadHint}>Supports MP3, WAV, FLAC, AAC, OGG, M4A</small>
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

        {/* Audio Preview & Settings */}
        {audio && (
          <>
            {/* Audio Preview */}
            <div className={styles.previewCard}>
              <div className={styles.cardGlow}></div>
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>
                  <FaPlay />
                </div>
                <h2 className={styles.cardTitle}>Audio Preview</h2>
              </div>

              <div className={styles.mediaContainer}>
                {isBrowserCompatible(audio.name) ? (
                  <>
                    <audio
                      ref={audioRef}
                      src={audioUrl}
                      controls
                      className={styles.mediaPlayer}
                    />
                    <p className={styles.mediaHint}>
                      Preview your audio before conversion
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
                      The audio will be converted successfully.
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
                        onClick={() => {
                          setOutputFormat(format.value);
                          if (qualityOptions[format.value]) {
                            setAudioQuality(qualityOptions[format.value][1].value);
                          }
                        }}
                        className={`${styles.formatBtn} ${outputFormat === format.value ? styles.active : ''}`}
                      >
                        <span className={styles.formatName}>{format.label}</span>
                        <span className={styles.formatDesc}>{format.description}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quality Selection */}
                {qualityOptions[outputFormat] && (
                  <div className={styles.settingGroup}>
                    <label className={styles.settingLabel}>Quality</label>
                    <div className={styles.qualityOptions}>
                      {qualityOptions[outputFormat].map((quality) => (
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

                {/* Conversion Info */}
                <div className={styles.conversionInfo}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Conversion Type:</span>
                    <span className={styles.infoValue}>{getConversionType()}</span>
                  </div>
                  {isLossless(outputFormat) && (
                    <div className={styles.infoNote}>
                      <small>✨ Lossless format - no quality degradation</small>
                    </div>
                  )}
                  {!isLossless(outputFormat) && qualityOptions[outputFormat] && (
                    <div className={styles.infoNote}>
                      <small>🎵 Quality: {audioQuality} - adjust above for file size vs quality</small>
                    </div>
                  )}
                </div>

                {/* Convert Button */}
                <div className={styles.convertAction}>
                  <button
                    onClick={convertAudio}
                    disabled={!loaded || processing || !audio}
                    className={styles.convertBtn}
                  >
                    <FaExchangeAlt />
                    {processing ? "Converting..." : "Convert Audio"}
                  </button>
                </div>
              </div>
            </div>

            {/* Audio Result */}
            {convertedAudioUrl && (
              <div className={styles.resultCard}>
                <div className={styles.cardGlow}></div>
                <div className={styles.cardHeader}>
                  <div className={styles.cardIcon}>
                    <FaMusic />
                  </div>
                  <h2 className={styles.cardTitle}>Converted Audio</h2>
                </div>

                <div className={styles.resultContent}>
                  {isOutputFormatCompatible(outputFormat) ? (
                    <audio
                      ref={resultAudioRef}
                      src={convertedAudioUrl}
                      controls
                      className={styles.resultAudio}
                    />
                  ) : (
                    <div className={styles.unsupportedPreview}>
                      <div className={styles.unsupportedIcon}>
                        <FaMusic />
                      </div>
                      <p className={styles.unsupportedText}>
                        <strong>converted_audio.{outputFormat}</strong>
                      </p>
                      <p className={styles.unsupportedHint}>
                        Browser preview not supported for {outputFormat.toUpperCase()} format. 
                        Download the file to play it in a media player.
                      </p>
                    </div>
                  )}
                  
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

export default AudioConverter;
