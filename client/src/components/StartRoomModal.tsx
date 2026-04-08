import { useCallback, useEffect, useId, useState } from 'react'
import type { ComponentType, SVGProps } from 'react'
import * as ReactQRCode from 'react-qr-code'
import {
  FlippingLetterPoolProvider,
  PooledFlippingTitle,
} from './FlippingLetterPool'
import { usePrefersReducedMotion } from '../usePrefersReducedMotion'
import { useAnimatedModal } from '../useAnimatedModal'
import './StartRoomModal.css'

const SHARE_ROOM_FLIP_LINES = ['Share the Room'] as const

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
  const [copied, setCopied] = useState(false)
  const reducedMotion = usePrefersReducedMotion()
  const { shouldMount, rootClass, panelRef, onPanelTransitionEnd } =
    useAnimatedModal(open, reducedMotion, {
      rootClassExtra: 'modal-root--layer-above',
    })

  const roomUrl = `${window.location.origin}/`

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

  if (!shouldMount) return null

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
        <FlippingLetterPoolProvider lines={SHARE_ROOM_FLIP_LINES}>
          <PooledFlippingTitle
            lineIndex={0}
            id={titleId}
            as="h2"
            text={SHARE_ROOM_FLIP_LINES[0]}
            className="modal-title"
          />
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
        </FlippingLetterPoolProvider>
      </div>
    </div>
  )
}
