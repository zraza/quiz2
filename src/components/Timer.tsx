import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const Timer: React.FC<{ totalSeconds: number }> = ({ totalSeconds }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const totalFrames = totalSeconds * fps;
  const progress = interpolate(frame, [0, totalFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  let barColor = '#4CAF50';
  let borderColor = '#388E3C';
  if (progress < 0.2) {
    barColor = '#F44336';
    borderColor = '#C62828';
  } else if (progress < 0.35) {
    barColor = '#FF9800';
    borderColor = '#E65100';
  }

  const shimmerOffset = (frame % 45) / 45;

  return (
    <div style={{
      position: 'absolute',
      bottom: 18,
      left: 50,
      right: 50,
      height: 32,
      borderRadius: 16,
      border: `3px solid ${borderColor}`,
      backgroundColor: 'rgba(0,0,0,0.2)',
      overflow: 'visible',
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: `${progress * 100}%`,
        borderRadius: 14,
        backgroundColor: barColor,
        overflow: 'hidden',
      }}>
        {/* Shimmer */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(90deg, transparent ${shimmerOffset * 100 - 20}%, rgba(255,255,255,0.3) ${shimmerOffset * 100}%, transparent ${shimmerOffset * 100 + 20}%)`,
        }} />
        {/* Top highlight */}
        <div style={{
          position: 'absolute',
          top: 3,
          left: 10,
          right: 10,
          height: 6,
          borderRadius: 3,
          backgroundColor: 'rgba(255,255,255,0.2)',
        }} />
      </div>

      {/* ? badge */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: `${progress * 100}%`,
        transform: 'translate(-50%, -50%)',
        width: 44,
        height: 44,
        borderRadius: '50%',
        backgroundColor: '#fff',
        border: `3px solid ${borderColor}`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
      }}>
        <span style={{ fontSize: 24, fontWeight: 900, color: barColor }}>?</span>
      </div>
    </div>
  );
};
