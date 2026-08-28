import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate, Video, Audio } from 'remotion';
import { AutoText, OptionText, FONT_OPTION } from '../components/AutoText';
import type { QuizQuestion } from '../types';
import { getSpeedConfig } from '../types';

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
  const spd = getSpeedConfig(question);
  const mediaRole = question.mediaRole || 'clue';
  const mediaDuration = Math.min(question.mediaDuration || 0, 20);
  const voFrames = Math.ceil((question.voDuration || 0) * fps);
  const mediaFrames = mediaRole === 'clue' ? mediaDuration * fps : 0;
  const delayFrames = voFrames + mediaFrames; // total delay before timer starts
  const isVoPhase = frame < voFrames;
  const isMediaPhase = frame >= voFrames && frame < delayFrames;
  const quizFrame = Math.max(0, frame - delayFrames); // frame relative to timer start

  const countdownFrames = question.timeLimit * fps;
  const isRevealing = quizFrame >= countdownFrames;
  const revealProgress = isRevealing
    ? interpolate(quizFrame, [countdownFrames, countdownFrames + spd.revealFrames], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 0;

  // Timer bar
  const timerProgress = (isVoPhase || isMediaPhase) ? 1 : Math.max(0, Math.min(1, (countdownFrames - quizFrame) / countdownFrames));
  const barColor = timerProgress > 0.5 ? '#4CAF50' : timerProgress > 0.2 ? '#FF9800' : '#F44336';
  const timerUrgent = timerProgress < 0.2 && !isRevealing;
  const timerPulse = timerUrgent ? 28 + Math.sin(frame * 0.5) * 6 : 28;

  // Image animation
  const imgFloat = Math.sin(frame * 0.035) * 3;
  const imgRotate = Math.sin(frame * 0.02) * 0.5;
  const imgSpring = spring({ frame, fps, config: { damping: spd.springDamping, stiffness: spd.springStiffness, mass: spd.mass } });

  const titleOpacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: 'clamp' });
  const titleY = interpolate(frame, [0, 10], [-30, 0], { extrapolateRight: 'clamp' });

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
        opacity: titleOpacity * (isRevealing ? interpolate(revealProgress, [0, 0.5], [1, 0.5], { extrapolateRight: 'clamp' }) : 1),
        transform: `translateY(${titleY + (isRevealing ? -revealProgress * 20 : 0)}px)`,
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
      {(() => {
        // Animate video width: 100% during media → 46% after
        // Transition happens over 15 frames after media ends
        const transitionFrame = Math.max(0, frame - delayFrames);
        const videoWidthPct = (isVoPhase || isMediaPhase)
          ? 100
          : delayFrames > 0
            ? interpolate(transitionFrame, [0, 15], [100, 46], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
            : 46;
        const optionsOpacity = (isVoPhase || isMediaPhase)
          ? 0
          : delayFrames > 0
            ? interpolate(transitionFrame, [8, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
            : 1;
        const contentGap = (isVoPhase || isMediaPhase) ? 0 : interpolate(Math.min(transitionFrame, 15), [0, 15], [0, 60], { extrapolateRight: 'clamp' });

        return (
          <div style={{
            position: 'absolute',
            top: 210,
            left: 100,
            right: 100,
            bottom: 80,
            display: 'flex',
            gap: contentGap,
            alignItems: 'stretch',
          }}>
            {/* IMAGE/VIDEO */}
            <div style={{
              width: `${videoWidthPct}%`,
              flexShrink: 0,
              borderRadius: 28,
              overflow: 'hidden',
              border: '5px solid rgba(255,255,255,0.9)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
              position: 'relative',
            }}>
              {/* Video/image content */}
              {question.mediaUrl ? (
                <Video
                  src={question.mediaUrl}
                  style={{
                    position: 'absolute', inset: 0, width: '100%', height: '100%',
                    objectFit: question.mediaFit || 'cover',
                    background: '#000',
                  }}
                  volume={mediaRole === 'ambient' ? 0 : isMediaPhase ? 1 : 0}
                  startFrom={0}
                  loop={mediaRole === 'ambient'}
                  pauseWhenBuffering
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

            {/* OPTIONS — fade in after media ends */}
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
              padding: '10px 0',
              justifyContent: 'center',
              opacity: optionsOpacity,
            }}>
          {options.map((option, i) => {
            const delay = spd.entryDelay + i * spd.entryGap;
            const s = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: spd.springDamping, stiffness: spd.springStiffness, mass: spd.mass } });
            const translateX = interpolate(s, [0, 1], [50, 0]);
            const optOpacity = interpolate(s, [0, 1], [0, 1]);

            const isCorrect = option === question.correctAnswer;
            const isWrong = isRevealing && !isCorrect;
            const cardOpacity = isWrong ? 1 - revealProgress * 0.55 : 1;

            // Shake on correct reveal
            const shakeX = isRevealing && isCorrect && revealProgress < 0.5
              ? Math.sin(quizFrame * 1.5) * 4 * (1 - revealProgress * 2)
              : 0;

            return (
              <div key={i} style={{
                flex: 1,
                position: 'relative',
                backgroundColor: '#FFFFFF',
                borderRadius: 24,
                boxShadow: isRevealing && isCorrect
                  ? `0 0 ${30 * revealProgress}px rgba(76,175,80,${revealProgress * 0.6}), 0 4px 16px rgba(0,0,0,0.08)`
                  : '0 4px 16px rgba(0,0,0,0.08)',
                border: isRevealing && isCorrect ? `4px solid rgba(76,175,80,${revealProgress})` : '4px solid transparent',
                display: 'flex',
                alignItems: 'center',
                gap: 28,
                padding: '0 44px',
                transform: `translateX(${translateX + shakeX}px)${isRevealing && isCorrect ? ` scale(${1 + revealProgress * 0.03})` : ''}`,
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
        );
      })()}

      {/* VOICEOVER */}
      {question.voUrl && <Audio src={question.voUrl} startFrom={0} volume={1} />}
      {question.voRevealUrl && isRevealing && (
        <Audio src={question.voRevealUrl} startFrom={0} volume={1} />
      )}

      {/* TIMER BAR — hidden during VO and media phase */}
      {!isRevealing && !isVoPhase && !isMediaPhase && (
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
