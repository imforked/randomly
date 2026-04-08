import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import './FlippingText.css'
import { usePrefersReducedMotion } from '../usePrefersReducedMotion'

const GAP_MS_MIN = 1500
const GAP_MS_MAX = 3000

/** Inclusive random delay before a channel’s next flip after the current one ends. */
function randomGapMs(): number {
  return (
    GAP_MS_MIN +
    Math.floor(Math.random() * (GAP_MS_MAX - GAP_MS_MIN + 1))
  )
}

const FIRST_FLIP_DELAY_MS = 1000
/** Offset between channel starts so flips stay phase-shifted over time. */
const PHASE_STAGGER_MS = 450

const CHANNEL_COUNT = 3
type ChannelIndex = 0 | 1 | 2

type CharPos = { lineIndex: number; charIndex: number }

function buildPool(lines: readonly string[]): CharPos[] {
  const pool: CharPos[] = []
  lines.forEach((text, lineIndex) => {
    ;[...text].forEach((ch, charIndex) => {
      if (ch !== ' ') pool.push({ lineIndex, charIndex })
    })
  })
  return pool
}

function posEq(a: CharPos, b: CharPos): boolean {
  return a.lineIndex === b.lineIndex && a.charIndex === b.charIndex
}

/** Random letter not equal to `excludeLast` (when possible) and not any other channel’s active letter. */
function pickRandomExcluding(
  pool: readonly CharPos[],
  excludeLast: CharPos | null,
  excludeOtherActives: readonly CharPos[],
): CharPos | null {
  if (pool.length === 0) return null

  const candidates = pool.filter(
    (p) => !excludeOtherActives.some((o) => posEq(o, p)),
  )

  if (candidates.length === 0) return null

  if (candidates.length === 1) return candidates[0]!

  let next: CharPos
  let guard = 0
  do {
    next = candidates[Math.floor(Math.random() * candidates.length)]!
    guard++
  } while (
    excludeLast &&
    posEq(next, excludeLast) &&
    guard < 64
  )
  return next
}

type FlipGlyphOnceProps = {
  lower: string
  upper: string
  animKey: number
  onAnimationEnd: () => void
}

function FlipGlyphOnce({
  lower,
  upper,
  animKey,
  onAnimationEnd,
}: FlipGlyphOnceProps) {
  return (
    <span className="flip-letter">
      <span
        key={animKey}
        className="flip-letter__inner flip-letter__inner--once"
        onAnimationEnd={(e) => {
          if (e.target !== e.currentTarget) return
          if (e.animationName !== 'flipLetterOnce') return
          onAnimationEnd()
        }}
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

type ChannelState = {
  active: CharPos | null
  animNonce: number
}

type ChannelsTuple = [ChannelState, ChannelState, ChannelState]

type PoolContextValue = {
  channels: ChannelsTuple
  onFlipEnd: (channel: ChannelIndex) => void
}

const FlippingLetterPoolContext = createContext<PoolContextValue | null>(null)

export function FlippingLetterPoolProvider({
  lines,
  children,
}: {
  lines: readonly string[]
  children: ReactNode
}) {
  const reducedMotion = usePrefersReducedMotion()
  const pool = useMemo(() => buildPool(lines), [lines])

  const [actives, setActives] = useState<(CharPos | null)[]>(() =>
    Array.from({ length: CHANNEL_COUNT }, () => null),
  )
  const [nonces, setNonces] = useState<number[]>(() =>
    Array.from({ length: CHANNEL_COUNT }, () => 0),
  )

  const lastCompletedRef = useRef<(CharPos | null)[]>(
    Array.from({ length: CHANNEL_COUNT }, () => null),
  )
  const activeRef = useRef<(CharPos | null)[]>(
    Array.from({ length: CHANNEL_COUNT }, () => null),
  )
  activeRef.current = actives

  const nextTimerRef = useRef<(ReturnType<typeof setTimeout> | null)[]>(
    Array.from({ length: CHANNEL_COUNT }, () => null),
  )

  const clearChannelTimer = useCallback((channel: ChannelIndex) => {
    const t = nextTimerRef.current[channel]
    if (t !== null) {
      clearTimeout(t)
      nextTimerRef.current[channel] = null
    }
  }, [])

  const clearAllChannelTimers = useCallback(() => {
    for (let c = 0; c < CHANNEL_COUNT; c++) {
      clearChannelTimer(c as ChannelIndex)
    }
  }, [clearChannelTimer])

  const scheduleNextFlip = useCallback(
    (channel: ChannelIndex) => {
      if (pool.length === 0) return
      const excludeOthers: CharPos[] = []
      for (let i = 0; i < CHANNEL_COUNT; i++) {
        if (i !== channel) {
          const a = activeRef.current[i]
          if (a) excludeOthers.push(a)
        }
      }
      const last = lastCompletedRef.current[channel]
      const pos = pickRandomExcluding(pool, last, excludeOthers)
      if (!pos) return
      setNonces((prev) => {
        const next = [...prev]
        next[channel] = next[channel]! + 1
        return next
      })
      setActives((prev) => {
        const next = [...prev]
        next[channel] = pos
        return next
      })
    },
    [pool],
  )

  const onFlipEnd = useCallback(
    (channel: ChannelIndex) => {
      setActives((prev) => {
        const next = [...prev]
        const p = prev[channel]
        if (p) lastCompletedRef.current[channel] = p
        next[channel] = null
        return next
      })
      clearChannelTimer(channel)
      nextTimerRef.current[channel] = setTimeout(() => {
        nextTimerRef.current[channel] = null
        scheduleNextFlip(channel)
      }, randomGapMs())
    },
    [clearChannelTimer, scheduleNextFlip],
  )

  useEffect(() => {
    if (reducedMotion || pool.length === 0) return
    const timers: ReturnType<typeof setTimeout>[] = []
    for (let c = 0; c < CHANNEL_COUNT; c++) {
      timers.push(
        setTimeout(() => {
          scheduleNextFlip(c as ChannelIndex)
        }, FIRST_FLIP_DELAY_MS + c * PHASE_STAGGER_MS),
      )
    }
    return () => {
      timers.forEach(clearTimeout)
      clearAllChannelTimers()
    }
  }, [reducedMotion, pool.length, scheduleNextFlip, clearAllChannelTimers])

  const channels = useMemo((): ChannelsTuple => {
    return [
      { active: actives[0]!, animNonce: nonces[0]! },
      { active: actives[1]!, animNonce: nonces[1]! },
      { active: actives[2]!, animNonce: nonces[2]! },
    ]
  }, [actives, nonces])

  const value = useMemo<PoolContextValue>(
    () => ({ channels, onFlipEnd }),
    [channels, onFlipEnd],
  )

  if (reducedMotion) {
    return <>{children}</>
  }

  return (
    <FlippingLetterPoolContext.Provider value={value}>
      {children}
    </FlippingLetterPoolContext.Provider>
  )
}

export type PooledFlippingTitleTag = 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div'

export type PooledFlippingTitleProps = {
  lineIndex: number
  text: string
  as?: PooledFlippingTitleTag
  className?: string
  id?: string
}

/**
 * One line of guidance text that participates in a shared {@link FlippingLetterPoolProvider}.
 * Up to three letters across all lines may flip at once on staggered channels; after each flip,
 * that channel waits a random interval (1500–3000 ms) before picking again.
 */
export function PooledFlippingTitle({
  lineIndex,
  text,
  as: Tag = 'span',
  className,
  id,
}: PooledFlippingTitleProps) {
  const ctx = useContext(FlippingLetterPoolContext)
  const reducedMotion = usePrefersReducedMotion()

  if (reducedMotion || !ctx) {
    return createElement(Tag, { className, id }, text)
  }

  const { channels, onFlipEnd } = ctx
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

          for (const c of [0, 1, 2] as const) {
            const { active, animNonce } = channels[c]
            const isActive =
              active?.lineIndex === lineIndex && active?.charIndex === i
            if (isActive) {
              return (
                <FlipGlyphOnce
                  key={`${c}-${i}-${ch}-active`}
                  lower={ch.toLowerCase()}
                  upper={ch.toUpperCase()}
                  animKey={animNonce}
                  onAnimationEnd={() => onFlipEnd(c)}
                />
              )
            }
          }

          return (
            <span key={`${i}-${ch}`} className="flip-letter flip-letter--static">
              {ch.toLowerCase()}
            </span>
          )
        })}
      </span>
    </>,
  )
}
