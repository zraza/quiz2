import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import type { AudioQuestion } from '../types';
import { getRevealStyle, WrongXOverlay, CorrectCheckOverlay } from '../components/AnswerReveal';
import { AutoText, OptionText } from '../components/AutoText';

const LABELS = ['A', 'B', 'C', 'D'];
const BADGE_COLORS = ['#E53935', '#1E88E5', '#43A047', '#FB8C00'];

export const AudioQuestionComp: React.FC<{ question: AudioQuestion }> = ({ question }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const revealFrame = question.timeLimit * fps;
  const isRevealing = frame >= revealFrame;
  const revealProgress = isRevealing
    ? interpolate(frame, [revealFrame + 5, revealFrame + 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 0;

  const titleOpacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: 'clamp' });
  const discRotation = frame * 1.5;
  const waveCount = 5;

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

      {/* AUDIO VIZ — fills center */}
      <div style={{
        position: 'absolute',
        top: 135,
        left: 0,
        right: 0,
        bottom: 210,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* Sound waves */}
        {Array.from({ length: waveCount }).map((_, i) => {
          const ringProgress = ((frame * 0.012 + i * 0.2) % 1);
          const size = 180 + ringProgress * 280;
          const opacity = interpolate(ringProgress, [0, 0.6, 1], [0.5, 0.2, 0]);
          return <div key={i} style={{ position: 'absolute', width: size, height: size, borderRadius: '50%', border: `3px solid rgba(255,255,255,${opacity})` }} />;
        })}

        {/* Vinyl */}
        <div style={{
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #333 0%, #111 40%, #222 60%, #111 100%)',
          border: '6px solid rgba(255,255,255,0.2)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
          transform: `rotate(${discRotation}deg)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {[45, 70, 95, 120].map((r) => (
            <div key={r} style={{ position: 'absolute', width: r * 2, height: r * 2, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)' }} />
          ))}
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #FF6B6B, #e53935)', border: '3px solid #222', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 36 }}>🎵</span>
          </div>
        </div>
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
