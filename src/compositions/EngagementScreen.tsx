import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { AutoText } from '../components/AutoText';
import { CLAMP } from '../config';

interface EngagementProps {
  type: 'score-check' | 'subscribe-cta' | 'challenge' | 'streak';
  text: string;
  subtext?: string;
}

const EMOJIS: Record<EngagementProps['type'], string> = {
  'score-check': '🏆',
  'subscribe-cta': '🔔',
  'challenge': '⚡',
  'streak': '🔥',
};

const GLOW_COLORS: Record<EngagementProps['type'], string> = {
  'score-check': 'rgba(255,215,0,0.4)',
  'subscribe-cta': 'rgba(255,0,0,0.3)',
  'challenge': 'rgba(138,43,226,0.4)',
  'streak': 'rgba(255,107,53,0.4)',
};

/**
 * EngagementScreen: Interstitial for score checks, subscribe CTAs, challenges, streaks.
 * Big text + emoji center screen, animated entry with scale spring, background glow pulse.
 * Duration: 4 seconds (120 frames at 30fps).
 */
export const EngagementScreen: React.FC<EngagementProps> = ({ type, text, subtext }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const emoji = EMOJIS[type];
  const glowColor = GLOW_COLORS[type];

  // Entry spring — scale from 0 to 1
  const entrySpring = spring({ frame, fps, config: { damping: 10, stiffness: 160, mass: 0.8 } });
  const scale = interpolate(entrySpring, [0, 1], [0.3, 1]);
  const opacity = interpolate(entrySpring, [0, 1], [0, 1]);

  // Exit fade (last 15 frames)
  const exitOpacity = interpolate(frame, [105, 120], [1, 0], CLAMP);

  // Background glow pulse
  const glowPulse = 0.5 + Math.sin(frame * 0.1) * 0.3;
  const glowSize = 300 + Math.sin(frame * 0.08) * 50;

  // Emoji bounce
  const emojiBounce = Math.sin(frame * 0.12) * 8;
  const emojiScale = 1 + Math.sin(frame * 0.15) * 0.08;

  // Subtext entry (delayed)
  const subtextSpring = spring({ frame: Math.max(0, frame - 12), fps, config: { damping: 12, stiffness: 180, mass: 0.7 } });
  const subtextOpacity = interpolate(subtextSpring, [0, 1], [0, 1]);
  const subtextY = interpolate(subtextSpring, [0, 1], [20, 0]);

  return (
    <AbsoluteFill style={{ opacity: exitOpacity }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: glowSize * 2,
        height: glowSize * 2,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
        transform: `translate(-50%, -50%) scale(${glowPulse + 0.5})`,
        opacity: 0.6,
        pointerEvents: 'none',
      }} />

      {/* Second glow ring */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: glowSize * 1.5,
        height: glowSize * 1.5,
        borderRadius: '50%',
        border: `3px solid ${glowColor}`,
        transform: `translate(-50%, -50%) scale(${1 + Math.sin(frame * 0.06) * 0.1})`,
        opacity: 0.3,
        pointerEvents: 'none',
      }} />

      {/* Main content */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 30,
        transform: `scale(${scale})`,
        opacity,
      }}>
        {/* Emoji */}
        <div style={{
          fontSize: 140,
          transform: `translateY(${emojiBounce}px) scale(${emojiScale})`,
          filter: `drop-shadow(0 8px 20px ${glowColor})`,
        }}>
          {emoji}
        </div>

        {/* Main text */}
        <AutoText width={1400} maxSize={100} minSize={48} maxLines={2} color="#fff" shadow>
          {text}
        </AutoText>

        {/* Subtext */}
        {subtext && (
          <div style={{
            opacity: subtextOpacity,
            transform: `translateY(${subtextY}px)`,
            marginTop: 10,
          }}>
            <AutoText width={1200} maxSize={52} minSize={28} maxLines={2} color="rgba(255,255,255,0.85)" shadow>
              {subtext}
            </AutoText>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
