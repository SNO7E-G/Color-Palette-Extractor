import { useState, useCallback, lazy, Suspense } from 'react';
import UploadArea from './components/UploadArea';
import PaletteViewer from './components/PaletteViewer';
import ExportButtons from './components/ExportButtons';
import ThemeToggle from './components/ThemeToggle';
import ErrorBoundary from './components/ErrorBoundary';
import PaletteHistory from './components/PaletteHistory';
import './App.css';

const ColorHarmony = lazy(() => import('./components/ColorHarmony'));
const AccessibilityChecker = lazy(() => import('./components/AccessibilityChecker'));
const ColorBlindnessSimulator = lazy(() => import('./components/ColorBlindnessSimulator'));
const GradientGenerator = lazy(() => import('./components/GradientGenerator'));

const COLOR_FORMATS = [
  { value: 'hex', label: 'HEX' },
  { value: 'rgb', label: 'RGB' },
  { value: 'hsl', label: 'HSL' },
  { value: 'cmyk', label: 'CMYK' },
  { value: 'tailwind', label: 'Tailwind' },
];

function App() {
  const [colors, setColors] = useState([]);
  const [error, setError] = useState(null);
  const [paletteSize, setPaletteSize] = useState(8);
  const [colorFormat, setColorFormat] = useState('hex');
  const [activeSection, setActiveSection] = useState(null);

  const handleColorsExtracted = useCallback((newColors) => {
    setError(null);
    setColors(newColors);
  }, []);

  const handleError = useCallback((errorMessage) => {
    setError(errorMessage);
    setColors([]);
  }, []);

  const handleRestorePalette = useCallback((restoredColors) => {
    setColors(restoredColors);
    setError(null);
  }, []);

  const toggleSection = useCallback((section) => {
    setActiveSection(prev => prev === section ? null : section);
  }, []);

  return (
    <ErrorBoundary>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg">
        Skip to content
      </a>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
        <div className="min-h-screen p-3 sm:p-4 md:p-8 flex flex-col items-center">
          <div className="max-w-6xl mx-auto w-full flex-1 space-y-6 sm:space-y-8 md:space-y-12">
            <header className="text-center space-y-3 sm:space-y-4 animate-fade-slide-up relative">
              <div className="absolute right-0 top-0">
                <ThemeToggle />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                <span className="inline-block animate-gradient bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent bg-[length:200%_200%]">
                  Color Palette Extractor
                </span>
              </h1>
              <p className="text-gray-400 text-xs sm:text-sm md:text-base animate-fade-slide-up" style={{ animationDelay: '0.2s' }}>
                Drop, paste, or upload an image to extract its color palette
              </p>
            </header>

            <main id="main-content" className="space-y-6 sm:space-y-8 md:space-y-12">
              {/* Palette Size Slider */}
              <div className="flex items-center justify-center gap-4 animate-fade-slide-up" style={{ animationDelay: '0.25s' }}>
                <label htmlFor="palette-size" className="text-sm text-gray-400">Colors:</label>
                <input id="palette-size" type="range" min="2" max="24" value={paletteSize}
                  onChange={(e) => setPaletteSize(Number(e.target.value))}
                  className="w-32 sm:w-48 accent-blue-500" />
                <span className="text-sm font-medium text-gray-300 w-6 text-center">{paletteSize}</span>
              </div>

              <div className="animate-fade-slide-up" style={{ animationDelay: '0.3s' }}>
                <UploadArea onColorsExtracted={handleColorsExtracted} onError={handleError} paletteSize={paletteSize} />
              </div>

              {error && (
                <div className="flex justify-center animate-fade-slide-up px-2">
                  <div className="w-full max-w-md px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm sm:text-base" role="alert">
                    {error}
                  </div>
                </div>
              )}

              {colors.length > 0 && (
                <div className="space-y-6 sm:space-y-8 md:space-y-12 animate-scale-up" style={{ animationDelay: '0.4s' }}>
                  {/* Color Format Selector */}
                  <div className="flex justify-center gap-1 flex-wrap">
                    {COLOR_FORMATS.map(fmt => (
                      <button key={fmt.value} onClick={() => setColorFormat(fmt.value)}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                          colorFormat === fmt.value ? 'bg-blue-600 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}>
                        {fmt.label}
                      </button>
                    ))}
                  </div>

                  <div className="transition-all duration-300 ease-out px-2 sm:px-0">
                    <PaletteViewer colors={colors} onColorsChange={setColors} colorFormat={colorFormat} />
                  </div>

                  <ExportButtons colors={colors} />

                  {/* Advanced Feature Toggles */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    {[
                      { key: 'harmony', label: 'Harmonies' },
                      { key: 'accessibility', label: 'Accessibility' },
                      { key: 'colorblind', label: 'Color Blindness' },
                      { key: 'gradient', label: 'Gradients' },
                    ].map(section => (
                      <button key={section.key} onClick={() => toggleSection(section.key)}
                        className={`px-4 py-2 text-sm rounded-xl transition-colors border border-white/10 ${
                          activeSection === section.key ? 'bg-blue-600/30 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                        {section.label}
                      </button>
                    ))}
                  </div>

                  <Suspense fallback={<div className="text-center text-gray-500 text-sm py-4">Loading...</div>}>
                    {activeSection === 'harmony' && <ColorHarmony colors={colors} />}
                    {activeSection === 'accessibility' && <AccessibilityChecker colors={colors} />}
                    {activeSection === 'colorblind' && <ColorBlindnessSimulator colors={colors} />}
                    {activeSection === 'gradient' && <GradientGenerator colors={colors} />}
                  </Suspense>
                </div>
              )}

              <PaletteHistory currentColors={colors} onRestorePalette={handleRestorePalette} />
            </main>

            <footer className="text-center text-gray-500 text-xs sm:text-sm mt-auto pt-6 sm:pt-8">
              <p className="max-w-md mx-auto px-4">
                Drop an image, paste from clipboard, or tap to upload.
                <br className="hidden sm:inline" />
                Supports JPG and PNG formats up to 5MB.
              </p>
              <p className="mt-2">
                &copy; {new Date().getFullYear()} <strong>Mahmoud Ashraf (SNO7E)</strong>. All rights reserved.
              </p>
            </footer>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
