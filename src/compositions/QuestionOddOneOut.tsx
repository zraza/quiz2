import React from 'react';
import { AbsoluteFill, Img, spring, interpolate } from 'remotion';
import { OptionText } from '../components/AutoText';
import { QuestionCard } from '../components/QuestionCard';
import { TimerBar } from '../components/TimerBar';
import type { OddOneOutQ } from '../types';
import { useQuizTiming } from '../hooks/useQuizTiming';
import { CLAMP } from '../config';

/**
 * QuestionOddOneOut: 4 items in a 2x2 grid. One doesn't belong.
 * On reveal: odd one gets red border + X, others get green + ✓.
 * Explanation text appears below the grid.
 */
export const QuestionOddOneOut: React.FC<{ question: OddOneOutQ }> = ({ question }) => {
  const { frame, fps, spd, voFrames, quizFrame, isRevealing, revealProgress, timerProgress } = useQuizTiming(question);

  return (
    <AbsoluteFill>
      {/* QUESTION CARD */}
      <QuestionCard text={question.questionText} isRevealing={isRevealing} revealProgress={revealProgress} />

      {/* 2×2 GRID */}
      <div style={{
        position: 'absolute',
        top: 220,
        left: 160,
        right: 160,
        bottom: isRevealing ? 180 : 80,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: 36,
      }}>
        {question.items.map((item, i) => {
          const delay = spd.entryDelay + i * spd.entryGap;
          const s = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: spd.springDamping, stiffness: spd.springStiffness, mass: spd.mass } });
          const scale = interpolate(s, [0, 1], [0.85, 1]);
          const cardOpacity = interpolate(s, [0, 1], [0, 1]);

          const isOdd = i === question.oddIndex;
          const isNormal = !isOdd;

          // Reveal styling
          const borderColor = isRevealing
            ? isOdd
              ? `rgba(229,57,53,${revealProgress})`
              : `rgba(76,175,80,${revealProgress})`
            : 'rgba(255,255,255,0.2)';
          const borderWidth = isRevealing ? 6 : 4;

          // Shake the odd one on reveal
          const shakeX = isRevealing && isOdd && revealProgress < 0.5
            ? Math.sin(quizFrame * 1.8) * 5 * (1 - revealProgress * 2)
            : 0;

          return (
            <div key={i} style={{
              position: 'relative',
              borderRadius: 24,
              background: '#FFFFFF',
              border: `${borderWidth}px solid ${borderColor}`,
              boxShadow: isRevealing && isOdd
                ? `0 0 ${30 * revealProgress}px rgba(229,57,53,${revealProgress * 0.5}), 0 8px 24px rgba(0,0,0,0.1)`
                : isRevealing && isNormal
                  ? `0 0 ${20 * revealProgress}px rgba(76,175,80,${revealProgress * 0.3}), 0 8px 24px rgba(0,0,0,0.1)`
                  : '0 8px 24px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              padding: 24,
              overflow: 'hidden',
              transform: `scale(${scale}) translateX(${shakeX}px)${isRevealing && isOdd ? ` scale(${1 - revealProgress * 0.03})` : ''}`,
              opacity: cardOpacity,
            }}>
              {/* Image if available */}
              {item.image && (
                <div style={{
                  width: '70%',
                  aspectRatio: '16/10',
                  borderRadius: 16,
                  overflow: 'hidden',
                  flexShrink: 0,
                }}>
                  <Img
                    src={item.image}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              )}

              {/* Label */}
              <OptionText width={500} maxSize={item.image ? 40 : 56} minSize={24} color="#1a1a1a">
                {item.label}
              </OptionText>

              {/* Reveal badge: ✓ or ✕ */}
              {isRevealing && revealProgress > 0.25 && (
                <div style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: isOdd ? '#E53935' : '#4CAF50',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: `scale(${interpolate(revealProgress, [0.25, 0.55], [0, 1], CLAMP)})`,
                  boxShadow: isOdd
                    ? '0 4px 12px rgba(229,57,53,0.4)'
                    : '0 4px 12px rgba(76,175,80,0.4)',
                }}>
                  <span style={{ fontSize: 36, color: '#fff', fontWeight: 900 }}>
                    {isOdd ? '✕' : '✓'}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* EXPLANATION — appears on reveal below grid */}
      {isRevealing && revealProgress > 0.4 && (
        <div style={{
          position: 'absolute',
          bottom: 60,
          left: 160,
          right: 160,
          display: 'flex',
          justifyContent: 'center',
          opacity: interpolate(revealProgress, [0.4, 0.7], [0, 1], CLAMP),
          transform: `translateY(${interpolate(revealProgress, [0.4, 0.7], [20, 0], CLAMP)}px)`,
        }}>
          <div style={{
            background: 'rgba(0,0,0,0.75)',
            borderRadius: 20,
            padding: '20px 50px',
            backdropFilter: 'blur(10px)',
          }}>
            <OptionText width={1200} maxSize={42} minSize={24} color="#fff">
              {question.explanation}
            </OptionText>
          </div>
        </div>
      )}

      {/* TIMER BAR */}
      <TimerBar progress={timerProgress} entryFrame={voFrames} visible={!isRevealing && frame >= voFrames} />
    </AbsoluteFill>
  );
};
