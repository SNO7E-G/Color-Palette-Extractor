import { useState, useRef, useCallback } from 'react';
import UploadArea from './components/UploadArea';
import PaletteViewer from './components/PaletteViewer';
import ExportButtons from './components/ExportButtons';
import './App.css';

function App() {
  const [colors, setColors] = useState([]);
  const [error, setError] = useState(null);
  const paletteRef = useRef(null);

  const handleColorsExtracted = useCallback((newColors) => {
    setError(null);
    setColors(newColors);
  }, []);

  const handleError = useCallback((errorMessage) => {
    setError(errorMessage);
    setColors([]);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
      <div className="min-h-screen p-3 sm:p-4 md:p-8 flex flex-col items-center">
        <div className="max-w-6xl mx-auto w-full flex-1 space-y-6 sm:space-y-8 md:space-y-12">
          {/* Header with animated gradient text */}
          <header className="text-center space-y-3 sm:space-y-4 animate-fade-slide-up">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              <span className="inline-block animate-gradient bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Color Palette Extractor
              </span>
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm md:text-base animate-fade-slide-up" 
              style={{ animationDelay: '0.2s' }}>
              Drop, paste, or upload an image to extract its color palette
            </p>
          </header>

          {/* Main content with staggered animations */}
          <main className="space-y-6 sm:space-y-8 md:space-y-12">
            {/* Upload Area */}
            <div className="animate-fade-slide-up" style={{ animationDelay: '0.3s' }}>
              <UploadArea 
                onColorsExtracted={handleColorsExtracted}
                onError={handleError}
              />
            </div>

            {/* Error display */}
            {error && (
              <div className="flex justify-center animate-fade-slide-up px-2">
                <div className="w-full max-w-md px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm sm:text-base">
                  {error}
                </div>
              </div>
            )}

            {/* Palette Display with transition */}
            {colors.length > 0 && (
              <div className="space-y-6 sm:space-y-8 md:space-y-12 animate-scale-up"
                style={{ animationDelay: '0.4s' }}
              >
                <div ref={paletteRef}
                  className="transition-all duration-300 ease-out hover:scale-[1.02] px-2 sm:px-0">
                  <PaletteViewer colors={colors} />
                </div>
                <ExportButtons colors={colors} paletteRef={paletteRef} />
              </div>
            )}
          </main>

          {/* Footer with copyright notice */}
          <footer className="text-center text-gray-500 text-xs sm:text-sm mt-auto pt-6 sm:pt-8">
            <p className="max-w-md mx-auto px-4">
                Drop an image, paste from clipboard, or tap to upload. 
              <br className="hidden sm:inline" />
                  Supports JPG and PNG formats up to 5MB.
            </p>
            <p className="mt-2">
               © {new Date().getFullYear()} <strong>Mahmoud Ashraf (SNO7E)</strong>. All rights reserved.
            </p>
         </footer>
        </div>
      </div>
    </div>
  );
}

export default App;
