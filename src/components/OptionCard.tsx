import React from 'react';
import { spring, interpolate, useVideoConfig } from 'remotion';
import { OptionText } from './AutoText';
import { LABELS, BADGE_COLORS, CLAMP } from '../config';

interface Props {
  index: number;
  text: string;
  isCorrect: boolean;
  isRevealing: boolean;
  revealProgress: number;
  /** Frame to use for entry spring (usually frame - delay) */
  springFrame: number;
  /** Frame for shake animation (usually quizFrame) */
  quizFrame: number;
  /** Spring config */
  spd: { springDamping: number; springStiffness: number; mass: number };
  /** Text max width (default 380) */
  textWidth?: number;
}

/**
 * OptionCard: White card with letter badge, option text, and reveal ✓/✕.
 * Entry: slides in from right with spring.
 * Reveal: correct = green glow + shake + ✓, wrong = dim + ✕.
 */
export const OptionCard: React.FC<Props> = ({
  index, text, isCorrect, isRevealing, revealProgress, springFrame, quizFrame, spd, textWidth = 380,
}) => {
  const { fps } = useVideoConfig();
  const s = spring({ frame: Math.max(0, springFrame), fps, config: { damping: spd.springDamping, stiffness: spd.springStiffness, mass: spd.mass } });
  const translateX = interpolate(s, [0, 1], [50, 0]);
  const optOpacity = interpolate(s, [0, 1], [0, 1]);

  const isWrong = isRevealing && !isCorrect;
  const cardOpacity = isWrong ? 1 - revealProgress * 0.55 : 1;
  const shakeX = isRevealing && isCorrect && revealProgress < 0.5
    ? Math.sin(quizFrame * 1.5) * 4 * (1 - revealProgress * 2)
    : 0;

  return (
    <div style={{
      flex: 1,
      position: 'relative',
      backgroundColor: '#FFFFFF',
      borderRadius: 24,
      boxShadow: isRevealing && isCorrect
        ? `0 0 ${30 * revealProgress}px rgba(76,175,80,${revealProgress * 0.6}), 0 4px 16px rgba(0,0,0,0.08)`
        : '0 4px 16px rgba(0,0,0,0.08)',
      border: isRevealing && isCorrect ? `4px solid rgba(76,175,80,${revealProgress})` : '4px solid transparent',
      display: 'flex',
      alignItems: 'center',
      gap: 28,
      padding: '0 44px',
      transform: `translateX(${translateX + shakeX}px)${isRevealing && isCorrect ? ` scale(${1 + revealProgress * 0.03})` : ''}`,
      opacity: optOpacity * cardOpacity,
    }}>
      {/* Letter badge */}
      <div style={{
        width: 70, height: 70, borderRadius: '50%',
        backgroundColor: BADGE_COLORS[index],
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
      }}>
        <span style={{ fontSize: 36, fontWeight: 900, color: '#fff', fontFamily: 'system-ui' }}>
          {LABELS[index]}
        </span>
      </div>

      {/* Option text */}
      <OptionText width={textWidth} maxSize={48} minSize={24} color="#1a1a1a">
        {text}
      </OptionText>

      {/* Reveal badge */}
      {isRevealing && isCorrect && revealProgress > 0.2 && (
        <div style={{
          position: 'absolute', right: 36, width: 64, height: 64, borderRadius: '50%',
          background: '#4CAF50', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: `scale(${interpolate(revealProgress, [0.2, 0.5], [0, 1], CLAMP)})`,
          boxShadow: '0 4px 12px rgba(76,175,80,0.4)',
        }}>
          <span style={{ fontSize: 36, color: '#fff', fontWeight: 900 }}>✓</span>
        </div>
      )}
      {isWrong && revealProgress > 0.3 && (
        <div style={{
          position: 'absolute', right: 36, width: 64, height: 64, borderRadius: '50%',
          background: '#E53935', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: `scale(${interpolate(revealProgress, [0.3, 0.6], [0, 1], CLAMP)})`,
          boxShadow: '0 4px 12px rgba(229,57,53,0.4)',
        }}>
          <span style={{ fontSize: 32, fontWeight: 900, color: '#fff' }}>✕</span>
        </div>
      )}
    </div>
  );
};
