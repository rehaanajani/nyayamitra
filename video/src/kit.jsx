import { AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'
import { loadFont as inter } from '@remotion/google-fonts/Inter'
import { loadFont as noto } from '@remotion/google-fonts/NotoSansDevanagari'
import { loadFont as tiro } from '@remotion/google-fonts/TiroDevanagariSanskrit'
import { loadFont as serif } from '@remotion/google-fonts/InstrumentSerif'

const { fontFamily: INTER } = inter('normal', { weights: ['400', '500', '600'] })
const { fontFamily: NOTO } = noto('normal', { weights: ['400', '500'], subsets: ['devanagari'] })
const { fontFamily: TIRO } = tiro('normal', { subsets: ['devanagari'] })
const { fontFamily: SERIF } = serif('normal', { subsets: ['latin'] })

export const F = { sans: `${INTER}, ${NOTO}`, deva: `${TIRO}, ${NOTO}`, display: `${SERIF}, ${TIRO}` }
export const C = { ink: '#0b0b0f', ink2: '#3d3f4a', muted: '#6b6f7c', violet: '#7c6cf0', warn: '#e35d17', peach: '#fdeee3', peachInk: '#b0623a', lav: '#e2e0fb', cyan: '#a2ebfc' }
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
export { clamp }

export const Wash = ({ children }) => {
  const f = useCurrentFrame()
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(60% 50% at 20% 30%, rgba(162,235,252,.75), transparent 70%), radial-gradient(55% 55% at 80% 25%, rgba(226,224,251,.9), transparent 70%), radial-gradient(60% 60% at 55% 85%, rgba(255,211,183,.85), transparent 70%), #f7f7fb' }}>
      <div style={{ position: 'absolute', left: '-50%', top: '-50%', width: '200%', height: '200%', opacity: 0.7, transform: `rotate(${f * 0.03}deg)`, background: 'repeating-conic-gradient(from 0deg at 50% 50%, rgba(255,255,255,.5) 0deg 2.2deg, rgba(255,255,255,0) 2.2deg 7deg)' }} />
      {children}
    </AbsoluteFill>
  )
}

export const useSpring = (at, config = { damping: 20, stiffness: 120, mass: 0.9 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig()
  return spring({ frame: f - at, fps, config })
}

// A pile of cards: each new one rises from below; everything under it shrinks and slides back.
export const Stack = ({ cards, top = 34, width = 1500, height = 844 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig()
  const rise = (at) => spring({ frame: f - at, fps, config: { damping: 19, stiffness: 105, mass: 0.95 } })
  return (
    <AbsoluteFill>
      {cards.map((c, i) => {
        const p = rise(c.at)
        const depth = cards.slice(i + 1).reduce((s, n) => s + rise(n.at), 0)
        const w = c.width ?? width; const h = c.height ?? height
        return (
          <div key={i} style={{
            position: 'absolute', left: (c.left ?? (1920 - w) / 2), top: c.top ?? top, width: w, height: h, borderRadius: 34, overflow: 'hidden', background: c.bg ?? '#fff',
            boxShadow: '0 40px 80px -30px rgba(16,24,40,.45), 0 0 0 1px rgba(255,255,255,.7)',
            transform: `translateY(${(1 - p) * 1150 - depth * 34}px) scale(${1 - depth * 0.055}) rotate(${(1 - p) * (i % 2 ? 3 : -3)}deg)`,
            filter: `brightness(${1 - Math.min(depth, 2) * 0.1})`, transformOrigin: '50% 0%',
          }}>{c.render()}</div>
        )
      })}
    </AbsoluteFill>
  )
}

// A real screenshot; keys move a slow camera over it: [{ f, x, y, z }], x/y in percent.
export const Shot = ({ src, keys = [{ f: 0, x: 50, y: 50, z: 1 }] }) => {
  const f = useCurrentFrame()
  const fs = keys.map((k) => k.f)
  const at = (p) => (keys.length < 2 ? keys[0][p] : interpolate(f, fs, keys.map((k) => k[p]), { ...clamp, easing: Easing.inOut(Easing.cubic) }))
  return <Img src={staticFile(`shots/${src}.png`)} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', transformOrigin: `${at('x')}% ${at('y')}%`, transform: `scale(${at('z')})` }} />
}

export const Photo = ({ src, from = 1.04, to = 1.14, pos = '50% 50%', dur = 240 }) => {
  const f = useCurrentFrame()
  return <Img src={staticFile(`img/${src}.webp`)} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, transform: `scale(${interpolate(f, [0, dur], [from, to], clamp)})` }} />
}

// Mitra from the waist up only: the frame's bottom edge always hides where the image ends.
export const Lion = ({ at, left, right, h = 560, flip = false }) => {
  const f = useCurrentFrame(); const p = useSpring(at, { damping: 14, stiffness: 95, mass: 1 })
  const sway = Math.sin((f - at) / 34) * 1.2
  return (
    <Img src={staticFile('brand/mitra.png')} style={{
      position: 'absolute', bottom: -18, left, right, height: h, transformOrigin: '50% 100%',
      transform: `translateY(${(1 - p) * (h + 60)}px) rotate(${sway}deg) scaleX(${flip ? -1 : 1})`,
      filter: 'drop-shadow(0 18px 30px rgba(11,11,15,.28))',
    }} />
  )
}

export const Pop = ({ at, style, children }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig()
  const p = spring({ frame: f - at, fps, config: { damping: 12, stiffness: 190, mass: 0.7 } })
  return <div style={{ ...style, opacity: Math.min(p * 2, 1), transform: `${style?.transform ?? ''} scale(${0.6 + p * 0.4})` }}>{children}</div>
}

export const Rise = ({ at, style, children, y = 34 }) => {
  const p = useSpring(at)
  return <div style={{ ...style, opacity: p, transform: `translateY(${(1 - p) * y}px)` }}>{children}</div>
}

export const Sfx = ({ at, name, volume = 0.25 }) => (
  <Sequence from={Math.max(0, Math.round(at))} layout="none"><Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} /></Sequence>
)

export const Pill = ({ children, style }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, borderRadius: 999, background: C.ink, color: '#fff', padding: '14px 28px', fontFamily: F.sans, fontWeight: 500, fontSize: 30, ...style }}>{children}</div>
)

const TAG = { adv: 'ADVOCATE', jud: 'THE BENCH', jud2: 'THE BENCH', cit: 'CALLER', sah: 'सहाय', opp: 'OPPOSING COUNSEL' }

function chunks(text, max = 66) {
  const parts = text.match(/[^.?!:,]+[.?!:,]*["']?\s*/g) ?? [text]
  const out = []; let cur = ''
  for (const p of parts) {
    if (cur && (cur + p).length > max) { out.push(cur.trim()); cur = p } else cur += p
  }
  if (cur.trim()) out.push(cur.trim())
  return out
}

// Burned-in captions: most LinkedIn feeds play on mute.
export const Captions = ({ lines, fps, hideFrom = Infinity }) => {
  const f = useCurrentFrame()
  if (f >= hideFrom) return null
  const t = f / fps
  const line = lines.find((l) => t >= l.start && t < l.start + l.dur + 0.12)
  if (!line) return null
  const cs = chunks(line.caption); const total = cs.reduce((s, c) => s + c.length, 0)
  let acc = 0; let cur = cs[cs.length - 1]; let curStart = line.start
  for (const c of cs) {
    const d = (c.length / total) * line.dur
    if (t < line.start + acc + d) { cur = c; curStart = line.start + acc; break }
    acc += d
  }
  const op = interpolate(t - curStart, [0, 0.1], [0.4, 1], clamp)
  const tag = TAG[line.id]
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 34, display: 'flex', justifyContent: 'center', zIndex: 50 }}>
      <div style={{ maxWidth: 1500, display: 'flex', alignItems: 'center', gap: 18, borderRadius: 26, background: 'rgba(11,11,15,.9)', padding: '17px 32px', color: '#fff', fontFamily: F.sans, fontWeight: 500, fontSize: 36, lineHeight: 1.25, opacity: op, boxShadow: '0 20px 50px -18px rgba(11,11,15,.6)' }}>
        {tag && <span style={{ flexShrink: 0, fontSize: 19, letterSpacing: tag === 'सहाय' ? 0 : '0.14em', color: '#c9c4ff' }}>{tag}</span>}
        <span>{cur}</span>
      </div>
    </div>
  )
}
