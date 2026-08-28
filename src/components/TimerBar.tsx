import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { TIMER_HEIGHT } from '../config';

interface Props {
  progress: number;
  entryFrame: number;
  visible: boolean;
}

/**
 * TimerBar: Chunky, glossy, beveled progress bar.
 * Entry: entire bar scales up from bottom with the fill sweeping in.
 * Premium YouTube quiz style — 3D look with highlights and shadow.
 */
export const TimerBar: React.FC<Props> = ({ progress, entryFrame, visible }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!visible) return null;

  const sinceEntry = Math.max(0, frame - entryFrame);

  // Entry: scale Y from 0 → 1 (bar "pops up" from nothing)
  const scaleY = interpolate(sinceEntry, [0, 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Fill sweeps in (slight delay)
  const fillPct = sinceEntry < 20
    ? interpolate(sinceEntry, [6, 20], [0, progress * 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : progress * 100;

  // Urgent pulse
  const urgent = progress < 0.2 && progress > 0 && sinceEntry > 20;
  const pulse = urgent ? Math.sin(frame * 0.4) * 4 : 0;
  const height = TIMER_HEIGHT + pulse;

  // Color with gradient for 3D depth
  const baseColor = progress > 0.5 ? '#4CAF50' : progress > 0.2 ? '#FF9800' : '#F44336';
  const lightColor = progress > 0.5 ? '#81C784' : progress > 0.2 ? '#FFB74D' : '#EF5350';
  const darkColor = progress > 0.5 ? '#2E7D32' : progress > 0.2 ? '#E65100' : '#B71C1C';

  // Shimmer
  const shimmer = ((frame % 50) / 50) * 100;

  return (
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height,
      transform: `scaleY(${scaleY})`,
      transformOrigin: 'bottom',
      // Background track — dark, recessed look
      background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.25) 100%)',
      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), 0 -2px 8px rgba(0,0,0,0.1)',
    }}>
      {/* Fill bar — glossy bevel */}
      <div style={{
        position: 'absolute',
        top: 2,
        left: 2,
        bottom: 2,
        width: `calc(${fillPct}% - 4px)`,
        borderRadius: 4,
        // 3D gradient: light on top, dark on bottom
        background: `linear-gradient(180deg, ${lightColor} 0%, ${baseColor} 35%, ${baseColor} 65%, ${darkColor} 100%)`,
        boxShadow: `0 1px 3px ${darkColor}88, inset 0 1px 2px rgba(255,255,255,0.3)`,
      }}>
        {/* Top highlight — glass reflection */}
        <div style={{
          position: 'absolute',
          top: 2,
          left: 4,
          right: 4,
          height: '35%',
          borderRadius: 3,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.05) 100%)',
        }} />
        {/* Shimmer sweep */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 4,
          background: `linear-gradient(90deg, transparent ${shimmer - 10}%, rgba(255,255,255,0.2) ${shimmer}%, transparent ${shimmer + 10}%)`,
        }} />
      </div>

      {/* Right edge glow on the fill (makes the leading edge pop) */}
      {fillPct > 5 && (
        <div style={{
          position: 'absolute',
          top: 4,
          bottom: 4,
          left: `calc(${fillPct}% - 8px)`,
          width: 6,
          borderRadius: 3,
          background: `rgba(255,255,255,${0.15 + (urgent ? Math.sin(frame * 0.5) * 0.1 : 0)})`,
        }} />
      )}
    </div>
  );
};
