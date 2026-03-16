import { useMemo } from 'react';
import { getContrastRatio } from '../utils/color.js';

function getWcagRating(ratio) {
  if (ratio >= 7) return { level: 'AAA', normalText: true, largeText: true };
  if (ratio >= 4.5) return { level: 'AA', normalText: true, largeText: true };
  if (ratio >= 3) return { level: 'AA Large', normalText: false, largeText: true };
  return { level: 'Fail', normalText: false, largeText: false };
}

export default function AccessibilityChecker({ colors }) {
  const pairs = useMemo(() => {
    if (!colors || colors.length < 2) return [];

    const results = [];
    for (let i = 0; i < colors.length; i++) {
      for (let j = i + 1; j < colors.length; j++) {
        const ratio = getContrastRatio(colors[i], colors[j]);
        const rating = getWcagRating(ratio);
        if (rating.largeText) {
          results.push({
            color1: colors[i],
            color2: colors[j],
            ratio: Math.round(ratio * 100) / 100,
            rating,
          });
        }
      }
    }

    results.sort((a, b) => b.ratio - a.ratio);
    return results.slice(0, 12);
  }, [colors]);

  if (!colors || colors.length < 2) return null;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <h3 className="text-lg font-semibold text-gray-200 text-center">
        Accessibility Checker
        <span className="block text-xs text-gray-500 font-normal mt-1">
          WCAG contrast ratio analysis
        </span>
      </h3>

      {pairs.length === 0 ? (
        <p className="text-center text-gray-500 text-sm">
          No accessible color pairs found in this palette.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {pairs.map((pair, idx) => (
            <div
              key={idx}
              className="bg-white/5 dark:bg-gray-800/30 rounded-xl p-3 space-y-2 backdrop-blur-sm border border-white/5"
            >
              <div className="flex gap-2 items-center">
                <div
                  className="w-8 h-8 rounded-lg border border-white/10"
                  style={{ backgroundColor: pair.color1 }}
                  title={pair.color1}
                />
                <span className="text-gray-500 text-xs">+</span>
                <div
                  className="w-8 h-8 rounded-lg border border-white/10"
                  style={{ backgroundColor: pair.color2 }}
                  title={pair.color2}
                />
                <div className="ml-auto text-right">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    pair.rating.level === 'AAA' ? 'bg-green-500/20 text-green-400' :
                    pair.rating.level === 'AA' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {pair.rating.level}
                  </span>
                  <p className="text-xs text-gray-500 mt-0.5">{pair.ratio}:1</p>
                </div>
              </div>

              <div className="flex gap-1">
                <div
                  className="flex-1 rounded-lg p-2 text-center text-xs font-medium"
                  style={{
                    backgroundColor: pair.color1,
                    color: pair.color2,
                  }}
                >
                  Sample Text
                </div>
                <div
                  className="flex-1 rounded-lg p-2 text-center text-xs font-medium"
                  style={{
                    backgroundColor: pair.color2,
                    color: pair.color1,
                  }}
                >
                  Sample Text
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
