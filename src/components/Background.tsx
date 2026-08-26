import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';

/**
 * Background: Solid bright color with slowly rotating sunburst rays.
 */
export const Background: React.FC<{ color?: string }> = ({ color = '#5BC0BE' }) => {
  const frame = useCurrentFrame();
  const rotation = frame * 0.15; // slow spin

  const segments = 24;
  const stops: string[] = [];
  for (let i = 0; i < segments; i++) {
    const startDeg = (i / segments) * 360;
    const endDeg = ((i + 1) / segments) * 360;
    const rayColor = i % 2 === 0
      ? 'rgba(255,255,255,0.08)'
      : 'rgba(0,0,0,0.05)';
    stops.push(`${rayColor} ${startDeg}deg ${endDeg}deg`);
  }

  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', inset: 0, backgroundColor: color }} />
      <div style={{
        position: 'absolute',
        inset: '-50%',
        width: '200%',
        height: '200%',
        left: '-50%',
        top: '-50%',
        background: `conic-gradient(from 0deg at 50% 50%, ${stops.join(', ')})`,
        transform: `rotate(${rotation}deg)`,
      }} />
    </AbsoluteFill>
  );
};
