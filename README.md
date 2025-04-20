# Color Palette Extractor

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-^18.2.0-blue?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-^5.1.6-purple?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-^3.x-blue?logo=tailwindcss)](https://tailwindcss.com/)

A modern web application built with React and Vite that allows users to effortlessly extract color palettes from images. Upload an image via drag & drop, file selection, or pasting, and instantly get a visually appealing palette of dominant colors.

## 📚 Table of Contents
- [Features](#✨-features)
- [Project Structure](#📂-project-structure)
- [Tech Stack](#🛠️-tech-stack)
- [Getting Started](#🚀-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Development Server](#running-the-development-server)
  - [Building for Production](#building-for-production)
- [Usage](#📖-usage)
- [Contributing](#🤝-contributing)
- [License](#📄-license)
- [Author](#👤-author)
- [Acknowledgements](#🙏-acknowledgements)

## ✨ Features

*   **Multiple Upload Methods:** Offers flexibility for users to provide images:
    *   🖱️ **Drag and Drop:** Intuitively drop image files directly onto the upload zone.
    *   📋 **Paste from Clipboard:** Conveniently paste images copied from other applications.
    *   📁 **File Selection:** Use the standard file browser to select local image files.
*   **Efficient Color Extraction:** Utilizes the powerful `colorthief` library to quickly analyze the uploaded image and extract the 8 most prominent colors, forming the palette.
*   **Interactive Palette Display:** Presents the generated palette in an engaging and usable format:
    *   Displays colors in a responsive grid layout.
    *   🖱️ **One-Click Copy:** Instantly copy a color's HEX code to the clipboard by clicking its swatch.
    *   👀 **Hover Effect:** Reveals the HEX code clearly when hovering over a color.
    *   ⌨️ **Keyboard Navigation:** Fully accessible via keyboard (arrow keys to navigate, Enter/Space to copy).
    *   🎨 **Smart Text Contrast:** Automatically calculates and applies black or white text for HEX codes, ensuring readability against any background color.
*   **Versatile Export Options:** Allows users to save their palettes for later use:
    *   **JSON:** Export the palette data (array of hex codes, timestamp) in a structured JSON format, ideal for integration into other tools or codebases.
    *   **PNG:** Export a high-resolution PNG image capture of the visual color palette display using `html2canvas`, perfect for presentations, documentation, or sharing.
*   **User-Friendly Interface:** Designed for ease of use and clarity:
    *   🖼️ **Image Preview:** Shows a thumbnail of the uploaded image before processing.
    *   ⏳ **Visual Feedback:** Incorporates loading spinners, progress indicators, and success/error messages during processing and export operations.
    *   ❌ **Robust Error Handling:** Provides clear feedback for common issues like invalid file types (supports JPG/PNG), exceeding size limits (max 5MB), or color extraction problems.
    *   📱 **Responsive Design:** Adapts seamlessly to various screen sizes, offering a consistent experience on desktops, tablets, and mobile devices.
*   **Modern Tech Stack:** Leverages current web technologies for optimal performance and developer experience:
    *   Built with **React** for component-based UI development.
    *   Powered by **Vite** for lightning-fast HMR (Hot Module Replacement) and optimized builds.
    *   Styled with **Tailwind CSS** for rapid, utility-first styling.

## 📂 Project Structure

```
color-palette-extractor/
├── public/             # Static assets (e.g., favicon)
├── src/                # Source code
│   ├── assets/         # Project assets (if any, e.g., images used in UI)
│   ├── components/     # Reusable React components
│   │   ├── ExportButtons.jsx
│   │   ├── PaletteViewer.jsx
│   │   └── UploadArea.jsx
│   ├── App.css         # Main application styles
│   ├── App.jsx         # Root application component
│   ├── index.css       # Global styles and Tailwind directives
│   └── main.jsx        # Application entry point
├── .eslintrc.cjs       # ESLint configuration
├── .gitignore          # Git ignore rules
├── index.html          # Main HTML template for Vite
├── LICENSE             # Project license file (MIT)
├── package-lock.json   # Exact dependency versions
├── package.json        # Project metadata and dependencies
├── postcss.config.js   # PostCSS configuration (for Tailwind)
├── README.md           # This file
├── tailwind.config.js  # Tailwind CSS configuration
└── vite.config.js      # Vite configuration
```

## 🛠️ Tech Stack

*   **Frontend Framework:** [React](https://reactjs.org/) - For building the user interface components.
*   **Build Tool:** [Vite](https://vitejs.dev/) - Provides a fast development server and optimized build process.
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework for rapid UI development.
*   **Color Extraction:** [ColorThief](https://github.com/lokesh/color-thief) - A JavaScript library for extracting dominant colors from images.
*   **File Saving:** [FileSaver.js](https://github.com/eligrey/FileSaver.js/) - For saving generated files (JSON, PNG) on the client-side.
*   **Image Generation:** [html2canvas](https://html2canvas.hertzen.com/) - For capturing the palette display as an image.

## 🚀 Getting Started

### Prerequisites

*   [Node.js](https://nodejs.org/) (Recommended version: >= 18.x)
*   [npm](https://www.npmjs.com/) (or [yarn](https://yarnpkg.com/))

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd color-palette-extractor
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    ```
    For production environments, consider using:
    ```bash
    npm ci
    ```

### Running the Development Server

1.  **Start the Vite development server:**
    ```bash
    npm run dev
    # or
    # yarn dev
    ```
2.  Open your browser and navigate to `http://localhost:5173` (or the port specified in the console).

### Building for Production

1.  **Create an optimized production build:**
    ```bash
    npm run build
    # or
    # yarn build
    ```
    The production files will be located in the `dist` directory.

2.  **Preview the production build locally:**
    ```bash
    npm run preview
    # or
    # yarn preview
    ```

## 📖 Usage

1.  Launch the application.
2.  Use one of the available methods (drag & drop, paste, click to upload) to provide an image (JPG or PNG, up to 5MB).
3.  Wait for the application to process the image and display the extracted 8-color palette.
4.  Interact with the palette:
    *   Hover over colors to view their HEX codes.
    *   Click a color to copy its HEX code.
    *   Use arrow keys to navigate and Enter/Space to copy.
5.  Use the "Export as JSON" or "Export as PNG" buttons to save the palette.

## 🤝 Contributing

Contributions are welcome! If you have suggestions for improvements or find any issues, please feel free to open an issue or submit a pull request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Mahmoud Ashraf (SNO7E)**

*   GitHub: [@SNO7E-G](https://github.com/SNO7E-G)
*   LinkedIn: [Mahmoud Ashraf](https://www.linkedin.com/in/sno7e)

## 🙏 Acknowledgements

This project utilizes the following open-source software:

*   [React](https://reactjs.org/) ([License](https://github.com/facebook/react/blob/main/LICENSE))
*   [Vite](https://vitejs.dev/) ([License](https://github.com/vitejs/vite/blob/main/LICENSE))
*   [Tailwind CSS](https://tailwindcss.com/) ([License](https://github.com/tailwindlabs/tailwindcss/blob/master/LICENSE))
*   [ColorThief](https://github.com/lokesh/color-thief) ([License](https://github.com/lokesh/color-thief/blob/master/LICENSE))
*   [FileSaver.js](https://github.com/eligrey/FileSaver.js/) ([License](https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md))
*   [html2canvas](https://html2canvas.hertzen.com/) ([License](https://github.com/niklasvh/html2canvas/blob/master/LICENSE))

We are grateful to the developers and communities behind these projects.