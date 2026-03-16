import { describe, it, expect } from 'vitest';
import {
  hexToRgb,
  hexToHsl,
  hslToHex,
  hexToCmyk,
  getLuminance,
  isDarkColor,
  getContrastText,
  getContrastRatio,
  formatColor,
  getColorHarmonies,
  simulateColorBlindness,
} from '../color.js';

describe('hexToRgb', () => {
  it('converts black', () => {
    expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
  });

  it('converts white', () => {
    expect(hexToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('converts red', () => {
    expect(hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('converts arbitrary color', () => {
    expect(hexToRgb('#1A2B3C')).toEqual({ r: 26, g: 43, b: 60 });
  });
});

describe('hexToHsl', () => {
  it('converts pure red', () => {
    const hsl = hexToHsl('#FF0000');
    expect(hsl.h).toBe(0);
    expect(hsl.s).toBe(100);
    expect(hsl.l).toBe(50);
  });

  it('converts white', () => {
    const hsl = hexToHsl('#FFFFFF');
    expect(hsl.s).toBe(0);
    expect(hsl.l).toBe(100);
  });

  it('converts black', () => {
    const hsl = hexToHsl('#000000');
    expect(hsl.s).toBe(0);
    expect(hsl.l).toBe(0);
  });
});

describe('hslToHex', () => {
  it('converts red HSL to hex', () => {
    expect(hslToHex(0, 100, 50)).toBe('#ff0000');
  });

  it('converts green HSL to hex', () => {
    expect(hslToHex(120, 100, 50)).toBe('#00ff00');
  });

  it('converts blue HSL to hex', () => {
    expect(hslToHex(240, 100, 50)).toBe('#0000ff');
  });

  it('roundtrips through hexToHsl', () => {
    const original = '#3a7bd5';
    const { h, s, l } = hexToHsl(original);
    const result = hslToHex(h, s, l);
    // Allow small rounding differences
    const origRgb = hexToRgb(original);
    const resultRgb = hexToRgb(result);
    expect(Math.abs(origRgb.r - resultRgb.r)).toBeLessThanOrEqual(2);
    expect(Math.abs(origRgb.g - resultRgb.g)).toBeLessThanOrEqual(2);
    expect(Math.abs(origRgb.b - resultRgb.b)).toBeLessThanOrEqual(2);
  });
});

describe('hexToCmyk', () => {
  it('converts black', () => {
    expect(hexToCmyk('#000000')).toEqual({ c: 0, m: 0, y: 0, k: 100 });
  });

  it('converts white', () => {
    expect(hexToCmyk('#FFFFFF')).toEqual({ c: 0, m: 0, y: 0, k: 0 });
  });

  it('converts pure red', () => {
    expect(hexToCmyk('#FF0000')).toEqual({ c: 0, m: 100, y: 100, k: 0 });
  });
});

describe('getLuminance', () => {
  it('black has luminance 0', () => {
    expect(getLuminance('#000000')).toBe(0);
  });

  it('white has luminance 1', () => {
    expect(getLuminance('#FFFFFF')).toBeCloseTo(1, 2);
  });

  it('returns value between 0 and 1', () => {
    const lum = getLuminance('#808080');
    expect(lum).toBeGreaterThan(0);
    expect(lum).toBeLessThan(1);
  });
});

describe('isDarkColor', () => {
  it('black is dark', () => {
    expect(isDarkColor('#000000')).toBe(true);
  });

  it('white is not dark', () => {
    expect(isDarkColor('#FFFFFF')).toBe(false);
  });

  it('dark blue is dark', () => {
    expect(isDarkColor('#000080')).toBe(true);
  });
});

describe('getContrastText', () => {
  it('returns white for dark backgrounds', () => {
    expect(getContrastText('#000000')).toBe('#FFFFFF');
  });

  it('returns black for light backgrounds', () => {
    expect(getContrastText('#FFFFFF')).toBe('#000000');
  });
});

describe('getContrastRatio', () => {
  it('black vs white gives 21:1', () => {
    const ratio = getContrastRatio('#000000', '#FFFFFF');
    expect(ratio).toBeCloseTo(21, 0);
  });

  it('same color gives 1:1', () => {
    const ratio = getContrastRatio('#808080', '#808080');
    expect(ratio).toBeCloseTo(1, 1);
  });

  it('ratio is always >= 1', () => {
    const ratio = getContrastRatio('#123456', '#654321');
    expect(ratio).toBeGreaterThanOrEqual(1);
  });
});

describe('formatColor', () => {
  it('formats as HEX', () => {
    expect(formatColor('#ff0000', 'hex')).toBe('#FF0000');
  });

  it('formats as RGB', () => {
    expect(formatColor('#ff0000', 'rgb')).toBe('rgb(255, 0, 0)');
  });

  it('formats as HSL', () => {
    expect(formatColor('#ff0000', 'hsl')).toBe('hsl(0, 100%, 50%)');
  });

  it('formats as CMYK', () => {
    expect(formatColor('#ff0000', 'cmyk')).toBe('cmyk(0%, 100%, 100%, 0%)');
  });

  it('formats as Tailwind', () => {
    expect(formatColor('#ff0000', 'tailwind')).toBe('bg-[#ff0000]');
  });

  it('defaults to HEX for unknown format', () => {
    expect(formatColor('#ff0000', 'unknown')).toBe('#FF0000');
  });
});

describe('getColorHarmonies', () => {
  it('returns all harmony types', () => {
    const harmonies = getColorHarmonies('#ff0000');
    expect(harmonies).toHaveProperty('complementary');
    expect(harmonies).toHaveProperty('analogous');
    expect(harmonies).toHaveProperty('triadic');
    expect(harmonies).toHaveProperty('splitComplementary');
  });

  it('complementary has 2 colors', () => {
    const harmonies = getColorHarmonies('#ff0000');
    expect(harmonies.complementary).toHaveLength(2);
  });

  it('analogous has 3 colors', () => {
    const harmonies = getColorHarmonies('#ff0000');
    expect(harmonies.analogous).toHaveLength(3);
  });

  it('triadic has 3 colors', () => {
    const harmonies = getColorHarmonies('#ff0000');
    expect(harmonies.triadic).toHaveLength(3);
  });

  it('includes the original color', () => {
    const harmonies = getColorHarmonies('#ff0000');
    expect(harmonies.complementary[0]).toBe('#ff0000');
  });
});

describe('simulateColorBlindness', () => {
  it('returns a hex string', () => {
    const result = simulateColorBlindness('#ff0000', 'protanopia');
    expect(result).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('achromatopsia returns grayscale', () => {
    const result = simulateColorBlindness('#ff0000', 'achromatopsia');
    const { r, g, b } = hexToRgb(result);
    // For achromatopsia, all channels should be very close
    expect(Math.abs(r - g)).toBeLessThanOrEqual(1);
    expect(Math.abs(g - b)).toBeLessThanOrEqual(1);
  });

  it('returns original for unknown type', () => {
    expect(simulateColorBlindness('#ff0000', 'unknown')).toBe('#ff0000');
  });

  it('handles all supported types', () => {
    const types = ['protanopia', 'deuteranopia', 'tritanopia', 'achromatopsia'];
    types.forEach(type => {
      const result = simulateColorBlindness('#3a7bd5', type);
      expect(result).toMatch(/^#[0-9a-f]{6}$/);
    });
  });
});
