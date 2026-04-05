import { useCallback, useId, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { FlippingText } from '../components/FlippingText'
import { StartRoomModal } from '../components/StartRoomModal'
import './CreateRoomPage.css'

const ROOM_SIZE_MIN = 1
const ROOM_SIZE_MAX = 100
const ROOM_SIZE_DEFAULT = 4

const OPTIONS_MIN = 1
const OPTIONS_MAX = 50
const OPTIONS_DEFAULT = 3

export type RoomDraft = {
  topic: string
  roomSize: number
  optionsPerGuest: number
}

export function CreateRoomPage() {
  const decidingId = useId()
  const roomSizeId = useId()
  const optionsId = useId()

  const [topic, setTopic] = useState('')
  const [roomSize, setRoomSize] = useState(ROOM_SIZE_DEFAULT)
  const [optionsPerGuest, setOptionsPerGuest] = useState(OPTIONS_DEFAULT)
  const [shareModalOpen, setShareModalOpen] = useState(false)

  const submit = useCallback((e: FormEvent) => {
    e.preventDefault()
    setShareModalOpen(true)
  }, [])

  return (
    <main className="shell shell-landing">
      <div className="stack-lg">
        <Link to="/" className="create-room-page__back">
          ← Back
        </Link>
        <form className="create-room-page__form" onSubmit={submit}>
          <div className="create-room-page__field">
            <FlippingText
              id={decidingId}
              as="h1"
              text="What are you deciding on?"
              className="create-room-page__prompt"
            />
            <input
              type="text"
              className="field-input"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              autoComplete="off"
              aria-labelledby={decidingId}
            />
          </div>

          <div className="create-room-page__field">
            <FlippingText
              id={roomSizeId}
              as="h2"
              text="How big is your room?"
              className="create-room-page__prompt"
            />
            <div
              className="create-room-page__stepper"
              role="group"
              aria-labelledby={roomSizeId}
            >
              <button
                type="button"
                className="btn btn-secondary create-room-page__stepper-btn"
                aria-label="Decrease room size"
                disabled={roomSize <= ROOM_SIZE_MIN}
                onClick={() =>
                  setRoomSize((n) => Math.max(ROOM_SIZE_MIN, n - 1))
                }
              >
                −
              </button>
              <span
                className="create-room-page__stepper-value"
                aria-live="polite"
              >
                {roomSize}
              </span>
              <button
                type="button"
                className="btn btn-secondary create-room-page__stepper-btn"
                aria-label="Increase room size"
                disabled={roomSize >= ROOM_SIZE_MAX}
                onClick={() =>
                  setRoomSize((n) => Math.min(ROOM_SIZE_MAX, n + 1))
                }
              >
                +
              </button>
            </div>
          </div>

          <div className="create-room-page__field">
            <FlippingText
              id={optionsId}
              as="h2"
              text="How many options per guest?"
              className="create-room-page__prompt"
            />
            <div
              className="create-room-page__stepper"
              role="group"
              aria-labelledby={optionsId}
            >
              <button
                type="button"
                className="btn btn-secondary create-room-page__stepper-btn"
                aria-label="Decrease options per guest"
                disabled={optionsPerGuest <= OPTIONS_MIN}
                onClick={() =>
                  setOptionsPerGuest((n) => Math.max(OPTIONS_MIN, n - 1))
                }
              >
                −
              </button>
              <span
                className="create-room-page__stepper-value"
                aria-live="polite"
              >
                {optionsPerGuest}
              </span>
              <button
                type="button"
                className="btn btn-secondary create-room-page__stepper-btn"
                aria-label="Increase options per guest"
                disabled={optionsPerGuest >= OPTIONS_MAX}
                onClick={() =>
                  setOptionsPerGuest((n) => Math.min(OPTIONS_MAX, n + 1))
                }
              >
                +
              </button>
            </div>
          </div>

          <button type="submit" className="btn create-room-page__submit">
            Create a Room
          </button>
        </form>
      </div>
      <StartRoomModal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />
    </main>
  )
}
