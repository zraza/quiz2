import React from 'react';
import { AbsoluteFill, spring, interpolate } from 'remotion';
import { OptionText } from '../components/AutoText';
import { QuestionCard } from '../components/QuestionCard';
import { TimerBar } from '../components/TimerBar';
import type { ImageOptionsQ } from '../types';
import { LABELS, BADGE_COLORS } from '../config';
import { useQuizTiming } from '../hooks/useQuizTiming';

// ponytail: placeholder gradients until real images are wired via <Img>
const PLACEHOLDER_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
];

/**
 * QuestionImageOptions: Question at top, 3 image cards side by side below.
 * On reveal: correct gets green border + ✓, wrong dim + red border.
 */
export const QuestionImageOptions: React.FC<{ question: ImageOptionsQ }> = ({ question }) => {
  const { frame, fps, spd, voFrames, quizFrame, isRevealing, revealProgress, timerProgress } = useQuizTiming(question);

  return (
    <AbsoluteFill>
      {/* QUESTION CARD — full width */}
      <QuestionCard text={question.questionText} isRevealing={isRevealing} revealProgress={revealProgress} />

      {/* 3 IMAGE OPTIONS — side by side */}
      <div style={{
        position: 'absolute',
        top: 230, left: 130, right: 130, bottom: 100,
        display: 'flex', gap: 60, alignItems: 'center',
      }}>
        {question.options.map((option, i) => {
          const delay = spd.entryDelay + i * spd.entryGap;
          const s = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: spd.springDamping, stiffness: spd.springStiffness, mass: spd.mass } });
          const scale = interpolate(s, [0, 1], [0.85, 1]);
          const optOpacity = interpolate(s, [0, 1], [0, 1]);

          const isCorrect = i === question.correctIndex;
          const isWrong = isRevealing && !isCorrect;
          const cardOpacity = isWrong ? 1 - revealProgress * 0.5 : 1;

          const borderColor = isRevealing
            ? isCorrect ? `rgba(76,175,80,${revealProgress})` : `rgba(229,57,53,${revealProgress * 0.6})`
            : 'rgba(255,255,255,0.9)';

          return (
            <div key={i} style={{
              flex: 1, height: '100%',
              position: 'relative',
              transform: `scale(${scale})`,
              opacity: optOpacity * cardOpacity,
            }}>
              {/* Image card */}
              <div style={{
                position: 'absolute', inset: 0, bottom: 40,
                borderRadius: 24, overflow: 'hidden',
                border: `6px solid ${borderColor}`,
                boxShadow: isRevealing && isCorrect
                  ? `0 8px 30px rgba(76,175,80,${revealProgress * 0.5})`
                  : '0 8px 30px rgba(0,0,0,0.2)',
                background: PLACEHOLDER_GRADIENTS[i],
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {/* Show image if URL provided */}
                {question.optionImages[i] && (
                  <img
                    src={question.optionImages[i]}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                )}

                {/* Correct badge */}
                {isRevealing && isCorrect && revealProgress > 0.2 && (
                  <div style={{
                    position: 'absolute', top: 16, right: 16,
                    width: 64, height: 64, borderRadius: '50%',
                    background: '#4CAF50',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transform: `scale(${interpolate(revealProgress, [0.2, 0.5], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })})`,
                    boxShadow: '0 4px 12px rgba(76,175,80,0.4)',
                  }}>
                    <span style={{ fontSize: 36, color: '#fff', fontWeight: 900 }}>✓</span>
                  </div>
                )}

                {/* Wrong badge */}
                {isWrong && revealProgress > 0.3 && (
                  <div style={{
                    position: 'absolute', top: 16, right: 16,
                    width: 56, height: 56, borderRadius: '50%',
                    background: '#E53935',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transform: `scale(${interpolate(revealProgress, [0.3, 0.6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })})`,
                    boxShadow: '0 4px 12px rgba(229,57,53,0.4)',
                  }}>
                    <span style={{ fontSize: 28, fontWeight: 900, color: '#fff' }}>✕</span>
                  </div>
                )}
              </div>

              {/* Label overlapping bottom border of image */}
              <div style={{
                position: 'absolute', bottom: 16, left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex', alignItems: 'center', gap: 14,
                background: '#FFFFFF', borderRadius: 20,
                padding: '12px 28px',
                boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                whiteSpace: 'nowrap',
              }}>
                <div style={{
                  width: 50, height: 50, borderRadius: '50%',
                  backgroundColor: BADGE_COLORS[i],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
                }}>
                  <span style={{ fontSize: 28, fontWeight: 900, color: '#fff', fontFamily: 'system-ui' }}>
                    {LABELS[i]}
                  </span>
                </div>
                <OptionText width={300} maxSize={40} minSize={20} color="#1a1a1a">
                  {option}
                </OptionText>
              </div>
            </div>
          );
        })}
      </div>

      {/* TIMER BAR */}
      <TimerBar progress={timerProgress} entryFrame={voFrames} visible={!isRevealing && frame >= voFrames} />
    </AbsoluteFill>
  );
};
