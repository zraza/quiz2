import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { FONT_QUESTION } from '../components/AutoText';

/**
 * GetReady: 3 seconds. Shows 3... 2... 1... with each number
 * scaling up and fading out before the next appears.
 */
export const GetReady: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const framesPerCount = fps; // 1 second each
  const countIndex = Math.floor(frame / framesPerCount); // 0, 1, 2
  const frameInCount = frame % framesPerCount;

  const numbers = ['3', '2', '1'];
  const currentNumber = numbers[Math.min(countIndex, 2)];

  // Each number pops in fast and punchy
  const pop = spring({ frame: frameInCount, fps, config: { damping: 12, stiffness: 220, mass: 0.7 } });
  const scale = interpolate(pop, [0, 1], [0.2, 1]);
  const opacity = interpolate(frameInCount, [0, fps * 0.6, fps - 1], [0, 1, 0.2], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 20,
    }}>
      {/* "GET READY" label */}
      <span style={{
        fontSize: 64,
        fontWeight: 700,
        fontFamily: FONT_QUESTION,
        color: 'rgba(255,255,255,0.7)',
        textShadow: '3px 3px 6px rgba(0,0,0,0.3)',
        letterSpacing: 4,
      }}>
        GET READY
      </span>

      {/* Big number */}
      <span style={{
        fontSize: 300,
        fontWeight: 400,
        fontFamily: FONT_QUESTION,
        color: '#fff',
        textShadow: '6px 6px 0 rgba(0,0,0,0.3), 3px 3px 0 rgba(0,0,0,0.2)',
        transform: `scale(${scale})`,
        opacity,
        lineHeight: 1,
      }}>
        {currentNumber}
      </span>
    </AbsoluteFill>
  );
};
