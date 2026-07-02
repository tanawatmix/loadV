import React, { useState } from 'react';
import axios from 'axios';
import { Download, Link2, Loader2, CheckCircle, XCircle, Video, X } from 'lucide-react';
import './App.css';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState(null);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [cookies, setCookies] = useState('');
  const [showCookies, setShowCookies] = useState(false);

  const getPlatformIcon = (platform) => {
    const platformLower = platform?.toLowerCase() || '';
    if (platformLower.includes('tiktok')) {
      return <Video size={24} />;
    } else if (platformLower.includes('twitter') || platformLower.includes('x')) {
      return <Link2 size={24} />;
    } else if (platformLower.includes('threads')) {
      return <Link2 size={24} />;
    }
    return <Video size={24} />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getQualityLabel = (format) => {
    if (format.height) {
      return `${format.height}p`;
    }
    return format.quality || 'Unknown';
  };

  const handleFetchInfo = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError('');
    setVideoInfo(null);
    setDownloadSuccess(false);

    try {
      const response = await axios.post(`${API_URL}/info`, { url, cookies });
      if (response.data.success) {
        setVideoInfo(response.data);
      } else {
        setError(response.data.error || 'Failed to fetch video information');
      }
    } catch (err) {
      setError('Failed to connect to server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (formatId) => {
    setDownloading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/download`, {
        url,
        format_id: formatId,
        cookies
      });

      if (response.data.success) {
        // Download the file
        const fileResponse = await axios.get(`${API_URL}/file/${response.data.filename}`, {
          responseType: 'blob'
        });

        const downloadUrl = window.URL.createObjectURL(new Blob([fileResponse.data]));
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', response.data.filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);

        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 3000);
      } else {
        setError(response.data.error || 'Download failed');
      }
    } catch (err) {
      setError('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };


  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <h1 className="title">
            <Download className="icon" size={32} />
            Social Media Downloader
          </h1>
          <p className="subtitle">Download from X, Threads, TikTok</p>
        </header>

        <div className="input-section">
          <div className="input-wrapper">
            <Link2 className="input-icon" size={20} />
            <input
              type="text"
              placeholder="Paste your link here..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleFetchInfo()}
              className="url-input"
            />
            {url && (
              <button
                onClick={() => {
                  setUrl('');
                  setVideoInfo(null);
                  setError('');
                }}
                className="clear-button"
              >
                <X size={16} />
              </button>
            )}
            <button
              onClick={handleFetchInfo}
              disabled={loading}
              className="fetch-button"
            >
              {loading ? <Loader2 className="spinner" size={20} /> : 'Fetch'}
            </button>
          </div>


        </div>

        {error && (
          <div className="error-message">
            <XCircle size={20} />
            {error}
          </div>
        )}

        {downloadSuccess && (
          <div className="success-message">
            <CheckCircle size={20} />
            Download started successfully!
          </div>
        )}

        {videoInfo && (
          <div className="video-info">
            <div className="video-header">
              <div className="platform-icon">
                {getPlatformIcon(videoInfo.platform)}
              </div>
              <div className="video-meta">
                <h3 className="video-title">{videoInfo.title}</h3>
                <span className="platform-name">{videoInfo.platform}</span>
              </div>
            </div>

            {videoInfo.thumbnail && (
              <div className="thumbnail-container">
                <img src={videoInfo.thumbnail} alt="Thumbnail" className="thumbnail" />
              </div>
            )}

            <div className="quality-section">
              <h4 className="section-title">Available Qualities</h4>
              <div className="quality-list">
                {videoInfo.formats && videoInfo.formats.length > 0 ? (
                  videoInfo.formats.map((format, index) => (
                    <div key={index} className="quality-item">
                      <div className="quality-info">
                        <span className="quality-label">{getQualityLabel(format)}</span>
                        <span className="quality-details">
                          {format.width && format.height && `${format.width}x${format.height}`}
                          {format.filesize && ` • ${formatFileSize(format.filesize)}`}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDownload(format.format_id)}
                        disabled={downloading}
                        className="download-button"
                      >
                        {downloading ? (
                          <Loader2 className="spinner" size={18} />
                        ) : (
                          <>
                            <Download size={18} />
                            Download
                          </>
                        )}
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="no-formats">No formats available</p>
                )}
              </div>
            </div>
          </div>
        )}

        <footer className="footer">
          <p>Supported platforms: X (Twitter), Threads, TikTok</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
