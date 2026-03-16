/**
 * Color name database - maps common color names to hex values.
 * Uses CSS named colors plus extended set.
 */

import { hexToRgb } from './color.js';

const COLOR_NAMES = {
  'Black': '#000000',
  'White': '#FFFFFF',
  'Red': '#FF0000',
  'Lime': '#00FF00',
  'Blue': '#0000FF',
  'Yellow': '#FFFF00',
  'Cyan': '#00FFFF',
  'Magenta': '#FF00FF',
  'Silver': '#C0C0C0',
  'Gray': '#808080',
  'Maroon': '#800000',
  'Olive': '#808000',
  'Green': '#008000',
  'Purple': '#800080',
  'Teal': '#008080',
  'Navy': '#000080',
  'Dark Red': '#8B0000',
  'Brown': '#A52A2A',
  'Firebrick': '#B22222',
  'Crimson': '#DC143C',
  'Tomato': '#FF6347',
  'Coral': '#FF7F50',
  'Indian Red': '#CD5C5C',
  'Light Coral': '#F08080',
  'Dark Salmon': '#E9967A',
  'Salmon': '#FA8072',
  'Light Salmon': '#FFA07A',
  'Orange Red': '#FF4500',
  'Dark Orange': '#FF8C00',
  'Orange': '#FFA500',
  'Gold': '#FFD700',
  'Dark Golden Rod': '#B8860B',
  'Golden Rod': '#DAA520',
  'Pale Golden Rod': '#EEE8AA',
  'Dark Khaki': '#BDB76B',
  'Khaki': '#F0E68C',
  'Yellow Green': '#9ACD32',
  'Dark Olive Green': '#556B2F',
  'Olive Drab': '#6B8E23',
  'Lawn Green': '#7CFC00',
  'Chartreuse': '#7FFF00',
  'Green Yellow': '#ADFF2F',
  'Dark Green': '#006400',
  'Forest Green': '#228B22',
  'Lime Green': '#32CD32',
  'Light Green': '#90EE90',
  'Pale Green': '#98FB98',
  'Dark Sea Green': '#8FBC8F',
  'Medium Spring Green': '#00FA9A',
  'Spring Green': '#00FF7F',
  'Sea Green': '#2E8B57',
  'Medium Aqua Marine': '#66CDAA',
  'Medium Sea Green': '#3CB371',
  'Light Sea Green': '#20B2AA',
  'Dark Slate Gray': '#2F4F4F',
  'Dark Cyan': '#008B8B',
  'Aqua': '#00FFFF',
  'Light Cyan': '#E0FFFF',
  'Dark Turquoise': '#00CED1',
  'Turquoise': '#40E0D0',
  'Medium Turquoise': '#48D1CC',
  'Pale Turquoise': '#AFEEEE',
  'Aqua Marine': '#7FFFD4',
  'Powder Blue': '#B0E0E6',
  'Cadet Blue': '#5F9EA0',
  'Steel Blue': '#4682B4',
  'Corn Flower Blue': '#6495ED',
  'Deep Sky Blue': '#00BFFF',
  'Dodger Blue': '#1E90FF',
  'Light Blue': '#ADD8E6',
  'Sky Blue': '#87CEEB',
  'Light Sky Blue': '#87CEFA',
  'Midnight Blue': '#191970',
  'Dark Blue': '#00008B',
  'Medium Blue': '#0000CD',
  'Royal Blue': '#4169E1',
  'Blue Violet': '#8A2BE2',
  'Indigo': '#4B0082',
  'Dark Slate Blue': '#483D8B',
  'Slate Blue': '#6A5ACD',
  'Medium Slate Blue': '#7B68EE',
  'Medium Purple': '#9370DB',
  'Dark Magenta': '#8B008B',
  'Dark Violet': '#9400D3',
  'Dark Orchid': '#9932CC',
  'Medium Orchid': '#BA55D3',
  'Thistle': '#D8BFD8',
  'Plum': '#DDA0DD',
  'Violet': '#EE82EE',
  'Orchid': '#DA70D6',
  'Medium Violet Red': '#C71585',
  'Pale Violet Red': '#DB7093',
  'Deep Pink': '#FF1493',
  'Hot Pink': '#FF69B4',
  'Light Pink': '#FFB6C1',
  'Pink': '#FFC0CB',
  'Antique White': '#FAEBD7',
  'Beige': '#F5F5DC',
  'Bisque': '#FFE4C4',
  'Blanched Almond': '#FFEBCD',
  'Wheat': '#F5DEB3',
  'Corn Silk': '#FFF8DC',
  'Lemon Chiffon': '#FFFACD',
  'Light Golden Rod Yellow': '#FAFAD2',
  'Light Yellow': '#FFFFE0',
  'Saddle Brown': '#8B4513',
  'Sienna': '#A0522D',
  'Chocolate': '#D2691E',
  'Peru': '#CD853F',
  'Sandy Brown': '#F4A460',
  'Burly Wood': '#DEB887',
  'Tan': '#D2B48C',
  'Rosy Brown': '#BC8F8F',
  'Moccasin': '#FFE4B5',
  'Navajo White': '#FFDEAD',
  'Peach Puff': '#FFDAB9',
  'Misty Rose': '#FFE4E1',
  'Lavender Blush': '#FFF0F5',
  'Linen': '#FAF0E6',
  'Old Lace': '#FDF5E6',
  'Papaya Whip': '#FFEFD5',
  'Sea Shell': '#FFF5EE',
  'Mint Cream': '#F5FFFA',
  'Slate Gray': '#708090',
  'Light Slate Gray': '#778899',
  'Light Steel Blue': '#B0C4DE',
  'Lavender': '#E6E6FA',
  'Floral White': '#FFFAF0',
  'Alice Blue': '#F0F8FF',
  'Ghost White': '#F8F8FF',
  'Honeydew': '#F0FFF0',
  'Ivory': '#FFFFF0',
  'Azure': '#F0FFFF',
  'Snow': '#FFFAFA',
  'Dim Gray': '#696969',
  'Dark Gray': '#A9A9A9',
  'Light Gray': '#D3D3D3',
  'Gainsboro': '#DCDCDC',
  'White Smoke': '#F5F5F5',
};

const colorEntries = Object.entries(COLOR_NAMES).map(([name, hex]) => ({
  name,
  hex: hex.toLowerCase(),
  rgb: hexToRgb(hex),
}));

/**
 * Find the nearest named color for a given hex using Euclidean distance in RGB space.
 */
export function getNearestColorName(hex) {
  const target = hexToRgb(hex);
  let bestName = 'Unknown';
  let bestDist = Infinity;

  for (const entry of colorEntries) {
    const dr = target.r - entry.rgb.r;
    const dg = target.g - entry.rgb.g;
    const db = target.b - entry.rgb.b;
    const dist = dr * dr + dg * dg + db * db;

    if (dist < bestDist) {
      bestDist = dist;
      bestName = entry.name;
    }
  }

  return bestName;
}

export { COLOR_NAMES };
