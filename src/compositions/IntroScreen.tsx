import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { AutoText, FONT_QUESTION, FONT_OPTION } from '../components/AutoText';

interface Props {
  title: string;
  subtitle?: string;
  questionCount?: number;
}

/**
 * IntroScreen: 5 seconds.
 * - Title SLAMS in (huge, fills screen width)
 * - Subtitle fades in below
 * - "X Questions • 10 Seconds Each"
 */
export const IntroScreen: React.FC<Props> = ({
  title,
  subtitle = 'Can You Score 10/10?',
  questionCount = 10,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title pop - PUNCHY
  const titleSpring = spring({ frame, fps, config: { damping: 12, stiffness: 200, mass: 0.8 } });
  const titleScale = interpolate(titleSpring, [0, 1], [0.3, 1]);
  const titleOpacity = interpolate(titleSpring, [0, 1], [0, 1]);

  // Subtitle fade - faster
  const subOpacity = interpolate(frame, [12, 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const subY = interpolate(frame, [12, 22], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Info line - faster
  const infoOpacity = interpolate(frame, [24, 34], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 80,
      gap: 30,
    }}>
      {/* Emoji/icon */}
      <div style={{
        fontSize: 100,
        opacity: titleOpacity,
        transform: `scale(${titleScale})`,
      }}>
        🧠
      </div>

      {/* Title — fills the width */}
      <div style={{
        transform: `scale(${titleScale})`,
        opacity: titleOpacity,
        width: '100%',
        textAlign: 'center',
      }}>
        <AutoText width={1600} maxSize={160} minSize={60}>
          {title}
        </AutoText>
      </div>

      {/* Subtitle */}
      <div style={{
        opacity: subOpacity,
        transform: `translateY(${subY}px)`,
        textAlign: 'center',
      }}>
        <span style={{
          fontSize: 56,
          fontWeight: 700,
          fontFamily: FONT_OPTION,
          color: 'rgba(255,255,255,0.9)',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
        }}>
          {subtitle}
        </span>
      </div>

      {/* Info line */}
      <div style={{
        opacity: infoOpacity,
        textAlign: 'center',
        marginTop: 20,
      }}>
        <span style={{
          fontSize: 36,
          fontWeight: 600,
          fontFamily: FONT_OPTION,
          color: 'rgba(255,255,255,0.6)',
          letterSpacing: 2,
        }}>
          {questionCount} QUESTIONS • 10 SECONDS EACH
        </span>
      </div>
    </AbsoluteFill>
  );
};
