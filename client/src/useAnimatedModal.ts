import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import type { TransitionEvent } from 'react'

type UseAnimatedModalOptions = {
  /** Extra classes on the modal root (e.g. z-index layer). */
  rootClassExtra?: string
}

/**
 * Shared open / close lifecycle for full-screen modals (mount, CSS transition, unmount).
 */
export function useAnimatedModal(
  open: boolean,
  reducedMotion: boolean,
  options: UseAnimatedModalOptions = {},
) {
  const { rootClassExtra } = options
  const openRef = useRef(open)
  const [shouldMount, setShouldMount] = useState(open)
  const [motionOpen, setMotionOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    openRef.current = open
  }, [open])

  useLayoutEffect(() => {
    /* Drive mount + motion classes from `open` so exit transitions can finish before unmount. */
    /* eslint-disable react-hooks/set-state-in-effect -- intentional animation orchestration */
    if (open) {
      setShouldMount(true)
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setMotionOpen(true))
      })
      return () => cancelAnimationFrame(id)
    }
    setMotionOpen(false)
    if (reducedMotion) {
      queueMicrotask(() => {
        if (!openRef.current) setShouldMount(false)
      })
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [open, reducedMotion])

  useEffect(() => {
    if (!motionOpen) return
    panelRef.current?.focus()
  }, [motionOpen])

  const onPanelTransitionEnd = useCallback(
    (e: TransitionEvent<HTMLDivElement>) => {
      if (e.target !== e.currentTarget) return
      if (openRef.current) return
      setShouldMount(false)
    },
    [],
  )

  const rootClass = [
    'modal-root',
    motionOpen && 'modal-root--open',
    reducedMotion && 'modal-root--reduced-motion',
    rootClassExtra,
  ]
    .filter(Boolean)
    .join(' ')

  return {
    shouldMount,
    motionOpen,
    rootClass,
    panelRef,
    onPanelTransitionEnd,
  }
}
