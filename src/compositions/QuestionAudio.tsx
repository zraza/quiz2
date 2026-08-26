import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate, Audio, Video } from 'remotion';
import { AutoText, OptionText, FONT_OPTION } from '../components/AutoText';
import type { AudioQ } from '../types';

const LABELS = ['A', 'B', 'C', 'D'];
const BADGE_COLORS = ['#E53935', '#43A047', '#1E88E5', '#FF9800'];
const BAR_COUNT = 32;

/**
 * QuestionAudio: Animated waveform left + text options right.
 * Same layout as QuestionPlay but replaces the image with a waveform visualizer.
 */
export const QuestionAudio: React.FC<{ question: AudioQ }> = ({ question }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const mediaRole = question.mediaRole || 'clue';
  const mediaDuration = Math.min(question.mediaDuration || 0, 20);
  const mediaFrames = mediaRole === 'clue' ? mediaDuration * fps : 0;
  const isMediaPhase = frame < mediaFrames;
  const quizFrame = Math.max(0, frame - mediaFrames);

  const countdownFrames = question.timeLimit * fps;
  const isRevealing = quizFrame >= countdownFrames;
  const revealProgress = isRevealing
    ? interpolate(quizFrame, [countdownFrames, countdownFrames + 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 0;

  const timerProgress = isMediaPhase ? 1 : Math.max(0, Math.min(1, (countdownFrames - quizFrame) / countdownFrames));
  const barColor = timerProgress > 0.5 ? '#4CAF50' : timerProgress > 0.2 ? '#FF9800' : '#F44336';
  const titleOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill>
      {/* QUESTION CARD — full width */}
      <div style={{
        position: 'absolute',
        top: 50, left: 100, right: 100,
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

      {/* CONTENT: Waveform left + Options right */}
      <div style={{
        position: 'absolute', top: 210, left: 100, right: 100, bottom: 80,
        display: 'flex', gap: 60,
      }}>
        {/* WAVEFORM — left 46% */}
        <div style={{
          flex: '0 0 46%', borderRadius: 28, overflow: 'hidden',
          border: '5px solid rgba(255,255,255,0.9)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
          background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: 24, padding: 40,
          position: 'relative',
        }}>
          {/* Play audio — supports mp4 (video as audio), mp3, any format */}
          {question.mediaUrl && (
            question.mediaUrl.endsWith('.mp3') || question.mediaUrl.endsWith('.wav') || question.mediaUrl.endsWith('.ogg')
              ? <Audio src={question.mediaUrl} startFrom={0} volume={isMediaPhase ? 1 : 0} />
              : <Video src={question.mediaUrl} style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }} startFrom={0} volume={isMediaPhase ? 1 : 0} />
          )}
          {/* Waveform bars */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 200 }}>
            {Array.from({ length: BAR_COUNT }).map((_, i) => {
              const phase = (frame * 0.08) + i * 0.4;
              const height = isRevealing
                ? 8 // flatten on reveal
                : isMediaPhase
                  ? 30 + Math.abs(Math.sin(phase * 1.5)) * 150 + Math.sin(phase * 0.9) * 50 // big during playback
                  : 15 + Math.abs(Math.sin(phase * 0.5)) * 60; // smaller during thinking
              return (
                <div key={i} style={{
                  width: 8, borderRadius: 4,
                  height: Math.max(8, height),
                  background: isMediaPhase
                    ? `hsl(${260 + i * 3}, 80%, ${55 + Math.sin(phase) * 15}%)`
                    : `hsl(${200 + i * 4}, 60%, ${45 + Math.sin(phase) * 10}%)`,
                  transition: isRevealing ? 'height 0.3s' : 'none',
                }} />
              );
            })}
          </div>

          {/* Audio title */}
          <span style={{
            fontSize: 24, fontWeight: 700,
            color: 'rgba(255,255,255,0.5)', fontFamily: FONT_OPTION,
            letterSpacing: 2,
          }}>
            {question.audioTitle || '🎵 NAME THIS SONG'}
          </span>
        </div>

        {/* OPTIONS — hidden during clue media phase */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          gap: 24, padding: '10px 0', justifyContent: 'center',
          opacity: isMediaPhase ? 0 : 1,
          transform: isMediaPhase ? 'translateX(40px)' : 'translateX(0)',
          transition: 'opacity 0.3s, transform 0.3s',
        }}>
          {question.options.map((option, i) => {
            const delay = 5 + i * 3;
            const s = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 10 } });
            const translateX = interpolate(s, [0, 1], [60, 0]);
            const optOpacity = interpolate(s, [0, 1], [0, 1]);
            const isCorrect = option === question.correctAnswer;
            const isWrong = isRevealing && !isCorrect;
            const cardOpacity = isWrong ? 1 - revealProgress * 0.55 : 1;

            return (
              <div key={i} style={{
                flex: 1, position: 'relative',
                backgroundColor: '#FFFFFF', borderRadius: 24,
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                display: 'flex', alignItems: 'center', gap: 28, padding: '0 44px',
                transform: `translateX(${translateX}px)`,
                opacity: optOpacity * cardOpacity,
              }}>
                <div style={{
                  width: 70, height: 70, borderRadius: '50%',
                  backgroundColor: BADGE_COLORS[i],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
                }}>
                  <span style={{ fontSize: 36, fontWeight: 900, color: '#fff', fontFamily: 'system-ui' }}>
                    {LABELS[i]}
                  </span>
                </div>
                <OptionText width={380} maxSize={48} minSize={24} color="#1a1a1a">
                  {option}
                </OptionText>
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
      </div>

      {/* TIMER BAR — hidden during media phase */}
      {!isRevealing && !isMediaPhase && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 28, background: 'rgba(0,0,0,0.15)' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${timerProgress * 100}%`, background: barColor }}>
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(90deg, transparent ${((frame % 45) / 45) * 100 - 15}%, rgba(255,255,255,0.2) ${((frame % 45) / 45) * 100}%, transparent ${((frame % 45) / 45) * 100 + 15}%)` }} />
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
