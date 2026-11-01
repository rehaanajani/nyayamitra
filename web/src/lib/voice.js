import { API_BASE } from './api'

// Downsamples the mic to 16 kHz mono s16le and emits 512-sample (1024-byte)
// frames, which is exactly what Prisma realtime expects.
const WORKLET = `
class Pcm16 extends AudioWorkletProcessor {
  constructor() { super(); this.ratio = sampleRate / 16000; this.buf = new Int16Array(512); this.n = 0; this.t = 0; }
  process(inputs) {
    const ch = inputs[0][0];
    if (!ch) return true;
    let peak = 0;
    for (let i = 0; i < ch.length; i++) peak = Math.max(peak, Math.abs(ch[i]));
    this.port.postMessage({ level: peak });
    while (this.t < ch.length) {
      const s = Math.max(-1, Math.min(1, ch[Math.floor(this.t)]));
      this.buf[this.n++] = s < 0 ? s * 0x8000 : s * 0x7fff;
      if (this.n === 512) { this.port.postMessage({ pcm: this.buf.buffer.slice(0) }); this.n = 0; }
      this.t += this.ratio;
    }
    this.t -= ch.length;
    return true;
  }
}
registerProcessor('pcm16', Pcm16);
`

function wsUrl(path) {
  if (API_BASE) return API_BASE.replace(/^http/, 'ws') + path
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${proto}//${location.host}${path}`
}

/**
 * Live listener: mic -> /ws/stt -> Prisma. Calls back with Prisma events.
 * onSegment(text) fires per finished utterance (final_transcript: digits, Latin English);
 * onInterim(text) every ~450 ms while speaking (partial_transcript: Devanagari, numbers as words);
 * onSpeechStart() when the user starts talking (used for barge-in); onLevel(0..1) for the orb.
 */
export async function startListening({ lang, onSegment, onInterim, onSpeechStart, onLevel, onError }) {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 },
  })
  const ctx = new AudioContext()
  const url = URL.createObjectURL(new Blob([WORKLET], { type: 'application/javascript' }))
  await ctx.audioWorklet.addModule(url)
  const src = ctx.createMediaStreamSource(stream)
  const node = new AudioWorkletNode(ctx, 'pcm16')
  src.connect(node)

  const ws = new WebSocket(wsUrl('/ws/stt'))
  ws.binaryType = 'arraybuffer'
  let open = false
  ws.onopen = () => {
    open = true
    ws.send(JSON.stringify({ type: 'start', lang, sample_rate: 16000 }))
  }
  ws.onmessage = (e) => {
    let m
    try { m = JSON.parse(e.data) } catch { return }
    const text = (m.text || '').trim()
    if (m.type === 'speech_start') onSpeechStart?.()
    else if (m.type === 'partial_transcript' && text) onInterim?.(text, m)
    else if ((m.type === 'final_transcript' || m.type === 'transcript') && text) onSegment?.(text, m)
    else if (m.type === 'error') onError?.(m.message || m.error || 'Speech error')
  }
  ws.onerror = () => onError?.('Could not reach the speech server')

  node.port.onmessage = ({ data }) => {
    if (data.level !== undefined) onLevel?.(Math.min(1, data.level * 2.2))
    if (data.pcm && open && ws.readyState === 1) ws.send(data.pcm)
  }

  return {
    commit() { if (ws.readyState === 1) ws.send(JSON.stringify({ type: 'commit' })) },
    stop() {
      try { ws.close() } catch { /* already closed */ }
      node.disconnect(); src.disconnect()
      stream.getTracks().forEach((t) => t.stop())
      ctx.close()
      URL.revokeObjectURL(url)
    },
  }
}

/** Splits text into speakable sentences so the first one plays while the rest synthesize. */
export function sentences(text) {
  return (text.match(/[^.!?।\n]+[.!?।]*/g) || [text]).map((s) => s.trim()).filter(Boolean)
}

let ttsQueue = Promise.resolve()

/**
 * Timbre speaker with a queue and instant stop (for barge-in).
 */
export function createSpeaker({ onStart, onEnd, onLevel } = {}) {
  let ctx = null
  let current = null
  let token = 0
  let analyser = null
  let raf = 0

  function ensure() {
    if (!ctx) {
      ctx = new AudioContext()
      analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      analyser.connect(ctx.destination)
    }
    return ctx
  }

  function meter() {
    if (!analyser) return
    const d = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteTimeDomainData(d)
    let peak = 0
    for (const v of d) peak = Math.max(peak, Math.abs(v - 128) / 128)
    onLevel?.(peak)
    raf = requestAnimationFrame(meter)
  }

  async function fetchOnce(text, lang, role) {
    const res = await fetch(API_BASE + '/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, lang, role }),
    })
    if (res.status === 429 || res.status === 502) {
      const e = new Error('busy'); e.busy = true; throw e
    }
    if (!res.ok) throw new Error('Voice is unavailable right now. The text is on screen.')
    return res.arrayBuffer()
  }

  // Gnani allows one TTS request at a time per key, so every request goes
  // through one queue, with a couple of polite retries when it's busy.
  function fetchAudio(text, lang, role) {
    const run = ttsQueue.then(async () => {
      for (let attempt = 0; attempt < 3; attempt++) {
        try { return await fetchOnce(text, lang, role) } catch (e) {
          if (!e.busy || attempt === 2) throw e.busy ? new Error('Voice is busy for a moment. The text is on screen.') : e
          await new Promise((r) => setTimeout(r, 700 * (attempt + 1)))
        }
      }
    })
    ttsQueue = run.catch(() => {})
    return run
  }

  // tag: a Timbre v3 audio tag such as '<sigh>', voiced before the first sentence
  async function speak(text, { lang = 'hi', role = 'sahay', tag } = {}) {
    const my = ++token
    const c = ensure()
    if (c.state === 'suspended') await c.resume()
    const parts = sentences(text)
    if (tag && parts.length) parts[0] = `${tag} ${parts[0]}`
    onStart?.()
    cancelAnimationFrame(raf); meter()
    try {
      // fetch the next sentence while the current one plays (one request in flight)
      let next = parts.length ? fetchAudio(parts[0], lang, role) : null
      for (let i = 0; i < parts.length; i++) {
        const buf = await next
        if (my !== token) return
        next = i + 1 < parts.length ? fetchAudio(parts[i + 1], lang, role) : null
        const audio = await c.decodeAudioData(buf)
        if (my !== token) return
        await new Promise((resolve) => {
          const s = c.createBufferSource()
          s.buffer = audio
          s.connect(analyser)
          s.onended = resolve
          current = s
          s.start()
        })
      }
    } finally {
      if (my === token) { current = null; cancelAnimationFrame(raf); onLevel?.(0); onEnd?.() }
    }
  }

  function stop() {
    token++
    try { current?.stop() } catch { /* not started */ }
    current = null
    cancelAnimationFrame(raf)
    onLevel?.(0)
    onEnd?.()
  }

  return { speak, stop, get speaking() { return !!current } }
}
