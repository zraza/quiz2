/**
 * GLOBAL CONFIG — single source of truth for all timing, styling, and behavior.
 * Change values here to affect the entire video.
 */

// ============ VIDEO ============
export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

// ============ TIMING (seconds) ============
export const INTRO_SECONDS = 5;
export const GETREADY_SECONDS = 3;
export const TRANSITION_SECONDS = 1.5;
export const HALFWAY_SECONDS = 3;
export const OUTRO_SECONDS = 5;
export const REVEAL_SECONDS = 3;

/** Gap between VO ending and timer starting */
export const VO_GAP_SECONDS = 1;

/** Max media playback duration (clue mode) */
export const MAX_MEDIA_SECONDS = 20;

// ============ TIMING (frames, derived) ============
export const INTRO_FRAMES = INTRO_SECONDS * FPS;
export const GETREADY_FRAMES = GETREADY_SECONDS * FPS;
export const TRANSITION_FRAMES = Math.round(TRANSITION_SECONDS * FPS);
export const HALFWAY_FRAMES = HALFWAY_SECONDS * FPS;
export const OUTRO_FRAMES = OUTRO_SECONDS * FPS;

// ============ LAYOUT ============
export const SIDE_MARGIN = 100;
export const QUESTION_CARD_TOP = 50;
export const CONTENT_TOP = 210;
export const CONTENT_BOTTOM = 80;
export const TIMER_HEIGHT = 44;

// ============ COLORS ============
export const BG_COLORS = ['#5BC0BE', '#6B4CE6', '#E85D75', '#F4A942', '#5BC0BE', '#6B4CE6', '#E85D75', '#F4A942', '#5BC0BE', '#6B4CE6'];
export const BADGE_COLORS = ['#E53935', '#43A047', '#1E88E5', '#FF9800', '#8E24AA', '#00897B'];
export const LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];
export const TIMER_COLORS = { good: '#4CAF50', warning: '#FF9800', danger: '#F44336' };

// ============ INTERPOLATION ============
export const CLAMP = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

// ============ VO ============
export const VO_VOICE = 'Daniel';
export const VO_RATE = 155; // words per minute

/** Estimate VO duration from text (words / rate + gap) */
export function estimateVoDuration(text: string): number {
  const words = text.split(/\s+/).length;
  return Math.ceil(words / 2.5) + VO_GAP_SECONDS;
}
