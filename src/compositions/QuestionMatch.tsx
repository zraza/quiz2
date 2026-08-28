import React from 'react';
import { AbsoluteFill, spring, interpolate } from 'remotion';
import { OptionText } from '../components/AutoText';
import { QuestionCard } from '../components/QuestionCard';
import { TimerBar } from '../components/TimerBar';
import type { MatchQ } from '../types';
import { useQuizTiming } from '../hooks/useQuizTiming';

const ROW_COLORS = ['#E53935', '#1E88E5', '#43A047'];
const ROW_COLORS_LIGHT = ['#FFEBEE', '#E3F2FD', '#E8F5E9']; // subtle tints

/**
 * QuestionMatch: Two columns, 3 rows.
 * On reveal: pairs glow same colour, connecting beam between them, right card tints.
 */
export const QuestionMatch: React.FC<{ question: MatchQ }> = ({ question }) => {
  const { frame, fps, spd, voFrames, quizFrame, countdownFrames, isRevealing, revealProgress, timerProgress } = useQuizTiming(question);

  const slideProgress = isRevealing
    ? interpolate(quizFrame, [countdownFrames + 5, countdownFrames + 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 0;

  // Pop effect after slide completes
  const popProgress = isRevealing
    ? interpolate(quizFrame, [countdownFrames + 22, countdownFrames + 28, countdownFrames + 34], [0, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 0;

  const glowPulse = 0.3 + Math.sin(frame * 0.06) * 0.12;
  const rowCount = question.left.length;

  const contentHeight = 790;
  const ROW_GAP = 24;
  const rowHeight = (contentHeight - ROW_GAP * (rowCount - 1)) / rowCount;

  // For each right item at display position dp, find its target row
  const targetRowForDisplay: number[] = [];
  for (let dp = 0; dp < rowCount; dp++) {
    const targetRow = question.correctOrder.indexOf(dp);
    targetRowForDisplay.push(targetRow);
  }

  // Beam pulse after match
  const beamPulse = isRevealing && revealProgress > 0.75
    ? 0.5 + Math.sin((frame - countdownFrames) * 0.15) * 0.3
    : 0;

  return (
    <AbsoluteFill>
      {/* QUESTION CARD */}
      <QuestionCard text={question.questionText} isRevealing={isRevealing} revealProgress={revealProgress} />

      {/* CONTENT AREA */}
      <div style={{
        position: 'absolute',
        top: 210, left: 80, right: 80, bottom: 80,
        display: 'flex', gap: 50,
      }}>
        {/* LEFT COLUMN — images, fixed positions */}
        <div style={{ flex: 1, position: 'relative' }}>
          {question.left.map((item, i) => {
            const delay = spd.entryDelay + i * spd.entryGap;
            const s = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: spd.springDamping, stiffness: spd.springStiffness, mass: spd.mass } });
            const entryScale = interpolate(s, [0, 1], [0.85, 1]);
            const entryOpacity = interpolate(s, [0, 1], [0, 1]);
            const cardSweep = ((frame * 1.2 + i * 50) % 220) - 60;
            const topY = i * (rowHeight + ROW_GAP);

            // Glow when matched
            const matched = revealProgress > 0.75;
            const matchScale = 1 + popProgress * 0.03;

            return (
              <div key={`left-${i}`} style={{
                position: 'absolute',
                left: 0, right: 0,
                top: topY, height: rowHeight,
                transform: `scale(${entryScale * matchScale})`, opacity: entryOpacity,
              }}>
                <div style={{
                  position: 'absolute', inset: 0,
                  borderRadius: 20, overflow: 'hidden',
                  border: matched
                    ? `4px solid ${ROW_COLORS[i]}`
                    : `3px solid rgba(255,255,255,${0.4 + glowPulse})`,
                  boxShadow: matched
                    ? `0 6px 24px rgba(0,0,0,0.2), 0 0 25px ${ROW_COLORS[i]}55, inset 0 0 20px ${ROW_COLORS[i]}15`
                    : `0 6px 24px rgba(0,0,0,0.2), 0 0 ${8 + glowPulse * 12}px ${ROW_COLORS[i]}33`,
                }}>
                  {item.image ? (
                    <img src={item.image} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, ${ROW_COLORS[i]}33, ${ROW_COLORS[i]}11)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <OptionText width={600} maxSize={44} minSize={22} color="#fff">{item.label}</OptionText>
                    </div>
                  )}
                  {/* Light sweep */}
                  {!isRevealing && (
                    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(115deg, transparent ${cardSweep - 30}%, rgba(255,255,255,0.25) ${cardSweep}%, rgba(255,255,255,0.35) ${cardSweep + 4}%, transparent ${cardSweep + 30}%)` }} />
                  )}
                  {/* Label */}
                  {item.image && (
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      padding: '30px 16px 16px',
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                      backdropFilter: 'blur(3px)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <OptionText width={500} maxSize={36} minSize={18} color="#fff">{item.label}</OptionText>
                    </div>
                  )}
                  {/* Top shine */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, rgba(255,255,255,${0.3 + glowPulse * 0.3}), transparent)` }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* CENTER — connecting beams on reveal */}
        <div style={{ width: 50, position: 'relative', flexShrink: 0 }}>
          {isRevealing && revealProgress > 0.75 && question.left.map((_, i) => {
            const topY = i * (rowHeight + ROW_GAP) + rowHeight / 2;
            return (
              <div key={`beam-${i}`} style={{
                position: 'absolute',
                left: -10, right: -10,
                top: topY - 3,
                height: 6,
                borderRadius: 3,
                background: `linear-gradient(90deg, ${ROW_COLORS[i]}, ${ROW_COLORS[i]}88, ${ROW_COLORS[i]})`,
                opacity: interpolate(revealProgress, [0.75, 0.9], [0, beamPulse + 0.3], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
                boxShadow: `0 0 12px ${ROW_COLORS[i]}88, 0 0 4px ${ROW_COLORS[i]}`,
              }} />
            );
          })}
        </div>

        {/* RIGHT COLUMN — white cards, slide on reveal */}
        <div style={{ flex: 1, position: 'relative' }}>
          {question.right.map((item, displayPos) => {
            const delay = spd.entryDelay + (displayPos + rowCount) * spd.entryGap;
            const s = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: spd.springDamping, stiffness: spd.springStiffness, mass: spd.mass } });
            const entryScale = interpolate(s, [0, 1], [0.85, 1]);
            const entryOpacity = interpolate(s, [0, 1], [0, 1]);

            const startY = displayPos * (rowHeight + ROW_GAP);
            const targetRow = targetRowForDisplay[displayPos];
            const endY = targetRow * (rowHeight + ROW_GAP);
            const currentY = startY + (endY - startY) * slideProgress;

            const matchedColor = ROW_COLORS[targetRow];
            const matched = revealProgress > 0.75;
            const matchScale = 1 + popProgress * 0.03;

            // Tint the white card with match colour after landing
            const bgColor = matched
              ? ROW_COLORS_LIGHT[targetRow]
              : '#FFFFFF';

            return (
              <div key={`right-${displayPos}`} style={{
                position: 'absolute',
                left: 0, right: 0,
                top: currentY, height: rowHeight,
                transform: `scale(${entryScale * matchScale})`, opacity: entryOpacity,
              }}>
                <div style={{
                  position: 'absolute', inset: 0,
                  borderRadius: 20, overflow: 'hidden',
                  background: bgColor,
                  border: 'none',
                  boxShadow: matched
                    ? `0 0 30px ${matchedColor}55, 0 0 60px ${matchedColor}22, 0 4px 16px rgba(0,0,0,0.08)`
                    : '0 4px 20px rgba(0,0,0,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {item.image ? (
                    <img src={item.image} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <OptionText width={600} maxSize={56} minSize={26} color={matched ? matchedColor : '#1a1a1a'}>
                      {item.label}
                    </OptionText>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TIMER BAR */}
      <TimerBar progress={timerProgress} entryFrame={voFrames} visible={!isRevealing && frame >= voFrames} />
    </AbsoluteFill>
  );
};
