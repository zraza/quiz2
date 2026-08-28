import React from 'react';
import { AbsoluteFill, Img, spring, interpolate } from 'remotion';
import { QuestionCard } from '../components/QuestionCard';
import { TimerBar } from '../components/TimerBar';
import { OptionCard } from '../components/OptionCard';
import type { ZoomInQ } from '../types';
import { useQuizTiming } from '../hooks/useQuizTiming';
import { CLAMP } from '../config';

/**
 * QuestionZoomIn: Image starts at 500% zoom (scale 5), slowly zooms out
 * to 100% (scale 1) as the countdown progresses. On reveal, snaps to full view.
 */
export const QuestionZoomIn: React.FC<{ question: ZoomInQ }> = ({ question }) => {
  const { frame, fps, spd, voFrames, quizFrame, countdownFrames, isRevealing, revealProgress, timerProgress } = useQuizTiming(question);

  // Zoom: starts at scale(5), linearly reduces to scale(1) over countdown
  const zoomProgress = isRevealing
    ? 1
    : interpolate(quizFrame, [0, countdownFrames], [0, 1], CLAMP);
  const scale = interpolate(zoomProgress, [0, 1], [5, 1]);

  // Image container entry animation
  const imgEntry = spring({ frame: Math.max(0, frame - 3), fps, config: { damping: 14, stiffness: 200, mass: 0.8 } });
  const imgOpacity = interpolate(imgEntry, [0, 1], [0, 1]);

  return (
    <AbsoluteFill>
      {/* QUESTION CARD */}
      <QuestionCard text={question.questionText} isRevealing={isRevealing} revealProgress={revealProgress} />

      {/* ZOOMED IMAGE */}
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
            top: '50%',
            left: '50%',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `translate(-50%, -50%) scale(${scale})`,
            transition: isRevealing ? 'transform 0.3s ease-out' : undefined,
          }}
        />

        {/* Vignette overlay to add depth during zoom */}
        {!isRevealing && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,${0.3 - zoomProgress * 0.25}) 100%)`,
            pointerEvents: 'none',
          }} />
        )}

        {/* Reveal flash */}
        {isRevealing && revealProgress < 0.3 && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: `rgba(255,255,255,${interpolate(revealProgress, [0, 0.3], [0.4, 0], CLAMP)})`,
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
