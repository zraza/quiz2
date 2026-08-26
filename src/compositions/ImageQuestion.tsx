import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import type { ImageQuestion } from '../types';
import { AutoText } from '../components/AutoText';
import { FONT_OPTION } from '../fonts';

const LABELS = ['A', 'B', 'C'];

/**
 * ImageQuestion: THREE IMAGE CARDS filling the screen (Quiz Blitz style).
 * Question at top, 3 large cards side-by-side, labels at bottom of each card.
 * Subtle floating animation. On reveal: correct = color + green, wrong = greyscale + red X.
 */
export const ImageQuestionComp: React.FC<{ question: ImageQuestion }> = ({ question }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const revealFrame = question.timeLimit * fps;
  const isRevealing = frame >= revealFrame;
  const revealProgress = isRevealing
    ? interpolate(frame, [revealFrame + 5, revealFrame + 25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 0;

  const titleOpacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: 'clamp' });

  const IMAGE_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1'];
  const IMAGE_EMOJIS = ['🎬', '🎭', '🎪'];

  return (
    <AbsoluteFill>
      {/* QUESTION — top, fills width */}
      <div style={{
        position: 'absolute',
        top: 25,
        left: 110,
        right: 40,
        textAlign: 'center',
        opacity: titleOpacity,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 110,
      }}>
        <AutoText text={question.questionText} maxSize={72} minSize={40} />
      </div>

      {/* THREE IMAGE CARDS — filling the screen */}
      <div style={{
        position: 'absolute',
        top: 145,
        left: 30,
        right: 30,
        bottom: 65,
        display: 'flex',
        gap: 16,
        alignItems: 'stretch',
      }}>
        {question.options.map((option, i) => {
          const delay = 3 + i * 4;
          const s = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 10, stiffness: 80 } });
          const scale = interpolate(s, [0, 1], [0.7, 1]);

          // Subtle floating (different phase per card)
          const floatY = Math.sin((frame + i * 40) * 0.04) * 5;
          const floatRotate = Math.sin((frame + i * 60) * 0.02) * 1.2;

          const isCorrect = option === question.correctAnswer;
          const isWrong = isRevealing && !isCorrect;
          const borderColor = isRevealing
            ? isCorrect ? '#4CAF50' : 'rgba(200,200,200,0.3)'
            : '#fff';

          return (
            <div key={i} style={{
              flex: 1,
              position: 'relative',
              borderRadius: 24,
              overflow: 'hidden',
              border: `6px solid ${borderColor}`,
              boxShadow: isRevealing && isCorrect
                ? '0 8px 30px rgba(76, 175, 80, 0.5)'
                : '0 8px 24px rgba(0,0,0,0.15)',
              transform: `scale(${scale}) translateY(${floatY}px) rotate(${floatRotate}deg)`,
              filter: isWrong ? `grayscale(${revealProgress})` : 'none',
              opacity: isWrong ? 1 - revealProgress * 0.3 : 1,
            }}>
              {/* Image placeholder */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(145deg, ${IMAGE_COLORS[i]}, ${IMAGE_COLORS[i]}cc)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{ fontSize: 100 }}>{IMAGE_EMOJIS[i]}</span>
              </div>

              {/* Label at bottom */}
              <div style={{
                position: 'absolute',
                bottom: 14,
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: isRevealing && isCorrect ? '#4CAF50' : '#fff',
                borderRadius: 14,
                padding: '10px 20px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}>
                <span style={{
                  fontSize: 26,
                  fontWeight: 900,
                  color: isRevealing && isCorrect ? '#fff' : '#1a1a1a',
                  fontFamily: 'system-ui',
                }}>
                  {LABELS[i]}
                </span>
                <span style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: isRevealing && isCorrect ? '#fff' : '#333',
                  fontFamily: FONT_OPTION,
                }}>
                  {option}
                </span>
              </div>

              {/* Red X on wrong */}
              {isWrong && revealProgress > 0.3 && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: `rgba(0,0,0,${revealProgress * 0.3})`,
                }}>
                  <div style={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    backgroundColor: '#E53935',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: `scale(${interpolate(revealProgress, [0.3, 0.7], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })})`,
                    boxShadow: '0 4px 20px rgba(229, 57, 53, 0.4)',
                  }}>
                    <span style={{ fontSize: 56, fontWeight: 900, color: '#fff' }}>✕</span>
                  </div>
                </div>
              )}

              {/* Green check on correct */}
              {isRevealing && isCorrect && revealProgress > 0.3 && (
                <div style={{
                  position: 'absolute',
                  top: 14,
                  right: 14,
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  backgroundColor: '#4CAF50',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: `scale(${interpolate(revealProgress, [0.3, 0.7], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })})`,
                  boxShadow: '0 4px 12px rgba(76,175,80,0.5)',
                }}>
                  <span style={{ fontSize: 36, color: '#fff' }}>✓</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
