from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import yt_dlp
import os
import uuid
from datetime import datetime

app = Flask(__name__)
CORS(app)

DOWNLOAD_FOLDER = 'downloads'
if not os.path.exists(DOWNLOAD_FOLDER):
    os.makedirs(DOWNLOAD_FOLDER)

def get_video_info(url, cookies=None):
    """Get video information including available qualities"""
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
    }
    
    if cookies:
        ydl_opts['cookiefile'] = cookies
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            info = ydl.extract_info(url, download=False)
            
            formats = []
            if 'formats' in info:
                for f in info['formats']:
                    if f.get('vcodec') != 'none' and f.get('ext') in ['mp4', 'webm']:
                        formats.append({
                            'format_id': f.get('format_id'),
                            'ext': f.get('ext'),
                            'quality': f.get('format_note', 'unknown'),
                            'height': f.get('height'),
                            'width': f.get('width'),
                            'filesize': f.get('filesize'),
                            'url': f.get('url')
                        })
            
            # Get thumbnail
            thumbnail = info.get('thumbnail', '')
            
            # Get title
            title = info.get('title', 'Untitled')
            
            # Get platform
            platform = info.get('extractor_key', 'unknown')
            
            return {
                'success': True,
                'title': title,
                'thumbnail': thumbnail,
                'platform': platform,
                'formats': formats
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

def download_video(url, format_id, cookies=None):
    """Download video with specific format"""
    filename = f"{uuid.uuid4()}"
    output_path = os.path.join(DOWNLOAD_FOLDER, f"{filename}.%(ext)s")
    
    ydl_opts = {
        'format': format_id,
        'outtmpl': output_path,
        'quiet': True,
        'no_warnings': True,
    }
    
    if cookies:
        ydl_opts['cookiefile'] = cookies
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            info = ydl.extract_info(url, download=True)
            downloaded_file = ydl.prepare_filename(info)
            
            return {
                'success': True,
                'filename': os.path.basename(downloaded_file),
                'filepath': downloaded_file
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

@app.route('/api/info', methods=['POST'])
def get_info():
    """Get video information from URL"""
    data = request.json
    url = data.get('url')
    cookies = data.get('cookies')
    
    if not url:
        return jsonify({'success': False, 'error': 'URL is required'}), 400
    
    result = get_video_info(url, cookies)
    return jsonify(result)

@app.route('/api/download', methods=['POST'])
def download():
    """Download video with selected quality"""
    data = request.json
    url = data.get('url')
    format_id = data.get('format_id')
    cookies = data.get('cookies')
    
    if not url or not format_id:
        return jsonify({'success': False, 'error': 'URL and format_id are required'}), 400
    
    result = download_video(url, format_id, cookies)
    return jsonify(result)

@app.route('/api/file/<filename>', methods=['GET'])
def get_file(filename):
    """Serve downloaded file"""
    filepath = os.path.join(DOWNLOAD_FOLDER, filename)
    if os.path.exists(filepath):
        return send_file(filepath, as_attachment=True)
    return jsonify({'success': False, 'error': 'File not found'}), 404

if __name__ == '__main__':
    app.run(debug=True, port=5000)
