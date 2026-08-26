import React from 'react';
import { spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const QuestionNumber: React.FC<{ number: number }> = ({ number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const popIn = spring({ frame, fps, config: { damping: 10, stiffness: 120 } });
  const scale = interpolate(popIn, [0, 1], [0, 1]);

  return (
    <div style={{
      position: 'absolute',
      top: 20,
      left: 25,
      transform: `scale(${scale})`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      zIndex: 100,
    }}>
      <span style={{ fontSize: 22, marginBottom: -6, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}>🧠</span>
      <div style={{
        width: 64,
        height: 64,
        borderRadius: '50%',
        backgroundColor: '#E53935',
        border: '3px solid rgba(255,255,255,0.4)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{
          fontSize: 32,
          fontWeight: 900,
          color: '#fff',
          fontFamily: 'system-ui',
          textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
        }}>
          {number}
        </span>
      </div>
    </div>
  );
};
