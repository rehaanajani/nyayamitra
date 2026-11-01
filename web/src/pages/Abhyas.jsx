import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, Gavel, Landmark, Mic, MicOff, Plus, Scale, Send, Square, Timer } from 'lucide-react'
import { api } from '../lib/api'
import useVoice from '../lib/useVoice'
import { FadeUp, LightField, Orb, Reveal, SectionLabel } from '../components/ui'
import LanguageMenu from '../components/LanguageMenu'
import { langInfo, useLang } from '../lib/lang'
import Transcript from '../components/Transcript'
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

function Court({ matter, side, lang, temperament, status, onExit }) {
  const [items, setItems] = useState([])
  const [thinking, setThinking] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [debrief, setDebrief] = useState(null)
  const [ending, setEnding] = useState(false)
  const [text, setText] = useState('')
  const itemsRef = useRef(items)
  itemsRef.current = items
  const interjecting = useRef(false)
  const endedRef = useRef(false)
  const turnsRef = useRef(0)
  const canTalk = status.gnani && langInfo(lang).voice
  const rounds = matter.rounds || 5
  const round = Math.min(rounds, items.filter((m) => m.role === 'user' && !m.interrupt).length + 1)
  const me = matter.sides?.[side]
  const youAre = me ? `Counsel for the ${side}, ${me.name}` : matter.you_are

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [])

  function speak(text, role) {
    if (canTalk) voice.say(text, { lang, role })
  }

  async function onTurn(userText) {
    setItems((x) => [...x, { role: 'user', text: userText }])
    setThinking(true)
    try {
      const r = await api('/api/abhyas/turn', { case_id: matter.id, side, lang, temperament, text: userText, history: itemsRef.current })
      setItems((x) => [...x, { role: r.speaker, text: r.text, flags: r.flags }])
      speak(r.text, r.speaker)
      // after the last round, let the reply land, then deliver the verdict
      turnsRef.current += 1
      if (turnsRef.current >= rounds) setTimeout(() => end(), canTalk ? 6000 : 1800)
    } catch (e) { voice.setError(e.message) }
    setThinking(false)
  }

  async function onPartial(partial, secs) {
    if (interjecting.current) return false
    const r = await api('/api/abhyas/interject', { case_id: matter.id, lang, partial, seconds: secs }).catch(() => null)
    if (!r?.interjection) return false
    interjecting.current = true
    const j = r.interjection
    setItems((x) => [...x, { role: 'user', text: partial, interrupt: true }, { role: 'judge', text: j.text, flags: j.flags }])
    speak(j.text, 'judge')
    setTimeout(() => { interjecting.current = false }, 1500)
    return true
  }

  const voice = useVoice({ lang, onTurn, onPartial })

  useEffect(() => {
    api(`/api/abhyas/opening?lang=${lang}`).then(async (o) => {
      setItems([{ role: 'judge', text: o.text }])
      if (canTalk) { await voice.start(); speak(o.text, 'judge') }
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function end() {
    if (endedRef.current) return
    endedRef.current = true
    setEnding(true)
    voice.stop(); voice.stopSpeaking()
    try { setDebrief(await api('/api/abhyas/debrief', { case_id: matter.id, side, lang, history: itemsRef.current })) } catch (e) { voice.setError(e.message) }
    setEnding(false)
  }

  if (debrief) return <Nirnay result={debrief} matter={matter} onAgain={onExit} seconds={seconds} />

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')
  const lastBench = [...items].reverse().find((m) => m.role !== 'user')

  return (
    <section className="mx-auto grid max-w-6xl gap-6 px-5 pb-20 lg:grid-cols-[360px_1fr]">
      <div className="flex flex-col gap-5">
        <div className="card p-6">
          <button onClick={onExit} className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-ink"><ArrowLeft size={14} /> Matters</button>
          <div className="font-display text-2xl leading-snug">{matter.title}</div>
          <div className="mt-1 text-sm text-muted">{matter.court}</div>
          <div className="mt-4 text-sm"><span className="text-muted">You are:</span> {youAre}</div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-muted"><span>Round {round} of {rounds}</span><span>{Math.max(0, rounds - round)} left</span></div>
            <div className="mt-1.5 flex gap-1">{Array.from({ length: rounds }).map((_, i) => <span key={i} className={`h-1.5 flex-1 rounded-full ${i < round ? 'bg-ink' : 'bg-line'}`} />)}</div>
          </div>
          {me && (
            <details className="mt-4 text-sm" open>
              <summary className="cursor-pointer font-medium">Your strongest points</summary>
              <ul className="mt-2 grid gap-1.5 text-ink-2">{me.key_args.map((f) => <li key={f}>• {f}</li>)}</ul>
            </details>
          )}
          <details className="mt-4 text-sm">
            <summary className="cursor-pointer font-medium">Case file</summary>
            <ul className="mt-2 grid gap-1.5 text-ink-2">{matter.facts.map((f) => <li key={f}>• {f}</li>)}</ul>
          </details>
        </div>
        <div className="card flex flex-col items-center gap-4 p-6">
          <Orb tone="bench" level={voice.speaking ? voice.outLevel : voice.micLevel * 0.6} active={voice.speaking || voice.listening} size={190} label={voice.speaking ? (lastBench?.role === 'opponent' ? 'प्रतिवाद' : 'न्यायाधीश') : ''} />
          <div className="flex items-center gap-2 text-sm text-muted"><Timer size={14} /> {mm}:{ss}</div>
          <div className="flex flex-wrap justify-center gap-2">
            {voice.listening ? (
              <button className="pill pill-light" onClick={voice.stop}><MicOff size={16} /> Mute</button>
            ) : (
              <button className="pill pill-light" onClick={voice.start} disabled={!canTalk}><Mic size={16} /> Mic</button>
            )}
            <button className="pill pill-dark" onClick={end} disabled={ending}><Square size={14} /> {ending ? 'Judging…' : 'End hearing'}</button>
          </div>
          {voice.error && <p className="text-center text-sm text-warn">{voice.error}</p>}
          <p className="text-center text-xs text-muted">{matter.historic ? 'Opposing counsel answers each submission and the bench presses you.' : 'The bench will cut you off for repealed sections or long speeches. You can cut it off too.'}</p>
        </div>
      </div>

      <div className="card flex h-[640px] flex-col p-5">
        <Transcript items={items} partial={voice.partial} className="flex-1 px-1" />
        {thinking && <div className="px-2 py-2 text-sm text-muted">The bench is considering…</div>}
        <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); const v = text.trim(); if (v) { setText(''); onPartial(v, 0).then((took) => { if (!took) onTurn(v) }) } }}>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder={matter.historic ? 'Type your submission, e.g. "My Lords, Article 368 gives the power to amend, not to destroy…"' : "Type your submission, e.g. 'My Lord, under Section 438 CrPC…'"} className="flex-1 rounded-full border border-line bg-white px-5 py-3 text-[15px] outline-none focus:border-violet" />
          <button className="pill pill-dark !px-4" aria-label="Send"><Send size={16} /></button>
        </form>
      </div>
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
            <div className="relative h-[300px] overflow-hidden rounded-[28px] shadow-[0_30px_60px_-30px_rgba(16,24,40,.45)] sm:h-[420px]">
              <Scene name="scene-practice" eager alt="A young advocate in a black coat and bands rehearsing at night, a violet voice ribbon rising from his laptop" position="50% 22%" />
              <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_100%_0%,rgba(11,11,15,.72)_0%,rgba(11,11,15,.35)_38%,transparent_62%)]" />
              <div className="absolute right-6 top-6 max-w-sm text-right text-white sm:right-10 sm:top-9">
                <div className="font-display text-3xl leading-tight sm:text-[40px]">2 AM before the hearing.</div>
                <div className="mt-2 text-[15px] text-white/85">No senior awake to practise with. This bench never sleeps.</div>
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
