import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { TIMER_HEIGHT } from '../config';

interface Props {
  /** 0-1, where 1 = full time remaining */
  progress: number;
  /** Frame at which the timer first appears (for entry animation) */
  entryFrame: number;
  /** Whether to show the timer at all */
  visible: boolean;
}

/**
 * TimerBar: Thick progress bar with dramatic entry.
 * 
 * Entry: bar slides up from below the screen + the fill sweeps from left to right.
 * During countdown: smooth color transition + shimmer.
 * Urgent: bar grows taller and pulses.
 */
export const TimerBar: React.FC<Props> = ({ progress, entryFrame, visible }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!visible) return null;

  const framesSinceEntry = Math.max(0, frame - entryFrame);

  // Slide up from below — translateY goes from 100% (hidden below) to 0
  const slideUp = interpolate(framesSinceEntry, [0, 12], [TIMER_HEIGHT + 10, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Fill sweeps in from left (slight delay after bar appears)
  const fillWidth = interpolate(framesSinceEntry, [4, 18], [0, progress * 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // After entry animation completes, use actual progress
  const displayWidth = framesSinceEntry > 18 ? progress * 100 : fillWidth;

  // Pulse when urgent (below 20%)
  const urgent = progress < 0.2 && progress > 0 && framesSinceEntry > 18;
  const pulseExtra = urgent ? Math.sin(frame * 0.5) * 6 : 0;
  const height = TIMER_HEIGHT + pulseExtra;

  // Color
  const barColor = progress > 0.5 ? '#4CAF50' : progress > 0.2 ? '#FF9800' : '#F44336';

  // Shimmer
  const shimmerPos = ((frame % 40) / 40) * 100;

  // Glow when urgent
  const glowShadow = urgent
    ? `0 -4px 16px ${barColor}55, 0 0 8px ${barColor}33`
    : '0 -2px 8px rgba(0,0,0,0.1)';

  return (
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height,
      background: 'rgba(0,0,0,0.15)',
      transform: `translateY(${slideUp}px)`,
      boxShadow: glowShadow,
    }}>
      {/* Fill bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: `${displayWidth}%`,
        background: barColor,
        borderRadius: '0 4px 4px 0',
      }}>
        {/* Shimmer */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(90deg, transparent ${shimmerPos - 12}%, rgba(255,255,255,0.35) ${shimmerPos}%, transparent ${shimmerPos + 12}%)`,
        }} />
        {/* Top highlight edge */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: 'rgba(255,255,255,0.25)',
          borderRadius: '4px 4px 0 0',
        }} />
      </div>
    </div>
  );
};
