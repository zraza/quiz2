import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { AutoText, OptionText, FONT_OPTION } from '../components/AutoText';
import type { ThisOrThatQ } from '../types';
import { getSpeedConfig } from '../types';

/**
 * QuestionThisOrThat: Two big cards side by side with "OR" in the middle.
 * Binary choice — fast, opinionated, engaging.
 * On reveal: winner glows green + scales up, loser dims + shrinks.
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

  const scaleA = interpolate(springA, [0, 1], [0.8, 1]);
  const scaleB = interpolate(springB, [0, 1], [0.8, 1]);
  const opacityA = interpolate(springA, [0, 1], [0, 1]);
  const opacityB = interpolate(springB, [0, 1], [0, 1]);

  // OR animation
  const orSpring = spring({ frame: Math.max(0, frame - spd.entryDelay - spd.entryGap), fps, config: { damping: 12, stiffness: 200, mass: 0.6 } });
  const orScale = interpolate(orSpring, [0, 1], [0, 1]);
  const orRotate = interpolate(orSpring, [0, 1], [-20, 0]);

  // Reveal effects
  const isACorrect = question.correctSide === 'A';
  const winnerScale = 1 + revealProgress * 0.05;
  const loserScale = 1 - revealProgress * 0.05;
  const loserOpacity = 1 - revealProgress * 0.5;

  // Gentle float
  const floatA = Math.sin(frame * 0.03) * 3;
  const floatB = Math.sin(frame * 0.03 + 1.5) * 3;

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
          flex: 1, background: '#FFFFFF', borderRadius: 24,
          padding: '28px 50px', boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
          textAlign: 'center',
        }}>
          <AutoText width={1500} maxSize={64} minSize={32} maxLines={2} color="#1a1a1a" shadow={false}>
            {question.questionText}
          </AutoText>
        </div>
      </div>

      {/* TWO CARDS + OR */}
      <div style={{
        position: 'absolute',
        top: 220, left: 80, right: 80, bottom: 80,
        display: 'flex',
        alignItems: 'center',
        gap: 0,
      }}>
        {/* CARD A */}
        <div style={{
          flex: 1,
          height: '100%',
          position: 'relative',
          transform: `scale(${scaleA * (isRevealing ? (isACorrect ? winnerScale : loserScale) : 1)}) translateY(${floatA}px)`,
          opacity: opacityA * (isRevealing && !isACorrect ? loserOpacity : 1),
        }}>
          <div style={{
            position: 'absolute', inset: 20,
            borderRadius: 28, overflow: 'hidden',
            border: isRevealing
              ? isACorrect
                ? `6px solid rgba(76,175,80,${revealProgress})`
                : `6px solid rgba(229,57,53,${revealProgress * 0.5})`
              : '6px solid rgba(255,255,255,0.9)',
            boxShadow: isRevealing && isACorrect
              ? `0 0 ${40 * revealProgress}px rgba(76,175,80,${revealProgress * 0.5})`
              : '0 12px 40px rgba(0,0,0,0.25)',
          }}>
            {/* Image */}
            <img src={question.imageA} style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
            }} />
            {/* Gradient overlay at bottom */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%',
              background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
            }} />
            {/* Label */}
            <div style={{
              position: 'absolute', bottom: 30, left: 0, right: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
            }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: '#E53935', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
              }}>
                <span style={{ fontSize: 42, fontWeight: 900, color: '#fff', fontFamily: 'system-ui' }}>A</span>
              </div>
              <OptionText width={600} maxSize={56} minSize={28} color="#fff">
                {question.optionA}
              </OptionText>
            </div>
            {/* Correct/wrong badge */}
            {isRevealing && revealProgress > 0.3 && (
              <div style={{
                position: 'absolute', top: 24, right: 24,
                width: 72, height: 72, borderRadius: '50%',
                background: isACorrect ? '#4CAF50' : '#E53935',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transform: `scale(${interpolate(revealProgress, [0.3, 0.6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })})`,
                boxShadow: `0 4px 12px ${isACorrect ? 'rgba(76,175,80,0.4)' : 'rgba(229,57,53,0.4)'}`,
              }}>
                <span style={{ fontSize: 40, color: '#fff', fontWeight: 900 }}>{isACorrect ? '✓' : '✕'}</span>
              </div>
            )}
          </div>
        </div>

        {/* OR BADGE — center */}
        <div style={{
          position: 'relative', zIndex: 10,
          width: 100, height: 100,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #FF6B35, #FF9800)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 6px 25px rgba(255,107,53,0.4)',
          transform: `scale(${orScale}) rotate(${orRotate}deg)`,
          flexShrink: 0,
        }}>
          <span style={{
            fontSize: 36, fontWeight: 900, color: '#fff',
            fontFamily: FONT_OPTION, letterSpacing: 1,
          }}>
            OR
          </span>
        </div>

        {/* CARD B */}
        <div style={{
          flex: 1,
          height: '100%',
          position: 'relative',
          transform: `scale(${scaleB * (isRevealing ? (!isACorrect ? winnerScale : loserScale) : 1)}) translateY(${floatB}px)`,
          opacity: opacityB * (isRevealing && isACorrect ? loserOpacity : 1),
        }}>
          <div style={{
            position: 'absolute', inset: 20,
            borderRadius: 28, overflow: 'hidden',
            border: isRevealing
              ? !isACorrect
                ? `6px solid rgba(76,175,80,${revealProgress})`
                : `6px solid rgba(229,57,53,${revealProgress * 0.5})`
              : '6px solid rgba(255,255,255,0.9)',
            boxShadow: isRevealing && !isACorrect
              ? `0 0 ${40 * revealProgress}px rgba(76,175,80,${revealProgress * 0.5})`
              : '0 12px 40px rgba(0,0,0,0.25)',
          }}>
            {/* Image */}
            <img src={question.imageB} style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
            }} />
            {/* Gradient overlay at bottom */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%',
              background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
            }} />
            {/* Label */}
            <div style={{
              position: 'absolute', bottom: 30, left: 0, right: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
            }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: '#1E88E5', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
              }}>
                <span style={{ fontSize: 42, fontWeight: 900, color: '#fff', fontFamily: 'system-ui' }}>B</span>
              </div>
              <OptionText width={600} maxSize={56} minSize={28} color="#fff">
                {question.optionB}
              </OptionText>
            </div>
            {/* Correct/wrong badge */}
            {isRevealing && revealProgress > 0.3 && (
              <div style={{
                position: 'absolute', top: 24, right: 24,
                width: 72, height: 72, borderRadius: '50%',
                background: !isACorrect ? '#4CAF50' : '#E53935',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transform: `scale(${interpolate(revealProgress, [0.3, 0.6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })})`,
                boxShadow: `0 4px 12px ${!isACorrect ? 'rgba(76,175,80,0.4)' : 'rgba(229,57,53,0.4)'}`,
              }}>
                <span style={{ fontSize: 40, color: '#fff', fontWeight: 900 }}>{!isACorrect ? '✓' : '✕'}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TIMER BAR */}
      {!isRevealing && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: timerPulse, background: 'rgba(0,0,0,0.15)' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${timerProgress * 100}%`, background: barColor }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: `linear-gradient(90deg, transparent ${((frame % 45) / 45) * 100 - 15}%, rgba(255,255,255,0.25) ${((frame % 45) / 45) * 100}%, transparent ${((frame % 45) / 45) * 100 + 15}%)`,
            }} />
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
