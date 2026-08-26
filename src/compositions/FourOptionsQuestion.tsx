import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import type { FourOptionsQuestion } from '../types';
import { getRevealStyle, WrongXOverlay, CorrectCheckOverlay } from '../components/AnswerReveal';
import { AutoText, OptionText } from '../components/AutoText';

const LABELS = ['A', 'B', 'C', 'D'];
const BADGE_COLORS = ['#E53935', '#1E88E5', '#43A047', '#FB8C00'];

export const FourOptionsQuestionComp: React.FC<{ question: FourOptionsQuestion }> = ({ question }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const revealFrame = question.timeLimit * fps;
  const isRevealing = frame >= revealFrame;
  const revealProgress = isRevealing
    ? interpolate(frame, [revealFrame + 5, revealFrame + 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 0;

  const titleOpacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: 'clamp' });

  // Subtle image float
  const imgFloat = Math.sin(frame * 0.03) * 4;
  const imgRotate = Math.sin(frame * 0.02) * 1.5;
  const imgSpring = spring({ frame, fps, config: { damping: 10 } });

  return (
    <AbsoluteFill>
      {/* QUESTION — top */}
      <div style={{
        position: 'absolute',
        top: 40,
        left: 110,
        right: 40,
        textAlign: 'center',
        opacity: titleOpacity,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 120,
      }}>
        <AutoText text={question.questionText} maxSize={72} minSize={42} />
      </div>

      {/* SPLIT: Image left + Options right */}
      <div style={{
        position: 'absolute',
        top: 170,
        left: 30,
        right: 30,
        bottom: 65,
        display: 'flex',
        gap: 24,
        alignItems: 'stretch',
      }}>
        {/* LEFT: Visual card with animation */}
        <div style={{
          flex: '0 0 42%',
          borderRadius: 24,
          overflow: 'hidden',
          border: '6px solid #fff',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          transform: `scale(${interpolate(imgSpring, [0, 1], [0.8, 1])}) translateY(${imgFloat}px) rotate(${imgRotate - 2}deg)`,
          background: 'linear-gradient(145deg, #667eea, #764ba2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 12,
        }}>
          <span style={{ fontSize: 100 }}>🤔</span>
          <span style={{ fontSize: 28, fontWeight: 700, color: 'rgba(255,255,255,0.8)', fontFamily: 'system-ui' }}>
            THINK...
          </span>
        </div>

        {/* RIGHT: 4 stacked options filling height */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}>
          {question.options.map((option, i) => {
            const delay = 6 + i * 3;
            const s = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 12 } });
            const translateX = interpolate(s, [0, 1], [60, 0]);
            const optOpacity = interpolate(s, [0, 1], [0, 1]);

            const isCorrect = option === question.correctAnswer;
            const revealStyles = getRevealStyle(option, question.correctAnswer, revealProgress);

            return (
              <div key={i} style={{
                position: 'relative',
                flex: 1,
                backgroundColor: '#FFFFFF',
                borderRadius: 20,
                boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '0 20px',
                transform: `translateX(${translateX}px)`,
                opacity: optOpacity,
                border: '3px solid transparent',
                ...revealStyles,
              }}>
                <div style={{
                  width: 54,
                  height: 54,
                  borderRadius: '50%',
                  backgroundColor: BADGE_COLORS[i],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                }}>
                  <span style={{ fontSize: 28, fontWeight: 900, color: '#fff', fontFamily: 'system-ui' }}>{LABELS[i]}</span>
                </div>
                <OptionText text={option} maxSize={38} minSize={22} />
                {isRevealing && isCorrect && <CorrectCheckOverlay revealProgress={revealProgress} />}
                {isRevealing && !isCorrect && <WrongXOverlay revealProgress={revealProgress} />}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
