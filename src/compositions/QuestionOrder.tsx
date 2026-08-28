import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { AutoText, OptionText, FONT_OPTION } from '../components/AutoText';
import type { OrderQ } from '../types';
import { getSpeedConfig } from '../types';

const POSITION_COLORS = ['#E53935', '#FF9800', '#1E88E5', '#43A047'];

/**
 * QuestionOrder: 4 cards shown side by side in wrong order.
 * On reveal: cards slide/swap into correct positions with smooth animation.
 */
export const QuestionOrder: React.FC<{ question: OrderQ }> = ({ question }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const spd = getSpeedConfig(question);

  const countdownFrames = question.timeLimit * fps;
  const isRevealing = frame >= countdownFrames;
  const revealProgress = isRevealing
    ? interpolate(frame, [countdownFrames, countdownFrames + 25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 0;

  const timerProgress = Math.max(0, Math.min(1, (countdownFrames - frame) / countdownFrames));
  const barColor = timerProgress > 0.5 ? '#4CAF50' : timerProgress > 0.2 ? '#FF9800' : '#F44336';
  const timerUrgent = timerProgress < 0.2 && !isRevealing;
  const timerPulse = timerUrgent ? 28 + Math.sin(frame * 0.5) * 6 : 28;

  const titleOpacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: 'clamp' });
  const titleY = interpolate(frame, [0, 10], [-30, 0], { extrapolateRight: 'clamp' });

  // Light sweep
  const sweepPos = ((frame * 1.2) % 220) - 60;
  const glowPulse = 0.3 + Math.sin(frame * 0.06) * 0.12;

  const itemCount = question.items.length;
  // Card width percentage (with gaps)
  const cardWidthPct = 100 / itemCount;

  return (
    <AbsoluteFill>
      {/* QUESTION CARD */}
      <div style={{
        position: 'absolute',
        top: 50, left: 100, right: 100,
        display: 'flex', alignItems: 'center',
        opacity: titleOpacity,
        transform: `translateY(${titleY}px)`,
      }}>
        <div style={{
          flex: 1, background: 'rgba(255,255,255,0.95)', borderRadius: 24,
          padding: '28px 50px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.8)',
          textAlign: 'center',
          border: '1px solid rgba(255,255,255,0.6)',
        }}>
          <AutoText width={1500} maxSize={64} minSize={32} maxLines={2} color="#1a1a1a" shadow={false}>
            {question.questionText}
          </AutoText>
        </div>
      </div>

      {/* CARDS AREA */}
      <div style={{
        position: 'absolute',
        top: 210, left: 80, right: 80, bottom: 80,
        display: 'flex',
        alignItems: 'center',
        gap: 24,
      }}>
        {question.displayOrder.map((itemIdx, displayPos) => {
          const item = question.items[itemIdx];
          // Where should this card end up? Its correct position is its index in items[]
          const correctPos = itemIdx;

          // Entry animation
          const delay = spd.entryDelay + displayPos * spd.entryGap;
          const s = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: spd.springDamping, stiffness: spd.springStiffness, mass: spd.mass } });
          const entryScale = interpolate(s, [0, 1], [0.8, 1]);
          const entryOpacity = interpolate(s, [0, 1], [0, 1]);

          // On reveal: slide from displayPos to correctPos
          const slideX = isRevealing
            ? interpolate(revealProgress, [0.1, 0.8], [0, (correctPos - displayPos) * cardWidthPct], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
            : 0;

          // Number badge appears on reveal
          const numberOpacity = isRevealing
            ? interpolate(revealProgress, [0.7, 1], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
            : 0;

          const cardSweep = ((frame * 1.2 + displayPos * 40) % 220) - 60;

          return (
            <div key={displayPos} style={{
              flex: 1,
              height: '100%',
              position: 'relative',
              transform: `scale(${entryScale}) translateX(${slideX}%)`,
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
                    background: `linear-gradient(160deg, ${POSITION_COLORS[itemIdx]}22, ${POSITION_COLORS[itemIdx]}44)`,
                  }} />
                )}

                {/* Light sweep */}
                {!isRevealing && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: `linear-gradient(115deg, transparent ${cardSweep - 30}%, rgba(255,255,255,0.25) ${cardSweep}%, rgba(255,255,255,0.35) ${cardSweep + 4}%, transparent ${cardSweep + 30}%)`,
                  }} />
                )}

                {/* Bottom glass label */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  padding: '40px 16px 24px',
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                  backdropFilter: 'blur(3px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <OptionText width={340} maxSize={40} minSize={20} color="#fff">
                    {item.label}
                  </OptionText>
                </div>

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
      {!isRevealing && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: timerPulse, background: 'rgba(0,0,0,0.12)' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${timerProgress * 100}%`, background: barColor, borderRadius: '0 4px 4px 0' }}>
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(90deg, transparent ${((frame % 45) / 45) * 100 - 15}%, rgba(255,255,255,0.3) ${((frame % 45) / 45) * 100}%, transparent ${((frame % 45) / 45) * 100 + 15}%)` }} />
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
