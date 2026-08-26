import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import type { SimpleQuestion } from '../types';
import { getRevealStyle, WrongXOverlay, CorrectCheckOverlay } from '../components/AnswerReveal';
import { AutoText, OptionText } from '../components/AutoText';

const LABELS = ['A', 'B', 'C', 'D'];
const BADGE_COLORS = ['#E53935', '#1E88E5', '#43A047', '#FB8C00'];

export const SimpleQuestionComp: React.FC<{ question: SimpleQuestion }> = ({ question }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const revealFrame = question.timeLimit * fps;
  const isRevealing = frame >= revealFrame;
  const revealProgress = isRevealing
    ? interpolate(frame, [revealFrame + 5, revealFrame + 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 0;

  const titleOpacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill>
      {/* QUESTION — fills top area */}
      <div style={{
        position: 'absolute',
        top: 50,
        left: 110,
        right: 50,
        textAlign: 'center',
        opacity: titleOpacity,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 140,
      }}>
        <AutoText text={question.questionText} maxSize={76} minSize={44} />
      </div>

      {/* OPTIONS — 2x2 grid filling remaining space */}
      <div style={{
        position: 'absolute',
        top: 200,
        left: 40,
        right: 40,
        bottom: 70,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: 14,
      }}>
        {question.options.map((option, i) => {
          const delay = 4 + i * 3;
          const s = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 12 } });
          const scale = interpolate(s, [0, 1], [0.85, 1]);

          const isCorrect = option === question.correctAnswer;
          const revealStyles = getRevealStyle(option, question.correctAnswer, revealProgress);

          return (
            <div key={i} style={{
              position: 'relative',
              backgroundColor: '#FFFFFF',
              borderRadius: 24,
              boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              padding: '0 24px',
              transform: `scale(${scale})`,
              border: '3px solid transparent',
              ...revealStyles,
            }}>
              {/* Badge */}
              <div style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                backgroundColor: BADGE_COLORS[i],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
              }}>
                <span style={{ fontSize: 32, fontWeight: 900, color: '#fff', fontFamily: 'system-ui' }}>
                  {LABELS[i]}
                </span>
              </div>
              <OptionText text={option} maxSize={44} minSize={26} />
              {isRevealing && isCorrect && <CorrectCheckOverlay revealProgress={revealProgress} />}
              {isRevealing && !isCorrect && <WrongXOverlay revealProgress={revealProgress} />}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
