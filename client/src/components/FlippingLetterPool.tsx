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

const GAP_MS = 2000
const FIRST_FLIP_DELAY_MS = 1000

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

function pickRandomExcluding(
  pool: readonly CharPos[],
  exclude: CharPos | null,
): CharPos | null {
  if (pool.length === 0) return null
  if (pool.length === 1) return pool[0]!
  let next: CharPos
  let guard = 0
  do {
    next = pool[Math.floor(Math.random() * pool.length)]!
    guard++
  } while (
    exclude &&
    next.lineIndex === exclude.lineIndex &&
    next.charIndex === exclude.charIndex &&
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

type PoolContextValue = {
  active: CharPos | null
  animNonce: number
  onFlipEnd: () => void
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
  const [active, setActive] = useState<CharPos | null>(null)
  const [animNonce, setAnimNonce] = useState(0)
  const lastCompletedRef = useRef<CharPos | null>(null)

  const nextTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearNextTimer = useCallback(() => {
    if (nextTimerRef.current !== null) {
      clearTimeout(nextTimerRef.current)
      nextTimerRef.current = null
    }
  }, [])

  const scheduleNextFlip = useCallback(() => {
    if (pool.length === 0) return
    const pos = pickRandomExcluding(pool, lastCompletedRef.current)
    if (!pos) return
    setAnimNonce((n) => n + 1)
    setActive(pos)
  }, [pool])

  const onFlipEnd = useCallback(() => {
    setActive((prev) => {
      if (prev) lastCompletedRef.current = prev
      return null
    })
    clearNextTimer()
    nextTimerRef.current = setTimeout(() => {
      nextTimerRef.current = null
      scheduleNextFlip()
    }, GAP_MS)
  }, [clearNextTimer, scheduleNextFlip])

  useEffect(() => {
    if (reducedMotion || pool.length === 0) return
    const t = setTimeout(() => {
      scheduleNextFlip()
    }, FIRST_FLIP_DELAY_MS)
    return () => {
      clearTimeout(t)
      clearNextTimer()
    }
  }, [reducedMotion, pool.length, scheduleNextFlip, clearNextTimer])

  const value = useMemo<PoolContextValue>(
    () => ({ active, animNonce, onFlipEnd }),
    [active, animNonce, onFlipEnd],
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
 * At most one letter across all lines animates at a time; flips are spaced by {@link GAP_MS}
 * after each flip completes.
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

  const { active, animNonce, onFlipEnd } = ctx
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
          const isActive =
            active?.lineIndex === lineIndex && active?.charIndex === i
          if (isActive) {
            return (
              <FlipGlyphOnce
                key={`${i}-${ch}-active`}
                lower={ch.toLowerCase()}
                upper={ch.toUpperCase()}
                animKey={animNonce}
                onAnimationEnd={onFlipEnd}
              />
            )
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
