import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import type { BaseQuestion } from '../types';
import { SPEED_CONFIG, DEFAULT_SPEEDS } from '../types';
import { CLAMP, MAX_MEDIA_SECONDS } from '../config';

/**
 * useQuizTiming: shared timing logic for all question compositions.
 * Returns everything needed for VO phase, media phase, countdown, reveal, and timer.
 */
export function useQuizTiming(question: Pick<BaseQuestion, 'voDuration' | 'timeLimit' | 'mediaDuration' | 'mediaRole' | 'speed' | 'type'>) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const speed = question.speed || DEFAULT_SPEEDS[question.type] || 'normal';
  const spd = SPEED_CONFIG[speed];

  const voFrames = Math.ceil((question.voDuration || 0) * fps);
  const mediaRole = question.mediaRole || 'clue';
  const mediaFrames = mediaRole === 'clue' ? Math.min(question.mediaDuration || 0, MAX_MEDIA_SECONDS) * fps : 0;
  const delayFrames = voFrames + mediaFrames;

  const isVoPhase = frame < voFrames;
  const isMediaPhase = frame >= voFrames && frame < delayFrames;
  const quizFrame = Math.max(0, frame - delayFrames);

  const countdownFrames = question.timeLimit * fps;
  const isRevealing = quizFrame >= countdownFrames;
  const revealProgress = isRevealing
    ? interpolate(quizFrame, [countdownFrames, countdownFrames + spd.revealFrames], [0, 1], CLAMP)
    : 0;

  const timerProgress = (isVoPhase || isMediaPhase)
    ? 1
    : Math.max(0, Math.min(1, (countdownFrames - quizFrame) / countdownFrames));

  return { frame, fps, spd, voFrames, mediaFrames, delayFrames, isVoPhase, isMediaPhase, quizFrame, countdownFrames, isRevealing, revealProgress, timerProgress };
}
