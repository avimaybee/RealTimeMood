
import type { Mood, SimpleMood } from '@/types';

export function moodToHslString(mood: Mood): string {
  return `hsl(${mood.hue}, ${mood.saturation}%, ${mood.lightness}%)`;
}

export function moodToHslValues(mood: Mood): string {
  return `${mood.hue} ${mood.saturation}% ${mood.lightness}%`;
}

// A curated list of 8 moods for the button grid, based on user feedback for
// clearer emotional representation.
export const PREDEFINED_MOODS: Mood[] = [
  { hue: 54, saturation: 95, lightness: 60, name: "Happy Yellow", adjective: "Happy", emoji: "😊" },
  { hue: 35, saturation: 100, lightness: 55, name: "Enthusiastic Orange", adjective: "Enthusiastic", emoji: "🔥" },
  { hue: 0, saturation: 90, lightness: 58, name: "Passionate Red", adjective: "Passionate", emoji: "❤️" },
  { hue: 340, saturation: 100, lightness: 70, name: "Compassionate Pink", adjective: "Compassionate", emoji: "🥰" },
  { hue: 215, saturation: 85, lightness: 65, name: "Calm Blue", adjective: "Calm", emoji: "😌" },
  { hue: 130, saturation: 70, lightness: 55, name: "Peaceful Green", adjective: "Peaceful", emoji: "🧘" },
  { hue: 280, saturation: 80, lightness: 60, name: "Imaginative Purple", adjective: "Imaginative", emoji: "💡" },
  { hue: 220, saturation: 10, lightness: 50, name: "Reflective Gray", adjective: "Reflective", emoji: "🌫️" },
];


const shortestAngleDiff = (a: number, b: number): number => {
    const diff = Math.abs(a - b);
    return Math.min(diff, 360 - diff);
};
  
export function findClosestMood(hue: number): Mood {
    if (!PREDEFINED_MOODS.length) {
      // Return a fallback mood if the array is empty
      return { hue: 54, saturation: 95, lightness: 65, name: "Happy Yellow", adjective: "Happy", emoji: "😊" };
    }
  
    return PREDEFINED_MOODS.reduce((prev, curr) => {
      const prevDiff = shortestAngleDiff(hue, prev.hue);
      const currDiff = shortestAngleDiff(hue, curr.hue);
      return currDiff < prevDiff ? curr : prev;
    });
}


/**
 * Averages an array of HSL color objects, correctly handling the circular nature of hue.
 * @param moods An array of {h, s, l} objects.
 * @returns A single {h, s, l} object representing the average color.
 */
export function averageHsl(moods: SimpleMood[]): SimpleMood {
  if (moods.length === 0) {
    return { h: 210, s: 100, l: 70 }; // Default to 'Calm'
  }
  
  let sumX = 0;
  let sumY = 0;
  let sumS = 0;
  let sumL = 0;

  for (const mood of moods) {
    const angle = (mood.h * Math.PI) / 180;
    sumX += Math.cos(angle);
    sumY += Math.sin(angle);
    sumS += mood.s;
    sumL += mood.l;
  }

  const avgX = sumX / moods.length;
  const avgY = sumY / moods.length;
  
  const avgAngle = Math.atan2(avgY, avgX);
  const avgHue = (avgAngle * 180) / Math.PI;

  return {
    h: (avgHue + 360) % 360,
    s: sumS / moods.length,
    l: sumL / moods.length,
  };
}
