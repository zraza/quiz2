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
 * TimerBar: Reusable progress bar that slides up from bottom on entry.
 * - Entry: grows from 0 height with spring
 * - Pulses when below 20%
 * - Shimmer effect across the bar
 */
export const TimerBar: React.FC<Props> = ({ progress, entryFrame, visible }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!visible) return null;

  // Entry animation — bar grows from 0 to full height
  const framesSinceEntry = Math.max(0, frame - entryFrame);
  const entrySpring = spring({ frame: framesSinceEntry, fps, config: { damping: 14, stiffness: 200, mass: 0.7 } });
  const currentHeight = TIMER_HEIGHT * entrySpring;

  // Pulse when urgent (below 20%)
  const urgent = progress < 0.2 && progress > 0;
  const pulseExtra = urgent ? Math.sin(frame * 0.5) * 8 : 0;
  const height = currentHeight + pulseExtra;

  // Color
  const barColor = progress > 0.5 ? '#4CAF50' : progress > 0.2 ? '#FF9800' : '#F44336';

  // Shimmer
  const shimmerPos = ((frame % 45) / 45) * 100;

  return (
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height,
      background: 'rgba(0,0,0,0.12)',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: `${progress * 100}%`,
        background: barColor,
        borderRadius: '0 4px 4px 0',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(90deg, transparent ${shimmerPos - 15}%, rgba(255,255,255,0.3) ${shimmerPos}%, transparent ${shimmerPos + 15}%)`,
        }} />
      </div>
    </div>
  );
};
