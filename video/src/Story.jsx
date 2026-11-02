import { AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion'
import sahayFrames from '../public/rec/sahay/frames.json'
import courtFrames from '../public/rec/court/frames.json'
import { C, Captions, F, Lion, Photo, Pill, Pop, Rise, Sfx, Stack, Wash, clamp } from './kit'

export const FPS = 30
const FRAMES = { sahay: sahayFrames, court: courtFrames }
const fr = (s) => Math.round(s * FPS)

const Big = ({ children, style }) => <div style={{ fontFamily: F.display, fontSize: 120, lineHeight: 1.04, color: C.ink, letterSpacing: '-0.01em', ...style }}>{children}</div>

// Plays the real recording: picks the frame the screen showed at that moment, with a slow camera over it.
const Live = ({ clip, from, rate = 1, keys }) => {
  const f = useCurrentFrame(); const list = FRAMES[clip]
  const t = (from + (f / FPS) * rate) * 1000
  let lo = 0; let hi = list.length - 1
  while (lo < hi) { const m = (lo + hi + 1) >> 1; if (list[m][0] <= t) lo = m; else hi = m - 1 }
  const ks = keys?.length ? keys : [{ f: 0, x: 50, y: 50, z: 1 }]
  const fs = ks.map((k) => fr(k.f))
  const at = (p) => (ks.length < 2 ? ks[0][p] : interpolate(f, fs, ks.map((k) => k[p]), { ...clamp, easing: Easing.inOut(Easing.cubic) }))
  return (
    <AbsoluteFill style={{ background: '#f7f7fb', overflow: 'hidden' }}>
      <Img src={staticFile(`rec/${clip}/f/${list[lo][1]}`)} style={{ width: '100%', height: '100%', transformOrigin: `${at('x')}% ${at('y')}%`, transform: `scale(${at('z')})` }} />
    </AbsoluteFill>
  )
}

const Scene = ({ children }) => {
  const f = useCurrentFrame()
  return <AbsoluteFill style={{ opacity: interpolate(f, [0, 6], [0, 1], clamp) }}>{children}</AbsoluteFill>
}

const Tag = ({ children }) => (
  <Rise at={6} style={{ position: 'absolute', top: 26, left: 30, zIndex: 5 }}><Pill style={{ background: 'rgba(11,11,15,.88)', fontSize: 25, padding: '10px 22px' }}>{children}</Pill></Rise>
)

const PhotoCard = ({ src, pos, dur }) => <Photo src={src} pos={pos ?? '50% 45%'} from={1.03} to={1.13} dur={dur} />

const Title = ({ big, small }) => (
  <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', background: 'linear-gradient(135deg,#d9f6fd,#fff 55%,#ffe9db)' }}>
    <Rise at={3}><Big style={{ fontSize: 140 }}>{big}</Big></Rise>
    {small && <Rise at={26}><div style={{ marginTop: 30, fontFamily: F.sans, fontSize: 30, color: C.ink2 }}>{small}</div></Rise>}
  </AbsoluteFill>
)

const Stat = ({ num, label, src, tint }) => (
  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 100px', background: tint }}>
    <div style={{ fontFamily: F.display, fontSize: 230, lineHeight: 1.05, color: C.ink }}>{num}</div>
    <div style={{ fontFamily: F.sans, fontSize: 50, color: C.ink2, marginTop: 6 }}>{label}</div>
    <div style={{ fontFamily: F.sans, fontSize: 24, color: C.muted, marginTop: 30 }}>{src}</div>
  </div>
)
const STAT1 = () => <Stat tint="linear-gradient(135deg,#d9f6fd,#fff 60%,#ece9ff)" num="5.64 crore" label="court cases pending across India" src="Reply tabled in the Rajya Sabha, reported by PTI, July 2026" />
const STAT2 = () => <Stat tint="linear-gradient(135deg,#ece9ff,#fff 60%,#ffe9db)" num="80%+" label="of Indians qualify for free legal aid" src="India Justice Report 2019, as reported" />

const Brand = () => (
  <AbsoluteFill style={{ background: 'linear-gradient(135deg,#ece9ff,#fff 60%,#d9f6fd)', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
    <Rise at={2}><div style={{ fontFamily: F.deva, fontSize: 190, lineHeight: 1.1, color: C.ink }}>न्यायमित्र</div></Rise>
    <Rise at={20}><div style={{ fontFamily: F.display, fontSize: 68, color: C.ink, marginTop: 8 }}>A friend in court.</div></Rise>
  </AbsoluteFill>
)

const Aid = ({ dur }) => (
  <AbsoluteFill>
    <Photo src="scene-legal-aid" from={1.03} to={1.12} dur={dur} />
    <Pop at={Math.round(dur * 0.2)} style={{ position: 'absolute', left: 50, top: 90 }}>
      <div style={{ background: '#fff', borderRadius: 28, padding: '20px 40px', boxShadow: '0 30px 70px -25px rgba(11,11,15,.5)' }}>
        <div style={{ fontFamily: F.display, fontSize: 116, lineHeight: 1, color: C.ink }}>15100</div>
        <div style={{ fontFamily: F.sans, fontSize: 28, color: C.ink2, marginTop: 6 }}>Free legal aid helpline</div>
      </div>
    </Pop>
  </AbsoluteFill>
)

const Law = ({ a, b }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 18, background: 'rgba(255,255,255,.95)', borderRadius: 22, padding: '16px 28px', fontFamily: F.sans, fontWeight: 500, fontSize: 36, color: C.ink, boxShadow: '0 24px 50px -22px rgba(0,0,0,.6)' }}>
    <span style={{ color: C.muted, textDecoration: 'line-through' }}>{a}</span><span>→</span><span>{b}</span>
  </div>
)
const Laws = ({ dur }) => {
  const t = Math.round(dur * 0.25)
  return (
    <AbsoluteFill>
      <Photo src="scene-practice" from={1.04} to={1.14} pos="50% 40%" dur={dur} />
      <div style={{ position: 'absolute', right: 40, top: 40, display: 'grid', gap: 16, justifyItems: 'end' }}>
        <Pop at={t}><Law a="IPC" b="BNS" /></Pop><Pop at={t + 12}><Law a="CrPC" b="BNSS" /></Pop><Pop at={t + 24}><Law a="Evidence Act" b="BSA" /></Pop>
      </div>
    </AbsoluteFill>
  )
}

const Model = ({ at, name, verb, role }) => (
  <Rise at={at} y={60} style={{ flex: 1, padding: '32px 32px', borderRadius: 26, background: '#fff', boxShadow: '0 24px 50px -28px rgba(16,24,40,.5)' }}>
    <span style={{ display: 'inline-block', borderRadius: 12, background: C.peach, color: C.peachInk, padding: '8px 14px', fontFamily: F.sans, fontWeight: 500, fontSize: 19, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{role}</span>
    <div style={{ fontFamily: F.display, fontSize: 92, color: C.ink, marginTop: 22, lineHeight: 1 }}>{name}</div>
    <div style={{ fontFamily: F.sans, fontSize: 31, color: C.ink2, marginTop: 12 }}>{verb}</div>
  </Rise>
)
const Models = () => (
  <AbsoluteFill style={{ background: 'linear-gradient(135deg,#d9f6fd,#fff 55%,#ece9ff)', padding: '56px 56px' }}>
    <Rise at={2}><Big style={{ fontSize: 80 }}>Built on Gnani's voice stack</Big></Rise>
    <div style={{ display: 'flex', gap: 24, marginTop: 44 }}>
      <Model at={8} role="Speech to text" name="Prisma" verb="listens, Hindi and English mixed" />
      <Model at={40} role="Text to speech" name="Timbre" verb="speaks, in 10 Indian languages" />
      <Model at={70} role="Language model" name="Evon" verb="reasons, with Gemini as failover" />
    </div>
  </AbsoluteFill>
)

const Close = ({ tiny }) => {
  const f = useCurrentFrame()
  return (
    <Wash>
      <div style={{ position: 'absolute', left: 800, right: 50, top: 120, textAlign: 'center' }}>
        <Rise at={2}><div style={{ fontFamily: F.deva, fontSize: 138, lineHeight: 1.15, color: C.ink }}>न्याय सबका है।</div></Rise>
        <Rise at={tiny ? 8 : 30}><div style={{ fontFamily: F.display, fontSize: 70, color: C.ink, marginTop: 6 }}>Justice should speak your language.</div></Rise>
        <Pop at={tiny ? 22 : 50} style={{ marginTop: 40 }}><Pill style={{ fontSize: 42, padding: '20px 44px' }}>nyayamitra-gnani.vercel.app</Pill></Pop>
        <Rise at={tiny ? 34 : 70} style={{ marginTop: 42, fontFamily: F.sans, fontSize: 30, color: C.ink2, lineHeight: 1.5 }}>
          Rehaan Ajani · Raghav Maheshwari<br />
          <span style={{ fontWeight: 500, color: C.ink }}>#GreatIndianAIInternshipChallenge #GnaniAI</span>
          <div style={{ fontSize: 22, color: C.muted, marginTop: 16, lineHeight: 1.4 }}>Meena and Arjun are fictional. The app and its replies are real.<br />Legal information, not legal advice.<br />Music: Scott Buckley, The Long Dark (CC BY 3.0).</div>
        </Rise>
      </div>
      <Lion at={8} left={50} h={720} />
      <Pop at={24} style={{ position: 'absolute', left: 650, top: 690 }}>
        <div style={{ position: 'relative', transform: `translateY(${Math.sin(f / 26) * 5}px)`, filter: 'drop-shadow(0 12px 18px rgba(11,11,15,.22))' }}>
          <div style={{ background: '#fff', borderRadius: 28, padding: '14px 34px', fontFamily: F.deva, fontSize: 58, lineHeight: 1.1, color: C.ink }}>नमस्ते!</div>
          <span style={{ position: 'absolute', left: -38, bottom: -4, width: 66, height: 40, background: '#fff', clipPath: 'polygon(58% 0, 100% 0, 100% 62%, 0 100%)' }} />
        </div>
      </Pop>
    </Wash>
  )
}

const Visual = ({ v, dur }) => {
  switch (v.t) {
    case 'live': return <Live {...v} />
    case 'photo': return <PhotoCard {...v} dur={dur} />
    case 'title': return <Title {...v} />
    case 'stats': return <STAT1 />
    case 'brand': return <Brand />
    case 'aid': return <Aid dur={dur} />
    case 'laws': return <Laws dur={dur} />
    case 'models': return <Models />
    default: return null
  }
}

// Mitra steps in at the corner of a card and leaves before the next one, waist up only.
const LionVisit = ({ side, dur, h }) => {
  const f = useCurrentFrame()
  const out = interpolate(f, [dur - 10, dur], [0, h + 80], clamp)
  return <AbsoluteFill style={{ transform: `translateY(${out}px)` }}><Lion at={6} h={h} {...(side === 'left' ? { left: 6 } : { right: 6 })} /></AbsoluteFill>
}

export const Story = ({ data }) => {
  const END = Math.ceil(data.total * FPS)
  const closeIdx = data.items.findIndex((e) => e.v.t === 'close')
  const closeAt = fr(data.items[closeIdx].start)
  // consecutive items with the same card id share one card; every other item is a new card on the pile
  const groups = []
  data.items.slice(0, closeIdx).forEach((e) => {
    const last = groups[groups.length - 1]
    if (e.card && last && last.card === e.card) last.items.push(e)
    else groups.push({ card: e.card, at: fr(e.start), items: [e] })
    if (e.v.t === 'stats') groups.push({ at: fr(e.start + e.dur * 0.33), items: [], stat2: true })
  })
  const cards = groups.map((g) => ({
    at: g.at,
    render: () => (g.stat2 ? <STAT2 /> : g.items.map((e, i) => (
      <Sequence key={i} from={fr(e.start)} durationInFrames={fr(e.dur) + 8} name={e.id ?? 'live'} layout="absolute-fill">
        <Scene><Visual v={e.v} dur={fr(e.dur)} />{e.v.tag && <Tag>{e.v.tag}</Tag>}</Scene>
      </Sequence>
    ))),
  }))
  return (
    <AbsoluteFill style={{ background: '#fff' }}>
      <Wash>
        <Stack cards={cards} />
        {data.items.map((e, i) => e.v.lion && (
          <Sequence key={`l${i}`} from={fr(e.start)} durationInFrames={fr(e.dur)} layout="none"><LionVisit side={e.v.lion} dur={fr(e.dur)} h={e.v.lionH ?? 400} /></Sequence>
        ))}
      </Wash>
      <Sequence from={closeAt}><Scene><Close tiny={data.items[closeIdx].v.tiny} /></Scene></Sequence>
      <Captions lines={data.lines} fps={FPS} hideFrom={closeAt} />
      {data.items.map((e, i) => (
        <Sequence key={`a${i}`} from={fr(e.start)} layout="none">
          {e.voice && <Audio src={staticFile(e.voice)} volume={1.5} />}
          {e.gavel != null && <Sfx at={fr(e.gavel) - 6} name="gavel" volume={0.8} />}
          {(e.sounds ?? []).map((s, j) => (
            <Sequence key={j} from={fr(s.at)} durationInFrames={Math.max(1, fr(s.dur))} layout="none">
              <Audio src={staticFile(s.file)} startFrom={fr(s.skip)} volume={1.5} />
            </Sequence>
          ))}
        </Sequence>
      ))}
      <Audio src={staticFile('sfx/music-bed.wav')} volume={(f) => interpolate(f, [0, 20, closeAt, closeAt + 25, END - 30, END - 2], [0, 0.2, 0.2, 0.55, 0.55, 0], clamp)} />
    </AbsoluteFill>
  )
}
