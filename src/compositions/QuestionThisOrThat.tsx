import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { AutoText, OptionText, FONT_OPTION } from '../components/AutoText';
import type { ThisOrThatQ } from '../types';
import { getSpeedConfig } from '../types';

/**
 * QuestionThisOrThat: Glossy, premium two-card layout.
 * Subtle light sweep across cards, glass-morphism label area, glowing edges.
 */
export const QuestionThisOrThat: React.FC<{ question: ThisOrThatQ }> = ({ question }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const spd = getSpeedConfig(question);

  const countdownFrames = question.timeLimit * fps;
  const isRevealing = frame >= countdownFrames;
  const revealProgress = isRevealing
    ? interpolate(frame, [countdownFrames, countdownFrames + spd.revealFrames], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 0;

  const timerProgress = Math.max(0, Math.min(1, (countdownFrames - frame) / countdownFrames));
  const barColor = timerProgress > 0.5 ? '#4CAF50' : timerProgress > 0.2 ? '#FF9800' : '#F44336';
  const timerUrgent = timerProgress < 0.2 && !isRevealing;
  const timerPulse = timerUrgent ? 28 + Math.sin(frame * 0.5) * 6 : 28;

  const titleOpacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: 'clamp' });
  const titleY = interpolate(frame, [0, 10], [-30, 0], { extrapolateRight: 'clamp' });

  // Card entries
  const springA = spring({ frame: Math.max(0, frame - spd.entryDelay), fps, config: { damping: spd.springDamping, stiffness: spd.springStiffness, mass: spd.mass } });
  const springB = spring({ frame: Math.max(0, frame - spd.entryDelay - spd.entryGap * 2), fps, config: { damping: spd.springDamping, stiffness: spd.springStiffness, mass: spd.mass } });

  const scaleA = interpolate(springA, [0, 1], [0.85, 1]);
  const scaleB = interpolate(springB, [0, 1], [0.85, 1]);
  const opacityA = interpolate(springA, [0, 1], [0, 1]);
  const opacityB = interpolate(springB, [0, 1], [0, 1]);

  // OR animation
  const orSpring = spring({ frame: Math.max(0, frame - spd.entryDelay - spd.entryGap), fps, config: { damping: 10, stiffness: 180, mass: 0.6 } });
  const orScale = interpolate(orSpring, [0, 1], [0, 1]);

  // Reveal effects
  const isACorrect = question.correctSide === 'A';
  const winnerScale = 1 + revealProgress * 0.04;
  const loserScale = 1 - revealProgress * 0.03;
  const loserOpacity = 1 - revealProgress * 0.5;

  // Gentle float
  const floatA = Math.sin(frame * 0.025) * 2;
  const floatB = Math.sin(frame * 0.025 + 1.5) * 2;

  // Light sweep — a diagonal highlight that moves across both cards
  const sweepPosition = ((frame * 1.5) % 220) - 60; // faster, wider range
  const sweepPositionB = ((frame * 1.5 + 80) % 220) - 60; // offset for card B

  // Glow pulse on card edges — subtle breathing
  const glowPulse = 0.3 + Math.sin(frame * 0.06) * 0.15;

  const renderCard = (
    side: 'A' | 'B',
    image: string,
    label: string,
    springVal: number,
    scaleVal: number,
    opacityVal: number,
    floatVal: number,
    sweep: number,
  ) => {
    const isWinner = (side === 'A' && isACorrect) || (side === 'B' && !isACorrect);
    const isLoser = !isWinner;
    const badgeColor = side === 'A' ? '#E53935' : '#1E88E5';
    const glowColor = side === 'A' ? 'rgba(229,57,53,' : 'rgba(30,136,229,';

    return (
      <div style={{
        flex: 1,
        height: '100%',
        position: 'relative',
        transform: `scale(${scaleVal * (isRevealing ? (isWinner ? winnerScale : loserScale) : 1)}) translateY(${floatVal}px)`,
        opacity: opacityVal * (isRevealing && isLoser ? loserOpacity : 1),
      }}>
        <div style={{
          position: 'absolute', inset: 16,
          borderRadius: 24, overflow: 'hidden',
          border: isRevealing
            ? isWinner
              ? `4px solid rgba(76,175,80,${revealProgress})`
              : `4px solid rgba(229,57,53,${revealProgress * 0.4})`
            : `3px solid rgba(255,255,255,${0.4 + glowPulse})`,
          boxShadow: isRevealing && isWinner
            ? `0 0 ${50 * revealProgress}px rgba(76,175,80,${revealProgress * 0.6}), inset 0 0 30px rgba(76,175,80,${revealProgress * 0.1})`
            : `0 8px 32px rgba(0,0,0,0.3), 0 0 ${15 + glowPulse * 20}px ${glowColor}${glowPulse * 0.3})`,
        }}>
          {/* Image */}
          <img src={image} style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
          }} />

          {/* Light sweep — diagonal shine moving across the image */}
          {!isRevealing && (
            <div style={{
              position: 'absolute', inset: 0,
              background: `linear-gradient(115deg, transparent ${sweep - 30}%, rgba(0,0,0,0.03) ${sweep - 10}%, rgba(255,255,255,0.25) ${sweep}%, rgba(255,255,255,0.4) ${sweep + 4}%, rgba(255,255,255,0.25) ${sweep + 8}%, rgba(0,0,0,0.03) ${sweep + 18}%, transparent ${sweep + 30}%)`,
              pointerEvents: 'none',
            }} />
          )}

          {/* Glass-morphism label area at bottom */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '50px 20px 28px',
            background: 'linear-gradient(transparent, rgba(0,0,0,0.4) 30%, rgba(0,0,0,0.75))',
            backdropFilter: 'blur(4px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
          }}>
            {/* Badge with subtle glow ring */}
            <div style={{
              width: 76, height: 76, borderRadius: '50%',
              background: badgeColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 4px 15px rgba(0,0,0,0.3), 0 0 20px ${glowColor}${0.3 + glowPulse * 0.2})`,
              border: '3px solid rgba(255,255,255,0.3)',
            }}>
              <span style={{ fontSize: 40, fontWeight: 900, color: '#fff', fontFamily: 'system-ui' }}>{side}</span>
            </div>
            <OptionText width={580} maxSize={52} minSize={26} color="#fff">
              {label}
            </OptionText>
          </div>

          {/* Top edge shine — very subtle glass highlight */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 2,
            background: `linear-gradient(90deg, transparent, rgba(255,255,255,${0.3 + glowPulse * 0.3}), transparent)`,
          }} />

          {/* Correct/wrong badge on reveal */}
          {isRevealing && revealProgress > 0.25 && (
            <div style={{
              position: 'absolute', top: 20, right: 20,
              width: 72, height: 72, borderRadius: '50%',
              background: isWinner ? '#4CAF50' : '#E53935',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transform: `scale(${interpolate(revealProgress, [0.25, 0.55], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })})`,
              boxShadow: isWinner
                ? '0 4px 20px rgba(76,175,80,0.5), 0 0 30px rgba(76,175,80,0.3)'
                : '0 4px 12px rgba(229,57,53,0.4)',
              border: '3px solid rgba(255,255,255,0.4)',
            }}>
              <span style={{ fontSize: 40, color: '#fff', fontWeight: 900 }}>{isWinner ? '✓' : '✕'}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <AbsoluteFill>
      {/* QUESTION CARD — glass style */}
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

      {/* TWO CARDS + OR */}
      <div style={{
        position: 'absolute',
        top: 210, left: 60, right: 60, bottom: 70,
        display: 'flex',
        alignItems: 'center',
        gap: 0,
      }}>
        {renderCard('A', question.imageA, question.optionA, springA, scaleA, opacityA, floatA, sweepPosition)}

        {/* OR BADGE — glassy, pulsing */}
        <div style={{
          position: 'relative', zIndex: 10,
          width: 96, height: 96,
          borderRadius: '50%',
          background: 'linear-gradient(145deg, #FF6B35, #FF9800, #FFB74D)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 6px 30px rgba(255,107,53,${0.4 + glowPulse * 0.2}), inset 0 2px 4px rgba(255,255,255,0.3)`,
          transform: `scale(${orScale})`,
          flexShrink: 0,
          border: '3px solid rgba(255,255,255,0.35)',
        }}>
          {/* Inner glow ring */}
          <div style={{
            position: 'absolute', inset: 3, borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.2)',
          }} />
          <span style={{
            fontSize: 34, fontWeight: 900, color: '#fff',
            fontFamily: FONT_OPTION, letterSpacing: 1,
            textShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}>
            OR
          </span>
        </div>

        {renderCard('B', question.imageB, question.optionB, springB, scaleB, opacityB, floatB, sweepPositionB)}
      </div>

      {/* TIMER BAR */}
      {!isRevealing && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: timerPulse,
          background: 'rgba(0,0,0,0.12)',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, bottom: 0,
            width: `${timerProgress * 100}%`, background: barColor,
            borderRadius: '0 4px 4px 0',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: `linear-gradient(90deg, transparent ${((frame % 45) / 45) * 100 - 15}%, rgba(255,255,255,0.3) ${((frame % 45) / 45) * 100}%, transparent ${((frame % 45) / 45) * 100 + 15}%)`,
            }} />
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
