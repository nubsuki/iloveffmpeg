// Maximum file size for ffmpeg.wasm
export const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB

// Format file size for display
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

// Check if file size is within limit
export const isFileSizeValid = (file) => {
  return file && file.size <= MAX_FILE_SIZE;
};

// Get error message for file size
export const getFileSizeErrorMessage = (file) => {
  if (!file) return 'No file selected';
  if (file.size > MAX_FILE_SIZE) {
    return `File size (${formatFileSize(file.size)}) exceeds the ${formatFileSize(MAX_FILE_SIZE)} limit supported in the browser version of FFmpeg. Please choose a smaller file.`;
  }
  return null;
};