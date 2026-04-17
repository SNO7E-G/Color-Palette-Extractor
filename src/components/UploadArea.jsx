import { useState, useCallback, useEffect } from 'react';
import ColorThief from 'colorthief';

export default function UploadArea({ onColorsExtracted, onError }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [dropDepth, setDropDepth] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [touchFeedback, setTouchFeedback] = useState(false);

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
    setDropDepth((prev) => prev - 1);
    if (dropDepth === 1) {
      setIsDragging(false);
    }
  }, [dropDepth]);

  const processImage = useCallback(async (file) => {
    let previewUrl = null;
    try {
      setError('');
      setIsProcessing(true);
      setLoadingProgress(0);

      // Create preview
      previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      // Simulate loading progress
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Process image with ColorThief
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          clearInterval(progressInterval);
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
        // Updated to extract more colors
        palette = colorThief.getPalette(img, 16); // Change from 8 to 12
      } catch (err) {
        throw new Error(`Failed to extract colors: ${err.message}`);
      }

      const hexColors = palette.map(([r, g, b]) => 
        '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
      );

      setLoadingProgress(100);
      onColorsExtracted(hexColors);
    } catch (err) {
      setError(err.message || 'Failed to extract colors. Please try another image.');
      console.error('Color extraction error:', err);
      if (onError) {
        onError(err);
      }
    } finally {
      // Clean up preview URL to prevent memory leak
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setIsProcessing(false);
      setLoadingProgress(0);
    }
  }, [onColorsExtracted, onError]);

  const validateAndProcessFile = useCallback((file) => {
    if (!file.type.startsWith('image/')) {
      setError('Please provide an image file (JPG, PNG, etc.)');
      return;
    }

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      setError('Image size exceeds 5MB limit');
      return;
    }

    processImage(file);
  }, [processImage]);

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

  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    setTouchFeedback(true);
    setIsDragging(true);
  }, []);

  const handleTouchEnd = useCallback((e) => {
    e.preventDefault();
    setTouchFeedback(false);
    setIsDragging(false);
  }, []);

  const handleTouchCancel = useCallback((e) => {
    e.preventDefault();
    setTouchFeedback(false);
    setIsDragging(false);
  }, []);

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  return (
    <div className={`relative w-full max-w-3xl mx-auto transition-all duration-300 
      ${isDragging ? 'scale-105 shadow-2xl' : ''}`}>
      {/* Animated border gradient */}
      <div className={`absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500
        transition-opacity duration-300 ${isDragging || touchFeedback ? 'opacity-100' : 'opacity-0'}`} />

      {/* Main upload area */}
      <div
        className={`relative w-full min-h-[200px] sm:min-h-[300px] rounded-2xl transition-all duration-300
          ${isDragging || touchFeedback
            ? 'bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg'
            : 'bg-white/5 dark:bg-gray-800/5 backdrop-blur-sm'}`}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
      >
        {/* Hidden file input */}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          disabled={isProcessing}
          aria-label="Upload image"
        />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-6">
          {preview ? (
            <div className={`relative w-full max-w-[200px] sm:max-w-xs mx-auto aspect-square rounded-lg overflow-hidden
              transition-opacity duration-300 ${isProcessing ? 'opacity-50' : ''}`}>
              <img
                src={preview}
                alt="Uploaded preview"
                className="w-full h-full object-cover"
              />
              {isProcessing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 backdrop-blur-sm bg-black/20">
                  <div className="relative w-16 h-16">
                    <svg className="absolute inset-0 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-medium">
                      {loadingProgress}%
                    </span>
                  </div>
                  <span className="text-sm">Extracting colors...</span>
                </div>
              )}
            </div>
          ) : (
            <div className={`transition-transform duration-300 ${isDragging || touchFeedback ? 'scale-110' : ''}`}>
              <div className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center
                transition-all duration-300 ${isDragging || touchFeedback ? 'rotate-6 scale-110' : ''}`}>
                <svg
                  className={`w-8 h-8 sm:w-12 sm:h-12 transition-colors duration-300
                    ${isDragging || touchFeedback ? 'text-blue-500' : 'text-gray-400'}`}
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
                  ${isDragging || touchFeedback ? 'text-blue-500' : 'text-gray-300'}`}>
                  {isDragging ? 'Drop image here' : 'Drop an image or tap to upload'}
                </p>
                <p className="text-xs sm:text-sm text-gray-500">
                  Supports JPG, PNG • Max 5MB
                </p>
              </div>
            </div>
          )}

          {/* Loading indicator (visible only during processing) */}
          {isProcessing && !preview && (
            <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3 animate-fade-slide-up">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent" />
                <span className="text-sm text-gray-300">Processing image...</span>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-[250px] sm:max-w-sm px-2">
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-3 py-2 rounded-lg text-xs sm:text-sm text-center">
                {error}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Screen reader announcements */}
      <div className="sr-only" role="status" aria-live="polite">
        {isProcessing && 'Processing image...'}
        {error && `Error: ${error}`}
      </div>
    </div>
  );
}
