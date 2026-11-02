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
export const Stack = ({ cards, top = 64, width = 1422, height = 800 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig()
  const rise = (at) => spring({ frame: f - at, fps, config: { damping: 19, stiffness: 105, mass: 0.95 } })
  return (
    <AbsoluteFill>
      {cards.map((c, i) => {
        if (f < c.at - 1) return null
        const depth = cards.slice(i + 1, i + 5).reduce((s, n) => s + (f >= n.at ? rise(n.at) : 0), 0)
        if (depth >= 3) return null
        const p = rise(c.at)
        return (
          <div key={i} style={{
            position: 'absolute', left: (1920 - width) / 2, top, width, height, borderRadius: 34, overflow: 'hidden', background: c.bg ?? '#fff',
            boxShadow: '0 40px 80px -30px rgba(16,24,40,.45), 0 0 0 1px rgba(255,255,255,.7)',
            transform: `translateY(${(1 - p) * 1150 - depth * 26}px) scale(${1 - depth * 0.05}) rotate(${(1 - p) * (i % 2 ? 3 : -3)}deg)`,
            filter: `brightness(${1 - Math.min(depth, 2) * 0.08})`, transformOrigin: '50% 0%',
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

// Short subtitles below the cards, no backdrop. Each line is timed to the speech (scripts/story.py).
export const Captions = ({ lines, fps, hideFrom = Infinity }) => {
  const f = useCurrentFrame()
  if (f >= hideFrom) return null
  const t = f / fps
  const line = lines.find((l) => t >= l.start && t < l.start + l.dur)
  if (!line) return null
  return (
    <div style={{ position: 'absolute', left: 300, right: 300, top: 904, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, textAlign: 'center', zIndex: 50, fontFamily: F.sans, color: C.ink, fontWeight: 600, fontSize: 40, lineHeight: 1.2, textShadow: '0 0 14px rgba(255,255,255,.95), 0 0 3px rgba(255,255,255,.9)' }}>
      {line.tag && <span style={{ flexShrink: 0, fontSize: 21, fontWeight: 600, letterSpacing: '0.1em', color: C.violet }}>{line.tag}</span>}
      <span>{line.caption}</span>
    </div>
  )
}
