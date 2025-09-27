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

  // Function to check if multi-threaded FFmpeg is supported
  const isMultiThreadSupported = () => {
    const origin = window.location.origin;
    
    // Check if we're in a secure context
    if (window.isSecureContext) {
      return true;
    }
    
    // Check if it's localhost or .local domain
    if (origin.includes('localhost') || origin.includes('.local')) {
      return true;
    }
    
    // If it's an IP address without HTTPS, use single-threaded
    const isIP = /^https?:\/\/\d+\.\d+\.\d+\.\d+/.test(origin);
    if (isIP && !origin.startsWith('https://')) {
      console.warn('Using single-threaded FFmpeg due to IP access without HTTPS');
      return false;
    }
    
    return true;
  };

  useEffect(() => {
    const loadFFmpeg = async () => {
      if (loaded || loading) return;
      
      setLoading(true);
      setError(null);

      try {
        const ffmpegInstance = new FFmpeg();

        // Set up logging
        ffmpegInstance.on('log', ({ message }) => {
          setLogs(prev => [...prev.slice(-50), message]);
        });

        // Choose FFmpeg version based on environment
        const useMultiThread = isMultiThreadSupported();
        const coreType = useMultiThread ? 'core-mt' : 'core';
        const baseURL = `https://unpkg.com/@ffmpeg/${coreType}@0.12.6/dist/esm`;

        console.log(`Loading ${useMultiThread ? 'multi-threaded' : 'single-threaded'} FFmpeg`);

        // Load configuration
        const loadConfig = {
          coreURL: await toBlobURL(
            `${baseURL}/ffmpeg-core.js`,
            'text/javascript'
          ),
          wasmURL: await toBlobURL(
            `${baseURL}/ffmpeg-core.wasm`,
            'application/wasm'
          ),
        };

        // Add worker URL only for multi-threaded version
        if (useMultiThread) {
          loadConfig.workerURL = await toBlobURL(
            `${baseURL}/ffmpeg-core.worker.js`,
            'text/javascript'
          );
        }

        await ffmpegInstance.load(loadConfig);

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