import React, { createContext, useContext, useState, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

const FFmpegContext = createContext();

export const useFFmpeg = () => {
  const context = useContext(FFmpegContext);
  if (!context) {
    throw new Error('useFFmpeg must be used within a FFmpegProvider');
  }
  return context;
};

export const FFmpegProvider = ({ children }) => {
  const [ffmpeg, setFFmpeg] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const loadFFmpeg = async () => {
      if (loaded || loading) return;
      
      setLoading(true);
      setError(null);

      try {
        const ffmpegInstance = new FFmpeg();

        // Set up logging
        ffmpegInstance.on('log', ({ message }) => {
          setLogs(prev => [...prev.slice(-50), message]); // Keep last 50 logs
        });

        // Load FFmpeg
        const baseURL = 'https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm';
        await ffmpegInstance.load({
          coreURL: await toBlobURL(
            `${baseURL}/ffmpeg-core.js`,
            'text/javascript'
          ),
          wasmURL: await toBlobURL(
            `${baseURL}/ffmpeg-core.wasm`,
            'application/wasm'
          ),
          workerURL: await toBlobURL(
            `${baseURL}/ffmpeg-core.worker.js`,
            'text/javascript'
          ),
        });

        setFFmpeg(ffmpegInstance);
        setLoaded(true);
      } catch (err) {
        console.error('Failed to load FFmpeg:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadFFmpeg();
  }, []);

  // Helper function to get the latest log message
  const getLatestLog = () => {
    return logs[logs.length - 1] || '';
  };

  // Helper function to clear logs
  const clearLogs = () => {
    setLogs([]);
  };

  const value = {
    ffmpeg,
    loaded,
    loading,
    error,
    logs,
    getLatestLog,
    clearLogs,
  };

  return (
    <FFmpegContext.Provider value={value}>
      {children}
    </FFmpegContext.Provider>
  );
};
