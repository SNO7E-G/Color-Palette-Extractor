import { useMemo } from 'react';
import { getColorHarmonies, getContrastText } from '../utils/color.js';

const HARMONY_LABELS = {
  complementary: { name: 'Complementary', description: 'Opposite colors on the wheel' },
  analogous: { name: 'Analogous', description: 'Adjacent colors on the wheel' },
  triadic: { name: 'Triadic', description: 'Three evenly spaced colors' },
  splitComplementary: { name: 'Split Complementary', description: 'Base + two adjacent to complement' },
};

export default function ColorHarmony({ colors }) {
  const harmonies = useMemo(() => {
    if (!colors || colors.length === 0) return {};
    const baseColor = colors[0];
    return getColorHarmonies(baseColor);
  }, [colors]);

  if (!colors || colors.length === 0) return null;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <h3 className="text-lg font-semibold text-gray-200 dark:text-gray-200 text-center">
        Color Harmonies
        <span className="block text-xs text-gray-500 font-normal mt-1">
          Based on {colors[0]?.toUpperCase()}
        </span>
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.entries(harmonies).map(([type, palette]) => {
          const info = HARMONY_LABELS[type];
          return (
            <div
              key={type}
              className="bg-white/5 dark:bg-gray-800/30 rounded-xl p-4 space-y-3 backdrop-blur-sm border border-white/5"
            >
              <div>
                <h4 className="text-sm font-medium text-gray-300">{info.name}</h4>
                <p className="text-xs text-gray-500">{info.description}</p>
              </div>
              <div className="flex gap-2">
                {palette.map((color, i) => (
                  <div
                    key={`${type}-${i}`}
                    className="flex-1 aspect-square rounded-lg flex items-center justify-center text-xs font-mono transition-transform hover:scale-105"
                    style={{
                      backgroundColor: color,
                      color: getContrastText(color),
                    }}
                    title={color.toUpperCase()}
                  >
                    {color.toUpperCase()}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
