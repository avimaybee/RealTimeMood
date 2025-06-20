
import type { Mood } from '@/types';

/**
 * Calculates the relative luminance of an HSL color.
 * Formula from WCAG 2.0 guidelines.
 */
function getRelativeLuminance(h: number, s: number, l: number): number {
  // Convert HSL to RGB
  const sNorm = s / 100;
  const lNorm = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sNorm * Math.min(lNorm, 1 - lNorm);
  const f = (n: number) =>
    lNorm - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  
  const r = 255 * f(0);
  const g = 255 * f(8);
  const b = 255 * f(4);

  // Apply sRGB to linear transformation and calculate luminance
  const sRGB = [r, g, b].map(val => {
    const v = val / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * sRGB[0] + 0.7151 * sRGB[1] + 0.0722 * sRGB[2];
}

/**
 * Determines appropriate foreground HSL values based on background mood.
 * Also determines panel background type (light/dark).
 */
export function getDerivedColors(mood: Mood): {
  foregroundHue: number;
  foregroundSaturation: number;
  foregroundLightness: number;
  primaryForegroundHue: number;
  primaryForegroundSaturation: number;
  primaryForegroundLightness: number;
  panelBackgroundRgba: string; // "r, g, b" string
} {
  const bgLuminance = getRelativeLuminance(mood.hue, mood.saturation, mood.lightness);

  // Determine foreground color for general text
  const isBgLight = bgLuminance > 0.5; // Threshold for light/dark background
  const fgLightness = isBgLight ? 10 : 91.8; // 10% for dark text, 91.8% for light text
  const fgHue = isBgLight ? 204 : 200; 
  const fgSat = isBgLight ? 10 : 0;

  // Determine foreground color for primary elements
  const primaryHue = (mood.hue - 30 + 360) % 360;
  const primaryLightness = mood.lightness * 0.9;
  const primarySaturation = mood.saturation; // Use mood's saturation for primary
  const primaryLuminance = getRelativeLuminance(primaryHue, primarySaturation, primaryLightness);
  const isPrimaryLight = primaryLuminance > 0.5;
  const pfgLightness = isPrimaryLight ? 10 : 91.8;
  const pfgHue = isPrimaryLight ? 204 : 200;
  const pfgSat = isPrimaryLight ? 10 : 0;

  // Determine panel background
  const panelRgba = isBgLight ? '255, 255, 255' : '0, 0, 0';

  return {
    foregroundHue: fgHue,
    foregroundSaturation: fgSat,
    foregroundLightness: fgLightness,
    primaryForegroundHue: pfgHue,
    primaryForegroundSaturation: pfgSat,
    primaryForegroundLightness: pfgLightness,
    panelBackgroundRgba: panelRgba,
  };
}

export function moodToHslString(mood: Mood): string {
  return `hsl(${mood.hue}, ${mood.saturation}%, ${mood.lightness}%)`;
}

export function moodToHslValues(mood: Mood): string {
  return `${mood.hue} ${mood.saturation}% ${mood.lightness}%`;
}

export const PREDEFINED_MOODS: Mood[] = [
  { hue: 54, saturation: 95, lightness: 65, name: "Joyful Yellow", adjective: "Joyful" },    // Yellow
  { hue: 30, saturation: 100, lightness: 60, name: "Energetic Orange", adjective: "Energetic" }, // Orange
  { hue: 210, saturation: 100, lightness: 70, name: "Calm Blue", adjective: "Calm" },      // Blue
  { hue: 130, saturation: 70, lightness: 60, name: "Peaceful Green", adjective: "Peaceful" },  // Green
  { hue: 300, saturation: 80, lightness: 65, name: "Creative Purple", adjective: "Creative" }, // Purple
  { hue: 0, saturation: 90, lightness: 60, name: "Passionate Red", adjective: "Passionate" }, // Red
];
