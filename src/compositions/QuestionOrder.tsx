import React from 'react';
import { AbsoluteFill, spring, interpolate } from 'remotion';
import { OptionText } from '../components/AutoText';
import { QuestionCard } from '../components/QuestionCard';
import { TimerBar } from '../components/TimerBar';
import type { OrderQ } from '../types';
import { useQuizTiming } from '../hooks/useQuizTiming';

const POSITION_COLORS = ['#E53935', '#FF9800', '#1E88E5', '#43A047'];

/**
 * QuestionOrder: 3-4 cards shown in wrong order, slide into correct positions on reveal.
 * Uses absolute positioning so cards can truly swap places without overlap.
 */
export const QuestionOrder: React.FC<{ question: OrderQ }> = ({ question }) => {
  const { frame, fps, spd, voFrames, quizFrame, countdownFrames, isRevealing, revealProgress, timerProgress } = useQuizTiming(question);

  // Eased reveal for smoother slide
  const slideProgress = isRevealing
    ? interpolate(quizFrame, [countdownFrames + 5, countdownFrames + 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 0;

  const glowPulse = 0.3 + Math.sin(frame * 0.06) * 0.12;

  const itemCount = question.items.length;
  const GAP = 28;
  // Content area: left 80, right 80, so total width = 1920 - 160 = 1760
  const contentWidth = 1760;
  const cardWidth = (contentWidth - GAP * (itemCount - 1)) / itemCount;

  return (
    <AbsoluteFill>
      {/* QUESTION CARD */}
      <QuestionCard text={question.questionText} isRevealing={isRevealing} revealProgress={revealProgress} />

      {/* CARDS — positioned absolutely so they can swap */}
      <div style={{
        position: 'absolute',
        top: 210, left: 80, right: 80, bottom: 80,
      }}>
        {question.displayOrder.map((itemIdx, displayPos) => {
          const item = question.items[itemIdx];
          const correctPos = itemIdx; // correct slot index

          // Entry animation
          const delay = spd.entryDelay + displayPos * spd.entryGap;
          const s = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: spd.springDamping, stiffness: spd.springStiffness, mass: spd.mass } });
          const entryScale = interpolate(s, [0, 1], [0.85, 1]);
          const entryOpacity = interpolate(s, [0, 1], [0, 1]);

          // Current X position (starts at displayPos, ends at correctPos)
          const startX = displayPos * (cardWidth + GAP);
          const endX = correctPos * (cardWidth + GAP);
          const currentX = startX + (endX - startX) * slideProgress;

          // Number badge appears after slide
          const numberOpacity = isRevealing
            ? interpolate(revealProgress, [0.75, 1], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
            : 0;

          const cardSweep = ((frame * 1.2 + displayPos * 50) % 220) - 60;

          return (
            <div key={displayPos} style={{
              position: 'absolute',
              left: currentX,
              top: 0, bottom: 0,
              width: cardWidth,
              transform: `scale(${entryScale})`,
              opacity: entryOpacity,
            }}>
              <div style={{
                position: 'absolute', inset: 0,
                borderRadius: 24, overflow: 'hidden',
                border: `3px solid rgba(255,255,255,${0.4 + glowPulse})`,
                boxShadow: `0 8px 32px rgba(0,0,0,0.25), 0 0 ${10 + glowPulse * 15}px rgba(255,255,255,${glowPulse * 0.15})`,
              }}>
                {/* Image or gradient */}
                {item.image ? (
                  <img src={item.image} style={{
                    position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
                  }} />
                ) : (
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: `linear-gradient(160deg, ${POSITION_COLORS[itemIdx]}33, ${POSITION_COLORS[itemIdx]}11)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <OptionText width={cardWidth - 60} maxSize={44} minSize={22} color="#fff">
                      {item.label}
                    </OptionText>
                  </div>
                )}

                {/* Light sweep */}
                {!isRevealing && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: `linear-gradient(115deg, transparent ${cardSweep - 30}%, rgba(255,255,255,0.25) ${cardSweep}%, rgba(255,255,255,0.35) ${cardSweep + 4}%, transparent ${cardSweep + 30}%)`,
                  }} />
                )}

                {/* Bottom glass label (only if image) */}
                {item.image && (
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    padding: '40px 16px 24px',
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.75))',
                    backdropFilter: 'blur(3px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <OptionText width={cardWidth - 60} maxSize={36} minSize={18} color="#fff">
                      {item.label}
                    </OptionText>
                  </div>
                )}

                {/* Top edge shine */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                  background: `linear-gradient(90deg, transparent, rgba(255,255,255,${0.3 + glowPulse * 0.3}), transparent)`,
                }} />

                {/* Position number badge — appears on reveal */}
                {numberOpacity > 0 && (
                  <div style={{
                    position: 'absolute', top: 16, left: 16,
                    width: 56, height: 56, borderRadius: '50%',
                    background: POSITION_COLORS[correctPos],
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: numberOpacity,
                    transform: `scale(${numberOpacity})`,
                    boxShadow: `0 4px 12px ${POSITION_COLORS[correctPos]}66`,
                    border: '3px solid rgba(255,255,255,0.4)',
                  }}>
                    <span style={{ fontSize: 28, fontWeight: 900, color: '#fff', fontFamily: 'system-ui' }}>
                      {correctPos + 1}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* TIMER BAR */}
      <TimerBar progress={timerProgress} entryFrame={voFrames} visible={!isRevealing && frame >= voFrames} />
    </AbsoluteFill>
  );
};
