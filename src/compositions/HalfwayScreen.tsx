import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { FONT_QUESTION, FONT_OPTION } from '../components/AutoText';

/**
 * HalfwayScreen: Shown after question 5. Engagement prompt.
 * "HALFWAY!" big text + "Drop your score in the comments!"
 */
export const HalfwayScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pop = spring({ frame, fps, config: { damping: 12, stiffness: 200, mass: 0.8 } });
  const scale = interpolate(pop, [0, 1], [0.3, 1]);

  const subOpacity = interpolate(frame, [10, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 40,
      padding: 80,
    }}>
      {/* Emoji */}
      <span style={{ fontSize: 120, transform: `scale(${scale})` }}>🔥</span>

      {/* HALFWAY */}
      <span style={{
        fontSize: 140,
        fontFamily: FONT_QUESTION,
        color: '#fff',
        textShadow: '5px 5px 0 rgba(0,0,0,0.3)',
        transform: `scale(${scale})`,
        lineHeight: 1,
      }}>
        HALFWAY!
      </span>

      {/* Subtitle */}
      <span style={{
        fontSize: 48,
        fontWeight: 700,
        fontFamily: FONT_OPTION,
        color: 'rgba(255,255,255,0.8)',
        textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
        textAlign: 'center',
        opacity: subOpacity,
      }}>
        How are you doing? Drop your score in the comments!
      </span>
    </AbsoluteFill>
  );
};
