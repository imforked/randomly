import { createElement, type CSSProperties } from 'react'
import './FlippingText.css'
import { usePrefersReducedMotion } from '../usePrefersReducedMotion'

/** Seconds past 1s — irregular, cycled so delays don’t read as a ripple */
const DELAY_OFFSETS = [
  0, 0.01, 1.78, 3.62, 0.54, 2.89, 1.11, 2.46, 0.73, 2.02, 1.33, 3.1, 0.19,
  2.5, 1.67, 2.21,
] as const

const DURATION_SECONDS = [
  5.47, 6.13, 5.21, 6.02, 5.74, 6.31, 5.06, 5.89, 5.55, 6.0, 5.35, 6.2,
] as const

function flipDelayForIndex(i: number): string {
  const offset = DELAY_OFFSETS[i % DELAY_OFFSETS.length] ?? 0
  const layer = Math.floor(i / DELAY_OFFSETS.length) * 0.08
  return `${(1 + offset + layer).toFixed(2)}s`
}

function flipDurationForIndex(i: number): string {
  const d = DURATION_SECONDS[i % DURATION_SECONDS.length] ?? 5.8
  return `${d.toFixed(2)}s`
}

type FlipGlyphProps = {
  lower: string
  upper: string
  delay: string
  duration: string
}

function FlipGlyph({ lower, upper, delay, duration }: FlipGlyphProps) {
  return (
    <span className="flip-letter">
      <span
        className="flip-letter__inner"
        style={
          {
            '--flip-delay': delay,
            '--flip-duration': duration,
          } as CSSProperties
        }
      >
        <span className="flip-letter__face flip-letter__face--lower">
          {lower}
        </span>
        <span className="flip-letter__face flip-letter__face--upper">
          {upper}
        </span>
      </span>
    </span>
  )
}

export type FlippingTextTag = 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div'

export type FlippingTextProps = {
  /** Full string read by assistive tech and used for the animation */
  text: string
  /** Root element — use `h1` / `h2` / `h3` + `guide-prompt` for guidance prompts */
  as?: FlippingTextTag
  className?: string
}

/**
 * Guidance / headline text with per-letter flip (lowercase ↔ uppercase).
 * Use with `className="guide-prompt"` (or other theme classes) for prompts.
 */
export function FlippingText({
  text,
  as: Tag = 'span',
  className,
}: FlippingTextProps) {
  const reducedMotion = usePrefersReducedMotion()

  if (reducedMotion) {
    return createElement(Tag, { className }, text)
  }

  const letters = [...text]

  return createElement(
    Tag,
    {
      className: ['flipping-text', className].filter(Boolean).join(' '),
    },
    <>
      <span className="sr-only">{text}</span>
      <span className="flip-title" aria-hidden="true">
        {letters.map((ch, i) => (
          <FlipGlyph
            key={`${i}-${ch}`}
            lower={ch.toLowerCase()}
            upper={ch.toUpperCase()}
            delay={flipDelayForIndex(i)}
            duration={flipDurationForIndex(i)}
          />
        ))}
      </span>
    </>,
  )
}
