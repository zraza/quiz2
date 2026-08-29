import React from 'react';
import { loadFont } from '@remotion/google-fonts/Anton';

const anton = loadFont();

export const FONT_QUESTION = anton.fontFamily;
export const FONT_OPTION = anton.fontFamily;

/**
 * AutoText: Text that fills its container as large as possible.
 * 
 * Strategy: Given a container width (default 1920px usable),
 * calculate the maximum font size so the text fits in one or two lines.
 * 
 * Heuristic for Luckiest Guy at 1920px:
 * - Average char width ≈ 0.6 × fontSize
 * - Available width after padding = containerWidth
 * - Max single line chars = containerWidth / (0.6 * fontSize)
 * - So: fontSize = containerWidth / (charCount * 0.6) for single line
 * - Clamped between min and max
 * 
 * For 2-line text: fontSize = containerWidth / (charCount/2 * 0.6)
 */

interface AutoTextProps {
  children: string;
  /** Available width in pixels (default: 1720 = 1920 - 200px padding) */
  width?: number;
  /** Max font size allowed */
  maxSize?: number;
  /** Min font size floor */
  minSize?: number;
  /** Max lines before shrinking further */
  maxLines?: number;
  color?: string;
  font?: 'question' | 'option';
  shadow?: boolean;
  style?: React.CSSProperties;
}

export const AutoText: React.FC<AutoTextProps> = ({
  children,
  width = 1600,
  maxSize = 160,
  minSize = 48,
  maxLines = 2,
  color = '#fff',
  font = 'question',
  shadow = true,
  style = {},
}) => {
  const text = children;
  const charCount = text.length;

  // Character width ratio (empirical for Anton - condensed)
  const charRatio = 0.48;

  // Calculate font size for single line
  let fontSize = width / (charCount * charRatio);

  // If it's too big for max, cap it
  fontSize = Math.min(fontSize, maxSize);

  // If single-line doesn't fit at minSize, allow 2 lines
  if (fontSize < minSize && maxLines >= 2) {
    // Split across 2 lines: each line has ~half the chars
    fontSize = width / ((charCount / 2) * charRatio);
    fontSize = Math.min(fontSize, maxSize);
  }

  // Final clamp
  fontSize = Math.max(minSize, Math.min(maxSize, fontSize));

  const fontFamily = font === 'question' ? FONT_QUESTION : FONT_OPTION;
  const weight = font === 'question' ? 400 : 700;

  return (
    <span style={{
      fontSize,
      fontWeight: weight,
      fontFamily,
      color,
      lineHeight: 1.1,
      textAlign: 'center',
      display: 'block',
      width: '100%',
      textTransform: font === 'question' ? 'uppercase' : undefined,
      letterSpacing: font === 'question' ? 1.5 : undefined,
      textShadow: shadow
        ? '4px 4px 0 rgba(0,0,0,0.3), 2px 2px 0 rgba(0,0,0,0.2)'
        : 'none',
      wordWrap: 'break-word',
      ...style,
    }}>
      {text}
    </span>
  );
};

/**
 * OptionText: For answer options. Big, bold, fills the card.
 */
export const OptionText: React.FC<{
  children: string;
  width?: number;
  maxSize?: number;
  minSize?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ children, width = 500, maxSize = 72, minSize = 32, color = '#1a1a1a', style = {} }) => {
  const text = children;
  const charCount = text.length;
  const charRatio = 0.48;

  let fontSize = width / (charCount * charRatio);
  fontSize = Math.max(minSize, Math.min(maxSize, fontSize));

  return (
    <span style={{
      fontSize,
      fontWeight: 400,
      fontFamily: FONT_OPTION,
      color,
      lineHeight: 1.2,
      textTransform: 'uppercase',
      letterSpacing: 1,
      ...style,
    }}>
      {text}
    </span>
  );
};
