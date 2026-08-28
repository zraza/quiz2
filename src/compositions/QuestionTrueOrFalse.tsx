import React from 'react';
import { AbsoluteFill, spring, interpolate } from 'remotion';
import { AutoText } from '../components/AutoText';
import { QuestionCard } from '../components/QuestionCard';
import { TimerBar } from '../components/TimerBar';
import type { TrueOrFalseQ } from '../types';
import { useQuizTiming } from '../hooks/useQuizTiming';
import { CLAMP } from '../config';

/**
 * QuestionTrueOrFalse: Statement in center, two giant TRUE/FALSE buttons below.
 * On reveal: correct one glows + scales up, wrong one dims.
 */
export const QuestionTrueOrFalse: React.FC<{ question: TrueOrFalseQ }> = ({ question }) => {
  const { frame, fps, spd, voFrames, quizFrame, isRevealing, revealProgress, timerProgress } = useQuizTiming(question);

  const isTrue = question.correctAnswer === 'true';

  // Statement entry
  const stmtSpring = spring({ frame: Math.max(0, frame - spd.entryDelay), fps, config: { damping: spd.springDamping, stiffness: spd.springStiffness, mass: spd.mass } });
  const stmtScale = interpolate(stmtSpring, [0, 1], [0.9, 1]);
  const stmtOpacity = interpolate(stmtSpring, [0, 1], [0, 1]);

  // Button entries
  const btnSpringTrue = spring({ frame: Math.max(0, frame - spd.entryDelay - spd.entryGap * 2), fps, config: { damping: spd.springDamping, stiffness: spd.springStiffness, mass: spd.mass } });
  const btnSpringFalse = spring({ frame: Math.max(0, frame - spd.entryDelay - spd.entryGap * 3), fps, config: { damping: spd.springDamping, stiffness: spd.springStiffness, mass: spd.mass } });

  const trueScale = interpolate(btnSpringTrue, [0, 1], [0.8, 1]);
  const falseScale = interpolate(btnSpringFalse, [0, 1], [0.8, 1]);
  const trueOpacity = interpolate(btnSpringTrue, [0, 1], [0, 1]);
  const falseOpacity = interpolate(btnSpringFalse, [0, 1], [0, 1]);

  // Reveal effects
  const winnerScale = 1 + revealProgress * 0.08;
  const loserScale = 1 - revealProgress * 0.05;
  const loserOpacity = 1 - revealProgress * 0.6;

  // Glow pulse
  const glowPulse = isRevealing ? revealProgress : 0;

  return (
    <AbsoluteFill>
      {/* QUESTION CARD */}
      <QuestionCard text={question.questionText} isRevealing={isRevealing} revealProgress={revealProgress} />

      {/* STATEMENT — huge, centered */}
      <div style={{
        position: 'absolute',
        top: 240,
        left: 120,
        right: 120,
        bottom: 380,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: stmtOpacity,
        transform: `scale(${stmtScale})`,
      }}>
        <div style={{
          background: '#FFFFFF',
          borderRadius: 32,
          padding: '50px 70px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
          textAlign: 'center',
          maxWidth: 1400,
        }}>
          <AutoText width={1200} maxSize={80} minSize={36} maxLines={3} color="#1a1a1a" shadow={false}>
            {question.statement}
          </AutoText>
        </div>
      </div>

      {/* TRUE / FALSE BUTTONS */}
      <div style={{
        position: 'absolute',
        bottom: 80,
        left: 150,
        right: 150,
        height: 260,
        display: 'flex',
        gap: 60,
        alignItems: 'center',
      }}>
        {/* TRUE BUTTON */}
        <div style={{
          flex: 1,
          height: '100%',
          borderRadius: 32,
          background: isRevealing && !isTrue
            ? `linear-gradient(145deg, #66BB6A, #43A047)`
            : 'linear-gradient(145deg, #66BB6A, #2E7D32)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          transform: `scale(${trueScale * (isRevealing ? (isTrue ? winnerScale : loserScale) : 1)})`,
          opacity: trueOpacity * (isRevealing && !isTrue ? loserOpacity : 1),
          boxShadow: isRevealing && isTrue
            ? `0 0 ${60 * glowPulse}px rgba(76,175,80,${glowPulse * 0.8}), 0 8px 30px rgba(0,0,0,0.2)`
            : '0 8px 30px rgba(0,0,0,0.2)',
          border: isRevealing && isTrue
            ? `6px solid rgba(255,255,255,${0.5 + glowPulse * 0.5})`
            : '6px solid rgba(255,255,255,0.3)',
        }}>
          <span style={{ fontSize: 80, lineHeight: 1 }}>✓</span>
          <span style={{
            fontSize: 64,
            fontWeight: 900,
            color: '#fff',
            fontFamily: 'system-ui',
            letterSpacing: 3,
            textShadow: '3px 3px 0 rgba(0,0,0,0.2)',
          }}>
            TRUE
          </span>
        </div>

        {/* FALSE BUTTON */}
        <div style={{
          flex: 1,
          height: '100%',
          borderRadius: 32,
          background: isRevealing && isTrue
            ? `linear-gradient(145deg, #EF5350, #E53935)`
            : 'linear-gradient(145deg, #EF5350, #C62828)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          transform: `scale(${falseScale * (isRevealing ? (!isTrue ? winnerScale : loserScale) : 1)})`,
          opacity: falseOpacity * (isRevealing && isTrue ? loserOpacity : 1),
          boxShadow: isRevealing && !isTrue
            ? `0 0 ${60 * glowPulse}px rgba(229,57,53,${glowPulse * 0.8}), 0 8px 30px rgba(0,0,0,0.2)`
            : '0 8px 30px rgba(0,0,0,0.2)',
          border: isRevealing && !isTrue
            ? `6px solid rgba(255,255,255,${0.5 + glowPulse * 0.5})`
            : '6px solid rgba(255,255,255,0.3)',
        }}>
          <span style={{ fontSize: 80, lineHeight: 1 }}>✕</span>
          <span style={{
            fontSize: 64,
            fontWeight: 900,
            color: '#fff',
            fontFamily: 'system-ui',
            letterSpacing: 3,
            textShadow: '3px 3px 0 rgba(0,0,0,0.2)',
          }}>
            FALSE
          </span>
        </div>
      </div>

      {/* TIMER BAR */}
      <TimerBar progress={timerProgress} entryFrame={voFrames} visible={!isRevealing && frame >= voFrames} />
    </AbsoluteFill>
  );
};
