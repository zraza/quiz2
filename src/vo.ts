/**
 * VO utilities — shared between generation script and Remotion compositions.
 * Uses a simple hash (no Node crypto) for browser compatibility.
 */

import { staticFile } from 'remotion';

/** Simple string hash — produces a 12-char hex string */
function simpleHash(str: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const combined = 4294967296 * (2097151 & h2) + (h1 >>> 0);
  return combined.toString(16).padStart(12, '0').slice(0, 12);
}

/** Hash text to a short filename-safe string (12 chars) */
export function voHash(text: string): string {
  return simpleHash(text.trim().toLowerCase());
}

/** Get the full static URL for a VO file (uses Remotion's staticFile) */
export function voPath(text: string): string {
  return staticFile(`vo/${voHash(text)}.mp3`);
}
