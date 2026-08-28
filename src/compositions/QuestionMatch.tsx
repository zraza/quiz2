import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { AutoText, OptionText, FONT_OPTION } from '../components/AutoText';
import type { MatchQ } from '../types';
import { getSpeedConfig } from '../types';

const ROW_COLORS = ['#E53935', '#1E88E5', '#43A047'];

/**
 * QuestionMatch: Two columns, 3 rows. Left stays fixed, right slides to correct positions on reveal.
 * Great for: landmarks→countries, flags→capitals, faces→names
 */
export const QuestionMatch: React.FC<{ question: MatchQ }> = ({ question }) => {
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

  const glowPulse = 0.3 + Math.sin(frame * 0.06) * 0.12;
  const rowCount = question.left.length;
  const rowHeight = 100 / rowCount; // percentage

  // For each right item at display position i, find where it needs to go
  // correctOrder[targetRow] = currentDisplayIndex
  // So if correctOrder = [2, 0, 1], it means:
  //   left[0] matches right[2], left[1] matches right[0], left[2] matches right[1]
  // We need the inverse: for display position dp, find target position
  const targetPositions: number[] = [];
  for (let dp = 0; dp < rowCount; dp++) {
    // Find which left row this right[dp] should match
    const targetRow = question.correctOrder.indexOf(dp);
    targetPositions.push(targetRow);
  }

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
          textAlign: 'center', border: '1px solid rgba(255,255,255,0.6)',
        }}>
          <AutoText width={1500} maxSize={64} minSize={32} maxLines={2} color="#1a1a1a" shadow={false}>
            {question.questionText}
          </AutoText>
        </div>
      </div>

      {/* TWO COLUMNS */}
      <div style={{
        position: 'absolute',
        top: 210, left: 80, right: 80, bottom: 80,
        display: 'flex',
        gap: 40,
      }}>
        {/* LEFT COLUMN — fixed */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {question.left.map((item, i) => {
            const delay = spd.entryDelay + i * spd.entryGap;
            const s = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: spd.springDamping, stiffness: spd.springStiffness, mass: spd.mass } });
            const entryScale = interpolate(s, [0, 1], [0.85, 1]);
            const entryOpacity = interpolate(s, [0, 1], [0, 1]);
            const cardSweep = ((frame * 1.2 + i * 50) % 220) - 60;

            // Connection line appears on reveal
            const lineOpacity = isRevealing
              ? interpolate(revealProgress, [0.8, 1], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
              : 0;

            return (
              <div key={`left-${i}`} style={{
                flex: 1, position: 'relative',
                transform: `scale(${entryScale})`,
                opacity: entryOpacity,
              }}>
                <div style={{
                  position: 'absolute', inset: 0,
                  borderRadius: 20, overflow: 'hidden',
                  border: `3px solid rgba(255,255,255,${0.4 + glowPulse})`,
                  boxShadow: `0 6px 24px rgba(0,0,0,0.2), 0 0 ${8 + glowPulse * 12}px ${ROW_COLORS[i]}33`,
                }}>
                  {item.image ? (
                    <img src={item.image} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, ${ROW_COLORS[i]}33, ${ROW_COLORS[i]}11)` }} />
                  )}
                  {/* Light sweep */}
                  {!isRevealing && (
                    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(115deg, transparent ${cardSweep - 30}%, rgba(255,255,255,0.25) ${cardSweep}%, rgba(255,255,255,0.35) ${cardSweep + 4}%, transparent ${cardSweep + 30}%)` }} />
                  )}
                  {/* Bottom label */}
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    padding: '30px 16px 16px',
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                    backdropFilter: 'blur(3px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <OptionText width={500} maxSize={38} minSize={18} color="#fff">
                      {item.label}
                    </OptionText>
                  </div>
                  {/* Top shine */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, rgba(255,255,255,${0.3 + glowPulse * 0.3}), transparent)` }} />
                  {/* Row color badge */}
                  <div style={{
                    position: 'absolute', top: 12, left: 12,
                    width: 12, height: 12, borderRadius: '50%',
                    background: ROW_COLORS[i],
                    boxShadow: `0 0 8px ${ROW_COLORS[i]}`,
                  }} />
                </div>
                {/* Connection dot on right edge */}
                {lineOpacity > 0 && (
                  <div style={{
                    position: 'absolute', right: -20, top: '50%', transform: 'translateY(-50%)',
                    width: 16, height: 16, borderRadius: '50%',
                    background: ROW_COLORS[i], opacity: lineOpacity,
                    boxShadow: `0 0 10px ${ROW_COLORS[i]}`,
                  }} />
                )}
              </div>
            );
          })}
        </div>

        {/* CENTER — connection lines on reveal */}
        <div style={{ width: 40, position: 'relative' }}>
          {isRevealing && revealProgress > 0.8 && question.left.map((_, i) => {
            const rightIdx = question.correctOrder[i];
            const lineColor = ROW_COLORS[i];
            return (
              <div key={`line-${i}`} style={{
                position: 'absolute',
                left: 0, right: 0,
                top: `${(i + 0.5) * (100 / rowCount)}%`,
                height: 3,
                background: lineColor,
                opacity: interpolate(revealProgress, [0.8, 1], [0, 0.6], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
                boxShadow: `0 0 6px ${lineColor}`,
                borderRadius: 2,
              }} />
            );
          })}
        </div>

        {/* RIGHT COLUMN — slides on reveal */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24, position: 'relative' }}>
          {question.right.map((item, displayPos) => {
            const delay = spd.entryDelay + (displayPos + rowCount) * spd.entryGap;
            const s = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: spd.springDamping, stiffness: spd.springStiffness, mass: spd.mass } });
            const entryScale = interpolate(s, [0, 1], [0.85, 1]);
            const entryOpacity = interpolate(s, [0, 1], [0, 1]);
            const cardSweep = ((frame * 1.2 + (displayPos + 3) * 50) % 220) - 60;

            // Calculate slide offset on reveal
            const targetRow = targetPositions[displayPos];
            const slideOffset = isRevealing
              ? interpolate(revealProgress, [0.1, 0.7], [0, (targetRow - displayPos) * (100 / rowCount + 24 / (rowCount - 1))], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
              : 0;

            // Matched = green glow on reveal
            const matchedColor = ROW_COLORS[targetRow];

            return (
              <div key={`right-${displayPos}`} style={{
                flex: 1, position: 'relative',
                transform: `scale(${entryScale}) translateY(${slideOffset}%)`,
                opacity: entryOpacity,
              }}>
                <div style={{
                  position: 'absolute', inset: 0,
                  borderRadius: 20, overflow: 'hidden',
                  border: isRevealing && revealProgress > 0.7
                    ? `3px solid ${matchedColor}`
                    : `3px solid rgba(255,255,255,${0.4 + glowPulse})`,
                  boxShadow: isRevealing && revealProgress > 0.7
                    ? `0 6px 24px rgba(0,0,0,0.2), 0 0 15px ${matchedColor}44`
                    : `0 6px 24px rgba(0,0,0,0.2)`,
                }}>
                  {item.image ? (
                    <img src={item.image} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(160deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <OptionText width={500} maxSize={44} minSize={22} color="#fff">
                        {item.label}
                      </OptionText>
                    </div>
                  )}
                  {/* Light sweep */}
                  {!isRevealing && (
                    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(115deg, transparent ${cardSweep - 30}%, rgba(255,255,255,0.25) ${cardSweep}%, rgba(255,255,255,0.35) ${cardSweep + 4}%, transparent ${cardSweep + 30}%)` }} />
                  )}
                  {/* Label if has image */}
                  {item.image && (
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      padding: '30px 16px 16px',
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                      backdropFilter: 'blur(3px)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <OptionText width={500} maxSize={38} minSize={18} color="#fff">
                        {item.label}
                      </OptionText>
                    </div>
                  )}
                  {/* Top shine */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, rgba(255,255,255,${0.3 + glowPulse * 0.3}), transparent)` }} />
                  {/* Color dot on reveal */}
                  {isRevealing && revealProgress > 0.7 && (
                    <div style={{
                      position: 'absolute', top: 12, right: 12,
                      width: 12, height: 12, borderRadius: '50%',
                      background: matchedColor,
                      boxShadow: `0 0 8px ${matchedColor}`,
                      opacity: interpolate(revealProgress, [0.7, 1], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
                    }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
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
