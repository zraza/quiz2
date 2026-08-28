import React from 'react';
import { AbsoluteFill, interpolate, Video, Img } from 'remotion';
import { TimerBar } from '../components/TimerBar';
import { QuestionCard } from '../components/QuestionCard';
import { OptionCard } from '../components/OptionCard';
import type { QuizQuestion } from '../types';
import { useQuizTiming } from '../hooks/useQuizTiming';


/**
 * QuestionPlay: TV-optimized layout with image that swaps on reveal.
 * 
 * - During countdown: shows "question image" (e.g. galaxy)
 * - On reveal: image crossfades to "answer image" (e.g. Saturn)
 */
export const QuestionPlay: React.FC<{ question: QuizQuestion }> = ({ question }) => {
  const { frame, fps, spd, voFrames, mediaFrames, delayFrames, isVoPhase, isMediaPhase, quizFrame, countdownFrames, isRevealing, revealProgress, timerProgress } = useQuizTiming(question);

  const options = 'options' in question ? question.options : [];
  const mediaRole = question.mediaRole || 'clue';

  return (
    <AbsoluteFill>
      <QuestionCard text={question.questionText} isRevealing={isRevealing} revealProgress={revealProgress} />

      {/* CONTENT: Image left + Options right */}
      {(() => {
        // Animate video width: 100% during clue media → 46% after
        // For ambient: always 46% with options visible
        const transitionFrame = Math.max(0, frame - delayFrames);
        const isCluePhase = mediaRole === 'clue' && (isVoPhase || isMediaPhase);
        const videoWidthPct = isCluePhase
          ? 100
          : delayFrames > 0 && mediaRole === 'clue'
            ? interpolate(transitionFrame, [0, 10], [100, 46], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
            : 46;
        const optionsOpacity = isCluePhase
          ? 0
          : delayFrames > 0 && mediaRole === 'clue'
            ? interpolate(transitionFrame, [3, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
            : 1;
        const contentGap = isCluePhase ? 0 : interpolate(Math.min(transitionFrame, 10), [0, 10], [0, 60], { extrapolateRight: 'clamp' });

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
                /\.(mp4|webm|mov)(\?|$)/i.test(question.mediaUrl) ? (
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
                  <Img
                    src={question.mediaUrl}
                    style={{
                      position: 'absolute', inset: 0, width: '100%', height: '100%',
                      objectFit: question.mediaFit || 'cover',
                    }}
                  />
                )
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
          {options.map((option, i) => (
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
              textWidth={380}
            />
          ))}
        </div>
          </div>
        );
      })()}

      {/* TIMER BAR */}
      <TimerBar
        progress={timerProgress}
        entryFrame={delayFrames}
        visible={!isRevealing && !isVoPhase && !isMediaPhase}
      />
    </AbsoluteFill>
  );
};
