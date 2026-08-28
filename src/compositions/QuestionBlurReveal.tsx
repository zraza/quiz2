import React from 'react';
import { AbsoluteFill, Img, spring, interpolate } from 'remotion';
import { QuestionCard } from '../components/QuestionCard';
import { TimerBar } from '../components/TimerBar';
import { OptionCard } from '../components/OptionCard';
import type { BlurRevealQ } from '../types';
import { useQuizTiming } from '../hooks/useQuizTiming';
import { CLAMP } from '../config';

/**
 * QuestionBlurReveal: Image starts with blur(30px), gradually clears to blur(0px)
 * as the countdown progresses. On reveal, blur instantly clears.
 */
export const QuestionBlurReveal: React.FC<{ question: BlurRevealQ }> = ({ question }) => {
  const { frame, fps, spd, voFrames, quizFrame, countdownFrames, isRevealing, revealProgress, timerProgress } = useQuizTiming(question);

  // Blur: starts at 30px, linearly reduces to 0 over countdown
  const blurProgress = isRevealing
    ? 1
    : interpolate(quizFrame, [0, countdownFrames], [0, 1], CLAMP);
  const blurAmount = interpolate(blurProgress, [0, 1], [30, 0]);

  // Image container entry animation
  const imgEntry = spring({ frame: Math.max(0, frame - 3), fps, config: { damping: 14, stiffness: 200, mass: 0.8 } });
  const imgOpacity = interpolate(imgEntry, [0, 1], [0, 1]);

  return (
    <AbsoluteFill>
      {/* QUESTION CARD */}
      <QuestionCard text={question.questionText} isRevealing={isRevealing} revealProgress={revealProgress} />

      {/* BLURRED IMAGE */}
      <div style={{
        position: 'absolute',
        top: 210,
        left: 100,
        right: 100,
        bottom: 260,
        borderRadius: 28,
        overflow: 'hidden',
        border: '5px solid rgba(255,255,255,0.9)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
        opacity: imgOpacity,
      }}>
        <Img
          src={question.imageUrl}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: `blur(${blurAmount}px)`,
            // Scale up slightly when blurred to avoid seeing edges
            transform: `scale(${1 + blurAmount * 0.02})`,
          }}
        />

        {/* Subtle overlay that fades as image clears */}
        {!isRevealing && blurAmount > 5 && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: `rgba(0,0,0,${interpolate(blurAmount, [0, 30], [0, 0.15], CLAMP)})`,
            pointerEvents: 'none',
          }} />
        )}

        {/* "?" icon pulsing while blurred — hints at mystery */}
        {!isRevealing && blurAmount > 10 && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) scale(${1 + Math.sin(frame * 0.08) * 0.1})`,
            fontSize: 120,
            opacity: interpolate(blurAmount, [10, 25], [0, 0.6], CLAMP),
            pointerEvents: 'none',
          }}>
            🔍
          </div>
        )}

        {/* Reveal flash */}
        {isRevealing && revealProgress < 0.3 && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: `rgba(255,255,255,${interpolate(revealProgress, [0, 0.3], [0.3, 0], CLAMP)})`,
            pointerEvents: 'none',
          }} />
        )}
      </div>

      {/* OPTIONS — 4 in a row at bottom */}
      <div style={{
        position: 'absolute',
        bottom: 60,
        left: 80,
        right: 80,
        height: 180,
        display: 'flex',
        gap: 24,
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
            springFrame={frame - (spd.entryDelay + i * spd.entryGap)}
            quizFrame={quizFrame}
            spd={spd}
            textWidth={300}
          />
        ))}
      </div>

      {/* TIMER BAR */}
      <TimerBar progress={timerProgress} entryFrame={voFrames} visible={!isRevealing && frame >= voFrames} />
    </AbsoluteFill>
  );
};
