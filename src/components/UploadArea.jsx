import { useState, useCallback, useEffect, useRef } from 'react';
import ColorThief from 'colorthief';

export default function UploadArea({ onColorsExtracted, onError, paletteSize = 8 }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState(null);
  const [, setDropDepth] = useState(0);
  const [activeTab, setActiveTab] = useState('upload');
  const [urlInput, setUrlInput] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const previewUrlRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Cleanup blob URLs and camera on unmount
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const setPreviewUrl = useCallback((url) => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
    previewUrlRef.current = url;
    setPreview(url);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDropDepth((prev) => prev + 1);
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDropDepth((prev) => {
      const newDepth = prev - 1;
      if (newDepth === 0) {
        setIsDragging(false);
      }
      return newDepth;
    });
  }, []);

  const processImage = useCallback(async (file) => {
    try {
      setIsProcessing(true);

      const previewUrl = URL.createObjectURL(file);
      setPreviewUrl(previewUrl);

      const img = new Image();
      img.crossOrigin = 'Anonymous';

      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Image loading timed out'));
        }, 10000);

        img.onload = () => {
          clearTimeout(timeout);
          resolve();
        };
        img.onerror = () => {
          clearTimeout(timeout);
          reject(new Error('Failed to load image'));
        };
        img.src = previewUrl;
      });

      const colorThief = new ColorThief();
      let palette;
      try {
        // Extract 16 prominent colors
        palette = colorThief.getPalette(img, paletteSize);
      } catch (err) {
        throw new Error(`Failed to extract colors: ${err.message}`);
      }

      const hexColors = palette.map(([r, g, b]) =>
        '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
      );

      onColorsExtracted(hexColors);
    } catch (err) {
      console.error('Color extraction error:', err);
      if (onError) {
        onError(err.message || 'Failed to extract colors. Please try another image.');
      }
    } finally {
      setIsProcessing(false);
    }
  }, [onColorsExtracted, onError, paletteSize, setPreviewUrl]);

  const validateAndProcessFile = useCallback((file) => {
    if (!file.type.startsWith('image/')) {
      if (onError) onError('Please provide an image file (JPG, PNG, etc.)');
      return;
    }

    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      if (onError) onError('Image size exceeds 5MB limit');
      return;
    }

    processImage(file);
  }, [processImage, onError]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setDropDepth(0);

    const file = e.dataTransfer.files[0];
    if (file) {
      validateAndProcessFile(file);
    }
  }, [validateAndProcessFile]);

  const handleFileInput = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      validateAndProcessFile(file);
    }
  }, [validateAndProcessFile]);

  const handlePaste = useCallback((e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const imageItem = Array.from(items).find(item => item.type.startsWith('image/'));
    if (imageItem) {
      const file = imageItem.getAsFile();
      if (file) {
        validateAndProcessFile(file);
      }
    }
  }, [validateAndProcessFile]);

  const handleUrlSubmit = useCallback(async () => {
    if (!urlInput.trim()) return;
    try {
      setIsProcessing(true);
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Image loading timed out')), 15000);
        img.onload = () => { clearTimeout(timeout); resolve(); };
        img.onerror = () => { clearTimeout(timeout); reject(new Error('Failed to load image from URL.')); };
        img.src = urlInput.trim();
      });
      setPreview(urlInput.trim());
      const colorThief = new ColorThief();
      const palette = colorThief.getPalette(img, paletteSize);
      const hexColors = palette.map(([r, g, b]) =>
        '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
      );
      onColorsExtracted(hexColors);
    } catch (err) {
      console.error('URL image error:', err);
      if (onError) onError(err.message || 'Failed to load image from URL.');
    } finally {
      setIsProcessing(false);
    }
  }, [urlInput, paletteSize, onColorsExtracted, onError]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsCameraActive(true);
    } catch (err) {
      console.error('Camera error:', err);
      if (onError) onError('Camera access denied or not available.');
    }
  }, [onError]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'camera-capture.png', { type: 'image/png' });
        stopCamera();
        validateAndProcessFile(file);
      }
    }, 'image/png');
  }, [validateAndProcessFile, stopCamera]);

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  return (
    <div className={`relative w-full max-w-3xl mx-auto transition-all duration-300 
      ${isDragging ? 'scale-105 shadow-2xl' : ''}`}>
      {/* Animated border gradient */}
      <div className={`absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500
        transition-opacity duration-300 ${isDragging ? 'opacity-100' : 'opacity-0'}`} />

      {/* Tab selector */}
      <div className="relative flex gap-1 mb-2 bg-white/5 dark:bg-gray-800/30 rounded-xl p-1">
        {['upload', 'url', 'camera'].map(tab => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); if (tab !== 'camera') stopCamera(); }}
            className={`flex-1 py-2 text-xs sm:text-sm rounded-lg transition-colors ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-gray-300 hover:bg-white/5'
            }`}
            aria-label={`Switch to ${tab} tab`}
          >
            {tab === 'upload' ? 'Upload' : tab === 'url' ? 'URL' : 'Camera'}
          </button>
        ))}
      </div>

      {/* URL Tab */}
      {activeTab === 'url' && (
        <div className="relative rounded-2xl bg-white/5 dark:bg-gray-800/5 backdrop-blur-sm p-4 sm:p-6 space-y-3">
          <p className="text-sm text-gray-400 text-center">Paste an image URL to extract colors</p>
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="flex-1 bg-white/10 dark:bg-gray-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
              disabled={isProcessing}
              aria-label="Image URL"
            />
            <button
              onClick={handleUrlSubmit}
              disabled={isProcessing || !urlInput.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-sm text-white transition-colors"
            >
              {isProcessing ? 'Loading...' : 'Extract'}
            </button>
          </div>
        </div>
      )}

      {/* Camera Tab */}
      {activeTab === 'camera' && (
        <div className="relative rounded-2xl bg-white/5 dark:bg-gray-800/5 backdrop-blur-sm p-4 sm:p-6 space-y-3">
          {isCameraActive ? (
            <div className="space-y-3">
              <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-lg" />
              <div className="flex gap-2 justify-center">
                <button onClick={stopCamera} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-gray-300 transition-colors" aria-label="Cancel camera">Cancel</button>
                <button onClick={capturePhoto} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm text-white transition-colors" aria-label="Capture photo">Capture</button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <button onClick={startCamera} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white transition-colors inline-flex items-center gap-2" aria-label="Open camera">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Open Camera
              </button>
              <p className="text-xs text-gray-500 mt-2">Take a photo to extract colors</p>
            </div>
          )}
        </div>
      )}

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div
          className={`relative w-full min-h-[200px] sm:min-h-[300px] rounded-2xl transition-all duration-300
            ${isDragging
              ? 'bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg'
              : 'bg-white/5 dark:bg-gray-800/5 backdrop-blur-sm'}`}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            disabled={isProcessing}
            aria-label="Upload image file"
          />

          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-6">
            {preview ? (
              <div className={`relative w-full max-w-[200px] sm:max-w-xs mx-auto aspect-square rounded-lg overflow-hidden
                transition-opacity duration-300 ${isProcessing ? 'opacity-50' : ''}`}>
                <img
                  src={preview}
                  alt="Uploaded preview"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {isProcessing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 backdrop-blur-sm bg-black/20">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent" />
                    <span className="text-sm">Extracting colors...</span>
                  </div>
                )}
              </div>
            ) : (
              <div className={`transition-transform duration-300 ${isDragging ? 'scale-110' : ''}`}>
                <div className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center
                  transition-all duration-300 ${isDragging ? 'rotate-6 scale-110' : ''}`}>
                  <svg
                    className={`w-8 h-8 sm:w-12 sm:h-12 transition-colors duration-300
                      ${isDragging ? 'text-blue-500' : 'text-gray-400'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="text-center space-y-2">
                  <p className={`text-lg sm:text-xl font-medium transition-colors duration-300
                    ${isDragging ? 'text-blue-500' : 'text-gray-300'}`}>
                    {isDragging ? 'Drop image here' : 'Drop an image or tap to upload'}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Supports JPG, PNG - Max 5MB
                  </p>
                </div>
              </div>
            )}

            {isProcessing && !preview && (
              <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm">
                <div className="flex flex-col items-center gap-3 animate-fade-slide-up">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent" />
                  <span className="text-sm text-gray-300">Processing image...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="sr-only" role="status" aria-live="polite">
        {isProcessing && 'Processing image...'}
      </div>
    </div>
  );
}
