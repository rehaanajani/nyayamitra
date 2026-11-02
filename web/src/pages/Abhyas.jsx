import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, FileText, Gavel, Landmark, Plus, Scale, ScrollText, Send, Square, Timer } from 'lucide-react'
import { api } from '../lib/api'
import useVoice from '../lib/useVoice'
import { FadeUp, LightField, Reveal, SectionLabel, Streamed } from '../components/ui'
import LanguageMenu from '../components/LanguageMenu'
import { langInfo, useLang } from '../lib/lang'
import Nirnay from '../components/Nirnay'
import Scene from '../components/Scene'
import MicOrb from '../components/MicOrb'
import Sheet from '../components/Sheet'

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

function Party({ label, name, text, live, waiting, tone, voiced, reveal }) {
  return (
    <div className={`card flex min-h-[180px] flex-col overflow-hidden p-5 lg:min-h-0 ${tone === 'you' ? 'ring-1 ring-ink/10' : ''}`}>
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${tone === 'you' ? 'bg-ink' : 'bg-[#e8590c]'}`} />
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">{label}</span>
      </div>
      <div className="mt-1 text-sm text-ink-2">{name}</div>
      <div className="scroll-soft mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
        {text ? (
          <motion.p key={text} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="font-display text-[20px] leading-snug text-ink">
            {tone === 'them' ? <Streamed text={text} voiced={voiced} reveal={reveal} /> : text}{live && <span className="ml-1 inline-block h-5 w-[3px] animate-pulse bg-ink/50 align-middle" />}
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
    <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5">
      {AXES.map(([k, deva, en]) => (
        <div key={k}>
          <div className="flex items-center justify-between text-[11.5px] text-ink-2">
            <span className="font-medium text-ink">{scores.you[k]}</span>
            <span className="truncate px-1"><span className="font-deva">{deva}</span> · {en}</span>
            <span className="font-medium text-[#b0623a]">{scores.them[k]}</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <div className="flex h-2 flex-1 justify-end overflow-hidden rounded-full bg-white/70"><motion.div className="h-full rounded-full bg-ink" initial={{ width: 0 }} animate={{ width: `${scores.you[k]}%` }} transition={{ duration: 0.8 }} /></div>
            <span className="text-[10px] text-muted">vs</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/70"><motion.div className="h-full rounded-full bg-[#e8590c]/80" initial={{ width: 0 }} animate={{ width: `${scores.them[k]}%` }} transition={{ duration: 0.8 }} /></div>
          </div>
        </div>
      ))}
      <div className="col-span-2 flex items-center justify-between rounded-xl bg-white/70 px-4 py-1 text-sm">
        <span>You <b className="text-lg">{avg(scores.you)}</b></span>
        <span className="text-muted">this round</span>
        <span><b className="text-lg text-[#b0623a]">{avg(scores.them)}</b> Them</span>
      </div>
    </div>
  )
}

function Court({ matter, side, lang, temperament, status, onExit, onLock }) {
  const [rounds, setRounds] = useState([])           // [{ you, opponent, bench }]
  const [phase, setPhase] = useState('you')            // you | opponent | bench | done
  const [youNow, setYouNow] = useState('')
  const [oppNow, setOppNow] = useState('')
  const [bench, setBench] = useState({ text: '', scores: null, flags: [] })
  const [seconds, setSeconds] = useState(0)
  const [debrief, setDebrief] = useState(null)
  const [text, setText] = useState('')
  const [sheet, setSheet] = useState(null)          // record | file
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

  // the hearing owns the screen until the verdict arrives
  useEffect(() => { onLock(!debrief); return () => onLock(false) }, [debrief]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const t = setInterval(() => setSeconds((x) => x + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const history = () => roundsRef.current.flatMap((r) => [
    { role: 'user', text: r.you }, { role: 'opponent', text: r.opponent }, { role: 'judge', text: r.bench.text },
  ])

  // tag: a Timbre v3 expression (the bench clears its throat, sighs) on the first sentence
  async function say(t, role, tag) { if (canTalk) await voice.say(t, { lang, role, tag }) }

  async function onTurn(userText) {
    if (phaseRef.current !== 'you') return
    setYouNow(userText); setOppNow(''); setPhase('opponent')
    try {
      const req = { case_id: matter.id, side, lang, temperament, text: userText, history: history(), round }
      const r = await api('/api/abhyas/round', { ...req, stage: 'opponent' })
      if (r.correction) {
        setBench({ text: r.correction.text, scores: bench.scores, flags: r.correction.flags })
        setPhase('you')
        await say(r.correction.text, 'judge', '<sigh>')
        return
      }
      setOppNow(r.opponent.text)
      // the bench weighs the round while counsel is still speaking
      const benchP = api('/api/abhyas/round', { ...req, stage: 'bench', opponent: r.opponent.text })
      await say(r.opponent.text, 'opponent')
      setPhase('bench')
      r.bench = (await benchP).bench
      setBench({ text: r.bench.text, scores: r.bench.scores, flags: [] })
      const done = [...roundsRef.current, { you: userText, opponent: r.opponent.text, bench: r.bench }]
      setRounds(done)
      await say(r.bench.text, 'judge', avg(r.bench.scores.you) + 10 < avg(r.bench.scores.them) ? '<sigh>' : undefined)
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
    say(r.interjection.text, 'judge', r.interjection.flags?.length ? '<sigh>' : '<clears throat>')
    setTimeout(() => { interjecting.current = false }, 1500)
    return true
  }

  const voice = useVoice({ lang, onTurn, onPartial })
  const [micOn, setMicOn] = useState(false)  // voice mode, chosen by the user

  // the mic is open only on your turn, so counsel's voice can't trip it
  useEffect(() => {
    if (micOn && phase === 'you' && !voice.listening) voice.start()
    if ((!micOn || phase !== 'you') && voice.listening) voice.pause()
  }, [micOn, phase, voice.listening]) // eslint-disable-line react-hooks/exhaustive-deps

  const micLabel = !canTalk ? 'Voice is off · type below'
    : phase === 'opponent' ? 'Counsel is speaking · wait'
    : phase === 'bench' ? 'The bench is speaking · wait'
    : phase === 'done' ? 'Hearing closed'
    : !micOn ? 'Tap the ring to argue by voice'
    : voice.speaking ? 'The bench is speaking · talk to interrupt'
    : voice.partial ? 'Listening · pause or tap Done'
    : 'Your turn · speak now'
  const micTone = phase === 'you' && micOn ? (voice.speaking ? 'speak' : 'go') : phase === 'you' ? 'wait' : 'speak'

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
    <section className="mx-auto flex h-full max-w-[1280px] flex-col px-3 pb-3 pt-[84px] sm:px-5 sm:pb-5">
      {/* top bar */}
      <div className="card flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3">
        <button onClick={onExit} className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink"><ArrowLeft size={14} /> Matters</button>
        <div className="min-w-0 flex-1">
          <div className="font-display truncate text-lg leading-tight">{matter.title}</div>
          <div className="truncate text-xs text-muted">{matter.court}</div>
        </div>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: total }).map((_, i) => (
            <span key={i} className={`grid h-7 w-7 place-items-center rounded-full text-xs font-medium ${i < rounds.length ? 'bg-ink text-white' : i === rounds.length && phase !== 'done' ? 'border-2 border-ink text-ink' : 'bg-canvas text-muted'}`}>{i + 1}</span>
          ))}
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted"><Timer size={14} /> {mm}:{ss}</div>
        <button className="pill pill-light !py-2 text-sm" onClick={() => setSheet('record')}><ScrollText size={14} /> Record{rounds.length ? ` · ${rounds.length}` : ''}</button>
        <button className="pill pill-light !py-2 text-sm" onClick={() => setSheet('file')}><FileText size={14} /> Case file</button>
        <button className="pill pill-dark !py-2 text-sm" onClick={() => end()} disabled={phase === 'done'}><Square size={13} /> End hearing</button>
      </div>

      <div className="mt-3"><TurnBanner phase={phase} round={round} rounds={total} opponent={oppName} /></div>

      {/* the courtroom: you, the bench, opposing counsel */}
      <div className="scroll-soft mt-3 grid min-h-0 flex-1 gap-3 overflow-y-auto lg:grid-cols-[1fr_360px_1fr] lg:gap-4 lg:overflow-visible">
        <Party label="You" name={youAre} text={youNow || voice.partial} live={!!voice.partial && !youNow} tone="you" />

        <div className="card flex min-h-0 flex-col items-center overflow-hidden bg-gradient-to-b from-lav/60 via-white/80 to-white p-4 text-center">
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted"><span className="font-deva text-sm normal-case tracking-normal text-ink">न्यायाधीश</span> · The bench</div>
          <div className="scroll-soft mt-2 min-h-0 w-full flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.p key={bench.text} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-[15px] leading-relaxed text-ink">
                {phase === 'bench' && !bench.text ? 'Considering…' : <Streamed text={bench.text} voiced={canTalk} reveal={voice.reveal} />}
              </motion.p>
            </AnimatePresence>
          </div>
          {bench.flags?.map((f, i) => f.type === 'old_citation' && (
            <span key={i} className="mt-1 rounded-full bg-warn/10 px-3 py-1 text-xs font-medium text-warn">{f.old} → {f.new}</span>
          ))}
          <div className="mt-2 shrink-0"><MicOrb voice={voice} on={micOn} onToggle={() => setMicOn((v) => !v)} disabled={!canTalk || phase === 'done'} label={micLabel} tone={micTone} size={bench.scores ? 92 : 124} /></div>
          <div className="w-full shrink-0 text-left"><ScoreBars scores={bench.scores} /></div>
        </div>

        <Party label="Opposing counsel" name={oppName} text={oppNow} waiting={phase === 'opponent'} tone="them" voiced={canTalk} reveal={voice.reveal} />
      </div>

      {/* type instead of speaking */}
      <form className="card relative mt-3 flex gap-2 p-2.5" onSubmit={(e) => { e.preventDefault(); const v = text.trim(); if (v && phase === 'you') { setText(''); onPartial(v, 0).then((took) => { if (!took) onTurn(v) }) } }}>
        <input value={text} onChange={(e) => setText(e.target.value)} disabled={phase !== 'you'} placeholder={phase !== 'you' ? 'Wait for your turn…' : matter.historic ? 'Type your submission, e.g. "My Lords, Article 368 gives the power to amend, not to destroy…"' : "Type your submission, e.g. 'My Lord, under Section 482 BNSS…'"} className="min-w-0 flex-1 rounded-full bg-transparent px-4 py-2.5 text-[15px] outline-none disabled:opacity-60" />
        <button className="pill pill-dark !px-4" aria-label="Submit" disabled={phase !== 'you'}><Send size={16} /></button>
        {voice.error && <p className="absolute -top-7 left-0 right-0 text-center text-sm text-warn">{voice.error}</p>}
      </form>

      {/* record of proceedings and case file open as a side sheet, so the court never scrolls */}
      <Sheet open={!!sheet} title={sheet === 'record' ? 'Record of proceedings' : 'Case file'} onClose={() => setSheet(null)}>
{sheet === 'record' ? (
            rounds.length ? (
              <div className="mt-4 grid gap-3">
                {rounds.map((r, i) => (
                  <div key={i} className="rounded-2xl bg-canvas p-4">
                    <div className="font-display text-2xl text-muted">Round {i + 1}</div>
                    <div className="mt-2 text-[11px] uppercase tracking-wider text-muted">You · {avg(r.bench.scores.you)}</div><p className="mt-1 text-sm">{r.you}</p>
                    <div className="mt-3 text-[11px] uppercase tracking-wider text-[#b0623a]">Opposing counsel · {avg(r.bench.scores.them)}</div><p className="mt-1 text-sm">{r.opponent}</p>
                    <div className="mt-3 text-[11px] uppercase tracking-wider text-muted">Bench</div><p className="mt-1 text-sm text-ink-2">{r.bench.text}</p>
                  </div>
                ))}
              </div>
            ) : <p className="mt-4 text-sm text-muted">Nothing on record yet. Finish round 1 and it appears here.</p>
          ) : (
            <div className="mt-4 text-sm">
              <div className="font-display text-xl">{matter.title}</div>
              <div className="mt-1 text-muted">{matter.court}</div>
              {me && <><div className="mt-5 font-medium">Your strongest points</div><ul className="mt-2 grid gap-1.5 text-ink-2">{me.key_args.map((f) => <li key={f}>• {f}</li>)}</ul></>}
              <div className="mt-5 font-medium">Facts</div>
              <ul className="mt-2 grid gap-1.5 text-ink-2">{matter.facts.map((f) => <li key={f}>• {f}</li>)}</ul>
              {matter.bench_focus && <><div className="mt-5 font-medium">What the bench will press you on</div><ul className="mt-2 grid gap-1.5 text-ink-2">{matter.bench_focus.map((f) => <li key={f}>• {f}</li>)}</ul></>}
            </div>
          )}
      </Sheet>
    </section>
  )
}

export default function Abhyas({ status, params, onCourt }) {
  const [matter, setMatter] = useState(null)
  const [lang] = useLang()
  const [temperament, setTemperament] = useState('fair')
  const [inCourt, setInCourt] = useState(false)
  const [side, setSide] = useState('petitioner')
  const [locked, setLocked] = useState(false)

  useEffect(() => {
    onCourt?.(locked)
    if (!locked) return
    window.scrollTo(0, 0)
    const root = document.documentElement
    const prev = root.style.overflow
    root.style.overflow = 'hidden'
    return () => { root.style.overflow = prev }
  }, [locked]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => onCourt?.(false), []) // eslint-disable-line react-hooks/exhaustive-deps

  function pick(c) {
    setMatter(c); setSide('petitioner')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div>
      {inCourt && matter ? (
        <div className={`relative wash grain ${locked ? 'h-[100dvh] overflow-hidden' : 'min-h-screen pb-24 pt-28'}`}>
          <div className="rays pointer-events-none absolute -inset-[40%] opacity-80" />
          <div className="relative h-full">
            <Court matter={matter} side={side} lang={lang} temperament={temperament} status={status} onLock={setLocked} onExit={() => { setInCourt(false); setMatter(null) }} />
          </div>
        </div>
      ) : (
      <>
      <LightField className="pb-14 pt-32">
        <div className="mx-auto flex max-w-5xl flex-col items-center px-5 text-center">
          <Reveal text="अभ्यास" className="font-deva text-7xl leading-none sm:text-8xl" />
          <p className="font-display mt-4 max-w-2xl text-2xl text-ink-2 sm:text-3xl">It doesn't argue for you. It argues against you.</p>
          {!status.gnani && <span className="chip mt-5 !py-1.5">Voice is off · typing works</span>}
        </div>
        {(
          <div className="mx-auto mt-10 max-w-6xl px-5">
            <div className="grid overflow-hidden rounded-[28px] bg-[#1d1830] shadow-[0_30px_60px_-30px_rgba(16,24,40,.45)] md:grid-cols-[1.45fr_1fr]">
              <div className="aspect-[4/3]">
                <Scene name="scene-practice" eager alt="A young advocate in a black coat and bands rehearsing at night as a violet voice ribbon rises from his laptop" position="50% 50%" sizes="(max-width: 768px) 100vw, 760px" />
              </div>
              <div className="flex flex-col justify-center bg-gradient-to-br from-[#2a2245] via-[#1d1830] to-[#151224] p-8 text-white sm:p-12">
                <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/50">अभ्यास · Practice</div>
                <div className="font-display mt-4 text-4xl leading-[1.08] sm:text-5xl">2 AM before the hearing.</div>
                <p className="mt-4 max-w-sm text-[16px] leading-relaxed text-white/75">No senior awake to practise with. This bench never sleeps, and it argues back in your language.</p>
                {/* how a hearing runs: three quiet steps instead of tag chips */}
                <ol className="mt-8 border-t border-white/10">
                  {[['१', 'तर्क', 'You argue, by voice or text'], ['२', 'प्रतिवाद', 'Opposing counsel hits back'], ['३', 'निर्णय', 'The bench scores you both']].map(([n, deva, en]) => (
                    <li key={n} className="flex items-baseline gap-4 border-b border-white/10 py-3">
                      <span className="font-deva w-5 text-lg text-[#bdb9f7]">{n}</span>
                      <span className="font-deva w-16 shrink-0 text-[15px] text-white">{deva}</span>
                      <span className="text-[14px] text-white/60">{en}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        )}
      </LightField>

      <AnimatePresence mode="wait">
        {matter ? (
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
              <button className="pill pill-dark mt-8" onClick={() => { window.scrollTo(0, 0); setInCourt(true) }}><Gavel size={16} /> Enter court</button>
            </div>
          </motion.section>
        ) : (
          <motion.div key="pick" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CasePicker onPick={pick} preselect={params?.case} />
          </motion.div>
        )}
      </AnimatePresence>
      </>
      )}
    </div>
  )
}
