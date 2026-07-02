# Social Media Downloader

Download videos and images from Facebook, Instagram, X (Twitter), Threads, and TikTok with quality selection.

## Features

- Support for multiple platforms: Facebook, Instagram, X, Threads, TikTok
- Quality selection for downloads
- Preview thumbnails before downloading
- Clean, modern UI
- Real-time download progress

## Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- pip and npm

## Installation

### Backend Setup

1. Navigate to the project directory:
```bash
cd game
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Start the backend server:
```bash
cd backend
python app.py
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## Usage

1. Open your browser and go to `http://localhost:3000`
2. Paste a video/image URL from any supported platform
3. Click "Fetch" to get available qualities
4. Select your preferred quality
5. Click "Download" to save the file

## Supported Platforms

- Facebook
- Instagram
- X (Twitter)
- Threads
- TikTok

## Technical Details

- **Backend**: Flask with yt-dlp for video extraction
- **Frontend**: React with modern UI components
- **Styling**: Custom CSS with gradient design
- **Icons**: Lucide React

## Notes

- Some platforms may have restrictions on downloading
- Download speed depends on your internet connection
- Make sure both backend and frontend are running before use
