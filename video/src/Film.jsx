import { AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion'
import timeline from '../public/timeline.json'
import { C, Captions, F, Lion, Photo, Pill, Pop, Rise, Sfx, Shot, Stack, Wash, clamp, useSpring } from './kit'

export const FPS = 30
const fr = (s) => Math.round(s * FPS)
const byId = Object.fromEntries(timeline.lines.map((l) => [l.id, l]))
const on = (id) => fr(byId[id].start)
const at = (id, share = 0) => fr(byId[id].start + byId[id].dur * share)

const ORDER = ['cold', 'hook', 'problem', 'citizen', 'lawyer', 'intro', 'sahay', 'path', 'abhyas', 'abhyas2', 'verdict', 'tech', 'close']
const startOf = (s) => fr(timeline.lines.find((l) => l.scene === s).start)
const END = Math.ceil(timeline.total * FPS)
const endOf = (s) => { const i = ORDER.indexOf(s); return i + 1 < ORDER.length ? startOf(ORDER[i + 1]) : END }

// Each scene fades in over the last one, so cuts stay soft.
const Scene = ({ name, children, whoosh = true }) => {
  const from = startOf(name); const dur = endOf(name) - from + 10
  return (
    <Sequence from={from} durationInFrames={dur} name={name}>
      <Fade>{children}</Fade>
      {whoosh && <Sfx at={0} name="whoosh" volume={0.2} />}
    </Sequence>
  )
}
const Fade = ({ children }) => {
  const f = useCurrentFrame()
  return <AbsoluteFill style={{ opacity: interpolate(f, [0, 9], [0, 1], clamp) }}>{children}</AbsoluteFill>
}

export const Kicker = ({ children, style }) => <div style={{ fontFamily: F.sans, fontSize: 25, fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.muted, ...style }}>{children}</div>
export const Big = ({ children, style }) => <div style={{ fontFamily: F.display, fontSize: 120, lineHeight: 1.04, color: C.ink, letterSpacing: '-0.01em', ...style }}>{children}</div>

// ---- cold open: the hook is a real interruption from the app
const Cold = () => {
  const s = startOf('cold'); const j = on('jud') - s
  return (
    <AbsoluteFill style={{ background: '#111' }}>
      <Photo src="scene-court" from={1.02} to={1.2} pos="50% 45%" dur={j + 40} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(11,11,15,.28), transparent 35%, rgba(11,11,15,.4))' }} />
      <Rise at={6} style={{ position: 'absolute', top: 54, left: 0, right: 0, textAlign: 'center' }}><Pill style={{ background: 'rgba(255,255,255,.92)', color: C.ink, fontSize: 27 }}><span style={{ width: 13, height: 13, borderRadius: 9, background: '#d92d20' }} /> Practice hearing · State v. Ravi Kumar, Lucknow</Pill></Rise>
      <Stack cards={[{ at: j, render: () => <Shot src="court-correction" keys={[{ f: j, x: 50, y: 40, z: 1 }, { f: j + 40, x: 50, y: 36, z: 1.75 }]} /> }]} />
      <Pop at={j + 95} style={{ position: 'absolute', top: 700, left: 0, right: 0, textAlign: 'center' }}><Pill style={{ background: C.warn, fontSize: 56, padding: '20px 48px' }}>IPC 420 → BNS 318</Pill></Pop>
      <Sfx at={j} name="gavel" volume={0.85} /><Sfx at={j + 95} name="pop" volume={0.35} />
    </AbsoluteFill>
  )
}

const Hook = () => {
  const p = useSpring(0)
  return (
    <AbsoluteFill>
      <Wash />
      <AbsoluteFill style={{ opacity: 0.32, filter: 'blur(9px)', transform: `scale(${1.08 - p * 0.03})` }}><Shot src="court-correction" /></AbsoluteFill>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', paddingBottom: 90 }}>
        <Rise at={4}><Big style={{ fontSize: 158 }}>That judge is an AI.</Big></Rise>
        <Rise at={62}><div style={{ marginTop: 30, fontFamily: F.sans, fontSize: 44, color: C.ink2 }}>It just cut off counsel for citing a law India replaced in 2024.</div></Rise>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

// ---- problem: stat cards pile up
export const Stat = ({ num, label, src, tint }) => (
  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 110px', background: tint }}>
    <Kicker>The problem</Kicker>
    <div style={{ fontFamily: F.display, fontSize: 250, lineHeight: 1.05, color: C.ink, marginTop: 8 }}>{num}</div>
    <div style={{ fontFamily: F.sans, fontSize: 52, color: C.ink2, marginTop: 6 }}>{label}</div>
    <div style={{ fontFamily: F.sans, fontSize: 25, color: C.muted, marginTop: 34 }}>{src}</div>
  </div>
)
const Problem = () => {
  const s = startOf('problem'); const a = on('p2') - s; const b = at('p2', 0.52) - s
  return (
    <Wash>
      <Stack top={84} width={1420} height={740} cards={[
        { at: 2, render: () => <Stat tint="linear-gradient(135deg,#d9f6fd,#fff 60%,#ece9ff)" num="5.64 crore" label="court cases pending across India" src="Reply tabled in the Rajya Sabha, reported by PTI, July 2026" /> },
        { at: a, render: () => <Stat tint="linear-gradient(135deg,#ece9ff,#fff 60%,#ffe9db)" num="80%+" label="of Indians qualify for free legal aid" src="India Justice Report 2019, as reported" /> },
        { at: b, render: () => <Stat tint="linear-gradient(135deg,#ffe9db,#fff 60%,#d9f6fd)" num="1.5 crore" label="had ever used it, by 2019" src="India Justice Report 2019, as reported" /> },
      ]} />
      <Sfx at={a} name="whoosh-soft" volume={0.2} /><Sfx at={b} name="whoosh-soft" volume={0.2} />
    </Wash>
  )
}

const Citizen = () => {
  const s = startOf('citizen'); const q = at('p3', 0.56) - s
  return (
    <AbsoluteFill style={{ background: '#222' }}>
      <Photo src="scene-sahay" from={1.03} to={1.15} pos="60% 45%" dur={endOf('citizen') - s} />
      <Pop at={q} style={{ position: 'absolute', left: 110, top: 300 }}><div style={{ background: 'rgba(255,255,255,.95)', borderRadius: 34, padding: '34px 54px', fontFamily: F.display, fontSize: 92, color: C.ink, boxShadow: '0 30px 70px -25px rgba(11,11,15,.5)' }}>What do I do next?</div></Pop>
      <Sfx at={q} name="pop" volume={0.25} />
    </AbsoluteFill>
  )
}

const Law = ({ a, b }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 20, background: 'rgba(255,255,255,.95)', borderRadius: 24, padding: '20px 34px', fontFamily: F.sans, fontWeight: 500, fontSize: 40, color: C.ink, boxShadow: '0 24px 50px -22px rgba(0,0,0,.6)' }}>
    <span style={{ color: C.muted, textDecoration: 'line-through' }}>{a}</span><span>→</span><span>{b}</span>
  </div>
)
const Lawyer = () => {
  const s = startOf('lawyer'); const t = at('p4', 0.34) - s
  return (
    <AbsoluteFill style={{ background: '#111' }}>
      <Photo src="scene-practice" from={1.04} to={1.16} pos="50% 40%" dur={endOf('lawyer') - s} />
      <div style={{ position: 'absolute', right: 96, top: 110, display: 'grid', gap: 20, justifyItems: 'end' }}>
        <Pop at={t}><Law a="IPC" b="BNS" /></Pop>
        <Pop at={t + 12}><Law a="CrPC" b="BNSS" /></Pop>
        <Pop at={t + 24}><Law a="Evidence Act" b="BSA" /></Pop>
      </div>
      <Sfx at={t} name="pop" volume={0.22} /><Sfx at={t + 12} name="pop" volume={0.22} /><Sfx at={t + 24} name="pop" volume={0.22} />
    </AbsoluteFill>
  )
}

// ---- solution
const Intro = () => (
  <Wash>
    <Stack cards={[
      { at: 10, left: 900, top: 150, width: 900, height: 620, render: () => <Photo src="scene-court" /> },
      { at: 26, left: 900, top: 150, width: 900, height: 620, render: () => <Photo src="scene-journey" pos="55% 45%" /> },
    ]} />
    <div style={{ position: 'absolute', left: 110, top: 120, width: 760 }}>
      <Rise at={2}><div style={{ fontFamily: F.deva, fontSize: 142, lineHeight: 1.1, color: C.ink }}>न्यायमित्र</div></Rise>
      <Rise at={32}><div style={{ fontFamily: F.display, fontSize: 60, lineHeight: 1.12, color: C.ink, marginTop: 8 }}>A friend in court, whichever side of it you're on.</div></Rise>
    </div>
    <Lion at={14} left={140} h={470} />
    <Sfx at={14} name="whoosh-soft" volume={0.22} />
  </Wash>
)

export const Door = ({ n, deva, at: a }) => (
  <Pop at={a} style={{ position: 'absolute', left: 60, top: 42, zIndex: 20 }}><Pill style={{ fontSize: 30 }}>Door {n} <span style={{ fontFamily: F.deva, fontSize: 38, lineHeight: 1 }}>{deva}</span></Pill></Pop>
)

const SahayScene = () => {
  const s = startOf('sahay'); const c = on('cit') - s; const r = on('sah') - s
  return (
    <Wash>
      <Stack cards={[
        { at: 2, render: () => <Shot src="sahay-empty" keys={[{ f: 0, x: 22, y: 55, z: 1.25 }, { f: c, x: 22, y: 55, z: 1.5 }]} /> },
        { at: c, render: () => <Shot src="sahay-t1" keys={[{ f: c, x: 60, y: 30, z: 1.1 }, { f: r + 20, x: 90, y: 30, z: 1.7 }]} /> },
      ]} />
      <Door n="one" deva="सहाय" at={6} />
    </Wash>
  )
}

const Path = () => {
  const s = startOf('path'); const a = on('s4') - s; const n = at('s4', 0.62) - s
  return (
    <Wash>
      <Stack cards={[
        { at: 2, render: () => <Shot src="sahay-card" keys={[{ f: 0, x: 80, y: 20, z: 1 }, { f: 60, x: 92, y: 24, z: 1.5 }, { f: a, x: 92, y: 75, z: 1.5 }]} /> },
        { at: a, render: () => <Photo src="scene-legal-aid" dur={200} /> },
      ]} />
      <Pop at={n} style={{ position: 'absolute', left: 300, top: 110, zIndex: 20 }}>
        <div style={{ background: '#fff', borderRadius: 30, padding: '24px 46px', boxShadow: '0 30px 70px -25px rgba(11,11,15,.5)' }}>
          <div style={{ fontFamily: F.display, fontSize: 120, lineHeight: 1, color: C.ink }}>15100</div>
          <div style={{ fontFamily: F.sans, fontSize: 30, color: C.ink2, marginTop: 6 }}>Free legal aid helpline</div>
        </div>
      </Pop>
      <Lion at={a + 10} right={40} h={500} />
      <Sfx at={2} name="page" volume={0.5} /><Sfx at={a} name="whoosh-soft" volume={0.2} /><Sfx at={n} name="pop" volume={0.28} />
    </Wash>
  )
}

const Abhyas = () => {
  const s = startOf('abhyas'); const b = at('s5', 0.34) - s; const o = on('opp') - s
  return (
    <Wash>
      <Stack cards={[
        { at: 2, render: () => <Photo src="scene-court" dur={100} /> },
        { at: b, render: () => <Shot src="abhyas-picker" keys={[{ f: b, x: 50, y: 30, z: 1 }]} /> },
        { at: o, render: () => <Shot src="court-counsel" keys={[{ f: o, x: 60, y: 30, z: 1.05 }, { f: o + 45, x: 88, y: 34, z: 1.6 }]} /> },
      ]} />
      <Door n="two" deva="अभ्यास" at={6} />
      <Sfx at={b} name="whoosh-soft" volume={0.2} /><Sfx at={o} name="whoosh-soft" volume={0.2} />
    </Wash>
  )
}

const Abhyas2 = () => {
  const s = startOf('abhyas2'); const j = on('jud2') - s
  return (
    <Wash>
      <Stack cards={[{ at: 2, render: () => <Shot src="court-scored2" keys={[{ f: 0, x: 50, y: 30, z: 1 }, { f: j - 25, x: 50, y: 40, z: 1.05 }, { f: j + 25, x: 50, y: 55, z: 1.55 }]} /> }]} />
      <Sfx at={j} name="gavel" volume={0.55} />
    </Wash>
  )
}

const Verdict = () => (
  <Wash>
    <Stack cards={[{ at: 2, render: () => <Shot src="verdict" keys={[{ f: 0, x: 50, y: 20, z: 1 }, { f: 60, x: 66, y: 22, z: 1.4 }]} /> }]} />
    <Sfx at={3} name="page" volume={0.45} />
  </Wash>
)

export const Model = ({ name, verb, role, active }) => (
  <div style={{ width: '100%', height: '100%', padding: '40px 44px', background: 'rgba(255,255,255,.92)' }}>
    <span style={{ display: 'inline-block', borderRadius: 12, background: C.peach, color: C.peachInk, padding: '10px 16px', fontFamily: F.sans, fontWeight: 500, fontSize: 22, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{role}</span>
    <div style={{ fontFamily: F.display, fontSize: 104, color: C.ink, marginTop: 26, lineHeight: 1 }}>{name}</div>
    <div style={{ fontFamily: F.sans, fontSize: 38, color: C.ink2, marginTop: 14 }}>{verb}</div>
  </div>
)
const Tech = () => {
  const s = startOf('tech'); const t = (share) => at('s7', share) - s; const e = on('s8') - s
  const out = useSpring(e)
  return (
    <Wash>
      <div style={{ opacity: 1 - out }}>
        <Rise at={2} style={{ position: 'absolute', top: 62, left: 110 }}><Big style={{ fontSize: 88 }}>Built on Gnani's voice stack</Big></Rise>
        <Stack cards={[{ at: t(0.1), left: 110, top: 200, width: 530, height: 400, render: () => <Model role="Speech to text" name="Prisma" verb="listens, Hindi and English mixed" /> }]} />
        <Stack cards={[{ at: t(0.28), left: 695, top: 200, width: 530, height: 400, render: () => <Model role="Text to speech" name="Timbre" verb="speaks, in 10 Indian languages" /> }]} />
        <Stack cards={[{ at: t(0.47), left: 1280, top: 200, width: 530, height: 400, render: () => <Model role="Language model" name="Evon" verb="reasons, with Gemini as failover" /> }]} />
        <Lion at={t(0.2)} left={14} h={290} />
        <Pop at={t(0.68)} style={{ position: 'absolute', left: 1180, top: 650 }}><Pill style={{ fontSize: 30 }}>Route down → Gemini, in seconds</Pill></Pop>
        <Sfx at={t(0.1)} name="pop" volume={0.25} /><Sfx at={t(0.28)} name="pop" volume={0.25} /><Sfx at={t(0.47)} name="pop" volume={0.25} /><Sfx at={t(0.68)} name="whoosh-soft" volume={0.2} />
      </div>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: out, paddingBottom: 90 }}><Big style={{ fontSize: 118, textAlign: 'center' }}>Every voice in this film is Timbre.</Big></AbsoluteFill>
    </Wash>
  )
}

export const Close = ({ quick = false }) => {
  const f = useCurrentFrame()
  return (
    <Wash>
      <div style={{ position: 'absolute', left: 800, right: 50, top: 130, textAlign: 'center' }}>
        <Rise at={2}><div style={{ fontFamily: F.deva, fontSize: 138, lineHeight: 1.15, color: C.ink }}>न्याय सबका है।</div></Rise>
        <Rise at={quick ? 14 : 38}><div style={{ fontFamily: F.display, fontSize: 70, color: C.ink, marginTop: 6 }}>Justice should speak your language.</div></Rise>
        <Pop at={quick ? 34 : 70} style={{ marginTop: 44 }}><Pill style={{ fontSize: 42, padding: '20px 44px' }}>nyayamitra-gnani.vercel.app</Pill></Pop>
        <Rise at={quick ? 48 : 100} style={{ marginTop: 50, fontFamily: F.sans, fontSize: 30, color: C.ink2, lineHeight: 1.5 }}>
          Rehaan Ajani · Raghav Maheshwari<br />
          <span style={{ fontWeight: 500, color: C.ink }}>#GreatIndianAIInternshipChallenge #GnaniAI</span>
          <div style={{ fontSize: 21, color: C.muted, marginTop: 18, lineHeight: 1.4 }}>Legal information, not legal advice.<br />Music: Scott Buckley, The Long Dark (CC BY 3.0). Sound: Wikimedia Commons.</div>
        </Rise>
      </div>
      <Lion at={8} left={50} h={720} />
      <Pop at={30} style={{ position: 'absolute', left: 650, top: 690 }}>
        <div style={{ position: 'relative', transform: `translateY(${Math.sin(f / 26) * 5}px)`, filter: 'drop-shadow(0 12px 18px rgba(11,11,15,.22))' }}>
          <div style={{ background: '#fff', borderRadius: 28, padding: '14px 34px', fontFamily: F.deva, fontSize: 58, lineHeight: 1.1, color: C.ink }}>नमस्ते!</div>
          <span style={{ position: 'absolute', left: -38, bottom: -4, width: 66, height: 40, background: '#fff', clipPath: 'polygon(58% 0, 100% 0, 100% 62%, 0 100%)' }} />
        </div>
      </Pop>
      <Sfx at={30} name="pop" volume={0.3} />
    </Wash>
  )
}

const VO = () => timeline.lines.map((l) => (
  <Sequence key={l.id} from={fr(l.start)} layout="none"><Audio src={staticFile(`vo/${l.id}.wav`)} volume={1} /></Sequence>
))

export const Film = () => {
  const closeAt = startOf('close')
  return (
    <AbsoluteFill style={{ background: '#fff' }}>
      <Sequence from={startOf('cold')} durationInFrames={endOf('cold') - startOf('cold') + 10}><Cold /></Sequence>
      <Scene name="hook"><Hook /></Scene>
      <Scene name="problem"><Problem /></Scene>
      <Scene name="citizen"><Citizen /></Scene>
      <Scene name="lawyer"><Lawyer /></Scene>
      <Scene name="intro"><Intro /></Scene>
      <Scene name="sahay"><SahayScene /></Scene>
      <Scene name="path"><Path /></Scene>
      <Scene name="abhyas"><Abhyas /></Scene>
      <Scene name="abhyas2"><Abhyas2 /></Scene>
      <Scene name="verdict"><Verdict /></Scene>
      <Scene name="tech"><Tech /></Scene>
      <Scene name="close"><Close /></Scene>
      <Captions lines={timeline.lines} fps={FPS} hideFrom={closeAt} />
      <VO />
      <Audio src={staticFile('sfx/music-bed.wav')} volume={(f) => interpolate(f, [0, 25, closeAt, closeAt + 40, END - 45, END - 2], [0, 0.17, 0.17, 0.42, 0.42, 0], clamp)} />
    </AbsoluteFill>
  )
}
