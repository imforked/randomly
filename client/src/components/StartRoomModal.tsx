import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import type {
  ComponentType,
  SVGProps,
  TransitionEvent,
} from 'react'
import * as ReactQRCode from 'react-qr-code'
import { usePrefersReducedMotion } from '../usePrefersReducedMotion'
import './StartRoomModal.css'

/** Named runtime export; default import is a broken nested object under Vite ESM/CJS interop. */
type QRCodeProps = SVGProps<SVGSVGElement> & {
  value: string
  size?: number
  level?: 'L' | 'M' | 'Q' | 'H'
}

const QRCode = (ReactQRCode as unknown as { QRCode: ComponentType<QRCodeProps> })
  .QRCode

type StartRoomModalProps = {
  open: boolean
  onClose: () => void
}

export function StartRoomModal({ open, onClose }: StartRoomModalProps) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const openRef = useRef(open)
  const [copied, setCopied] = useState(false)
  const [shouldMount, setShouldMount] = useState(open)
  const [motionOpen, setMotionOpen] = useState(false)
  const reducedMotion = usePrefersReducedMotion()

  const roomUrl = `${window.location.origin}/`

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

  const handleClose = useCallback(() => {
    setCopied(false)
    onClose()
  }, [onClose])

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(roomUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }, [roomUrl])

  useEffect(() => {
    if (!open) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, handleClose])

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

  if (!shouldMount) return null

  const rootClass = [
    'modal-root',
    motionOpen && 'modal-root--open',
    reducedMotion && 'modal-root--reduced-motion',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={rootClass}>
      <button
        type="button"
        className="modal-backdrop"
        aria-label="Close dialog"
        onClick={handleClose}
      />
      <div
        ref={panelRef}
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onTransitionEnd={onPanelTransitionEnd}
      >
        <h2 id={titleId} className="modal-title">
          Share the Room
        </h2>
        <div className="modal-qr-wrap">
          <QRCode
            value={roomUrl}
            size={256}
            className="modal-qr-code"
            level="M"
          />
        </div>
        <div className="modal-action-group">
          <button
            type="button"
            className="btn btn-secondary modal-copy-btn"
            onClick={copyLink}
          >
            {copied ? 'Copied' : 'Copy Link'}
          </button>
          <a href={roomUrl} className="btn btn-secondary modal-go-room-btn">
            Go to Room
          </a>
        </div>
      </div>
    </div>
  )
}
