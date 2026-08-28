import React from 'react';
import { AbsoluteFill, spring, interpolate } from 'remotion';
import { AutoText, OptionText } from '../components/AutoText';
import { QuestionCard } from '../components/QuestionCard';
import { TimerBar } from '../components/TimerBar';
import { OptionCard } from '../components/OptionCard';
import type { FinishTheLyricQ } from '../types';
import { useQuizTiming } from '../hooks/useQuizTiming';
import { CLAMP } from '../config';

/**
 * QuestionFinishTheLyric: Lyrics with blank in center, 4 options below.
 * Musical note emoji pulses. On reveal, blank fills with gold text + song info.
 */
export const QuestionFinishTheLyric: React.FC<{ question: FinishTheLyricQ }> = ({ question }) => {
  const { frame, fps, spd, voFrames, quizFrame, isRevealing, revealProgress, timerProgress } = useQuizTiming(question);

  // Lyrics entry
  const lyricsSpring = spring({ frame: Math.max(0, frame - spd.entryDelay), fps, config: { damping: spd.springDamping, stiffness: spd.springStiffness, mass: spd.mass } });
  const lyricsOpacity = interpolate(lyricsSpring, [0, 1], [0, 1]);
  const lyricsScale = interpolate(lyricsSpring, [0, 1], [0.9, 1]);

  // Musical note pulsing
  const notePulse = 1 + Math.sin(frame * 0.15) * 0.15;
  const noteFloat = Math.sin(frame * 0.06) * 8;

  // Split lyrics around the blank
  const parts = question.lyrics.split('___');
  const beforeBlank = parts[0] || '';
  const afterBlank = parts[1] || '';

  return (
    <AbsoluteFill>
      {/* QUESTION CARD */}
      <QuestionCard text={question.questionText} isRevealing={isRevealing} revealProgress={revealProgress} />

      {/* LYRICS AREA */}
      <div style={{
        position: 'absolute',
        top: 220,
        left: 100,
        right: 100,
        bottom: 320,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: lyricsOpacity,
        transform: `scale(${lyricsScale})`,
      }}>
        {/* Musical notes floating */}
        {!isRevealing && (
          <>
            <div style={{
              position: 'absolute',
              top: 20,
              left: 80,
              fontSize: 60,
              transform: `scale(${notePulse}) translateY(${noteFloat}px)`,
              opacity: 0.6,
            }}>
              🎵
            </div>
            <div style={{
              position: 'absolute',
              bottom: 30,
              right: 100,
              fontSize: 50,
              transform: `scale(${notePulse * 0.9}) translateY(${-noteFloat}px)`,
              opacity: 0.5,
            }}>
              🎶
            </div>
          </>
        )}

        {/* Lyrics card */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: 32,
          padding: '50px 70px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
          textAlign: 'center',
          maxWidth: 1400,
          position: 'relative',
        }}>
          {/* Lyrics text with highlighted blank */}
          <div style={{
            fontSize: 52,
            fontWeight: 700,
            fontFamily: 'system-ui',
            color: '#1a1a1a',
            lineHeight: 1.4,
            letterSpacing: 0.5,
          }}>
            <span>{beforeBlank}</span>
            <span style={{
              display: 'inline-block',
              padding: '4px 24px',
              borderRadius: 12,
              background: isRevealing
                ? 'linear-gradient(135deg, #FFD700, #FFA000)'
                : 'linear-gradient(135deg, #FFF9C4, #FFE082)',
              color: isRevealing ? '#fff' : '#F57F17',
              fontWeight: 900,
              minWidth: 140,
              textAlign: 'center',
              boxShadow: isRevealing
                ? `0 4px 20px rgba(255,193,7,${revealProgress * 0.6})`
                : '0 2px 8px rgba(255,193,7,0.3)',
              transform: `scale(${isRevealing ? 1 + revealProgress * 0.05 : 1})`,
            }}>
              {isRevealing && revealProgress > 0.2
                ? question.missingWords
                : '___'
              }
            </span>
            <span>{afterBlank}</span>
          </div>
        </div>
      </div>

      {/* SONG INFO — appears on reveal */}
      {isRevealing && revealProgress > 0.5 && (
        <div style={{
          position: 'absolute',
          top: 220,
          left: 100,
          right: 100,
          bottom: 320,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          pointerEvents: 'none',
          opacity: interpolate(revealProgress, [0.5, 0.8], [0, 1], CLAMP),
          transform: `translateY(${interpolate(revealProgress, [0.5, 0.8], [15, 0], CLAMP)}px)`,
        }}>
          <div style={{
            background: 'rgba(0,0,0,0.8)',
            borderRadius: 16,
            padding: '14px 40px',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: -50,
          }}>
            <span style={{ fontSize: 36 }}>🎤</span>
            <OptionText width={800} maxSize={36} minSize={20} color="#fff">
              {`"${question.songTitle}" — ${question.artist}`}
            </OptionText>
          </div>
        </div>
      )}

      {/* OPTIONS — 4 in a row at bottom */}
      <div style={{
        position: 'absolute',
        bottom: 60,
        left: 80,
        right: 80,
        height: 220,
        display: 'flex',
        gap: 20,
        alignItems: 'center',
      }}>
        {question.options.map((option, i) => (
          <OptionCard
            key={i}
            index={i}
            text={option}
            isCorrect={option === question.correctAnswer}
            isRevealing={isRevealing}
            revealProgress={revealProgress}
            springFrame={frame - (spd.entryDelay + i * spd.entryGap)}
            quizFrame={quizFrame}
            spd={spd}
            textWidth={280}
          />
        ))}
      </div>

      {/* TIMER BAR */}
      <TimerBar progress={timerProgress} entryFrame={voFrames} visible={!isRevealing && frame >= voFrames} />
    </AbsoluteFill>
  );
};
