import { useCallback, useEffect, useRef, useState } from 'react'
import { createSpeaker, startListening } from './voice'

const END_OF_TURN_MS = 1100

/**
 * One voice conversation: always-on mic (Prisma), spoken replies (Timbre),
 * barge-in both ways.
 *
 * onTurn(text)            -> called when the user finishes a turn
 * onPartial(text, secs)   -> optional; called after every segment while the user
 *                            still holds the floor. Return true if it took over
 *                            (e.g. the judge interrupted), which ends the turn.
 */
export default function useVoice({ lang, onTurn, onPartial }) {
  const [listening, setListening] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [micLevel, setMicLevel] = useState(0)
  const [outLevel, setOutLevel] = useState(0)
  const [partial, setPartial] = useState('')
  const [error, setError] = useState('')
  const [reveal, setReveal] = useState(null) // what the voice is saying right now

  const listener = useRef(null)
  const buffer = useRef([])
  const started = useRef(0)
  const timer = useRef(null)
  const busy = useRef(false)
  const cb = useRef({ onTurn, onPartial })
  cb.current = { onTurn, onPartial }

  const speaker = useRef(null)
  if (!speaker.current) {
    speaker.current = createSpeaker({
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
      onLevel: setOutLevel,
      onSentence: setReveal,
    })
  }

  const flush = useCallback(async () => {
    clearTimeout(timer.current)
    const text = buffer.current.join(' ').trim()
    buffer.current = []
    started.current = 0
    setPartial('')
    if (!text || busy.current) return
    busy.current = true
    try { await cb.current.onTurn(text) } finally { busy.current = false }
  }, [])

  const lastInterim = useRef('')
  const suppress = useRef(false)

  // returns true if onPartial took the floor (e.g. the judge interrupted)
  const offerPartial = useCallback(async (soFar) => {
    if (!cb.current.onPartial) return false
    const secs = started.current ? (Date.now() - started.current) / 1000 : 0
    const took = await cb.current.onPartial(soFar, secs)
    if (took) {
      // drop the rest of this utterance; it was answered by the interruption
      suppress.current = true
      clearTimeout(timer.current)
      buffer.current = []
      started.current = 0
      lastInterim.current = ''
      setPartial('')
    }
    return took
  }, [])

  const say = useCallback(async (text, opts) => {
    try { await speaker.current.speak(text, opts) } catch (e) { setError(e.message) }
  }, [])

  const stopSpeaking = useCallback(() => speaker.current.stop(), [])

  const start = useCallback(async () => {
    setError('')
    try {
      listener.current = await startListening({
        lang,
        onLevel: setMicLevel,
        onError: (m) => setError(m),
        onSpeechStart: () => {
          // barge-in: the user talks over the AI
          if (speaker.current.speaking) speaker.current.stop()
          suppress.current = false
          clearTimeout(timer.current)
          if (!started.current) started.current = Date.now()
        },
        onInterim: async (text) => {
          if (suppress.current) return
          // live text while still speaking; lets the bench cut in mid-sentence
          const soFar = [...buffer.current, text].join(' ')
          if (soFar === lastInterim.current) return
          lastInterim.current = soFar
          setPartial(soFar)
          clearTimeout(timer.current)
          if (await offerPartial(soFar)) return
        },
        onSegment: async (text) => {
          if (suppress.current) return
          buffer.current.push(text)
          const soFar = buffer.current.join(' ')
          lastInterim.current = ''
          setPartial(soFar)
          clearTimeout(timer.current)
          if (await offerPartial(soFar)) return
          timer.current = setTimeout(flush, END_OF_TURN_MS)
        },
      })
      setListening(true)
    } catch (e) {
      setError(e.name === 'NotAllowedError' ? 'Microphone permission was blocked.' : e.message)
    }
  }, [lang, flush])

  // close the mic: submit=true sends what was heard, false discards it (not your turn)
  const close = useCallback((submit) => {
    listener.current?.stop()
    listener.current = null
    setListening(false)
    setMicLevel(0)
    if (submit) flush()
    else { clearTimeout(timer.current); buffer.current = []; started.current = 0; setPartial('') }
  }, [flush])
  const stop = useCallback(() => close(true), [close])
  const pause = useCallback(() => close(false), [close])

  useEffect(() => () => {
    listener.current?.stop()
    speaker.current?.stop()
    clearTimeout(timer.current)
  }, [])

  return { reveal, listening, speaking, micLevel, outLevel, partial, error, setError, start, stop, pause, submitNow: flush, say, stopSpeaking }
}
