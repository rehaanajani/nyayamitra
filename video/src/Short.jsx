import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion'
import timeline from '../public/timeline-short.json'
import { Big, Close, Door, FPS, Model, Stat } from './Film'
import { C, Captions, F, Lion, Photo, Pill, Pop, Rise, Sfx, Shot, Stack, Wash, clamp, useSpring } from './kit'

// The LinkedIn cut: same footage and voices as the full film, about a minute long.
const fr = (s) => Math.round(s * FPS)
const byId = Object.fromEntries(timeline.lines.map((l) => [l.id, l]))
const on = (id) => fr(byId[id].start)
const at = (id, share = 0) => fr(byId[id].start + byId[id].dur * share)
const ORDER = ['cold', 'hook', 'problem', 'intro', 'sahay', 'path', 'abhyas', 'abhyas2', 'tech', 'close']
const startOf = (s) => fr(timeline.lines.find((l) => l.scene === s).start)
const END = Math.ceil(timeline.total * FPS)
const endOf = (s) => { const i = ORDER.indexOf(s); return i + 1 < ORDER.length ? startOf(ORDER[i + 1]) : END }

const Fade = ({ children }) => {
  const f = useCurrentFrame()
  return <AbsoluteFill style={{ opacity: interpolate(f, [0, 8], [0, 1], clamp) }}>{children}</AbsoluteFill>
}
const Scene = ({ name, children }) => (
  <Sequence from={startOf(name)} durationInFrames={endOf(name) - startOf(name) + 9} name={name}>
    <Fade>{children}</Fade>
    <Sfx at={0} name="whoosh" volume={0.2} />
  </Sequence>
)

// The judge cuts in the moment the advocate reaches the old section.
const Cold = () => {
  const j = on('jud6')
  return (
    <AbsoluteFill style={{ background: '#111' }}>
      <Photo src="scene-court" from={1.08} to={1.2} pos="50% 45%" dur={j + 30} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(11,11,15,.28), transparent 35%, rgba(11,11,15,.4))' }} />
      <Rise at={3} style={{ position: 'absolute', top: 54, left: 0, right: 0, textAlign: 'center' }}><Pill style={{ background: 'rgba(255,255,255,.92)', color: C.ink, fontSize: 27 }}><span style={{ width: 13, height: 13, borderRadius: 9, background: '#d92d20' }} /> Practice hearing · State v. Ravi Kumar, Lucknow</Pill></Rise>
      <Stack cards={[{ at: j, render: () => <Shot src="court-correction" keys={[{ f: j, x: 50, y: 40, z: 1.2 }, { f: j + 30, x: 50, y: 36, z: 1.75 }]} /> }]} />
      <Pop at={j + 70} style={{ position: 'absolute', top: 700, left: 0, right: 0, textAlign: 'center' }}><Pill style={{ background: C.warn, fontSize: 56, padding: '20px 48px' }}>IPC 420 → BNS 318</Pill></Pop>
      <Sfx at={j} name="gavel" volume={0.85} /><Sfx at={j + 70} name="pop" volume={0.35} />
    </AbsoluteFill>
  )
}

const Hook = () => (
  <AbsoluteFill>
    <Wash />
    <AbsoluteFill style={{ opacity: 0.32, filter: 'blur(9px)', transform: 'scale(1.06)' }}><Shot src="court-correction" /></AbsoluteFill>
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', paddingBottom: 90 }}>
      <Rise at={3}><Big style={{ fontSize: 158 }}>That judge is an AI.</Big></Rise>
      <Rise at={46}><div style={{ marginTop: 30, fontFamily: F.sans, fontSize: 44, color: C.ink2 }}>It just caught a law India replaced in 2024.</div></Rise>
    </AbsoluteFill>
  </AbsoluteFill>
)

const Problem = () => {
  const s = startOf('problem'); const b = at('p6', 0.46) - s
  return (
    <Wash>
      <Stack top={84} width={1420} height={740} cards={[
        { at: 2, render: () => <Stat tint="linear-gradient(135deg,#d9f6fd,#fff 60%,#ece9ff)" num="5.64 crore" label="court cases pending across India" src="Reply tabled in the Rajya Sabha, reported by PTI, July 2026" /> },
        { at: b, render: () => <Photo src="scene-sahay" pos="60% 45%" dur={110} /> },
      ]} />
      <Pop at={b + 40} style={{ position: 'absolute', left: 340, top: 340 }}><div style={{ background: 'rgba(255,255,255,.96)', borderRadius: 30, padding: '28px 46px', fontFamily: F.display, fontSize: 84, color: C.ink, boxShadow: '0 30px 70px -25px rgba(11,11,15,.5)' }}>What do I do next?</div></Pop>
      <Sfx at={b} name="whoosh-soft" volume={0.2} /><Sfx at={b + 40} name="pop" volume={0.25} />
    </Wash>
  )
}

const Intro = () => (
  <Wash>
    <Stack cards={[{ at: 6, left: 900, top: 150, width: 900, height: 620, render: () => <Photo src="scene-journey" pos="55% 45%" dur={90} /> }]} />
    <div style={{ position: 'absolute', left: 110, top: 120, width: 760 }}>
      <Rise at={2}><div style={{ fontFamily: F.deva, fontSize: 142, lineHeight: 1.1, color: C.ink }}>न्यायमित्र</div></Rise>
      <Rise at={26}><div style={{ fontFamily: F.display, fontSize: 60, lineHeight: 1.12, color: C.ink, marginTop: 8 }}>A friend in court.</div></Rise>
    </div>
    <Lion at={10} left={30} h={500} />
    <Sfx at={10} name="whoosh-soft" volume={0.22} />
  </Wash>
)

const SahayScene = () => {
  const s = startOf('sahay'); const c = on('cit') - s
  return (
    <Wash>
      <Stack cards={[
        { at: 2, render: () => <Shot src="sahay-empty" keys={[{ f: 0, x: 22, y: 55, z: 1.25 }, { f: c, x: 22, y: 55, z: 1.5 }]} /> },
        { at: c, render: () => <Shot src="sahay-t1" keys={[{ f: c, x: 60, y: 30, z: 1.1 }, { f: c + 40, x: 90, y: 30, z: 1.7 }]} /> },
      ]} />
      <Door n="one" deva="सहाय" at={5} />
    </Wash>
  )
}

const Path = () => (
  <Wash>
    <Stack cards={[{ at: 2, render: () => <Shot src="sahay-card" keys={[{ f: 0, x: 80, y: 20, z: 1 }, { f: 45, x: 92, y: 24, z: 1.5 }, { f: 165, x: 92, y: 75, z: 1.5 }]} /> }]} />
    <Sfx at={2} name="page" volume={0.5} />
  </Wash>
)

const Abhyas = () => {
  const s = startOf('abhyas'); const b = at('s56', 0.3) - s
  return (
    <Wash>
      <Stack cards={[
        { at: 2, render: () => <Photo src="scene-court" dur={70} /> },
        { at: b, render: () => <Shot src="court-counsel" keys={[{ f: b, x: 60, y: 30, z: 1.05 }, { f: b + 40, x: 88, y: 34, z: 1.6 }]} /> },
      ]} />
      <Door n="two" deva="अभ्यास" at={5} />
      <Sfx at={b} name="whoosh-soft" volume={0.2} />
    </Wash>
  )
}

const Abhyas2 = () => {
  const s = startOf('abhyas2'); const j = on('jud2') - s
  return (
    <Wash>
      <Stack cards={[{ at: 2, render: () => <Shot src="court-scored2" keys={[{ f: 0, x: 50, y: 40, z: 1.05 }, { f: j + 15, x: 50, y: 55, z: 1.55 }]} /> }]} />
      <Sfx at={j} name="gavel" volume={0.55} />
    </Wash>
  )
}

const Tech = () => (
  <Wash>
    <Rise at={2} style={{ position: 'absolute', top: 70, left: 0, right: 0, textAlign: 'center' }}><Big style={{ fontSize: 96 }}>Every voice you just heard is Timbre.</Big></Rise>
    <Stack cards={[{ at: 6, left: 110, top: 300, width: 530, height: 400, render: () => <Model role="Speech to text" name="Prisma" verb="listens, Hindi and English mixed" /> }]} />
    <Stack cards={[{ at: 16, left: 695, top: 300, width: 530, height: 400, render: () => <Model role="Text to speech" name="Timbre" verb="speaks, in 10 Indian languages" /> }]} />
    <Stack cards={[{ at: 26, left: 1280, top: 300, width: 530, height: 400, render: () => <Model role="Language model" name="Evon" verb="reasons, with Gemini as failover" /> }]} />
    <Sfx at={6} name="pop" volume={0.25} /><Sfx at={16} name="pop" volume={0.25} /><Sfx at={26} name="pop" volume={0.25} />
  </Wash>
)

export const Short = () => {
  const closeAt = startOf('close')
  return (
    <AbsoluteFill style={{ background: '#fff' }}>
      <Sequence from={0} durationInFrames={endOf('cold') + 9}><Cold /></Sequence>
      <Scene name="hook"><Hook /></Scene>
      <Scene name="problem"><Problem /></Scene>
      <Scene name="intro"><Intro /></Scene>
      <Scene name="sahay"><SahayScene /></Scene>
      <Scene name="path"><Path /></Scene>
      <Scene name="abhyas"><Abhyas /></Scene>
      <Scene name="abhyas2"><Abhyas2 /></Scene>
      <Scene name="tech"><Tech /></Scene>
      <Scene name="close"><Close quick /></Scene>
      <Captions lines={timeline.lines} fps={FPS} hideFrom={closeAt} />
      {timeline.lines.map((l) => <Sequence key={l.id} from={fr(l.start)} layout="none"><Audio src={staticFile(`vo/${l.id}.wav`)} volume={1.5} /></Sequence>)}
      <Audio src={staticFile('sfx/music-bed.wav')} volume={(f) => interpolate(f, [0, 20, closeAt, closeAt + 25, END - 30, END - 2], [0, 0.24, 0.24, 0.6, 0.6, 0], clamp)} />
    </AbsoluteFill>
  )
}
