import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

export default function App() {
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  // 🔹 Challenge: Load images from localStorage on initial render
  useEffect(() => {
    const savedImages = localStorage.getItem('uploaded_images');
    if (savedImages) {
      try {
        setImages(JSON.parse(savedImages));
      } catch (err) {
        console.error('Failed to parse saved images:', err);
      }
    }
  }, []);

  // Helper to save new images to state & localStorage
  const saveImageToStorage = (base64String) => {
    const updatedImages = [base64String, ...images];
    setImages(updatedImages);
    try {
      localStorage.setItem('uploaded_images', JSON.stringify(updatedImages));
    } catch (err) {
      setError('Storage limit exceeded! Image too large for LocalStorage.');
    }
  };

  // Process the selected or dropped file
  const handleFileSelection = (file) => {
    setError('');

    if (!file) return;

    // Validate File Type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Invalid file type! Please upload JPG, PNG, or GIF images only.');
      return;
    }

    // Read file using FileReader API
    const reader = new FileReader();

    reader.onload = () => {
      const base64Image = reader.result;
      simulateUpload(base64Image);
    };

    reader.onerror = () => {
      setError('Error reading file. Please try again.');
    };

    reader.readAsDataURL(file);
  };

  // Simulate progress bar using setInterval & setTimeout
  const simulateUpload = (base64Image) => {
    setUploading(true);
    setProgress(0);

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          saveImageToStorage(base64Image);
          setUploading(false);
          setProgress(0);
        }, 300);
      }
    }, 100);
  };

  // 🔹 Drag & Drop Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  // Delete image handler
  const handleDelete = (indexToDelete) => {
    const filteredImages = images.filter((_, index) => index !== indexToDelete);
    setImages(filteredImages);
    localStorage.setItem('uploaded_images', JSON.stringify(filteredImages));
  };

  // Clear all images
  const handleClearAll = () => {
    setImages([]);
    localStorage.removeItem('uploaded_images');
  };

  return (
    <div className="container">
      <main className="uploader-card">
        <h1 className="title">File Uploader 📁</h1>

        {/* Drag and Drop Zone */}
        <div
          className={`drop-zone ${isDragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileSelection(e.target.files[0])}
            accept="image/jpeg, image/png, image/gif"
            hidden
          />
          <div className="drop-icon">☁️</div>
          <p className="drop-text">
            Drag & Drop your image here, or <span className="browse-text">Browse</span>
          </p>
          <span className="file-types">Supports: JPG, PNG, GIF</span>
        </div>

        {/* Error Message */}
        {error && <div className="error-message">{error}</div>}

        {/* Simulated Progress Bar */}
        {uploading && (
          <div className="progress-container">
            <div className="progress-label">
              <span>Uploading...</span>
              <span>{progress}%</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        )}

        {/* Image Preview Gallery */}
        {images.length > 0 && (
          <div className="gallery-section">
            <div className="gallery-header">
              <h2>Uploaded Images ({images.length})</h2>
              <button onClick={handleClearAll} className="clear-btn">
                Clear All
              </button>
            </div>

            <div className="image-grid">
              {images.map((imgUrl, index) => (
                <div key={index} className="image-card">
                  <img src={imgUrl} alt={`Upload ${index}`} />
                  <button onClick={() => handleDelete(index)} className="delete-btn">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}