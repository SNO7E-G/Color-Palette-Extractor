import { useState, useCallback, useEffect } from 'react';

const HISTORY_KEY = 'palette-history';
const MAX_HISTORY = 20;

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(history) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // localStorage full or unavailable
  }
}

export default function PaletteHistory({ currentColors, onRestorePalette }) {
  const [history, setHistory] = useState(loadHistory);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!currentColors || currentColors.length === 0) return;

    setHistory(prev => {
      const isDuplicate = prev.some(
        entry => JSON.stringify(entry.colors) === JSON.stringify(currentColors)
      );
      if (isDuplicate) return prev;

      const newEntry = {
        id: Date.now(),
        colors: currentColors,
        timestamp: new Date().toISOString(),
      };

      const updated = [newEntry, ...prev].slice(0, MAX_HISTORY);
      saveHistory(updated);
      return updated;
    });
  }, [currentColors]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    saveHistory([]);
  }, []);

  const removeEntry = useCallback((id) => {
    setHistory(prev => {
      const updated = prev.filter(entry => entry.id !== id);
      saveHistory(updated);
      return updated;
    });
  }, []);

  if (history.length === 0 && !isOpen) return null;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white/5 dark:bg-gray-800/30 
          rounded-xl hover:bg-white/10 transition-colors border border-white/5"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-medium text-gray-300">
          Palette History ({history.length})
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-2 space-y-2 animate-fade-slide-up">
          {history.length > 0 && (
            <div className="flex justify-end px-1">
              <button
                onClick={clearHistory}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                Clear All
              </button>
            </div>
          )}

          {history.map(entry => (
            <div
              key={entry.id}
              className="flex items-center gap-3 p-3 bg-white/5 dark:bg-gray-800/20 rounded-xl 
                border border-white/5 hover:bg-white/10 transition-colors group"
            >
              <button
                onClick={() => onRestorePalette(entry.colors)}
                className="flex-1 flex items-center gap-2 min-w-0"
                aria-label={`Restore palette from ${new Date(entry.timestamp).toLocaleString()}`}
              >
                <div className="flex gap-0.5 shrink-0">
                  {entry.colors.slice(0, 8).map((color, i) => (
                    <div
                      key={`${entry.id}-${i}`}
                      className="w-5 h-5 sm:w-6 sm:h-6 rounded"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  {entry.colors.length > 8 && (
                    <span className="text-xs text-gray-500 self-center ml-1">
                      +{entry.colors.length - 8}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500 truncate">
                  {new Date(entry.timestamp).toLocaleDateString()}
                </span>
              </button>

              <button
                onClick={() => removeEntry(entry.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition-all"
                aria-label="Remove from history"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}

          {history.length === 0 && (
            <p className="text-center text-gray-500 text-sm py-4">No history yet</p>
          )}
        </div>
      )}
    </div>
  );
}
