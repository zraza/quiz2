import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { AutoText, FONT_QUESTION, FONT_OPTION } from '../components/AutoText';

interface Props {
  questionNumber: number;
  questionText: string;
  timeLimit: number;
  answer: string;
  /** If provided, shows this image in the reveal instead of just text */
  answerImageUrl?: string;
  voDuration?: number;
}

/**
 * QuestionImage: Shows an IMAGE as the question content (like "Which country flag is this?")
 * 
 * Layout during countdown:
 * - Question number: top-left badge  
 * - Question text: top area
 * - IMAGE: fills the center (big, with subtle float)
 * - Timer bar at bottom
 * 
 * Layout on reveal:
 * - Image shrinks/moves up
 * - Answer appears below (text, or text + image)
 */
export const QuestionImage: React.FC<Props> = ({ questionNumber, questionText, timeLimit, answer, answerImageUrl, voDuration = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const voFrames = Math.ceil(voDuration * fps);
  const quizFrame = Math.max(0, frame - voFrames);

  const countdownFrames = timeLimit * fps;
  const isRevealing = quizFrame >= countdownFrames;
  const revealProgress = isRevealing
    ? interpolate(quizFrame, [countdownFrames, countdownFrames + 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 0;

  // Timer
  const timerProgress = frame < voFrames ? 1 : Math.max(0, Math.min(1, (countdownFrames - quizFrame) / countdownFrames));
  const barColor = timerProgress > 0.5 ? '#4CAF50' : timerProgress > 0.2 ? '#FF9800' : '#F44336';

  const titleOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });

  // Image animation
  const imgFloat = Math.sin(frame * 0.03) * 4;
  const imgSpring = spring({ frame, fps, config: { damping: 10 } });

  // On reveal: image moves up and shrinks
  const imgScale = isRevealing ? interpolate(revealProgress, [0, 1], [1, 0.65]) : 1;
  const imgY = isRevealing ? interpolate(revealProgress, [0, 1], [0, -80]) : imgFloat;

  // Answer
  const answerSpring = spring({ frame: Math.max(0, frame - countdownFrames - 5), fps, config: { damping: 8 } });
  const answerScale = interpolate(answerSpring, [0, 1], [0.3, 1]);
  const answerOpacity = interpolate(answerSpring, [0, 1], [0, 1]);

  return (
    <AbsoluteFill>
      {/* QUESTION TEXT — top, full width card */}
      <div style={{
        position: 'absolute',
        top: 40,
        left: 70,
        right: 70,
        display: 'flex',
        alignItems: 'center',
        opacity: titleOpacity,
      }}>
        <div style={{
          flex: 1,
          background: '#FFFFFF',
          borderRadius: 24,
          padding: '28px 50px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
          textAlign: 'center',
        }}>
          <AutoText width={1500} maxSize={68} minSize={36} maxLines={2} color="#1a1a1a" shadow={false}>
            {questionText}
          </AutoText>
        </div>
      </div>

      {/* IMAGE — center, big, crossfades on reveal */}
      <div style={{
        position: 'absolute',
        top: 180,
        left: 200,
        right: 200,
        bottom: isRevealing ? 300 : 80,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `scale(${imgScale * interpolate(imgSpring, [0, 1], [0.85, 1])}) translateY(${imgY}px)`,
      }}>
        <div style={{
          width: '100%',
          height: '100%',
          maxWidth: 900,
          maxHeight: 600,
          borderRadius: 28,
          overflow: 'hidden',
          border: '6px solid rgba(255,255,255,0.9)',
          boxShadow: '0 12px 50px rgba(0,0,0,0.3)',
          position: 'relative',
        }}>
          {/* Question image (during countdown) */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, #ff9a56 0%, #ff6f56 50%, #ff3860 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 12,
            opacity: isRevealing ? 1 - revealProgress : 1,
          }}>
            <span style={{ fontSize: 120 }}>🏳️</span>
            <span style={{
              fontSize: 28,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.8)',
              fontFamily: FONT_OPTION,
            }}>
              WHICH FLAG?
            </span>
          </div>

          {/* Answer image (crossfades in) */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 16,
            opacity: isRevealing ? revealProgress : 0,
          }}>
            <span style={{ fontSize: 120 }}>🇧🇷</span>
            <span style={{
              fontSize: 36,
              fontWeight: 700,
              color: '#fff',
              fontFamily: FONT_OPTION,
            }}>
              {answer}
            </span>
          </div>
        </div>
      </div>

      {/* ANSWER — appears on reveal below the image */}
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
          {/* Green tick */}
          <div style={{
            width: 70,
            height: 70,
            borderRadius: '50%',
            background: '#4CAF50',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(76,175,80,0.4)',
          }}>
            <span style={{ fontSize: 38, color: '#fff', fontWeight: 900 }}>✓</span>
          </div>

          {/* Answer text */}
          <AutoText width={1400} maxSize={90} minSize={40} color="#fff">
            {answer}
          </AutoText>
        </div>
      )}

      {/* TIMER BAR */}
      {!isRevealing && frame >= voFrames && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 28,
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
