import React from 'react';
import { AbsoluteFill, Img, spring, interpolate } from 'remotion';
import { QuestionCard } from '../components/QuestionCard';
import { TimerBar } from '../components/TimerBar';
import { AutoText } from '../components/AutoText';
import type { BlurRevealQ } from '../types';
import { useQuizTiming } from '../hooks/useQuizTiming';
import { CLAMP } from '../config';

/**
 * QuestionBlurReveal — BONUS variant (no options).
 * 
 * Image starts with blur(30px) and clears to blur(0) over the countdown.
 * Slight scale(1.1 → 1.0) compensates for blur edge artifacts.
 * A gold points badge (150 → 100 → 50 → 5) pulses on each drop.
 * On reveal: answer text slams in center-bottom in gold.
 * Premium "bonus question" feel with gold accents.
 */
export const QuestionBlurReveal: React.FC<{ question: BlurRevealQ }> = ({ question }) => {
  const { frame, fps, spd, voFrames, quizFrame, countdownFrames, isRevealing, revealProgress, timerProgress } = useQuizTiming(question);

  // --- Points logic ---
  const totalTime = countdownFrames;
  const elapsed = totalTime > 0 ? quizFrame / totalTime : 0;
  const points = elapsed < 0.25 ? 150 : elapsed < 0.5 ? 100 : elapsed < 0.75 ? 50 : 5;

  // Detect point-drop frames for pulse animation
  const dropFrames = [
    Math.floor(totalTime * 0.25),
    Math.floor(totalTime * 0.5),
    Math.floor(totalTime * 0.75),
  ];
  let badgePulse = 1;
  let flashOpacity = 0;
  for (const df of dropFrames) {
    const since = quizFrame - df;
    if (since >= 0 && since < 10) {
      badgePulse = interpolate(since, [0, 4, 10], [1, 1.3, 1], CLAMP);
      flashOpacity = interpolate(since, [0, 3, 10], [0.8, 0.4, 0], CLAMP);
      break;
    }
  }

  // --- Blur ---
  const blurProgress = isRevealing
    ? 1
    : interpolate(quizFrame, [0, countdownFrames], [0, 1], CLAMP);
  const blurAmount = interpolate(blurProgress, [0, 1], [30, 0]);
  // Slight zoom to hide blur edges (1.1 → 1.0)
  const imgScale = interpolate(blurProgress, [0, 1], [1.1, 1.0]);

  // Image entry
  const imgEntry = spring({ frame: Math.max(0, frame - 3), fps, config: { damping: 14, stiffness: 200, mass: 0.8 } });
  const imgOpacity = interpolate(imgEntry, [0, 1], [0, 1]);

  // Answer reveal spring
  const answerSpring = spring({ frame: Math.max(0, quizFrame - countdownFrames), fps, config: { damping: 12, stiffness: 220, mass: 0.7 } });
  const answerScale = interpolate(answerSpring, [0, 1], [0.3, 1]);
  const answerOpacity = interpolate(answerSpring, [0, 1], [0, 1]);

  // Badge entry
  const badgeEntry = spring({ frame: Math.max(0, quizFrame - 2), fps, config: { damping: 14, stiffness: 200, mass: 0.8 } });

  return (
    <AbsoluteFill>
      {/* QUESTION CARD — gold-tinted for bonus feel */}
      <QuestionCard text={question.questionText} isRevealing={isRevealing} revealProgress={revealProgress} />

      {/* Gold border overlay on question card */}
      <div style={{
        position: 'absolute',
        top: 50,
        left: 100,
        right: 100,
        height: 0,
        pointerEvents: 'none',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          height: 130,
          borderRadius: 24,
          border: '4px solid rgba(255, 193, 7, 0.6)',
          boxShadow: '0 0 20px rgba(255, 193, 7, 0.3), inset 0 0 20px rgba(255, 193, 7, 0.05)',
          pointerEvents: 'none',
          opacity: isRevealing ? 0.3 : 1,
        }} />
      </div>

      {/* BLURRED IMAGE */}
      <div style={{
        position: 'absolute',
        top: 210,
        left: 100,
        right: 100,
        bottom: 140,
        borderRadius: 28,
        overflow: 'hidden',
        border: '5px solid rgba(255, 193, 7, 0.8)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.25), 0 0 30px rgba(255, 193, 7, 0.2)',
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
            transform: `scale(${imgScale})`,
          }}
        />

        {/* Subtle dark overlay while blurred */}
        {!isRevealing && blurAmount > 5 && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: `rgba(0,0,0,${interpolate(blurAmount, [0, 30], [0, 0.12], CLAMP)})`,
            pointerEvents: 'none',
          }} />
        )}

        {/* Mystery icon pulsing while heavily blurred */}
        {!isRevealing && blurAmount > 10 && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) scale(${1 + Math.sin(frame * 0.08) * 0.1})`,
            fontSize: 100,
            opacity: interpolate(blurAmount, [10, 25], [0, 0.5], CLAMP),
            pointerEvents: 'none',
          }}>
            🔍
          </div>
        )}

        {/* Reveal flash — gold tinted */}
        {isRevealing && revealProgress < 0.3 && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: `rgba(255,215,0,${interpolate(revealProgress, [0, 0.3], [0.3, 0], CLAMP)})`,
            pointerEvents: 'none',
          }} />
        )}
      </div>

      {/* POINTS BADGE — top-right, gold circle */}
      {!isRevealing && quizFrame > 0 && (
        <div style={{
          position: 'absolute',
          top: 220,
          right: 120,
          transform: `scale(${badgePulse * badgeEntry})`,
          zIndex: 10,
        }}>
          {/* Flash overlay */}
          {flashOpacity > 0 && (
            <div style={{
              position: 'absolute',
              inset: -10,
              borderRadius: '50%',
              background: `rgba(255,255,255,${flashOpacity})`,
              pointerEvents: 'none',
            }} />
          )}
          <div style={{
            width: 130,
            height: 130,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA000 50%, #FF8F00 100%)',
            border: '5px solid rgba(255,255,255,0.9)',
            boxShadow: '0 8px 30px rgba(255,152,0,0.5), inset 0 2px 4px rgba(255,255,255,0.4)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{
              fontSize: 48,
              fontWeight: 900,
              color: '#fff',
              textShadow: '2px 2px 4px rgba(0,0,0,0.4)',
              lineHeight: 1,
            }}>
              {points}
            </span>
            <span style={{
              fontSize: 16,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.9)',
              textTransform: 'uppercase',
              letterSpacing: 2,
            }}>
              PTS
            </span>
          </div>
        </div>
      )}

      {/* BONUS LABEL — top-left star */}
      <div style={{
        position: 'absolute',
        top: 220,
        left: 120,
        opacity: imgOpacity,
        zIndex: 10,
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #FFD700, #FF8F00)',
          borderRadius: 16,
          padding: '10px 22px',
          boxShadow: '0 4px 15px rgba(255,152,0,0.4)',
        }}>
          <span style={{
            fontSize: 26,
            fontWeight: 900,
            color: '#fff',
            textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
            letterSpacing: 2,
          }}>
            ⭐ BONUS
          </span>
        </div>
      </div>

      {/* ANSWER — appears on reveal, gold slam */}
      {isRevealing && (
        <div style={{
          position: 'absolute',
          bottom: 80,
          left: 140,
          right: 140,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          transform: `scale(${answerScale})`,
          opacity: answerOpacity,
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,215,0,0.95), rgba(255,152,0,0.95))',
            borderRadius: 24,
            padding: '28px 60px',
            boxShadow: '0 10px 40px rgba(255,152,0,0.5), 0 0 60px rgba(255,215,0,0.3)',
            border: '3px solid rgba(255,255,255,0.8)',
          }}>
            <AutoText width={1400} maxSize={100} minSize={44} maxLines={2} color="#fff">
              {question.correctAnswer}
            </AutoText>
          </div>
        </div>
      )}

      {/* TIMER BAR */}
      <TimerBar progress={timerProgress} entryFrame={voFrames} visible={!isRevealing && frame >= voFrames} />
    </AbsoluteFill>
  );
};
