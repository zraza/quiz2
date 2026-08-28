import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { FONT_QUESTION } from '../components/AutoText';

/**
 * BonusRoundScreen: Special transition before bonus questions.
 * Dark, dramatic, reward-feeling. Stars, glow, excitement.
 * Replaces the normal "17/22" QuestionTransition for bonus Qs.
 */
export const BonusRoundScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const totalFrames = Math.round(fps * 1.5);

  // Star entry (spring in)
  const starSpring = spring({ frame, fps, config: { damping: 10, stiffness: 180, mass: 0.6 } });
  const starScale = interpolate(starSpring, [0, 1], [0, 1.2]);
  const starRotate = interpolate(starSpring, [0, 1], [-30, 0]);

  // Text entry (slight delay)
  const textSpring = spring({ frame: Math.max(0, frame - 5), fps, config: { damping: 12, stiffness: 200, mass: 0.7 } });
  const textY = interpolate(textSpring, [0, 1], [60, 0]);
  const textOpacity = interpolate(textSpring, [0, 1], [0, 1]);

  // Subtext entry
  const subSpring = spring({ frame: Math.max(0, frame - 10), fps, config: { damping: 14, stiffness: 180, mass: 0.8 } });
  const subOpacity = interpolate(subSpring, [0, 1], [0, 1]);

  // Exit
  const exitProgress = interpolate(frame, [totalFrames - 10, totalFrames], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const exitScale = 1 + exitProgress * 0.15;
  const exitOpacity = 1 - exitProgress;

  // Glow pulse
  const glowPulse = 0.4 + Math.sin(frame * 0.3) * 0.2;

  // Particle rays (radiating lines)
  const rays = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * 360 + frame * 2;
    const length = 200 + Math.sin(frame * 0.15 + i) * 50;
    return { angle, length, opacity: 0.15 + Math.sin(frame * 0.2 + i * 0.5) * 0.1 };
  });

  return (
    <AbsoluteFill style={{
      background: 'linear-gradient(180deg, #0a0a2e 0%, #1a1a3e 50%, #0a0a2e 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      transform: `scale(${exitScale})`,
      opacity: exitOpacity,
    }}>
      {/* Radiating rays */}
      {rays.map((ray, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 3,
          height: ray.length,
          background: `linear-gradient(180deg, rgba(255,215,0,${ray.opacity}) 0%, transparent 100%)`,
          transformOrigin: '50% 0%',
          transform: `translate(-50%, 0) rotate(${ray.angle}deg)`,
        }} />
      ))}

      {/* Center glow */}
      <div style={{
        position: 'absolute',
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: `radial-gradient(circle, rgba(255,215,0,${glowPulse}) 0%, transparent 70%)`,
      }} />

      {/* Star emoji — big, rotates in */}
      <div style={{
        fontSize: 140,
        transform: `scale(${starScale}) rotate(${starRotate}deg)`,
        marginBottom: 20,
        filter: `drop-shadow(0 0 30px rgba(255,215,0,0.8))`,
      }}>
        ⭐
      </div>

      {/* BONUS ROUND text */}
      <div style={{
        fontSize: 110,
        fontFamily: FONT_QUESTION,
        color: '#fff',
        textShadow: '0 0 40px rgba(255,215,0,0.6), 0 4px 0 rgba(0,0,0,0.3)',
        transform: `translateY(${textY}px)`,
        opacity: textOpacity,
        letterSpacing: 4,
      }}>
        BONUS ROUND
      </div>

      {/* Subtext */}
      <div style={{
        fontSize: 42,
        fontFamily: FONT_QUESTION,
        color: 'rgba(255,215,0,0.9)',
        marginTop: 20,
        opacity: subOpacity,
        textShadow: '0 0 15px rgba(255,215,0,0.4)',
      }}>
        Up to 150 points!
      </div>
    </AbsoluteFill>
  );
};
