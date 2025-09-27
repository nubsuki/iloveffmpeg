# ILoveFFmpeg

Browser-based multimedia toolkit that runs entirely in your browser using [FFmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm). No uploads, no tracking, complete privacy - your files never leave your device.

Main reason for creating this is due to quality loss when trimming in Movies&TV player apps in Windows. Name is inspired by ILovePDF.

## ✨ Features

- **Video Splitter** - Trim or split videos into multiple segments
- **Video Converter** - Convert between formats (MP4, AVI, MOV, MKV)
- **Audio Extractor** - Extract audio tracks from video files
- **Audio Converter** - Convert between audio formats (MP3, WAV, AAC, FLAC, OGG, M4A)
- **Audio Splitter** - Trim or split audio files into segments

### Supported Formats

**Video Input**: MP4, AVI, MOV, MKV, WebM, and more
**Video Output**: MP4, AVI, MOV, MKV
**Audio Input**: MP3, WAV, AAC, FLAC, OGG, M4A, and more
**Audio Output**: MP3, WAV, AAC, FLAC, OGG, M4A

## Limitations

- Some formats are not supported due to performance limitations of FFmpeg.wasm in browser environments
- Some formats have been removed due to browser support (e.g., AVI for video splitter)
- **Multi-threaded processing**: Due to browser security restrictions, multi-threaded FFmpeg (faster processing) only works in secure contexts:
  - ✅ HTTPS with a domain
  - ✅ `localhost` access
  - ❌ IP addresses over HTTP (automatically falls back to single-threaded mode)

## Known Issues

- Sometimes when using the same media file for multiple exports, the progress bar may show as aborted but the process will finish successfully

## Support

If you find this project helpful, consider:

- ⭐ Starring the repository
- ☕ [Buying me a coffee](https://buymeacoffee.com/nubsuki)
- 🐛 Reporting bugs or suggesting features

## 🔗 Links

- **Live**: [iloveffmpeg.xyz](https://iloveffmpeg.xyz/)

---

Made by [nubsuki](https://github.com/nubsuki)
