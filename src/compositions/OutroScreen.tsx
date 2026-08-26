import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { FONT_QUESTION, FONT_OPTION } from '../components/AutoText';

interface Props {
  totalQuestions: number;
}

/**
 * OutroScreen: Final score + subscribe CTA.
 * Shows "QUIZ COMPLETE!" and scoring tiers.
 */
export const OutroScreen: React.FC<Props> = ({ totalQuestions }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pop = spring({ frame, fps, config: { damping: 8, stiffness: 80 } });
  const scale = interpolate(pop, [0, 1], [0.3, 1]);

  const tiersOpacity = interpolate(frame, [25, 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const ctaOpacity = interpolate(frame, [50, 65], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 30,
      padding: 80,
    }}>
      {/* Trophy */}
      <span style={{ fontSize: 120, transform: `scale(${scale})` }}>🏆</span>

      {/* QUIZ COMPLETE */}
      <span style={{
        fontSize: 120,
        fontFamily: FONT_QUESTION,
        color: '#fff',
        textShadow: '5px 5px 0 rgba(0,0,0,0.3)',
        transform: `scale(${scale})`,
        lineHeight: 1,
      }}>
        QUIZ COMPLETE!
      </span>

      {/* Score tiers */}
      <div style={{
        opacity: tiersOpacity,
        display: 'flex',
        gap: 40,
        marginTop: 20,
      }}>
        {[
          { range: '0-3', label: 'Beginner', color: '#FF9800' },
          { range: '4-6', label: 'Good', color: '#2196F3' },
          { range: '7-9', label: 'Expert', color: '#9C27B0' },
          { range: '10', label: 'GENIUS', color: '#4CAF50' },
        ].map((tier) => (
          <div key={tier.range} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}>
            <span style={{
              fontSize: 44,
              fontWeight: 900,
              fontFamily: FONT_QUESTION,
              color: tier.color,
              textShadow: '2px 2px 0 rgba(0,0,0,0.3)',
            }}>
              {tier.range}
            </span>
            <span style={{
              fontSize: 28,
              fontWeight: 700,
              fontFamily: FONT_OPTION,
              color: 'rgba(255,255,255,0.8)',
            }}>
              {tier.label}
            </span>
          </div>
        ))}
      </div>

      {/* Subscribe CTA */}
      <div style={{
        opacity: ctaOpacity,
        marginTop: 30,
        background: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
        padding: '20px 50px',
        border: '3px solid rgba(255,255,255,0.2)',
      }}>
        <span style={{
          fontSize: 38,
          fontWeight: 700,
          fontFamily: FONT_OPTION,
          color: '#fff',
        }}>
          ▶ Subscribe for more quizzes!
        </span>
      </div>
    </AbsoluteFill>
  );
};
