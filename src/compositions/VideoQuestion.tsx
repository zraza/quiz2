import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import type { VideoQuestion } from '../types';
import { getRevealStyle, WrongXOverlay, CorrectCheckOverlay } from '../components/AnswerReveal';
import { AutoText, OptionText } from '../components/AutoText';

const LABELS = ['A', 'B', 'C', 'D'];
const BADGE_COLORS = ['#E53935', '#1E88E5', '#43A047', '#FB8C00'];

export const VideoQuestionComp: React.FC<{ question: VideoQuestion }> = ({ question }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const revealFrame = question.timeLimit * fps;
  const isRevealing = frame >= revealFrame;
  const revealProgress = isRevealing
    ? interpolate(frame, [revealFrame + 5, revealFrame + 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 0;

  const titleOpacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: 'clamp' });
  const vidSpring = spring({ frame, fps, config: { damping: 10 } });
  const glowIntensity = interpolate(Math.sin(frame * 0.05), [-1, 1], [0.1, 0.3]);
  const barCount = 7;

  return (
    <AbsoluteFill>
      {/* QUESTION — top */}
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
        height: 100,
      }}>
        <AutoText text={question.questionText} maxSize={68} minSize={38} />
      </div>

      {/* VIDEO PANEL — fills center */}
      <div style={{
        position: 'absolute',
        top: 135,
        left: 40,
        right: 40,
        bottom: 210,
        borderRadius: 24,
        overflow: 'hidden',
        border: '5px solid rgba(255,255,255,0.9)',
        boxShadow: `0 8px 30px rgba(0,0,0,0.2), 0 0 30px rgba(255,255,255,${glowIntensity})`,
        background: '#0a0a14',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 16,
        transform: `scale(${interpolate(vidSpring, [0, 1], [0.9, 1])})`,
      }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.15)',
          border: '3px solid rgba(255,255,255,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{ width: 0, height: 0, borderLeft: '26px solid #fff', borderTop: '15px solid transparent', borderBottom: '15px solid transparent', marginLeft: 5 }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 36 }}>
          {Array.from({ length: barCount }).map((_, i) => (
            <div key={i} style={{ width: 7, height: interpolate(Math.sin(frame * (0.1 + i * 0.03) + i * 1.5), [-1, 1], [8, 32]), borderRadius: 4, background: '#4CAF50', opacity: 0.8 }} />
          ))}
        </div>
        <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.5)', fontWeight: 600, fontFamily: 'system-ui' }}>
          {question.videoTitle}
        </span>
      </div>

      {/* OPTIONS — row at bottom */}
      <div style={{
        position: 'absolute',
        bottom: 65,
        left: 30,
        right: 30,
        height: 120,
        display: 'flex',
        gap: 12,
      }}>
        {question.options.map((option, i) => {
          const delay = 8 + i * 3;
          const s = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 12 } });
          const translateY = interpolate(s, [0, 1], [30, 0]);
          const isCorrect = option === question.correctAnswer;
          const revealStyles = getRevealStyle(option, question.correctAnswer, revealProgress);

          return (
            <div key={i} style={{
              flex: 1,
              position: 'relative',
              backgroundColor: '#fff',
              borderRadius: 18,
              boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              transform: `translateY(${translateY}px)`,
              opacity: interpolate(s, [0, 1], [0, 1]),
              border: '3px solid transparent',
              ...revealStyles,
            }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: BADGE_COLORS[i], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 22, fontWeight: 900, color: '#fff', fontFamily: 'system-ui' }}>{LABELS[i]}</span>
              </div>
              <OptionText text={option} maxSize={34} minSize={20} />
              {isRevealing && isCorrect && <CorrectCheckOverlay revealProgress={revealProgress} />}
              {isRevealing && !isCorrect && <WrongXOverlay revealProgress={revealProgress} />}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
