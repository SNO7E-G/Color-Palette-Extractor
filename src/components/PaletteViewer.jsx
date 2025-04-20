import { useState, useCallback, useRef, useEffect } from 'react';

export default function PaletteViewer({ colors }) {
  const [copiedColor, setCopiedColor] = useState(null);
  const [hoveredColor, setHoveredColor] = useState(null);
  const [isCopyNotificationVisible, setIsCopyNotificationVisible] = useState(false);
  const [focusedColorIndex, setFocusedColorIndex] = useState(-1);
  const colorRefs = useRef(new Map());

  const copyToClipboard = useCallback(async (color) => {
    try {
      await navigator.clipboard.writeText(color);
      setCopiedColor(color);
      setIsCopyNotificationVisible(true);
      setTimeout(() => {
        setCopiedColor(null);
        setIsCopyNotificationVisible(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  const getLuminance = useCallback((hexColor) => {
    const rgb = hexColor.match(/[A-Za-z0-9]{2}/g).map(v => parseInt(v, 16));
    return (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
  }, []);

  const getContrastText = useCallback((hexColor) => {
    return getLuminance(hexColor) > 0.5 ? '#000000' : '#FFFFFF';
  }, [getLuminance]);

  const handleKeyDown = useCallback((e, index) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      copyToClipboard(colors[index]);
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
  }, [colors, copyToClipboard]);

  useEffect(() => {
    // Reset focus management when colors change
    setFocusedColorIndex(-1);
    colorRefs.current = new Map();
  }, [colors]);

  return (
    <div className="relative w-full max-w-4xl mx-auto" role="grid">
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 sm:gap-4"
        role="row">
        {colors.map((color, index) => {
          const contrastText = getContrastText(color);
          const delay = index * 0.1;
          const isFocused = index === focusedColorIndex;

          return (
            <button
              key={color}
              ref={el => colorRefs.current.set(index, el)}
              onClick={() => copyToClipboard(color)}
              onMouseEnter={() => setHoveredColor(color)}
              onMouseLeave={() => setHoveredColor(null)}
              onFocus={() => {
                setHoveredColor(color);
                setFocusedColorIndex(index);
              }}
              onBlur={() => {
                setHoveredColor(null);
                if (focusedColorIndex === index) {
                  setFocusedColorIndex(-1);
                }
              }}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="relative group animate-scale-up focus-ring"
              style={{ 
                animationDelay: `${delay}s`,
                backgroundColor: color,
              }}
              aria-label={`Color ${color}. Press Enter or Space to copy. Use arrow keys to navigate.`}
              role="gridcell"
              tabIndex={0}
            >
              {/* Color swatch */}
              <div className={`
                aspect-square rounded-lg sm:rounded-xl transition-all duration-300
                hover-lift group-focus:scale-95
                ${hoveredColor === color ? 'scale-95' : 'scale-100'}
                ${copiedColor === color ? 'ring-4 ring-white/50 dark:ring-white/30' : ''}
                ${isFocused ? 'ring-2 ring-white/70 dark:ring-white/50' : ''}
              `}>
                {/* Floating particles on hover/focus */}
                {(hoveredColor === color || isFocused) && (
                  <div className="absolute inset-0 overflow-hidden rounded-lg sm:rounded-xl">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-1 h-1 rounded-full bg-current opacity-20"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                          color: contrastText,
                          animation: `float ${2 + Math.random()}s ease-in-out infinite`,
                          animationDelay: `${Math.random()}s`,
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Color value display */}
                <div className={`
                  absolute inset-0 flex items-center justify-center
                  font-mono text-xs sm:text-sm font-medium tracking-wider
                  transition-all duration-300 rounded-lg sm:rounded-xl backdrop-blur-[2px]
                  ${(hoveredColor === color || isFocused) ? 'bg-current/5 opacity-100' : 'opacity-0'}
                `}
                style={{ color: contrastText }}
                >
                  <span className="drop-shadow-sm">
                    {color.toUpperCase()}
                  </span>
                </div>

                {/* Copy feedback */}
                {copiedColor === color && (
                  <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm rounded-lg sm:rounded-xl bg-current/10">
                    <div className="px-1 py-1 rounded-md text-xs sm:text-sm font-medium animate-fade-slide-up"
                      style={{ color: contrastText }}
                      role="status"
                      aria-live="polite">
                      Copied!
                    </div>
                  </div>
                )}
              </div>

              {/* Tooltip */}
              <div className={`
                absolute -bottom-8 sm:-bottom-12 left-1/2 -translate-x-1/2 z-10
                px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg
                bg-gray-900 text-white text-xs sm:text-sm
                opacity-0 transition-opacity duration-200
                pointer-events-none whitespace-nowrap
                ${hoveredColor === color || isFocused ? 'opacity-100' : ''}
              `}
                role="tooltip">
                Click to copy
              </div>
            </button>
          );
        })}
      </div>

      {/* Global copy notification for screen readers */}
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
      >
        {isCopyNotificationVisible && 'Color copied to clipboard'}
      </div>

      {/* Keyboard navigation instructions */}
      <div className="sr-only" role="note">
        Use arrow keys to navigate between colors. Press Enter or Space to copy a color.
      </div>
    </div>
  );
}