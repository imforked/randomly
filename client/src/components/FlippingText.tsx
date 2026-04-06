import {
  createElement,
  useId,
  useMemo,
  type CSSProperties,
} from 'react'
import './FlippingText.css'
import { usePrefersReducedMotion } from '../usePrefersReducedMotion'

/** Stable 32-bit hash for seeding (per-instance id + letter index). */
function hashSeed(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  }
  return h >>> 0
}

/** Deterministic [0, 1) from seed — each FlippingText instance diverges via `useId`. */
function mulberry32(seed: number): () => number {
  return () => {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const DELAY_OFFSET_MAX = 3.62
const DURATION_MIN = 5.06
const DURATION_MAX = 6.31
const LAYER_STRIDE = 16
const LAYER_STEP = 0.08

function flipTimingForLetter(instanceKey: string, index: number): {
  delay: string
  duration: string
} {
  const rng = mulberry32(hashSeed(`${instanceKey}:${index}`))
  const delayOffset = rng() * DELAY_OFFSET_MAX
  const layer = Math.floor(index / LAYER_STRIDE) * LAYER_STEP
  const delay = `${(1 + delayOffset + layer).toFixed(2)}s`
  const duration = `${(
    DURATION_MIN +
    rng() * (DURATION_MAX - DURATION_MIN)
  ).toFixed(2)}s`
  return { delay, duration }
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
  /** Optional id for `aria-labelledby` / labels */
  id?: string
}

/**
 * Guidance / headline text with per-letter flip (lowercase ↔ uppercase).
 * Use with `className="guide-prompt"` (or other theme classes) for prompts.
 */
export function FlippingText({
  text,
  as: Tag = 'span',
  className,
  id,
}: FlippingTextProps) {
  const reducedMotion = usePrefersReducedMotion()
  const instanceKey = useId()

  const timings = useMemo(
    () =>
      [...text].map((ch, i) =>
        ch === ' ' ? null : flipTimingForLetter(instanceKey, i),
      ),
    [text, instanceKey],
  )

  if (reducedMotion) {
    return createElement(Tag, { className, id }, text)
  }

  const letters = [...text]

  return createElement(
    Tag,
    {
      className: ['flipping-text', className].filter(Boolean).join(' '),
      id,
    },
    <>
      <span className="sr-only">{text}</span>
      <span className="flip-title" aria-hidden="true">
        {letters.map((ch, i) => {
          if (ch === ' ') {
            return (
              <span key={`${i}-space`} className="flip-space">
                {'\u00A0'}
              </span>
            )
          }
          const { delay, duration } = timings[i]!
          return (
            <FlipGlyph
              key={`${i}-${ch}`}
              lower={ch.toLowerCase()}
              upper={ch.toUpperCase()}
              delay={delay}
              duration={duration}
            />
          )
        })}
      </span>
    </>,
  )
}
