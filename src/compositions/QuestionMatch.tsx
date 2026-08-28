import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { AutoText, OptionText, FONT_OPTION } from '../components/AutoText';
import type { MatchQ } from '../types';
import { getSpeedConfig } from '../types';

const ROW_COLORS = ['#E53935', '#1E88E5', '#43A047'];

/**
 * QuestionMatch: Two columns, 3 rows. Left fixed, right slides to correct positions.
 * Left: images. Right: white cards with text/flags that slide into place.
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

  const slideProgress = isRevealing
    ? interpolate(frame, [countdownFrames + 5, countdownFrames + 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 0;

  const timerProgress = Math.max(0, Math.min(1, (countdownFrames - frame) / countdownFrames));
  const barColor = timerProgress > 0.5 ? '#4CAF50' : timerProgress > 0.2 ? '#FF9800' : '#F44336';
  const timerUrgent = timerProgress < 0.2 && !isRevealing;
  const timerPulse = timerUrgent ? 28 + Math.sin(frame * 0.5) * 6 : 28;

  const titleOpacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: 'clamp' });
  const titleY = interpolate(frame, [0, 10], [-30, 0], { extrapolateRight: 'clamp' });

  const glowPulse = 0.3 + Math.sin(frame * 0.06) * 0.12;
  const rowCount = question.left.length;

  // Content area height: 1080 - 210(top) - 80(bottom) = 790
  const contentHeight = 790;
  const ROW_GAP = 24;
  const rowHeight = (contentHeight - ROW_GAP * (rowCount - 1)) / rowCount;

  // For each right item at display position dp, find its target row
  const targetRowForDisplay: number[] = [];
  for (let dp = 0; dp < rowCount; dp++) {
    const targetRow = question.correctOrder.indexOf(dp);
    targetRowForDisplay.push(targetRow);
  }

  return (
    <AbsoluteFill>
      {/* QUESTION CARD */}
      <div style={{
        position: 'absolute',
        top: 50, left: 100, right: 100,
        display: 'flex', alignItems: 'center',
        opacity: titleOpacity, transform: `translateY(${titleY}px)`,
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

            return (
              <div key={`left-${i}`} style={{
                position: 'absolute',
                left: 0, right: 0,
                top: topY, height: rowHeight,
                transform: `scale(${entryScale})`, opacity: entryOpacity,
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
                  {/* Color dot */}
                  <div style={{ position: 'absolute', top: 12, left: 12, width: 14, height: 14, borderRadius: '50%', background: ROW_COLORS[i], boxShadow: `0 0 8px ${ROW_COLORS[i]}` }} />
                </div>
              </div>
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

            // Slide from current row to target row
            const startY = displayPos * (rowHeight + ROW_GAP);
            const targetRow = targetRowForDisplay[displayPos];
            const endY = targetRow * (rowHeight + ROW_GAP);
            const currentY = startY + (endY - startY) * slideProgress;

            const matchedColor = ROW_COLORS[targetRow];

            return (
              <div key={`right-${displayPos}`} style={{
                position: 'absolute',
                left: 0, right: 0,
                top: currentY, height: rowHeight,
                transform: `scale(${entryScale})`, opacity: entryOpacity,
              }}>
                <div style={{
                  position: 'absolute', inset: 0,
                  borderRadius: 20, overflow: 'hidden',
                  background: '#FFFFFF',
                  border: isRevealing && revealProgress > 0.7
                    ? `4px solid ${matchedColor}`
                    : '4px solid rgba(0,0,0,0.06)',
                  boxShadow: isRevealing && revealProgress > 0.7
                    ? `0 6px 24px rgba(0,0,0,0.1), 0 0 20px ${matchedColor}33`
                    : '0 6px 24px rgba(0,0,0,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {item.image ? (
                    <img src={item.image} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <OptionText width={600} maxSize={56} minSize={26} color="#1a1a1a">
                      {item.label}
                    </OptionText>
                  )}
                  {/* Color dot on reveal */}
                  {isRevealing && revealProgress > 0.7 && (
                    <div style={{
                      position: 'absolute', top: 14, right: 14,
                      width: 16, height: 16, borderRadius: '50%',
                      background: matchedColor, boxShadow: `0 0 10px ${matchedColor}`,
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
