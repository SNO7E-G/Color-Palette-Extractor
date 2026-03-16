import { useState, useCallback, useMemo } from 'react';

const GRADIENT_TYPES = ['linear', 'radial', 'conic'];

export default function GradientGenerator({ colors }) {
  const [gradientType, setGradientType] = useState('linear');
  const [angle, setAngle] = useState(90);
  const [selectedColors, setSelectedColors] = useState(() =>
    colors ? colors.slice(0, Math.min(3, colors.length)) : []
  );
  const [copiedCss, setCopiedCss] = useState(false);

  const gradientCss = useMemo(() => {
    if (selectedColors.length < 2) return '';

    const colorStops = selectedColors.join(', ');

    switch (gradientType) {
      case 'linear':
        return `linear-gradient(${angle}deg, ${colorStops})`;
      case 'radial':
        return `radial-gradient(circle, ${colorStops})`;
      case 'conic':
        return `conic-gradient(from ${angle}deg, ${colorStops})`;
      default:
        return `linear-gradient(${angle}deg, ${colorStops})`;
    }
  }, [selectedColors, gradientType, angle]);

  const fullCssRule = useMemo(() => {
    return `background: ${gradientCss};`;
  }, [gradientCss]);

  const toggleColor = useCallback((color) => {
    setSelectedColors(prev => {
      if (prev.includes(color)) {
        return prev.filter(c => c !== color);
      }
      return [...prev, color];
    });
  }, []);

  const copyGradientCss = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(fullCssRule);
      setCopiedCss(true);
      setTimeout(() => setCopiedCss(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [fullCssRule]);

  if (!colors || colors.length < 2) return null;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <h3 className="text-lg font-semibold text-gray-200 text-center">
        Gradient Generator
        <span className="block text-xs text-gray-500 font-normal mt-1">
          Create CSS gradients from your palette
        </span>
      </h3>

      <div className="bg-white/5 dark:bg-gray-800/30 rounded-xl p-4 space-y-4 backdrop-blur-sm border border-white/5">
        {/* Gradient Preview */}
        <div
          className="w-full h-32 sm:h-48 rounded-xl border border-white/10"
          style={{ background: gradientCss || 'transparent' }}
        />

        {/* Color Selection */}
        <div>
          <p className="text-xs text-gray-500 mb-2">Select colors (min 2):</p>
          <div className="flex gap-2 flex-wrap">
            {colors.map((color, i) => (
              <button
                key={`grad-${i}`}
                onClick={() => toggleColor(color)}
                className={`w-8 h-8 rounded-lg border-2 transition-all duration-200 ${
                  selectedColors.includes(color)
                    ? 'border-white scale-110 shadow-lg'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
                style={{ backgroundColor: color }}
                aria-label={`${selectedColors.includes(color) ? 'Remove' : 'Add'} ${color}`}
              />
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Type</label>
            <div className="flex gap-1">
              {GRADIENT_TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => setGradientType(type)}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    gradientType === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/10 text-gray-400 hover:bg-white/20'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {(gradientType === 'linear' || gradientType === 'conic') && (
            <div className="flex-1 min-w-[120px]">
              <label className="text-xs text-gray-500 block mb-1">
                Angle: {angle}°
              </label>
              <input
                type="range"
                min="0"
                max="360"
                value={angle}
                onChange={(e) => setAngle(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
          )}
        </div>

        {/* CSS Output */}
        {gradientCss && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-black/30 rounded-lg p-3 text-gray-300 overflow-x-auto">
                {fullCssRule}
              </code>
              <button
                onClick={copyGradientCss}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs text-white transition-colors shrink-0"
              >
                {copiedCss ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
