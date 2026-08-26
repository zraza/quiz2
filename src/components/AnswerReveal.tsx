import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

/**
 * AnswerReveal: Helper that provides reveal state for options.
 * Not a full-screen overlay — instead exports utility functions/components
 * for use within question compositions for in-place reveal.
 *
 * This component is kept for backward compatibility but does NOT render
 * a full-screen flash. It's a no-op overlay (transparent).
 */
export const AnswerReveal: React.FC<{
  correctAnswer: string;
  revealStartFrame: number;
}> = () => {
  // No full-screen overlay needed — reveal happens in-place on options
  return null;
};

/**
 * Get the reveal styling for an option card.
 * Returns inline styles to apply to the option container.
 */
export function getRevealStyle(
  option: string,
  correctAnswer: string,
  revealProgress: number,
): React.CSSProperties {
  const isCorrect = option === correctAnswer;

  if (revealProgress <= 0) return {};

  if (isCorrect) {
    return {
      backgroundColor: interpolateColor(revealProgress, '#FFFFFF', '#4CAF50'),
      borderColor: '#388E3C',
      borderWidth: 4,
      boxShadow: `0 4px 20px rgba(76, 175, 80, ${0.4 * revealProgress})`,
    };
  }

  return {
    backgroundColor: interpolateColor(revealProgress, '#FFFFFF', '#e0e0e0'),
    opacity: 1 - revealProgress * 0.3,
  };
}

/**
 * Red X overlay for wrong answers during reveal.
 */
export const WrongXOverlay: React.FC<{ revealProgress: number }> = ({ revealProgress }) => {
  if (revealProgress <= 0) return null;

  return (
    <div style={{
      position: 'absolute',
      right: 20,
      top: '50%',
      transform: 'translateY(-50%)',
      width: 40,
      height: 40,
      borderRadius: '50%',
      backgroundColor: '#F44336',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: revealProgress,
      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
    }}>
      <span style={{
        color: '#fff',
        fontSize: 24,
        fontWeight: 900,
        fontFamily: 'system-ui',
        lineHeight: 1,
      }}>✕</span>
    </div>
  );
};

/**
 * Green checkmark overlay for correct answer.
 */
export const CorrectCheckOverlay: React.FC<{ revealProgress: number }> = ({ revealProgress }) => {
  if (revealProgress <= 0) return null;

  return (
    <div style={{
      position: 'absolute',
      right: 20,
      top: '50%',
      transform: 'translateY(-50%)',
      width: 40,
      height: 40,
      borderRadius: '50%',
      backgroundColor: '#388E3C',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: revealProgress,
      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
    }}>
      <span style={{
        color: '#fff',
        fontSize: 24,
        fontWeight: 900,
        fontFamily: 'system-ui',
        lineHeight: 1,
      }}>✓</span>
    </div>
  );
};

// Simple linear color interpolation helper
function interpolateColor(progress: number, from: string, to: string): string {
  const f = hexToRgb(from);
  const t = hexToRgb(to);
  const r = Math.round(f.r + (t.r - f.r) * progress);
  const g = Math.round(f.g + (t.g - f.g) * progress);
  const b = Math.round(f.b + (t.b - f.b) * progress);
  return `rgb(${r}, ${g}, ${b})`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { r: 255, g: 255, b: 255 };
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}
