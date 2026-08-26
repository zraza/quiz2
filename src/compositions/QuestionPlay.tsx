import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate, Video } from 'remotion';
import { AutoText, OptionText, FONT_OPTION } from '../components/AutoText';
import type { QuizQuestion } from '../types';

const LABELS = ['A', 'B', 'C', 'D'];
const BADGE_COLORS = ['#E53935', '#43A047', '#1E88E5', '#FF9800'];

/**
 * QuestionPlay: TV-optimized layout with image that swaps on reveal.
 * 
 * - During countdown: shows "question image" (e.g. galaxy)
 * - On reveal: image crossfades to "answer image" (e.g. Saturn)
 */
export const QuestionPlay: React.FC<{ question: QuizQuestion }> = ({ question }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const options = 'options' in question ? question.options : [];
  const mediaDuration = Math.min(question.mediaDuration || 0, 20);
  const mediaFrames = mediaDuration * fps;
  const isMediaPhase = frame < mediaFrames;
  const quizFrame = Math.max(0, frame - mediaFrames); // frame relative to quiz start

  const countdownFrames = question.timeLimit * fps;
  const isRevealing = quizFrame >= countdownFrames;
  const revealProgress = isRevealing
    ? interpolate(quizFrame, [countdownFrames, countdownFrames + 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 0;

  // Timer bar
  const timerProgress = isMediaPhase ? 1 : Math.max(0, Math.min(1, (countdownFrames - quizFrame) / countdownFrames));
  const barColor = timerProgress > 0.5 ? '#4CAF50' : timerProgress > 0.2 ? '#FF9800' : '#F44336';

  // Image animation
  const imgFloat = Math.sin(frame * 0.035) * 5;
  const imgRotate = Math.sin(frame * 0.02) * 0.8;
  const imgSpring = spring({ frame, fps, config: { damping: 10 } });

  const titleOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill>
      {/* TOP ROW: Question card (full width) */}
      <div style={{
        position: 'absolute',
        top: 50,
        left: 100,
        right: 100,
        display: 'flex',
        alignItems: 'center',
        opacity: titleOpacity,
      }}>
        {/* Question card — takes full width */}
        <div style={{
          flex: 1,
          background: '#FFFFFF',
          borderRadius: 24,
          padding: '28px 50px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
          textAlign: 'center',
        }}>
          <AutoText width={1500} maxSize={68} minSize={34} maxLines={2} color="#1a1a1a" shadow={false}>
            {question.questionText}
          </AutoText>
        </div>
      </div>

      {/* CONTENT: Image left + Options right */}
      <div style={{
        position: 'absolute',
        top: 210,
        left: 100,
        right: 100,
        bottom: 80,
        display: 'flex',
        gap: 60,
      }}>
        {/* IMAGE — left 46% */}
        {/* If question has options with an image context (like "gold"), show static image.
            If it's a mystery/guess question, crossfade to answer image on reveal. */}
        <div style={{
          flex: '0 0 46%',
          borderRadius: 28,
          overflow: 'hidden',
          border: '5px solid rgba(255,255,255,0.9)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
          transform: `scale(${interpolate(imgSpring, [0, 1], [0.85, 1])}) translateY(${imgFloat}px) rotate(${imgRotate}deg)`,
          position: 'relative',
        }}>
          {/* Video/image content */}
          {question.mediaUrl ? (
            <Video
              src={question.mediaUrl}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              volume={isMediaPhase ? 1 : 0}
              startFrom={0}
              endAt={mediaFrames}
            />
          ) : (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(135deg, #f6d365 0%, #fda085 50%, #f5af19 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', gap: 16,
            }}>
              <span style={{ fontSize: 130 }}>🏆</span>
            </div>
          )}
        </div>

        {/* OPTIONS */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          padding: '10px 0',
          justifyContent: 'center',
        }}>
          {options.map((option, i) => {
            const delay = 5 + i * 3;
            const s = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 10 } });
            const translateX = interpolate(s, [0, 1], [60, 0]);
            const optOpacity = interpolate(s, [0, 1], [0, 1]);

            const isCorrect = option === question.correctAnswer;
            const isWrong = isRevealing && !isCorrect;
            const cardOpacity = isWrong ? 1 - revealProgress * 0.55 : 1;

            return (
              <div key={i} style={{
                flex: 1,
                position: 'relative',
                backgroundColor: '#FFFFFF',
                borderRadius: 24,
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: 28,
                padding: '0 44px',
                transform: `translateX(${translateX}px)`,
                opacity: optOpacity * cardOpacity,
              }}>
                {/* Letter badge */}
                <div style={{
                  width: 70,
                  height: 70,
                  borderRadius: '50%',
                  backgroundColor: BADGE_COLORS[i],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
                }}>
                  <span style={{
                    fontSize: 36,
                    fontWeight: 900,
                    color: '#fff',
                    fontFamily: 'system-ui',
                  }}>
                    {LABELS[i]}
                  </span>
                </div>

                {/* Option text */}
                <OptionText width={380} maxSize={48} minSize={24} color="#1a1a1a">
                  {option}
                </OptionText>

                {/* Green tick on correct */}
                {isRevealing && isCorrect && revealProgress > 0.2 && (
                  <div style={{
                    position: 'absolute',
                    right: 36,
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: '#4CAF50',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: `scale(${interpolate(revealProgress, [0.2, 0.5], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })})`,
                    boxShadow: '0 4px 12px rgba(76,175,80,0.4)',
                  }}>
                    <span style={{ fontSize: 36, color: '#fff', fontWeight: 900 }}>✓</span>
                  </div>
                )}

                {/* Red cross on wrong */}
                {isWrong && revealProgress > 0.3 && (
                  <div style={{
                    position: 'absolute',
                    right: 36,
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: '#E53935',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: `scale(${interpolate(revealProgress, [0.3, 0.6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })})`,
                    boxShadow: '0 4px 12px rgba(229,57,53,0.4)',
                  }}>
                    <span style={{ fontSize: 32, fontWeight: 900, color: '#fff' }}>✕</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* TIMER BAR — hidden during media phase */}
      {!isRevealing && !isMediaPhase && (
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
