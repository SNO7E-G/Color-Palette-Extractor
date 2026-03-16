# Color Palette Extractor

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-^18.2.0-blue?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-^6.x-purple?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-^4.x-blue?logo=tailwindcss)](https://tailwindcss.com/)

A professional-grade web application built with React and Vite that extracts color palettes from images. Upload via drag & drop, file selection, paste, URL, or camera capture and instantly get a configurable palette of dominant colors with advanced color analysis tools.

## Features

- **Multiple Input Methods:** Drag & drop, clipboard paste, file upload, image URL, and camera capture
- **Configurable Palette Size:** Extract 2-24 colors with an adjustable slider
- **Multiple Color Formats:** View colors in HEX, RGB, HSL, CMYK, or Tailwind class format
- **Color Naming:** Automatic nearest CSS color name detection
- **Interactive Palette:** Click to copy, drag to reorder, click X to remove colors
- **Color Picker:** Click any swatch to fine-tune with an inline color picker
- **Color Harmonies:** Complementary, analogous, triadic, and split-complementary suggestions
- **Accessibility Checker:** WCAG contrast ratio analysis for all color pairs
- **Color Blindness Simulation:** Preview palette under protanopia, deuteranopia, tritanopia, and achromatopsia
- **Gradient Generator:** Create linear, radial, and conic CSS gradients from palette colors
- **Palette History:** Automatically saves up to 20 palettes in localStorage
- **Export Formats:** JSON, PNG, CSS Variables, SCSS, Tailwind config, SVG, Android XML
- **Dark/Light Theme:** Toggle with persistent preference
- **Responsive Design:** Works across all screen sizes (320px to 1440px+)
- **Keyboard Accessible:** Full keyboard navigation, ARIA labels, skip-to-content link
- **Error Boundary:** Graceful error handling with recovery UI
- **Performance Optimized:** React.memo, useMemo, lazy loading of advanced panels

## Project Structure

```
src/
├── components/
│   ├── AccessibilityChecker.jsx    # WCAG contrast analysis
│   ├── ColorBlindnessSimulator.jsx # Color blindness preview
│   ├── ColorHarmony.jsx            # Color harmony suggestions
│   ├── ErrorBoundary.jsx           # React error boundary
│   ├── ExportButtons.jsx           # Multi-format export
│   ├── GradientGenerator.jsx       # CSS gradient builder
│   ├── ImageCropper.jsx            # Image region selection
│   ├── PaletteHistory.jsx          # localStorage palette history
│   ├── PaletteViewer.jsx           # Interactive palette display
│   ├── ThemeToggle.jsx             # Dark/light mode toggle
│   └── UploadArea.jsx              # Image input (upload/URL/camera)
├── utils/
│   ├── color.js                    # Color conversion & analysis utilities
│   ├── colorNames.js               # CSS color name database
│   └── __tests__/
│       └── color.test.js           # Unit tests for color utilities
├── App.jsx                         # Root component
├── App.css                         # App-specific styles
├── index.css                       # Global styles & Tailwind
└── main.jsx                        # Entry point
```

## Tech Stack

- **React 18** - Component-based UI
- **Vite 6** - Build tool with HMR
- **Tailwind CSS 4** - Utility-first styling
- **ColorThief** - Dominant color extraction
- **@dnd-kit** - Drag-and-drop reordering
- **react-colorful** - Color picker
- **react-image-crop** - Image region selection
- **html2canvas** - PNG export
- **FileSaver.js** - Client-side file downloads
- **Vitest** - Unit testing

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18.x
- npm

### Installation

```bash
git clone https://github.com/SNO7E-G/Color-Palette-Extractor.git
cd Color-Palette-Extractor
npm install
```

### Development

```bash
npm run dev
```

Open http://localhost:5173

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

### Lint

```bash
npm run lint
```

## Usage

1. **Choose input method** - Upload tab (drag & drop / file), URL tab (paste image URL), or Camera tab
2. **Adjust palette size** - Use the slider to extract 2-24 colors
3. **Select color format** - Choose HEX, RGB, HSL, CMYK, or Tailwind
4. **Interact with palette** - Click to copy, drag to reorder, use color picker to adjust
5. **Analyze colors** - Toggle Harmonies, Accessibility, Color Blindness, or Gradients panels
6. **Export** - Choose from JSON, PNG, CSS, SCSS, Tailwind, SVG, or Android XML formats
7. **Review history** - Access previously extracted palettes from the history panel

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Author

**Mahmoud Ashraf (SNO7E)**

- GitHub: [@SNO7E-G](https://github.com/SNO7E-G)
- LinkedIn: [Mahmoud Ashraf](https://www.linkedin.com/in/sno7e)
