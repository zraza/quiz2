import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate, Audio, Video } from 'remotion';
import { AutoText, OptionText, FONT_OPTION } from '../components/AutoText';
import type { AudioQ } from '../types';
import { getSpeedConfig } from '../types';

const LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];
const BADGE_COLORS = ['#E53935', '#43A047', '#1E88E5', '#FF9800', '#9C27B0', '#00897B'];

/**
 * QuestionAudio: Audio plays invisibly. Options take full width.
 * - Odd option count → vertical stack (like QuestionPlay but full width)
 * - Even option count → 2×N grid
 * - Small animated speaker icon in question card to hint audio is playing
 */
export const QuestionAudio: React.FC<{ question: AudioQ }> = ({ question }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const mediaRole = question.mediaRole || 'clue';
  const spd = getSpeedConfig(question);
  const mediaDuration = Math.min(question.mediaDuration || 0, 20);
  const mediaFrames = mediaRole === 'clue' ? mediaDuration * fps : 0;
  const isMediaPhase = frame < mediaFrames;
  const quizFrame = Math.max(0, frame - mediaFrames);

  const countdownFrames = question.timeLimit * fps;
  const isRevealing = quizFrame >= countdownFrames;
  const revealProgress = isRevealing
    ? interpolate(quizFrame, [countdownFrames, countdownFrames + spd.revealFrames], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 0;

  const timerProgress = isMediaPhase ? 1 : Math.max(0, Math.min(1, (countdownFrames - quizFrame) / countdownFrames));
  const barColor = timerProgress > 0.5 ? '#4CAF50' : timerProgress > 0.2 ? '#FF9800' : '#F44336';
  const titleOpacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: 'clamp' });

  const isEven = question.options.length % 2 === 0;
  const isPlaying = isMediaPhase || (!isRevealing && mediaRole === 'ambient');

  // Pulsing speaker animation
  const speakerPulse = isPlaying ? 0.9 + Math.sin(frame * 0.2) * 0.1 : 0.8;

  // Transition from spectrum to options
  const transitionFrame = Math.max(0, frame - mediaFrames);
  const spectrumOpacity = isMediaPhase
    ? 1
    : mediaFrames > 0
      ? interpolate(transitionFrame, [0, 12], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
      : 0;
  const optionsOpacity = isMediaPhase
    ? 0
    : mediaFrames > 0
      ? interpolate(transitionFrame, [8, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
      : 1;

  return (
    <AbsoluteFill>
      {/* INVISIBLE AUDIO PLAYBACK */}
      {question.mediaUrl && (
        question.mediaUrl.endsWith('.mp3') || question.mediaUrl.endsWith('.wav') || question.mediaUrl.endsWith('.ogg')
          ? <Audio src={question.mediaUrl} startFrom={0} volume={isMediaPhase ? 1 : 0} />
          : <Video src={question.mediaUrl} style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }} startFrom={0} volume={isMediaPhase ? 1 : 0} />
      )}

      {/* QUESTION CARD */}
      <div style={{
        position: 'absolute',
        top: 50, left: 100, right: 100,
        display: 'flex', alignItems: 'center',
        opacity: titleOpacity,
      }}>
        <div style={{
          flex: 1, background: '#FFFFFF', borderRadius: 24,
          padding: '28px 50px', boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
          textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24,
        }}>
          {/* Speaker icon */}
          <span style={{
            fontSize: 48, transform: `scale(${speakerPulse})`,
            opacity: isPlaying ? 1 : 0.4,
          }}>
            {isPlaying ? '🔊' : '🔇'}
          </span>
          <AutoText width={1350} maxSize={64} minSize={32} maxLines={2} color="#1a1a1a" shadow={false}>
            {question.questionText}
          </AutoText>
        </div>
      </div>

      {/* AUDIO SPECTRUM — full width during media phase, fades out */}
      {spectrumOpacity > 0 && (
        <div style={{
          position: 'absolute',
          top: 220, left: 100, right: 100, bottom: 80,
          borderRadius: 28, overflow: 'hidden',
          background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: 30,
          border: '5px solid rgba(255,255,255,0.9)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
          opacity: spectrumOpacity,
        }}>
          {/* Waveform bars */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, height: 280 }}>
            {Array.from({ length: 48 }).map((_, i) => {
              const phase = (frame * 0.1) + i * 0.35;
              const height = 30 + Math.abs(Math.sin(phase * 1.5)) * 200 + Math.sin(phase * 0.9) * 60;
              return (
                <div key={i} style={{
                  width: 12, borderRadius: 6,
                  height: Math.max(12, height),
                  background: `hsl(${260 + i * 2}, 80%, ${55 + Math.sin(phase) * 15}%)`,
                }} />
              );
            })}
          </div>
          {/* Audio title */}
          <span style={{
            fontSize: 36, fontWeight: 700,
            color: 'rgba(255,255,255,0.6)', fontFamily: FONT_OPTION,
            letterSpacing: 3,
          }}>
            {question.audioTitle || '🎵 LISTEN CAREFULLY...'}
          </span>
        </div>
      )}

      {/* OPTIONS — full width, grid or stack */}
      <div style={{
        position: 'absolute',
        top: 220, left: 100, right: 100, bottom: 80,
        display: isEven ? 'grid' : 'flex',
        ...(isEven
          ? { gridTemplateColumns: '1fr 1fr', gap: 30, alignContent: 'center' }
          : { flexDirection: 'column' as const, gap: 20, justifyContent: 'center' }
        ),
        opacity: optionsOpacity,
      }}>
        {question.options.map((option, i) => {
          const delay = (mediaFrames > 0 ? mediaFrames / fps * 30 : 0) + spd.entryDelay + i * spd.entryGap;
          const s = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: spd.springDamping, stiffness: spd.springStiffness, mass: spd.mass } });
          const scale = interpolate(s, [0, 1], [0.85, 1]);
          const optOpacity = interpolate(s, [0, 1], [0, 1]);

          const isCorrect = option === question.correctAnswer;
          const isWrong = isRevealing && !isCorrect;
          const cardOpacity = isWrong ? 1 - revealProgress * 0.55 : 1;

          const borderColor = isRevealing && isCorrect
            ? `rgba(76,175,80,${revealProgress})`
            : 'transparent';

          return (
            <div key={i} style={{
              height: isEven ? 240 : 195,
              position: 'relative',
              backgroundColor: '#FFFFFF',
              borderRadius: 24,
              boxShadow: isRevealing && isCorrect
                ? `0 4px 16px rgba(0,0,0,0.08), 0 0 20px rgba(76,175,80,${revealProgress * 0.4})`
                : '0 4px 16px rgba(0,0,0,0.08)',
              border: `4px solid ${borderColor}`,
              display: 'flex', alignItems: 'center', gap: 28,
              padding: '0 44px',
              transform: `scale(${scale})`,
              opacity: optOpacity * cardOpacity,
            }}>
              {/* Letter badge */}
              <div style={{
                width: 70, height: 70, borderRadius: '50%',
                backgroundColor: BADGE_COLORS[i % BADGE_COLORS.length],
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
              }}>
                <span style={{ fontSize: 36, fontWeight: 900, color: '#fff', fontFamily: 'system-ui' }}>
                  {LABELS[i]}
                </span>
              </div>

              {/* Option text — fill remaining space */}
              <OptionText width={isEven ? 650 : 1450} maxSize={isEven ? 64 : 80} minSize={32} color="#1a1a1a">
                {option}
              </OptionText>

              {/* Correct tick */}
              {isRevealing && isCorrect && revealProgress > 0.2 && (
                <div style={{
                  position: 'absolute', right: 36, width: 64, height: 64, borderRadius: '50%',
                  background: '#4CAF50', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transform: `scale(${interpolate(revealProgress, [0.2, 0.5], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })})`,
                  boxShadow: '0 4px 12px rgba(76,175,80,0.4)',
                }}>
                  <span style={{ fontSize: 36, color: '#fff', fontWeight: 900 }}>✓</span>
                </div>
              )}

              {/* Wrong cross */}
              {isWrong && revealProgress > 0.3 && (
                <div style={{
                  position: 'absolute', right: 36, width: 64, height: 64, borderRadius: '50%',
                  background: '#E53935', display: 'flex', alignItems: 'center', justifyContent: 'center',
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

      {/* TIMER BAR */}
      {!isRevealing && !isMediaPhase && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 28, background: 'rgba(0,0,0,0.15)' }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, bottom: 0,
            width: `${timerProgress * 100}%`, background: barColor,
          }}>
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
