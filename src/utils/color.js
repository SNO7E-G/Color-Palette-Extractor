/**
 * Shared color utility functions used across the application.
 */

/**
 * Convert a hex color string to an { r, g, b } object.
 */
export function hexToRgb(hex) {
  const cleaned = hex.replace(/^#/, '');
  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);
  return { r, g, b };
}

/**
 * Convert a hex color string to an { h, s, l } object.
 * h: 0-360, s: 0-100, l: 0-100
 */
export function hexToHsl(hex) {
  const { r, g, b } = hexToRgb(hex);
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    if (max === rNorm) {
      h = ((gNorm - bNorm) / delta + (gNorm < bNorm ? 6 : 0)) * 60;
    } else if (max === gNorm) {
      h = ((bNorm - rNorm) / delta + 2) * 60;
    } else {
      h = ((rNorm - gNorm) / delta + 4) * 60;
    }
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Convert HSL values to a hex color string.
 */
export function hslToHex(h, s, l) {
  const sNorm = s / 100;
  const lNorm = l / 100;

  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;

  let rPrime = 0, gPrime = 0, bPrime = 0;

  if (h < 60) { rPrime = c; gPrime = x; bPrime = 0; }
  else if (h < 120) { rPrime = x; gPrime = c; bPrime = 0; }
  else if (h < 180) { rPrime = 0; gPrime = c; bPrime = x; }
  else if (h < 240) { rPrime = 0; gPrime = x; bPrime = c; }
  else if (h < 300) { rPrime = x; gPrime = 0; bPrime = c; }
  else { rPrime = c; gPrime = 0; bPrime = x; }

  const r = Math.round((rPrime + m) * 255);
  const g = Math.round((gPrime + m) * 255);
  const b = Math.round((bPrime + m) * 255);

  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

/**
 * Convert hex to CMYK object { c, m, y, k } (percentages 0-100).
 */
export function hexToCmyk(hex) {
  const { r, g, b } = hexToRgb(hex);
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const k = 1 - Math.max(rNorm, gNorm, bNorm);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };

  const c = Math.round(((1 - rNorm - k) / (1 - k)) * 100);
  const m = Math.round(((1 - gNorm - k) / (1 - k)) * 100);
  const y = Math.round(((1 - bNorm - k) / (1 - k)) * 100);

  return { c, m, y, k: Math.round(k * 100) };
}

/**
 * Get relative luminance of a hex color (0-1 range) per WCAG 2.0.
 */
export function getLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const [rs, gs, bs] = [r, g, b].map(c => {
    const sRgb = c / 255;
    return sRgb <= 0.03928 ? sRgb / 12.92 : Math.pow((sRgb + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Determine if a hex color is dark based on perceived brightness.
 */
export function isDarkColor(hex) {
  const { r, g, b } = hexToRgb(hex);
  const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
  return brightness < 150;
}

/**
 * Get a contrasting text color (black or white) for a given background hex.
 */
export function getContrastText(hex) {
  const { r, g, b } = hexToRgb(hex);
  const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return brightness > 0.5 ? '#000000' : '#FFFFFF';
}

/**
 * Compute the WCAG contrast ratio between two hex colors.
 */
export function getContrastRatio(hex1, hex2) {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Format a hex color in the specified format.
 */
export function formatColor(hex, format) {
  switch (format) {
    case 'hex':
      return hex.toUpperCase();
    case 'rgb': {
      const { r, g, b } = hexToRgb(hex);
      return `rgb(${r}, ${g}, ${b})`;
    }
    case 'hsl': {
      const { h, s, l } = hexToHsl(hex);
      return `hsl(${h}, ${s}%, ${l}%)`;
    }
    case 'cmyk': {
      const { c, m, y, k } = hexToCmyk(hex);
      return `cmyk(${c}%, ${m}%, ${y}%, ${k}%)`;
    }
    case 'tailwind': {
      return `bg-[${hex.toLowerCase()}]`;
    }
    default:
      return hex.toUpperCase();
  }
}

/**
 * Generate color harmonies from a base hex color.
 */
export function getColorHarmonies(hex) {
  const { h, s, l } = hexToHsl(hex);

  const wrap = (hue) => ((hue % 360) + 360) % 360;

  return {
    complementary: [hex, hslToHex(wrap(h + 180), s, l)],
    analogous: [
      hslToHex(wrap(h - 30), s, l),
      hex,
      hslToHex(wrap(h + 30), s, l),
    ],
    triadic: [
      hex,
      hslToHex(wrap(h + 120), s, l),
      hslToHex(wrap(h + 240), s, l),
    ],
    splitComplementary: [
      hex,
      hslToHex(wrap(h + 150), s, l),
      hslToHex(wrap(h + 210), s, l),
    ],
  };
}

/**
 * Simulate color blindness on a hex color.
 * Returns the transformed hex.
 */
export function simulateColorBlindness(hex, type) {
  const { r, g, b } = hexToRgb(hex);

  const matrices = {
    protanopia: [
      [0.567, 0.433, 0.000],
      [0.558, 0.442, 0.000],
      [0.000, 0.242, 0.758],
    ],
    deuteranopia: [
      [0.625, 0.375, 0.000],
      [0.700, 0.300, 0.000],
      [0.000, 0.300, 0.700],
    ],
    tritanopia: [
      [0.950, 0.050, 0.000],
      [0.000, 0.433, 0.567],
      [0.000, 0.475, 0.525],
    ],
    achromatopsia: [
      [0.299, 0.587, 0.114],
      [0.299, 0.587, 0.114],
      [0.299, 0.587, 0.114],
    ],
  };

  const m = matrices[type];
  if (!m) return hex;

  const newR = Math.min(255, Math.max(0, Math.round(m[0][0] * r + m[0][1] * g + m[0][2] * b)));
  const newG = Math.min(255, Math.max(0, Math.round(m[1][0] * r + m[1][1] * g + m[1][2] * b)));
  const newB = Math.min(255, Math.max(0, Math.round(m[2][0] * r + m[2][1] * g + m[2][2] * b)));

  return '#' + [newR, newG, newB].map(v => v.toString(16).padStart(2, '0')).join('');
}
