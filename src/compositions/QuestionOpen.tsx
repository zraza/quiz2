import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate, Audio } from 'remotion';
import { AutoText, FONT_QUESTION, FONT_OPTION } from '../components/AutoText';

interface Props {
  questionNumber: number;
  questionText: string;
  timeLimit: number;
  answer: string;
}

/**
 * QuestionOpen: Text-only question with NO options.
 * 
 * Layout:
 * - Question number: top-left badge
 * - Question text: FILLS the center of the screen (huge, 2 lines max)
 * - "?" icon pulsing below the question during countdown
 * - On reveal: question fades up, answer SLAMS in center (big text)
 * - Timer bar at bottom
 * 
 * Used for: open-ended questions like "What year was X?", "Name the capital of..."
 */
export const QuestionOpen: React.FC<Props> = ({ questionNumber, questionText, timeLimit, answer }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const countdownFrames = timeLimit * fps;
  const isRevealing = frame >= countdownFrames;
  const revealProgress = isRevealing
    ? interpolate(frame, [countdownFrames, countdownFrames + 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 0;

  // Timer
  const timerProgress = Math.max(0, Math.min(1, (countdownFrames - frame) / countdownFrames));
  const barColor = timerProgress > 0.5 ? '#4CAF50' : timerProgress > 0.2 ? '#FF9800' : '#F44336';
  const timerUrgent = timerProgress < 0.2 && !isRevealing;
  const timerPulse = timerUrgent ? 28 + Math.sin(frame * 0.5) * 6 : 28;

  const titleOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });

  // Reveal: question moves up, answer comes in
  const questionY = isRevealing ? interpolate(revealProgress, [0, 1], [0, -120]) : 0;
  const questionOpacity = isRevealing ? interpolate(revealProgress, [0, 0.5], [1, 0.4], { extrapolateRight: 'clamp' }) : 1;

  // Answer pop - PUNCHY
  const answerSpring = spring({ frame: Math.max(0, frame - countdownFrames), fps, config: { damping: 12, stiffness: 220, mass: 0.7 } });
  const answerScale = interpolate(answerSpring, [0, 1], [0.3, 1]);
  const answerOpacity = interpolate(answerSpring, [0, 1], [0, 1]);

  return (
    <AbsoluteFill>
      {/* QUESTION TEXT — centered, fills the screen */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 70,
        right: 70,
        bottom: 80,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 40,
        opacity: titleOpacity * questionOpacity,
        transform: `translateY(${questionY}px)`,
      }}>
        <div style={{
          background: '#FFFFFF',
          borderRadius: 28,
          padding: '44px 70px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
          width: '80%',
          textAlign: 'center',
        }}>
          <AutoText width={1400} maxSize={100} minSize={44} maxLines={2} color="#1a1a1a" shadow={false}>
            {questionText}
          </AutoText>
        </div>

        {/* Thinking prompt during countdown — animated dots */}
        {!isRevealing && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 20,
          }}>
            {/* Three thinking dots */}
            <div style={{ display: 'flex', gap: 16 }}>
              {[0, 1, 2].map((i) => {
                const dotScale = interpolate(
                  Math.sin((frame * 0.12) + i * 1.2),
                  [-1, 1],
                  [0.6, 1.2]
                );
                return (
                  <div key={i} style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.7)',
                    transform: `scale(${dotScale})`,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  }} />
                );
              })}
            </div>

            {/* "Think..." text */}
            <span style={{
              fontSize: 36,
              fontWeight: 600,
              fontFamily: FONT_OPTION,
              color: 'rgba(255,255,255,0.5)',
              letterSpacing: 4,
              textTransform: 'uppercase',
            }}>
              Think...
            </span>
          </div>
        )}
      </div>

      {/* ANSWER — appears on reveal, big and center */}
      {isRevealing && (
        <div style={{
          position: 'absolute',
          top: '45%',
          left: 140,
          right: 140,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
          transform: `scale(${answerScale})`,
          opacity: answerOpacity,
        }}>
          {/* Green tick above answer */}
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: '#4CAF50',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 20px rgba(76,175,80,0.4)',
          }}>
            <span style={{ fontSize: 44, color: '#fff', fontWeight: 900 }}>✓</span>
          </div>

          {/* Answer text */}
          <AutoText width={1400} maxSize={110} minSize={44} color="#fff">
            {answer}
          </AutoText>
        </div>
      )}

      {/* TIMER BAR */}
      {!isRevealing && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: timerPulse,
          background: 'rgba(0,0,0,0.15)',
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: `${timerProgress * 100}%`,
            background: barColor,
          }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(90deg, transparent ${((frame % 45) / 45) * 100 - 15}%, rgba(255,255,255,0.2) ${((frame % 45) / 45) * 100}%, transparent ${((frame % 45) / 45) * 100 + 15}%)`,
            }} />
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
