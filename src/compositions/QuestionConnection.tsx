import React from 'react';
import { AbsoluteFill, spring, interpolate } from 'remotion';
import { OptionText, AutoText } from '../components/AutoText';
import { QuestionCard } from '../components/QuestionCard';
import { TimerBar } from '../components/TimerBar';
import { OptionCard } from '../components/OptionCard';
import type { ConnectionQ } from '../types';
import { useQuizTiming } from '../hooks/useQuizTiming';
import { CLAMP } from '../config';

/**
 * QuestionConnection: 4 items in cards (horizontal row). "What connects these?"
 * 4 options below. On reveal: connection text appears above with connecting line.
 */
export const QuestionConnection: React.FC<{ question: ConnectionQ }> = ({ question }) => {
  const { frame, fps, spd, voFrames, quizFrame, isRevealing, revealProgress, timerProgress } = useQuizTiming(question);

  // Item card colors for variety
  const cardColors = ['#E3F2FD', '#FFF3E0', '#E8F5E9', '#FCE4EC'];
  const accentColors = ['#1E88E5', '#FF9800', '#43A047', '#E91E63'];

  return (
    <AbsoluteFill>
      {/* QUESTION CARD */}
      <QuestionCard text={question.questionText} isRevealing={isRevealing} revealProgress={revealProgress} />

      {/* CONNECTION TEXT — appears on reveal above items */}
      {isRevealing && revealProgress > 0.3 && (
        <div style={{
          position: 'absolute',
          top: 200,
          left: 100,
          right: 100,
          display: 'flex',
          justifyContent: 'center',
          opacity: interpolate(revealProgress, [0.3, 0.6], [0, 1], CLAMP),
          transform: `translateY(${interpolate(revealProgress, [0.3, 0.6], [-15, 0], CLAMP)}px)`,
          zIndex: 10,
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #FFD700, #FFA000)',
            borderRadius: 20,
            padding: '16px 50px',
            boxShadow: `0 6px 30px rgba(255,193,7,${revealProgress * 0.5})`,
          }}>
            <OptionText width={1000} maxSize={44} minSize={24} color="#fff">
              {`🔗 ${question.connection}`}
            </OptionText>
          </div>
        </div>
      )}

      {/* 4 ITEM CARDS — horizontal row */}
      <div style={{
        position: 'absolute',
        top: isRevealing ? 290 : 240,
        left: 100,
        right: 100,
        height: 320,
        display: 'flex',
        gap: 32,
        alignItems: 'center',
      }}>
        {question.items.map((item, i) => {
          const delay = spd.entryDelay + i * spd.entryGap;
          const s = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: spd.springDamping, stiffness: spd.springStiffness, mass: spd.mass } });
          const scale = interpolate(s, [0, 1], [0.85, 1]);
          const cardOpacity = interpolate(s, [0, 1], [0, 1]);

          // Gentle float
          const floatY = Math.sin(frame * 0.04 + i * 1.2) * 3;

          // On reveal, all cards glow green (they're all connected)
          const revealGlow = isRevealing
            ? `0 0 ${25 * revealProgress}px rgba(76,175,80,${revealProgress * 0.4})`
            : '';

          return (
            <div key={i} style={{
              flex: 1,
              height: '100%',
              borderRadius: 24,
              background: cardColors[i],
              border: isRevealing
                ? `5px solid rgba(76,175,80,${revealProgress})`
                : `5px solid ${accentColors[i]}22`,
              boxShadow: `0 8px 28px rgba(0,0,0,0.1)${revealGlow ? ', ' + revealGlow : ''}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
              gap: 16,
              transform: `scale(${scale}) translateY(${floatY}px)`,
              opacity: cardOpacity,
              position: 'relative',
            }}>
              {/* Item number badge */}
              <div style={{
                position: 'absolute',
                top: 14,
                left: 14,
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: accentColors[i],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{ fontSize: 24, fontWeight: 900, color: '#fff', fontFamily: 'system-ui' }}>
                  {i + 1}
                </span>
              </div>

              {/* Item text */}
              <OptionText width={320} maxSize={48} minSize={26} color="#1a1a1a">
                {item}
              </OptionText>

              {/* Connection line indicator on reveal */}
              {isRevealing && revealProgress > 0.5 && i < question.items.length - 1 && (
                <div style={{
                  position: 'absolute',
                  right: -20,
                  top: '50%',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#4CAF50',
                  opacity: interpolate(revealProgress, [0.5, 0.8], [0, 1], CLAMP),
                  zIndex: 5,
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Connecting line across items on reveal */}
      {isRevealing && revealProgress > 0.4 && (
        <div style={{
          position: 'absolute',
          top: isRevealing ? 450 : 400,
          left: 160,
          right: 160,
          height: 4,
          borderRadius: 2,
          background: `linear-gradient(90deg, transparent, rgba(76,175,80,${revealProgress}), rgba(76,175,80,${revealProgress}), transparent)`,
          opacity: interpolate(revealProgress, [0.4, 0.7], [0, 1], CLAMP),
        }} />
      )}

      {/* OPTIONS — 4 in a row at bottom */}
      <div style={{
        position: 'absolute',
        bottom: 60,
        left: 80,
        right: 80,
        height: 180,
        display: 'flex',
        gap: 20,
        alignItems: 'center',
      }}>
        {question.options.map((option, i) => (
          <OptionCard
            key={i}
            index={i}
            text={option}
            isCorrect={option === question.correctAnswer}
            isRevealing={isRevealing}
            revealProgress={revealProgress}
            springFrame={frame - (spd.entryDelay + (question.items.length + i) * spd.entryGap)}
            quizFrame={quizFrame}
            spd={spd}
            textWidth={280}
          />
        ))}
      </div>

      {/* TIMER BAR */}
      <TimerBar progress={timerProgress} entryFrame={voFrames} visible={!isRevealing && frame >= voFrames} />
    </AbsoluteFill>
  );
};
