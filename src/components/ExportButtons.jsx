import { useState, useCallback, useRef, useEffect } from 'react';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';

export default function ExportButtons({ colors, paletteRef }) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState('');
  const [hoveredButton, setHoveredButton] = useState(null);
  const [exportType, setExportType] = useState(null);
  const [exportProgress, setExportProgress] = useState(0);
  const exportTimeoutRef = useRef(null);

  const simulateProgress = useCallback(() => {
    setExportProgress(0);
    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);
    return interval;
  }, []);

  const showExportStatus = useCallback((message, type = 'success') => {
    setExportStatus({ message, type });
    if (exportTimeoutRef.current) {
      clearTimeout(exportTimeoutRef.current);
    }
    exportTimeoutRef.current = setTimeout(() => setExportStatus(''), 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (exportTimeoutRef.current) {
        clearTimeout(exportTimeoutRef.current);
      }
    };
  }, []);

  const isDarkColor = (hex) => {
    hex = hex.replace(/^#/, '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    return luminance < 150;
  };

  const handleExport = useCallback(async (type) => {
    if (isExporting) return;

    try {
      setIsExporting(true);
      setExportType(type);
      const progressInterval = simulateProgress();

      if (type === 'json') {
        const data = {
          name: 'Color Palette',
          colors,
          timestamp: new Date().toISOString(),
          metadata: {
            format: 'hex',
            count: colors.length,
          }
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: 'application/json',
        });

        setExportProgress(100);
        await saveAs(blob, 'color-palette.json');
        showExportStatus('✨ Palette exported as JSON!');
      } else if (type === 'png') {
        // Create a virtual palette container with timestamp
        const virtualContainer = document.createElement('div');
        virtualContainer.style.position = 'absolute';
        virtualContainer.style.top = '-9999px';
        virtualContainer.style.left = '-9999px';
        virtualContainer.style.padding = '24px';
        virtualContainer.style.background = '#ffffff';
        virtualContainer.style.display = 'flex';
        virtualContainer.style.flexDirection = 'column';
        virtualContainer.style.alignItems = 'center';
        virtualContainer.style.gap = '16px';
        virtualContainer.style.fontFamily = 'sans-serif';
        virtualContainer.style.width = '1000px';
      
        // Add title and timestamp at the top
        const headerDiv = document.createElement('div');
        headerDiv.style.textAlign = 'center';
        headerDiv.style.marginBottom = '16px';
        
        const titleElement = document.createElement('h2');
        titleElement.innerText = 'Color Palette';
        titleElement.style.fontSize = '24px';
        titleElement.style.fontWeight = 'bold';
        titleElement.style.marginBottom = '8px';
        titleElement.style.color = '#333333';
        
        const timestampElement = document.createElement('p');
        timestampElement.innerText = new Date().toLocaleString();
        timestampElement.style.fontSize = '14px';
        timestampElement.style.color = '#666666';
        
        headerDiv.appendChild(titleElement);
        headerDiv.appendChild(timestampElement);
        virtualContainer.appendChild(headerDiv);
      
        // Create swatches grid
        const swatchesGrid = document.createElement('div');
        swatchesGrid.style.display = 'grid';
        swatchesGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(120px, 1fr))';
        swatchesGrid.style.gap = '16px';
        swatchesGrid.style.width = '100%';
      
        colors.forEach(color => {
          const swatch = document.createElement('div');
          swatch.style.backgroundColor = color;
          swatch.style.width = '120px';
          swatch.style.height = '120px';
          swatch.style.display = 'flex';
          swatch.style.alignItems = 'center';
          swatch.style.justifyContent = 'center';
          swatch.style.borderRadius = '8px';
          swatch.style.fontSize = '14px';
          swatch.style.fontWeight = 'bold';
          swatch.style.textAlign = 'center';
          swatch.style.color = isDarkColor(color) ? '#fff' : '#000';
          swatch.innerText = color;
      
          swatchesGrid.appendChild(swatch);
        });
      
        virtualContainer.appendChild(swatchesGrid);
      
        document.body.appendChild(virtualContainer);
      
        const canvas = await html2canvas(virtualContainer, {
          backgroundColor: '#ffffff',
          scale: window.devicePixelRatio * 2,
          logging: false,
          useCORS: true,
        });
      
        document.body.removeChild(virtualContainer);
        
        canvas.toBlob((blob) => {
          if (blob) {
            setExportProgress(100);
            saveAs(blob, 'color-palette.png');
            showExportStatus('✨ Palette exported as PNG!');
          } else {
            throw new Error('Failed to create PNG');
          }
        }, 'image/png', 1.0);
      }
      
      clearInterval(progressInterval);
    } catch (err) {
      console.error(`${type.toUpperCase()} export error:`, err);
      showExportStatus(`❌ Failed to export ${type.toUpperCase()}`, 'error');
    } finally {
      setTimeout(() => {
        setIsExporting(false);
        setExportType(null);
        setExportProgress(0);
      }, 500);
    }
  }, [colors, isExporting, paletteRef, showExportStatus, simulateProgress]);

  const handleKeyDown = useCallback((e, type) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleExport(type);
    }
  }, [handleExport]);

  return (
    <div className="w-full max-w-4xl mx-auto mt-4 sm:mt-8 space-y-4 sm:space-y-6 p-2 sm:p-0">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        {/* JSON Export Button */}
        <button
          onClick={() => handleExport('json')}
          onKeyDown={(e) => handleKeyDown(e, 'json')}
          disabled={isExporting}
          onMouseEnter={() => setHoveredButton('json')}
          onMouseLeave={() => setHoveredButton(null)}
          onFocus={() => setHoveredButton('json')}
          onBlur={() => setHoveredButton(null)}
          className="flex-1 relative group focus-ring"
          aria-label={`Export as JSON${isExporting ? ' (processing)' : ''}`}
          role="button"
          tabIndex={0}
        >
          <div className="absolute inset-0 opacity-50 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl" />
          <div className="absolute inset-0 backdrop-blur-[2px] rounded-xl" />
          <div className={`relative h-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl
            transition-all duration-300 
            backdrop-blur-sm border border-white/10
            hover-lift
            ${isExporting && exportType === 'json' ? 'opacity-70' : ''}
            ${hoveredButton === 'json' ? 'bg-white/10' : 'bg-white/5'}
            dark:hover:bg-white/15`}
          >
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <div className={`rounded-lg p-1.5 sm:p-2 transition-colors duration-300
                ${hoveredButton === 'json' ? 'bg-blue-500/20' : 'bg-white/10'}`}
              >
                {isExporting && exportType === 'json' ? (
                  <div className="w-4 h-4 sm:w-5 sm:h-5 relative">
                    <svg className="animate-spin absolute inset-0" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] sm:text-xs font-medium">
                      {exportProgress}%
                    </span>
                  </div>
                ) : (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                )}
              </div>
              <span className="font-medium text-sm sm:text-base text-white">
                {isExporting && exportType === 'json' ? 'Exporting...' : 'Export as JSON'}
              </span>
            </div>

            {/* Hover effect particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
              {hoveredButton === 'json' && [...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-blue-500 rounded-full animate-float"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${3 + Math.random() * 2}s`
                  }}
                />
              ))}
            </div>
          </div>
        </button>

        {/* PNG Export Button */}
        <button
          onClick={() => handleExport('png')}
          onKeyDown={(e) => handleKeyDown(e, 'png')}
          disabled={isExporting}
          onMouseEnter={() => setHoveredButton('png')}
          onMouseLeave={() => setHoveredButton(null)}
          onFocus={() => setHoveredButton('png')}
          onBlur={() => setHoveredButton(null)}
          className="flex-1 relative group focus-ring"
          aria-label={`Export as PNG${isExporting ? ' (processing)' : ''}`}
          role="button"
          tabIndex={0}
        >
          <div className="absolute inset-0 opacity-50 bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl" />
          <div className="absolute inset-0 backdrop-blur-[2px] rounded-xl" />
          <div className={`relative h-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl
            transition-all duration-300 
            backdrop-blur-sm border border-white/10
            hover-lift
            ${isExporting && exportType === 'png' ? 'opacity-70' : ''}
            ${hoveredButton === 'png' ? 'bg-white/10' : 'bg-white/5'}
            dark:hover:bg-white/15`}
          >
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <div className={`rounded-lg p-1.5 sm:p-2 transition-colors duration-300
                ${hoveredButton === 'png' ? 'bg-purple-500/20' : 'bg-white/10'}`}
              >
                {isExporting && exportType === 'png' ? (
                  <div className="w-4 h-4 sm:w-5 sm:h-5 relative">
                    <svg className="animate-spin absolute inset-0" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] sm:text-xs font-medium">
                      {exportProgress}%
                    </span>
                  </div>
                ) : (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
              <span className="font-medium text-sm sm:text-base text-white">
                {isExporting && exportType === 'png' ? 'Exporting...' : 'Export as PNG'}
              </span>
            </div>

            {/* Hover effect particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
              {hoveredButton === 'png' && [...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-purple-500 rounded-full animate-float"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${3 + Math.random() * 2}s`
                  }}
                />
              ))}
            </div>
          </div>
        </button>
      </div>

      {/* Export Status Message */}
      {exportStatus && (
        <div className="flex justify-center">
          <div className={`px-3 sm:px-4 py-2 sm:py-3 rounded-xl animate-fade-slide-up backdrop-blur-sm
            text-sm sm:text-base
            ${exportStatus.type === 'error' 
              ? 'bg-red-500/10 border border-red-500/20 text-red-500' 
              : 'bg-green-500/10 border border-green-500/20 text-green-500'}`}
            role="status"
            aria-live="polite"
          >
            {exportStatus.message}
          </div>
        </div>
      )}
    </div>
  );
}