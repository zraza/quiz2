import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { AutoText } from './AutoText';
import { CLAMP } from '../config';

interface Props {
  text: string;
  isRevealing?: boolean;
  revealProgress?: number;
}

/**
 * QuestionCard: White card at top of screen with the question text.
 * Fades in on entry, fades up on reveal.
 */
export const QuestionCard: React.FC<Props> = ({ text, isRevealing = false, revealProgress = 0 }) => {
  const frame = useCurrentFrame();
  const titleOpacity = interpolate(frame, [0, 8], [0, 1], CLAMP);
  const titleY = interpolate(frame, [0, 10], [-30, 0], CLAMP);
  const revealFade = isRevealing ? interpolate(revealProgress, [0, 0.5], [1, 0.5], CLAMP) : 1;

  return (
    <div style={{
      position: 'absolute',
      top: 50,
      left: 160,
      right: 160,
      display: 'flex',
      alignItems: 'center',
      opacity: titleOpacity * revealFade,
      transform: `translateY(${titleY + (isRevealing ? -revealProgress * 20 : 0)}px)`,
    }}>
      <div style={{
        flex: 1,
        background: '#FFFFFF',
        borderRadius: 24,
        padding: '36px 70px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
        textAlign: 'center',
      }}>
        <AutoText width={1300} maxSize={44} minSize={28} maxLines={2} color="#1a1a1a" shadow={false} fillLines={false}>
          {text}
        </AutoText>
      </div>
    </div>
  );
};
