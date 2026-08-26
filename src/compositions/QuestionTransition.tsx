import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { FONT_QUESTION, FONT_OPTION } from '../components/AutoText';

interface Props {
  questionNumber: number;
  totalQuestions: number;
}

/**
 * QuestionTransition: 1.5 seconds.
 * 
 * Creative layout:
 * - Big number (current) on the left
 * - Slash divider animated
 * - Total on the right (smaller, dimmer)
 * - Like a scoreboard: 23 / 50
 */
export const QuestionTransition: React.FC<Props> = ({ questionNumber, totalQuestions }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const totalFrames = Math.round(fps * 1.5);

  // Number slides in from left - FAST
  const numSpring = spring({ frame, fps, config: { damping: 14, stiffness: 220, mass: 0.7 } });
  const numX = interpolate(numSpring, [0, 1], [-120, 0]);
  const numOpacity = interpolate(numSpring, [0, 1], [0, 1]);

  // Slash grows - SNAPPY
  const slashSpring = spring({ frame: Math.max(0, frame - 4), fps, config: { damping: 14, stiffness: 250, mass: 0.6 } });
  const slashScale = interpolate(slashSpring, [0, 1], [0, 1]);

  // Total slides in from right - FAST
  const totalSpring = spring({ frame: Math.max(0, frame - 7), fps, config: { damping: 12, stiffness: 200, mass: 0.7 } });
  const totalX = interpolate(totalSpring, [0, 1], [80, 0]);
  const totalOpacity = interpolate(totalSpring, [0, 1], [0, 1]);

  // Exit
  const exitStart = totalFrames - 10;
  const exitProgress = interpolate(frame, [exitStart, totalFrames], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const exitScale = 1 + exitProgress * 0.2;
  const exitOpacity = 1 - exitProgress;

  // Progress fill (how far through the quiz)
  const progressPct = (questionNumber / totalQuestions) * 100;

  return (
    <AbsoluteFill style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      transform: `scale(${exitScale})`,
      opacity: exitOpacity,
    }}>
      {/* Main number display */}
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 20,
      }}>
        {/* Current number — BIG */}
        <span style={{
          fontSize: 260,
          fontWeight: 400,
          fontFamily: FONT_QUESTION,
          color: '#fff',
          textShadow: '5px 5px 0 rgba(0,0,0,0.2)',
          transform: `translateX(${numX}px)`,
          opacity: numOpacity,
          lineHeight: 0.85,
        }}>
          {questionNumber}
        </span>

        {/* Slash */}
        <span style={{
          fontSize: 160,
          fontWeight: 400,
          fontFamily: FONT_QUESTION,
          color: 'rgba(255,255,255,0.3)',
          transform: `scale(${slashScale})`,
          lineHeight: 0.85,
        }}>
          /
        </span>

        {/* Total — smaller, dimmer */}
        <span style={{
          fontSize: 120,
          fontWeight: 400,
          fontFamily: FONT_QUESTION,
          color: 'rgba(255,255,255,0.4)',
          textShadow: '3px 3px 0 rgba(0,0,0,0.1)',
          transform: `translateX(${totalX}px)`,
          opacity: totalOpacity,
          lineHeight: 0.85,
        }}>
          {totalQuestions}
        </span>
      </div>

      {/* Thin progress bar underneath */}
      <div style={{
        marginTop: 50,
        width: '40%',
        height: 8,
        borderRadius: 4,
        background: 'rgba(255,255,255,0.15)',
        overflow: 'hidden',
        opacity: totalOpacity,
      }}>
        <div style={{
          height: '100%',
          width: `${progressPct}%`,
          background: '#fff',
          borderRadius: 4,
        }} />
      </div>
    </AbsoluteFill>
  );
};
