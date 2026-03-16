import { useMemo } from 'react';
import { simulateColorBlindness, getContrastText } from '../utils/color.js';

const BLINDNESS_TYPES = [
  { key: 'protanopia', name: 'Protanopia', description: 'Red-blind (~1% of males)' },
  { key: 'deuteranopia', name: 'Deuteranopia', description: 'Green-blind (~1% of males)' },
  { key: 'tritanopia', name: 'Tritanopia', description: 'Blue-blind (very rare)' },
  { key: 'achromatopsia', name: 'Achromatopsia', description: 'Total color blindness' },
];

export default function ColorBlindnessSimulator({ colors }) {
  const simulations = useMemo(() => {
    if (!colors || colors.length === 0) return [];
    return BLINDNESS_TYPES.map(type => ({
      ...type,
      palette: colors.map(color => simulateColorBlindness(color, type.key)),
    }));
  }, [colors]);

  if (!colors || colors.length === 0) return null;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <h3 className="text-lg font-semibold text-gray-200 text-center">
        Color Blindness Simulation
        <span className="block text-xs text-gray-500 font-normal mt-1">
          How your palette appears under different conditions
        </span>
      </h3>

      <div className="space-y-4">
        {/* Original */}
        <div className="bg-white/5 dark:bg-gray-800/30 rounded-xl p-4 backdrop-blur-sm border border-white/5">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Normal Vision</h4>
          <div className="flex gap-1.5 flex-wrap">
            {colors.map((color, i) => (
              <div
                key={`original-${i}`}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-[8px] sm:text-[10px] font-mono"
                style={{
                  backgroundColor: color,
                  color: getContrastText(color),
                }}
              >
                {color.toUpperCase().slice(0, 4)}
              </div>
            ))}
          </div>
        </div>

        {/* Simulations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {simulations.map(sim => (
            <div
              key={sim.key}
              className="bg-white/5 dark:bg-gray-800/30 rounded-xl p-4 backdrop-blur-sm border border-white/5"
            >
              <div className="mb-2">
                <h4 className="text-sm font-medium text-gray-300">{sim.name}</h4>
                <p className="text-xs text-gray-500">{sim.description}</p>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {sim.palette.map((color, i) => (
                  <div
                    key={`${sim.key}-${i}`}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-[8px] sm:text-[10px] font-mono"
                    style={{
                      backgroundColor: color,
                      color: getContrastText(color),
                    }}
                  >
                    {color.toUpperCase().slice(0, 4)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
