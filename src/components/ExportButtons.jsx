import { useState, useCallback, useRef, useEffect, useMemo, memo } from 'react';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import { isDarkColor } from '../utils/color.js';

const ExportButtons = memo(function ExportButtons({ colors }) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState('');
  const [exportType, setExportType] = useState(null);
  const exportTimeoutRef = useRef(null);

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

  const generateExportContent = useCallback((format) => {
    switch (format) {
      case 'css':
        return ':root {\n' + colors.map((c, i) => `  --color-${i + 1}: ${c};`).join('\n') + '\n}';
      case 'scss':
        return colors.map((c, i) => `$color-${i + 1}: ${c};`).join('\n');
      case 'tailwind':
        return 'module.exports = {\n  theme: {\n    extend: {\n      colors: {\n' +
          colors.map((c, i) => `        'palette-${i + 1}': '${c}',`).join('\n') +
          '\n      },\n    },\n  },\n};';
      case 'svg': {
        const w = 60, h = 60;
        const rects = colors.map((c, i) => `  <rect x="${i * w}" y="0" width="${w}" height="${h}" fill="${c}"/>`).join('\n');
        return `<svg xmlns="http://www.w3.org/2000/svg" width="${colors.length * w}" height="${h}">\n${rects}\n</svg>`;
      }
      case 'android':
        return '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n' +
          colors.map((c, i) => `  <color name="palette_${i + 1}">${c}</color>`).join('\n') +
          '\n</resources>';
      default:
        return '';
    }
  }, [colors]);

  const handleExport = useCallback(async (type) => {
    if (isExporting) return;

    try {
      setIsExporting(true);
      setExportType(type);

      if (type === 'json') {
        const data = {
          name: 'Color Palette',
          colors,
          timestamp: new Date().toISOString(),
          metadata: { format: 'hex', count: colors.length }
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        saveAs(blob, 'color-palette.json');
        showExportStatus('Palette exported as JSON!');
      } else if (type === 'png') {
        const virtualContainer = document.createElement('div');
        virtualContainer.style.cssText = 'position:absolute;top:-9999px;left:-9999px;padding:24px;background:#ffffff;display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:16px;font-family:sans-serif;width:1000px;';

        const timestamp = document.createElement('p');
        timestamp.innerText = new Date().toLocaleString();
        timestamp.style.cssText = 'text-align:center;grid-column:1/-1;color:#666;font-size:12px;margin-bottom:8px;';
        virtualContainer.appendChild(timestamp);

        colors.forEach(color => {
          const swatch = document.createElement('div');
          swatch.style.cssText = `background-color:${color};width:120px;height:120px;display:flex;align-items:center;justify-content:center;border-radius:8px;font-size:14px;font-weight:bold;color:${isDarkColor(color) ? '#fff' : '#000'};`;
          swatch.innerText = color;
          virtualContainer.appendChild(swatch);
        });

        document.body.appendChild(virtualContainer);
        const canvas = await html2canvas(virtualContainer, {
          backgroundColor: '#ffffff',
          scale: Math.min(window.devicePixelRatio * 2, 4),
          logging: false,
          useCORS: true,
        });
        document.body.removeChild(virtualContainer);

        const blob = await new Promise((resolve, reject) => {
          canvas.toBlob((b) => {
            if (b) resolve(b);
            else reject(new Error('Failed to create PNG'));
          }, 'image/png', 1.0);
        });
        saveAs(blob, 'color-palette.png');
        showExportStatus('Palette exported as PNG!');
      } else if (['css', 'scss', 'tailwind', 'android'].includes(type)) {
        const content = generateExportContent(type);
        const ext = { css: 'css', scss: 'scss', tailwind: 'js', android: 'xml' }[type];
        const blob = new Blob([content], { type: 'text/plain' });
        saveAs(blob, `color-palette.${ext}`);
        showExportStatus(`Palette exported as ${type.toUpperCase()}!`);
      } else if (type === 'svg') {
        const content = generateExportContent('svg');
        const blob = new Blob([content], { type: 'image/svg+xml' });
        saveAs(blob, 'color-palette.svg');
        showExportStatus('Palette exported as SVG!');
      }
    } catch (err) {
      console.error(`${type.toUpperCase()} export error:`, err);
      showExportStatus(`Failed to export ${type.toUpperCase()}`, 'error');
    } finally {
      setTimeout(() => {
        setIsExporting(false);
        setExportType(null);
      }, 500);
    }
  }, [colors, isExporting, showExportStatus, generateExportContent]);

  const exportFormats = useMemo(() => [
    { key: 'json', label: 'JSON' },
    { key: 'png', label: 'PNG' },
    { key: 'css', label: 'CSS Vars' },
    { key: 'scss', label: 'SCSS' },
    { key: 'tailwind', label: 'Tailwind' },
    { key: 'svg', label: 'SVG' },
    { key: 'android', label: 'Android XML' },
  ], []);

  return (
    <div className="w-full max-w-4xl mx-auto mt-4 sm:mt-8 space-y-4 sm:space-y-6 p-2 sm:p-0">
      <div className="flex flex-wrap gap-2 justify-center">
        {exportFormats.map(fmt => (
          <button key={fmt.key} onClick={() => handleExport(fmt.key)} disabled={isExporting}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border border-white/10 hover-lift focus-ring ${
              isExporting && exportType === fmt.key ? 'opacity-70 ' : ''
            }bg-white/5 hover:bg-white/10 text-white`}
            aria-label={`Export as ${fmt.label}${isExporting ? ' (processing)' : ''}`}>
            {isExporting && exportType === fmt.key ? (
              <span className="inline-flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Exporting...
              </span>
            ) : fmt.label}
          </button>
        ))}
      </div>

      {exportStatus && (
        <div className="flex justify-center">
          <div className={`px-3 sm:px-4 py-2 sm:py-3 rounded-xl animate-fade-slide-up backdrop-blur-sm text-sm sm:text-base ${
            exportStatus.type === 'error'
              ? 'bg-red-500/10 border border-red-500/20 text-red-500'
              : 'bg-green-500/10 border border-green-500/20 text-green-500'}`}
            role="status" aria-live="polite">
            {exportStatus.message}
          </div>
        </div>
      )}
    </div>
  );
});

export default ExportButtons;
