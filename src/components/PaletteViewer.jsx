import { useState, useCallback, useRef, useEffect, useMemo, memo } from 'react';
import { getContrastText, formatColor } from '../utils/color.js';
import { getNearestColorName } from '../utils/colorNames.js';

const PaletteViewer = memo(function PaletteViewer({ colors, onColorsChange, colorFormat = 'hex' }) {
  const [copiedColor, setCopiedColor] = useState(null);
  const [hoveredColor, setHoveredColor] = useState(null);
  const [isCopyNotificationVisible, setIsCopyNotificationVisible] = useState(false);
  const [focusedColorIndex, setFocusedColorIndex] = useState(-1);
  const colorRefs = useRef(new Map());

  const particleDataMap = useMemo(() => {
    return colors.map(() =>
      [...Array(5)].map(() => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: `${Math.random() * 2}s`,
        duration: `${2 + Math.random()}s`,
      }))
    );
  }, [colors]);

  const copyToClipboard = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedColor(text);
      setIsCopyNotificationVisible(true);
      setTimeout(() => {
        setCopiedColor(null);
        setIsCopyNotificationVisible(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  const copyAllColors = useCallback(async () => {
    const allColors = colors.map(c => formatColor(c, colorFormat)).join('\n');
    await copyToClipboard(allColors);
  }, [colors, colorFormat, copyToClipboard]);

  const handleRemove = useCallback((index) => {
    if (onColorsChange && colors.length > 1) {
      onColorsChange(colors.filter((_, i) => i !== index));
    }
  }, [colors, onColorsChange]);

  const handleKeyDown = useCallback((e, index) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      copyToClipboard(formatColor(colors[index], colorFormat));
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      handleRemove(index);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = (index + 1) % colors.length;
      const nextButton = colorRefs.current.get(nextIndex);
      nextButton?.focus();
      setFocusedColorIndex(nextIndex);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = (index - 1 + colors.length) % colors.length;
      const prevButton = colorRefs.current.get(prevIndex);
      prevButton?.focus();
      setFocusedColorIndex(prevIndex);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const cols = window.innerWidth >= 768 ? 8 : window.innerWidth >= 640 ? 4 : 2;
      const offset = e.key === 'ArrowUp' ? -cols : cols;
      const targetIndex = (index + offset + colors.length) % colors.length;
      const targetButton = colorRefs.current.get(targetIndex);
      targetButton?.focus();
      setFocusedColorIndex(targetIndex);
    }
  }, [colors, colorFormat, copyToClipboard, handleRemove]);

  useEffect(() => {
    // Reset focus management when colors change
    setFocusedColorIndex(-1);
    colorRefs.current = new Map();
  }, [colors]);

  return (
    <div className="relative w-full max-w-4xl mx-auto space-y-3">
      <div className="flex justify-end">
        <button onClick={copyAllColors}
          className="text-xs px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-gray-400 hover:text-white transition-colors"
          aria-label="Copy all colors">
          Copy All
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 sm:gap-3" role="grid">
        {colors.map((color, index) => {
          const contrastText = getContrastText(color);
          const isFocused = index === focusedColorIndex;
          const colorName = getNearestColorName(color);
          const displayValue = formatColor(color, colorFormat);
          const particles = particleDataMap[index] || [];

          return (
            <div key={`${color}-${index}`} className="relative group animate-scale-up" role="gridcell">
              <button
                ref={el => colorRefs.current.set(index, el)}
                onClick={() => copyToClipboard(displayValue)}
                onMouseEnter={() => setHoveredColor(color)}
                onMouseLeave={() => setHoveredColor(null)}
                onFocus={() => { setHoveredColor(color); setFocusedColorIndex(index); }}
                onBlur={() => { setHoveredColor(null); if (focusedColorIndex === index) setFocusedColorIndex(-1); }}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-full aspect-square rounded-lg sm:rounded-xl transition-all duration-300 hover-lift relative overflow-hidden"
                style={{ backgroundColor: color, animationDelay: `${index * 0.05}s` }}
                aria-label={`${colorName} (${displayValue}). Press Enter to copy. Arrow keys to navigate.`}
                tabIndex={0}
              >
                {(hoveredColor === color || isFocused) && (
                  <div className="absolute inset-0 overflow-hidden rounded-lg sm:rounded-xl">
                    {particles.map((p, i) => (
                      <div key={i} className="absolute w-1 h-1 rounded-full bg-current opacity-20"
                        style={{ left: p.left, top: p.top, color: contrastText,
                          animation: `float ${p.duration} ease-in-out infinite`, animationDelay: p.delay }} />
                    ))}
                  </div>
                )}

                <div className={`absolute inset-0 flex flex-col items-center justify-center font-mono text-xs font-medium tracking-wider transition-all duration-300 rounded-lg sm:rounded-xl backdrop-blur-[2px] ${
                  (hoveredColor === color || isFocused) ? 'bg-black/5 opacity-100' : 'opacity-0'}`}
                  style={{ color: contrastText }}>
                  <span className="drop-shadow-sm text-[10px] sm:text-xs">{displayValue}</span>
                  <span className="drop-shadow-sm text-[8px] sm:text-[10px] mt-0.5 opacity-70">{colorName}</span>
                </div>

                {copiedColor === displayValue && (
                  <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm rounded-lg sm:rounded-xl bg-black/10">
                    <div className="px-1 py-1 rounded-md text-xs font-medium animate-fade-slide-up"
                      style={{ color: contrastText }} role="status" aria-live="polite">Copied!</div>
                  </div>
                )}

                {(hoveredColor === color || isFocused) && copiedColor !== displayValue && (
                  <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 z-10 px-2 py-1 rounded-lg bg-gray-900 text-white text-[10px] whitespace-nowrap pointer-events-none"
                    role="tooltip">Click to copy</div>
                )}
              </button>

              {/* Remove button */}
              <button onClick={() => handleRemove(index)}
                className="absolute top-0.5 right-0.5 p-0.5 rounded-full opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity"
                style={{ color: contrastText }} aria-label={`Remove ${colorName}`}>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>

      <div className="sr-only" role="status" aria-live="polite">
        {isCopyNotificationVisible && 'Color copied to clipboard'}
      </div>
      <div className="sr-only" role="note">
        Use arrow keys to navigate between colors. Press Enter or Space to copy. Delete to remove.
      </div>
    </div>
  );
});

export default PaletteViewer;
