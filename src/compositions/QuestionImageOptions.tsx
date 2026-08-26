import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { AutoText, FONT_OPTION } from '../components/AutoText';
import type { ImageOptionsQ } from '../types';

const LABELS = ['A', 'B', 'C'];
const BADGE_COLORS = ['#E53935', '#43A047', '#1E88E5'];
// ponytail: placeholder gradients until real images are wired via <Img>
const PLACEHOLDER_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
];

/**
 * QuestionImageOptions: Question at top, 3 image cards side by side below.
 * On reveal: correct gets green border + ✓, wrong dim + red border.
 */
export const QuestionImageOptions: React.FC<{ question: ImageOptionsQ }> = ({ question }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const countdownFrames = question.timeLimit * fps;
  const isRevealing = frame >= countdownFrames;
  const revealProgress = isRevealing
    ? interpolate(frame, [countdownFrames, countdownFrames + 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 0;

  const timerProgress = Math.max(0, Math.min(1, (countdownFrames - frame) / countdownFrames));
  const barColor = timerProgress > 0.5 ? '#4CAF50' : timerProgress > 0.2 ? '#FF9800' : '#F44336';
  const titleOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill>
      {/* QUESTION CARD — full width */}
      <div style={{
        position: 'absolute',
        top: 40, left: 70, right: 70,
        display: 'flex', alignItems: 'center',
        opacity: titleOpacity,
      }}>
        <div style={{
          flex: 1, background: '#FFFFFF', borderRadius: 24,
          padding: '28px 50px', boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
          textAlign: 'center',
        }}>
          <AutoText width={1500} maxSize={68} minSize={34} maxLines={2} color="#1a1a1a" shadow={false}>
            {question.questionText}
          </AutoText>
        </div>
      </div>

      {/* 3 IMAGE OPTIONS — side by side */}
      <div style={{
        position: 'absolute',
        top: 190, left: 70, right: 70, bottom: 60,
        display: 'flex', gap: 36, alignItems: 'center',
      }}>
        {question.options.map((option, i) => {
          const delay = 5 + i * 4;
          const s = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 10 } });
          const scale = interpolate(s, [0, 1], [0.8, 1]);
          const optOpacity = interpolate(s, [0, 1], [0, 1]);

          const isCorrect = i === question.correctIndex;
          const isWrong = isRevealing && !isCorrect;
          const cardOpacity = isWrong ? 1 - revealProgress * 0.5 : 1;

          const borderColor = isRevealing
            ? isCorrect ? `rgba(76,175,80,${revealProgress})` : `rgba(229,57,53,${revealProgress * 0.6})`
            : 'rgba(255,255,255,0.9)';

          return (
            <div key={i} style={{
              flex: 1, height: '100%',
              display: 'flex', flexDirection: 'column', gap: 16,
              transform: `scale(${scale})`,
              opacity: optOpacity * cardOpacity,
            }}>
              {/* Image card */}
              <div style={{
                flex: 1, borderRadius: 24, overflow: 'hidden',
                border: `6px solid ${borderColor}`,
                boxShadow: isRevealing && isCorrect
                  ? `0 8px 30px rgba(76,175,80,${revealProgress * 0.5})`
                  : '0 8px 30px rgba(0,0,0,0.2)',
                background: PLACEHOLDER_GRADIENTS[i],
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
              }}>
                {/* Placeholder emoji — replace with <Img src={question.optionImages[i]} /> */}
                <span style={{ fontSize: 80 }}>
                  {['🖼️', '🎨', '🏛️'][i]}
                </span>

                {/* Correct badge */}
                {isRevealing && isCorrect && revealProgress > 0.2 && (
                  <div style={{
                    position: 'absolute', top: 16, right: 16,
                    width: 64, height: 64, borderRadius: '50%',
                    background: '#4CAF50',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transform: `scale(${interpolate(revealProgress, [0.2, 0.5], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })})`,
                    boxShadow: '0 4px 12px rgba(76,175,80,0.4)',
                  }}>
                    <span style={{ fontSize: 36, color: '#fff', fontWeight: 900 }}>✓</span>
                  </div>
                )}

                {/* Wrong badge */}
                {isWrong && revealProgress > 0.3 && (
                  <div style={{
                    position: 'absolute', top: 16, right: 16,
                    width: 56, height: 56, borderRadius: '50%',
                    background: '#E53935',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transform: `scale(${interpolate(revealProgress, [0.3, 0.6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })})`,
                    boxShadow: '0 4px 12px rgba(229,57,53,0.4)',
                  }}>
                    <span style={{ fontSize: 28, fontWeight: 900, color: '#fff' }}>✕</span>
                  </div>
                )}
              </div>

              {/* Label below image */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  backgroundColor: BADGE_COLORS[i],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
                }}>
                  <span style={{ fontSize: 26, fontWeight: 900, color: '#fff', fontFamily: 'system-ui' }}>
                    {LABELS[i]}
                  </span>
                </div>
                <span style={{
                  fontSize: 28, fontWeight: 700, color: '#fff',
                  fontFamily: FONT_OPTION, textShadow: '0 2px 6px rgba(0,0,0,0.3)',
                }}>
                  {option}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* TIMER BAR */}
      {!isRevealing && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 28, background: 'rgba(0,0,0,0.15)' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${timerProgress * 100}%`, background: barColor }}>
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(90deg, transparent ${((frame % 45) / 45) * 100 - 15}%, rgba(255,255,255,0.2) ${((frame % 45) / 45) * 100}%, transparent ${((frame % 45) / 45) * 100 + 15}%)` }} />
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
