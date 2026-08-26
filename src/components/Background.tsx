import React from 'react';
import { AbsoluteFill } from 'remotion';

/**
 * Background: Solid bright color with sunburst rays radiating from center.
 * Alternating slightly lighter/darker rays using conic-gradient.
 */
export const Background: React.FC<{ color?: string }> = ({ color = '#5BC0BE' }) => {
  // Generate conic-gradient stops for sunburst rays (24 segments)
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
      {/* Base solid color */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: color,
      }} />
      {/* Sunburst rays overlay */}
      <div style={{
        position: 'absolute',
        inset: '-50%',
        width: '200%',
        height: '200%',
        left: '-50%',
        top: '-50%',
        background: `conic-gradient(from 0deg at 50% 50%, ${stops.join(', ')})`,
      }} />
    </AbsoluteFill>
  );
};
