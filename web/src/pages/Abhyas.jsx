import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, Gavel, Landmark, Mic, MicOff, Plus, Scale, Send, Square, Timer } from 'lucide-react'
import { api } from '../lib/api'
import useVoice from '../lib/useVoice'
import { FadeUp, LightField, Orb, Reveal, SectionLabel } from '../components/ui'
import LanguageMenu from '../components/LanguageMenu'
import { langInfo, useLang } from '../lib/lang'
import Nirnay from '../components/Nirnay'
import Scene from '../components/Scene'

const TEMPERAMENTS = [
  { id: 'kind', label: 'Patient', deva: 'सौम्य' },
  { id: 'fair', label: 'Firm', deva: 'न्यायी' },
  { id: 'strict', label: 'Hostile', deva: 'कठोर' },
]


function CasePicker({ onPick, preselect }) {
  const [cases, setCases] = useState([])
  const [custom, setCustom] = useState('')
  const [building, setBuilding] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => { api('/api/abhyas/cases').then(setCases).catch((e) => setErr(e.message)) }, [])
  useEffect(() => {
    if (preselect && cases.length) {
      const c = cases.find((x) => x.id === preselect)
      if (c) onPick(c)
    }
  }, [preselect, cases]) // eslint-disable-line react-hooks/exhaustive-deps

  async function build() {
    setBuilding(true); setErr('')
    try {
      const c = await api('/api/abhyas/custom', { text: custom, lang: 'hi' })
      setCases((x) => [...x, c]); setCustom('')
      onPick(c)
    } catch (e) { setErr(e.message) }
    setBuilding(false)
  }

  const district = cases.filter((c) => c.kind !== 'landmark')
  const landmark = cases.filter((c) => c.kind === 'landmark')

  return (
    <section className="mx-auto max-w-6xl px-5 pb-24">
      <SectionLabel>District courts · live practice</SectionLabel>
      <div className="mt-5 grid gap-5 md:grid-cols-3">
        {district.map((c, i) => (
          <FadeUp key={c.id} delay={i * 0.06}>
            <button onClick={() => onPick(c)} className="group card flex h-full w-full flex-col p-6 text-left transition hover:-translate-y-1">
              <div className="flex items-center gap-2">
                <span className="chip">{langInfo(c.language).name}</span>
                {c.custom && <span className="chip">Your case</span>}
                <Gavel size={18} className="ml-auto text-muted transition group-hover:rotate-[-20deg] group-hover:text-ink" />
              </div>
              <div className="font-display mt-4 text-2xl leading-snug">{c.title}</div>
              <div className="mt-2 text-sm text-muted">{c.court}</div>
              <div className="mt-4 text-sm text-ink-2">{c.you_are}</div>
            </button>
          </FadeUp>
        ))}
        <FadeUp delay={0.2}>
          <div className="card flex h-full flex-col p-6">
            <div className="flex items-center gap-2 font-medium"><Plus size={18} /> Bring your own case</div>
            <p className="mt-1 text-sm text-muted">Paste a client's story, an FIR or a judgment summary. Names are replaced.</p>
            <textarea value={custom} onChange={(e) => setCustom(e.target.value)} rows={5} className="mt-3 flex-1 resize-none rounded-2xl border border-line bg-canvas p-3 text-sm outline-none focus:border-violet focus:bg-white" placeholder="My client's employer filed a cheating FIR after he resigned…" />
            <button className="pill pill-dark mt-3 self-start" onClick={build} disabled={building || custom.trim().length < 40}>{building ? 'Building the file…' : 'Build practice case'}</button>
          </div>
        </FadeUp>
      </div>

      {landmark.length > 0 && (
        <>
          <div className="mt-16 flex flex-wrap items-end justify-between gap-3">
            <div>
              <SectionLabel>Landmark Supreme Court cases</SectionLabel>
              <p className="mt-2 max-w-xl text-sm text-muted">Pick a side and argue five rounds against senior counsel, as the case stood before judgment.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {landmark.map((c, i) => (
              <FadeUp key={c.id} delay={i * 0.05}>
                <button onClick={() => onPick(c)} className="group card flex h-full w-full flex-col p-6 text-left transition hover:-translate-y-1">
                  <div className="flex items-center gap-2">
                    <span className="chip"><Landmark size={12} /> {c.year}</span>
                    <span className="chip">{c.rounds} rounds</span>
                    <Scale size={18} className="ml-auto text-muted transition group-hover:text-ink" />
                  </div>
                  <div className="font-display mt-4 text-2xl leading-snug">{c.title.replace(/ \(\d{4}\)$/, '')}</div>
                  <p className="mt-3 text-sm text-ink-2">{c.summary}</p>
                  <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
                    {(c.articles || []).map((a) => <span key={a} className="chip !text-[11px]">{a}</span>)}
                  </div>
                </button>
              </FadeUp>
            ))}
          </div>
        </>
      )}
      {err && <p className="mt-4 text-sm text-warn">{err}</p>}
    </section>
  )
}

const AXES = [
  ['law', 'विधि', 'Law'],
  ['facts', 'तथ्य', 'Facts'],
  ['bench_handling', 'उत्तर', 'Answering the bench'],
  ['delivery', 'वाणी', 'Delivery'],
]
const avg = (o) => Math.round(AXES.reduce((t, [k]) => t + (o?.[k] || 0), 0) / AXES.length)

function TurnBanner({ phase, round, rounds, opponent }) {
  const text = {
    you: `Your turn · Round ${round} of ${rounds} · present your argument`,
    opponent: `${opponent} is responding…`,
    bench: 'The bench is considering…',
    done: 'Hearing closed · the verdict is being written',
  }[phase]
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={phase + round}
        initial={{ opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8 }}
        className={`mx-auto flex w-fit items-center gap-2.5 rounded-full px-5 py-2.5 text-sm font-medium shadow-[0_10px_30px_-15px_rgba(16,24,40,.4)] ${phase === 'you' ? 'bg-ink text-white' : 'border border-white/80 bg-white/70 text-ink backdrop-blur-xl'}`}
      >
        <span className={`h-2 w-2 rounded-full ${phase === 'you' ? 'animate-pulse bg-go' : 'bg-violet'}`} />
        {text}
      </motion.div>
    </AnimatePresence>
  )
}

function Party({ label, name, text, live, waiting, tone }) {
  return (
    <div className={`card flex min-h-[300px] flex-col p-6 ${tone === 'you' ? 'ring-1 ring-ink/10' : ''}`}>
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${tone === 'you' ? 'bg-ink' : 'bg-[#e8590c]'}`} />
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">{label}</span>
      </div>
      <div className="mt-1 text-sm text-ink-2">{name}</div>
      <div className="mt-5 flex-1">
        {text ? (
          <motion.p key={text} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="font-display text-[22px] leading-snug text-ink">
            {text}{live && <span className="ml-1 inline-block h-5 w-[3px] animate-pulse bg-ink/50 align-middle" />}
          </motion.p>
        ) : waiting ? (
          <div className="flex gap-1.5 pt-2">{[0, 1, 2].map((i) => <motion.span key={i} className="h-2 w-2 rounded-full bg-[#e8590c]/70" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.12 }} />)}</div>
        ) : (
          <p className="text-[15px] text-muted">{tone === 'you' ? 'Awaiting your argument…' : 'Awaiting opposing counsel…'}</p>
        )}
      </div>
    </div>
  )
}

function ScoreBars({ scores }) {
  if (!scores) return null
  return (
    <div className="mt-5 grid gap-3">
      {AXES.map(([k, deva, en]) => (
        <div key={k}>
          <div className="flex items-center justify-between text-[12.5px] text-ink-2">
            <span className="font-medium text-ink">{scores.you[k]}</span>
            <span><span className="font-deva">{deva}</span> · {en}</span>
            <span className="font-medium text-[#b0623a]">{scores.them[k]}</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <div className="flex h-2 flex-1 justify-end overflow-hidden rounded-full bg-white/70"><motion.div className="h-full rounded-full bg-ink" initial={{ width: 0 }} animate={{ width: `${scores.you[k]}%` }} transition={{ duration: 0.8 }} /></div>
            <span className="text-[10px] text-muted">vs</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/70"><motion.div className="h-full rounded-full bg-[#e8590c]/80" initial={{ width: 0 }} animate={{ width: `${scores.them[k]}%` }} transition={{ duration: 0.8 }} /></div>
          </div>
        </div>
      ))}
      <div className="mt-1 flex items-center justify-between rounded-xl bg-white/70 px-4 py-2 text-sm">
        <span>You <b className="text-lg">{avg(scores.you)}</b></span>
        <span className="text-muted">this round</span>
        <span><b className="text-lg text-[#b0623a]">{avg(scores.them)}</b> Them</span>
      </div>
    </div>
  )
}

function MicOrb({ voice, canTalk }) {
  const live = voice.listening || voice.speaking
  const level = voice.speaking ? voice.outLevel : voice.micLevel
  return (
    <button
      onClick={() => (voice.listening ? voice.stop() : voice.start())}
      disabled={!canTalk}
      className="group relative grid place-items-center disabled:opacity-50"
      aria-label={voice.listening ? 'Stop the microphone' : 'Speak your argument'}
    >
      <Orb tone="bench" level={level} active={live} size={170} />
      <span className={`absolute grid h-16 w-16 place-items-center rounded-full shadow-lg transition group-hover:scale-105 ${voice.listening ? 'bg-ink text-white' : 'bg-white text-ink'}`}>
        {voice.listening ? <Mic size={26} /> : <MicOff size={24} />}
      </span>
    </button>
  )
}

function Court({ matter, side, lang, temperament, status, onExit }) {
  const [rounds, setRounds] = useState([])           // [{ you, opponent, bench }]
  const [phase, setPhase] = useState('you')            // you | opponent | bench | done
  const [youNow, setYouNow] = useState('')
  const [oppNow, setOppNow] = useState('')
  const [bench, setBench] = useState({ text: '', scores: null, flags: [] })
  const [seconds, setSeconds] = useState(0)
  const [debrief, setDebrief] = useState(null)
  const [text, setText] = useState('')
  const roundsRef = useRef(rounds)
  roundsRef.current = rounds
  const phaseRef = useRef(phase)
  phaseRef.current = phase
  const interjecting = useRef(false)
  const endedRef = useRef(false)
  const canTalk = status.gnani && langInfo(lang).voice
  const total = matter.rounds || 5
  const round = Math.min(total, rounds.length + 1)
  const me = matter.sides?.[side]
  const youAre = me ? `Counsel for the ${side}, ${me.name}` : matter.you_are
  const oppName = matter.sides ? `Senior counsel for the ${side === 'petitioner' ? 'respondent' : 'petitioner'}` : matter.opponent

  useEffect(() => {
    const t = setInterval(() => setSeconds((x) => x + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const history = () => roundsRef.current.flatMap((r) => [
    { role: 'user', text: r.you }, { role: 'opponent', text: r.opponent }, { role: 'judge', text: r.bench.text },
  ])

  async function say(t, role) { if (canTalk) await voice.say(t, { lang, role }) }

  async function onTurn(userText) {
    if (phaseRef.current !== 'you') return
    setYouNow(userText); setOppNow(''); setPhase('opponent')
    try {
      const r = await api('/api/abhyas/round', { case_id: matter.id, side, lang, temperament, text: userText, history: history(), round })
      if (r.correction) {
        setBench({ text: r.correction.text, scores: bench.scores, flags: r.correction.flags })
        setPhase('you')
        await say(r.correction.text, 'judge')
        return
      }
      setOppNow(r.opponent.text)
      await say(r.opponent.text, 'opponent')
      setPhase('bench')
      setBench({ text: r.bench.text, scores: r.bench.scores, flags: [] })
      const done = [...roundsRef.current, { you: userText, opponent: r.opponent.text, bench: r.bench }]
      setRounds(done)
      await say(r.bench.text, 'judge')
      if (done.length >= total) { end(done); return }
      setPhase('you'); setYouNow('')
    } catch (e) {
      voice.setError('Something went wrong reaching the court. Try that submission again.')
      setPhase('you')
    }
  }

  async function onPartial(partial, secs) {
    if (interjecting.current || phaseRef.current !== 'you') return false
    const r = await api('/api/abhyas/interject', { case_id: matter.id, lang, partial, seconds: secs }).catch(() => null)
    if (!r?.interjection) return false
    interjecting.current = true
    setYouNow(partial)
    setBench((b) => ({ ...b, text: r.interjection.text, flags: r.interjection.flags }))
    say(r.interjection.text, 'judge')
    setTimeout(() => { interjecting.current = false }, 1500)
    return true
  }

  const voice = useVoice({ lang, onTurn, onPartial })

  useEffect(() => {
    api(`/api/abhyas/opening?lang=${lang}`).then((o) => { setBench({ text: o.text, scores: null, flags: [] }); say(o.text, 'judge') })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function end(done = roundsRef.current) {
    if (endedRef.current) return
    endedRef.current = true
    setPhase('done')
    voice.stop(); voice.stopSpeaking()
    const hist = done.flatMap((r) => [{ role: 'user', text: r.you }, { role: 'opponent', text: r.opponent }, { role: 'judge', text: r.bench.text }])
    try {
      const d = await api('/api/abhyas/debrief', { case_id: matter.id, side, lang, history: hist })
      // the verdict uses the bench's own round-by-round scores
      if (done.length) {
        const scores = {}
        for (const [k] of AXES) scores[k] = Math.round(done.reduce((t, r) => t + r.bench.scores.you[k], 0) / done.length)
        d.scores = scores
      }
      setDebrief(d)
    } catch (e) { voice.setError(e.message) }
  }

  if (debrief) return <Nirnay result={debrief} matter={matter} onAgain={onExit} seconds={seconds} />

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')

  return (
    <section className="mx-auto max-w-[1280px] px-5 pb-24">
      {/* top bar */}
      <div className="card flex flex-wrap items-center gap-4 px-6 py-4">
        <button onClick={onExit} className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink"><ArrowLeft size={14} /> Matters</button>
        <div className="min-w-0">
          <div className="font-display truncate text-xl leading-tight">{matter.title}</div>
          <div className="text-xs text-muted">{matter.court}</div>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          {Array.from({ length: total }).map((_, i) => (
            <span key={i} className={`grid h-7 w-7 place-items-center rounded-full text-xs font-medium ${i < rounds.length ? 'bg-ink text-white' : i === rounds.length && phase !== 'done' ? 'border-2 border-ink text-ink' : 'bg-canvas text-muted'}`}>{i + 1}</span>
          ))}
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted"><Timer size={14} /> {mm}:{ss}</div>
        <button className="pill pill-dark !py-2 text-sm" onClick={() => end()} disabled={phase === 'done'}><Square size={13} /> End hearing</button>
      </div>

      <div className="mt-6"><TurnBanner phase={phase} round={round} rounds={total} opponent={oppName} /></div>

      {/* the courtroom: you, the bench, opposing counsel */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px_1fr]">
        <Party label="You" name={youAre} text={youNow || voice.partial} live={!!voice.partial && !youNow} tone="you" />

        <div className="card flex flex-col items-center bg-gradient-to-b from-lav/60 via-white/80 to-white p-6 text-center">
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted"><span className="font-deva text-sm normal-case tracking-normal text-ink">न्यायाधीश</span> · The bench</div>
          <AnimatePresence mode="wait">
            <motion.p key={bench.text} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-3 min-h-[72px] text-[15.5px] leading-relaxed text-ink">
              {phase === 'bench' && !bench.text ? 'Considering…' : bench.text}
            </motion.p>
          </AnimatePresence>
          {bench.flags?.map((f, i) => f.type === 'old_citation' && (
            <span key={i} className="mt-1 rounded-full bg-warn/10 px-3 py-1 text-xs font-medium text-warn">{f.old} → {f.new}</span>
          ))}
          <div className="mt-4"><MicOrb voice={voice} canTalk={canTalk} /></div>
          <div className="mt-2 h-5 text-sm text-muted">
            {!canTalk ? 'Voice is off · type below' : voice.speaking ? 'The court is speaking' : voice.listening ? 'Listening… talk any time' : 'Tap to speak'}
          </div>
          <div className="w-full text-left"><ScoreBars scores={bench.scores} /></div>
        </div>

        <Party label="Opposing counsel" name={oppName} text={oppNow} waiting={phase === 'opponent'} tone="them" />
      </div>

      {/* type instead of speaking */}
      <form className="card mt-6 flex gap-2 p-3" onSubmit={(e) => { e.preventDefault(); const v = text.trim(); if (v && phase === 'you') { setText(''); onPartial(v, 0).then((took) => { if (!took) onTurn(v) }) } }}>
        <input value={text} onChange={(e) => setText(e.target.value)} disabled={phase !== 'you'} placeholder={phase !== 'you' ? 'Wait for your turn…' : matter.historic ? 'Type your submission, e.g. "My Lords, Article 368 gives the power to amend, not to destroy…"' : "Type your submission, e.g. 'My Lord, under Section 482 BNSS…'"} className="flex-1 rounded-full bg-transparent px-4 py-2.5 text-[15px] outline-none disabled:opacity-60" />
        <button className="pill pill-dark !px-4" aria-label="Submit" disabled={phase !== 'you'}><Send size={16} /></button>
      </form>
      {voice.error && <p className="mt-3 text-center text-sm text-warn">{voice.error}</p>}

      {/* round record */}
      {rounds.length > 0 && (
        <div className="mt-10">
          <SectionLabel>Record of proceedings</SectionLabel>
          <div className="mt-4 grid gap-3">
            {rounds.map((r, i) => (
              <div key={i} className="card grid gap-4 p-5 md:grid-cols-[70px_1fr_1fr_1fr]">
                <div className="font-display text-3xl text-muted">{i + 1}</div>
                <div><div className="text-[11px] uppercase tracking-wider text-muted">You · {avg(r.bench.scores.you)}</div><p className="mt-1 text-sm">{r.you}</p></div>
                <div><div className="text-[11px] uppercase tracking-wider text-[#b0623a]">Opposing counsel · {avg(r.bench.scores.them)}</div><p className="mt-1 text-sm">{r.opponent}</p></div>
                <div><div className="text-[11px] uppercase tracking-wider text-muted">Bench</div><p className="mt-1 text-sm text-ink-2">{r.bench.text}</p></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* case file */}
      <details className="card mt-6 p-5 text-sm">
        <summary className="cursor-pointer font-medium">Case file {me ? '· your strongest points' : ''}</summary>
        {me && <ul className="mt-3 grid gap-1.5 text-ink-2">{me.key_args.map((f) => <li key={f}>• {f}</li>)}</ul>}
        <ul className="mt-3 grid gap-1.5 text-ink-2">{matter.facts.map((f) => <li key={f}>• {f}</li>)}</ul>
      </details>
    </section>
  )
}

export default function Abhyas({ status, params }) {
  const [matter, setMatter] = useState(null)
  const [lang] = useLang()
  const [temperament, setTemperament] = useState('fair')
  const [inCourt, setInCourt] = useState(false)
  const [side, setSide] = useState('petitioner')

  function pick(c) {
    setMatter(c); setSide('petitioner')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div>
      <LightField className="pb-14 pt-32">
        <div className="mx-auto flex max-w-5xl flex-col items-center px-5 text-center">
          <Reveal text="अभ्यास" className="font-deva text-7xl leading-none sm:text-8xl" />
          <p className="font-display mt-4 max-w-2xl text-2xl text-ink-2 sm:text-3xl">It doesn't argue for you. It argues against you.</p>
          {!status.gnani && <span className="chip mt-5 !py-1.5">Voice is off · typing works</span>}
        </div>
        {!inCourt && (
          <div className="mx-auto mt-10 max-w-6xl px-5">
            <div className="grid overflow-hidden rounded-[28px] bg-[#1d1830] shadow-[0_30px_60px_-30px_rgba(16,24,40,.45)] md:grid-cols-[1.45fr_1fr]">
              <div className="aspect-[4/3]">
                <Scene name="scene-practice" eager alt="A young advocate in a black coat and bands rehearsing at night as a violet voice ribbon rises from his laptop" position="50% 50%" sizes="(max-width: 768px) 100vw, 760px" />
              </div>
              <div className="flex flex-col justify-center bg-gradient-to-br from-[#2a2245] via-[#1d1830] to-[#151224] p-8 text-white sm:p-12">
                <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/50">अभ्यास · Practice</div>
                <div className="font-display mt-4 text-4xl leading-[1.08] sm:text-5xl">2 AM before the hearing.</div>
                <p className="mt-4 max-w-sm text-[16px] leading-relaxed text-white/75">No senior awake to practise with. This bench never sleeps, and it argues back in your language.</p>
                <div className="mt-6 flex flex-wrap gap-2 text-xs text-white/70">
                  <span className="rounded-full border border-white/15 px-3 py-1">Opposing counsel</span>
                  <span className="rounded-full border border-white/15 px-3 py-1">Bench scores every round</span>
                  <span className="rounded-full border border-white/15 px-3 py-1">5 rounds · verdict</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </LightField>

      <AnimatePresence mode="wait">
        {inCourt && matter ? (
          <motion.div key="court" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Court matter={matter} side={side} lang={lang} temperament={temperament} status={status} onExit={() => { setInCourt(false); setMatter(null) }} />
          </motion.div>
        ) : matter ? (
          <motion.section key="setup" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mx-auto max-w-3xl px-5 pb-24">
            <div className="card p-8">
              <button onClick={() => setMatter(null)} className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-ink"><ArrowLeft size={14} /> All matters</button>
              <div className="font-display text-3xl">{matter.title}</div>
              <div className="mt-1 text-muted">{matter.court} · {matter.stage}</div>
              {matter.summary && <p className="mt-3 text-ink-2">{matter.summary}</p>}
              {matter.sides && (
                <div className="mt-6">
                  <SectionLabel>Choose your side</SectionLabel>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {['petitioner', 'respondent'].map((k) => (
                      <button key={k} onClick={() => setSide(k)} className={`rounded-2xl border p-4 text-left transition ${side === k ? 'border-ink bg-ink text-white' : 'border-line bg-white hover:border-ink/40'}`}>
                        <div className={`text-[11px] font-medium uppercase tracking-wider ${side === k ? 'text-white/60' : 'text-muted'}`}>{k}</div>
                        <div className="mt-1 font-medium">{matter.sides[k].name}</div>
                        <div className={`mt-1 text-sm ${side === k ? 'text-white/70' : 'text-muted'}`}>{matter.sides[k].position}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div>
                  <SectionLabel>Language of the court</SectionLabel>
                  <div className="mt-2 -ml-3"><LanguageMenu align="left" /></div>
                </div>
                <div>
                  <SectionLabel>The bench</SectionLabel>
                  <div className="mt-3 inline-flex rounded-full border border-line bg-white p-1">
                    {TEMPERAMENTS.map((t) => (
                      <button key={t.id} onClick={() => setTemperament(t.id)} className={`rounded-full px-4 py-1.5 text-sm transition ${temperament === t.id ? 'bg-ink text-white' : 'text-ink-2'}`}>
                        <span className="font-deva">{t.deva}</span> <span className="opacity-60">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6 rounded-2xl bg-canvas p-5">
                <div className="text-sm font-medium">What the bench will press you on</div>
                <ul className="mt-2 grid gap-1 text-sm text-ink-2">{matter.bench_focus.map((f) => <li key={f}>• {f}</li>)}</ul>
              </div>
              <button className="pill pill-dark mt-8" onClick={() => { setInCourt(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }}><Gavel size={16} /> Enter court</button>
            </div>
          </motion.section>
        ) : (
          <motion.div key="pick" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CasePicker onPick={pick} preselect={params?.case} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
