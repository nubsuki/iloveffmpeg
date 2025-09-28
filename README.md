# ILoveFFmpeg

[![Docker](https://github.com/nubsuki/iloveffmpeg/actions/workflows/docker-image.yml/badge.svg)](https://github.com/nubsuki/iloveffmpeg/actions/workflows/docker-image.yml)
[![License](https://img.shields.io/github/license/nubsuki/iloveffmpeg)](LICENSE)
[![Stars](https://img.shields.io/github/stars/nubsuki/iloveffmpeg?style=social)](https://github.com/nubsuki/iloveffmpeg/stargazers)
[![Website](https://img.shields.io/website?url=https%3A%2F%2Filoveffmpeg.xyz)](https://iloveffmpeg.xyz)
[![BuyMeACoffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-Donate-yellow?logo=buymeacoffee)](https://buymeacoffee.com/nubsuki)


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
- Due to FFmpeg.wasm memory limitations when handling large files in the browser it may fail.

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
