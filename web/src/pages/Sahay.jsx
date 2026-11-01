import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { Mic, MicOff, RotateCcw, Send } from 'lucide-react'
import { api } from '../lib/api'
import useVoice from '../lib/useVoice'
import { LightField, Reveal } from '../components/ui'
import Scene from '../components/Scene'
import LanguageMenu from '../components/LanguageMenu'
import { langInfo, useLang } from '../lib/lang'
import Transcript from '../components/Transcript'
import MargCard from '../components/MargCard'

const EXAMPLES = {
  hi: ['मेरे boss ने 3 महीने से salary नहीं दी', 'Landlord deposit वापस नहीं कर रहा', 'UPI से 20 हज़ार कट गए, fraud call था', 'पुलिस FIR नहीं लिख रही'],
  ta: ['மூன்று மாதமாக salary வரவில்லை', 'Landlord deposit திருப்பித் தரவில்லை', 'UPI fraud, 20,000 போய்விட்டது', 'போலீஸ் FIR போட மறுக்கிறார்கள்'],
  en: ['My salary hasn\'t been paid for 3 months', 'Landlord won\'t return my deposit', 'I lost ₹20,000 to a UPI scam call', 'Police refused to file my FIR'],
}

const ORB_LABEL = {
  hi: ['बोल रही हूँ', 'सुन रही हूँ'],
  ta: ['பேசுகிறேன்', 'கேட்கிறேன்'],
  en: ['Speaking', 'Listening'],
}

export default function Sahay({ status }) {
  const [lang] = useLang()
  const canTalk = status.gnani && langInfo(lang).voice
  const [items, setItems] = useState([])
  const [state, setState] = useState({})
  const [card, setCard] = useState(null)
  const [text, setText] = useState('')
  const [thinking, setThinking] = useState(false)
  const stateRef = useRef(state)
  stateRef.current = state
  const itemsRef = useRef(items)
  itemsRef.current = items
  const cardRef = useRef(null)

  async function handleTurn(userText) {
    setItems((x) => [...x, { role: 'user', text: userText }])
    setThinking(true)
    try {
      const r = await api('/api/sahay/turn', { lang, text: userText, state: stateRef.current, history: itemsRef.current })
      setState(r.state)
      setItems((x) => [...x, { role: 'sahay', text: r.reply }])
      if (r.card) {
        setCard({ ...r.card, factMap: r.state.facts })
        setTimeout(() => cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 400)
      }
      if (canTalk) voice.say(r.reply, { lang, role: 'sahay' })
    } catch (e) {
      voice.setError(e.message)
    } finally {
      setThinking(false)
    }
  }

  const voice = useVoice({ lang, onTurn: handleTurn })

  async function begin() {
    const g = await api(`/api/sahay/greeting?lang=${lang}`)
    setItems([{ role: 'sahay', text: g.reply }])
    if (canTalk) {
      await voice.start()
      voice.say(g.reply, { lang, role: 'sahay' })
    }
  }

  function reset() {
    voice.stop(); voice.stopSpeaking()
    setItems([]); setState({}); setCard(null); setText('')
  }

  useEffect(() => { reset() }, [lang]) // eslint-disable-line react-hooks/exhaustive-deps

  function sendText(t) {
    const v = (t ?? text).trim()
    if (!v) return
    setText('')
    if (!items.length) {
      api(`/api/sahay/greeting?lang=${lang}`).then((g) => setItems([{ role: 'sahay', text: g.reply }])).then(() => handleTurn(v))
    } else handleTurn(v)
  }

  const started = items.length > 0
  const orbLevel = voice.speaking ? voice.outLevel : voice.micLevel

  return (
    <div>
      <LightField className="pb-16 pt-32">
        <div className="mx-auto max-w-5xl px-5">
          <div className="flex flex-col items-center text-center">
            <Reveal text="सहाय" className="font-deva text-7xl leading-none sm:text-8xl" />
            <p className="font-display mt-4 text-2xl text-ink-2 sm:text-3xl">Tell me what happened. In your words, in your language.</p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-line bg-white/80 py-1 pl-4 pr-1 text-sm text-ink-2">Speaking in <LanguageMenu align="left" /></div>
          </div>

          <div className="mt-10 grid items-start gap-8 lg:grid-cols-[340px_1fr]">
            <div className="flex flex-col items-center gap-5">
              <div className="relative grid w-[320px] place-items-center">
                {/* soft glow that pulses with the voice behind Mitra */}
                <motion.div
                  className="absolute bottom-6 h-60 w-60 rounded-full blur-2xl"
                  style={{ background: 'conic-gradient(from 90deg, #a2ebfc, #e2e0fb, #ffd3b7, #bdb9f7, #a2ebfc)' }}
                  animate={{ scale: 1 + orbLevel * 0.45, opacity: voice.listening || voice.speaking ? 0.95 : 0.6 }}
                  transition={{ duration: 0.15 }}
                />
                <img
                  src="/brand/mitra.webp"
                  alt="Mitra, a friendly lion in an advocate's coat, holding the Constitution of India"
                  className="relative w-[310px]"
                  style={{ WebkitMaskImage: 'linear-gradient(to bottom, #000 80%, transparent 100%)', maskImage: 'linear-gradient(to bottom, #000 80%, transparent 100%)' }}
                />
                <div className="relative h-5 text-sm text-muted">
                  {voice.speaking ? (ORB_LABEL[lang] || ORB_LABEL.en)[0] : voice.listening ? (ORB_LABEL[lang] || ORB_LABEL.en)[1] : ''}
                </div>
              </div>
              {!canTalk && (
                <span className="chip !py-1.5">{status.gnani ? `Voice isn't available in ${langInfo(lang).english} yet · type below` : 'Voice is off · typing works'}</span>
              )}
              <div className="flex gap-3">
                {!started ? (
                  <button className="pill pill-dark" onClick={begin} disabled={!canTalk}><Mic size={16} /> Start talking</button>
                ) : voice.listening ? (
                  <button className="pill pill-dark" onClick={voice.stop}><MicOff size={16} /> Stop mic</button>
                ) : (
                  <button className="pill pill-dark" onClick={voice.start} disabled={!canTalk}><Mic size={16} /> Resume mic</button>
                )}
                {started && <button className="pill pill-light" onClick={reset}><RotateCcw size={16} /> New</button>}
              </div>
              {voice.error && <p className="max-w-xs text-center text-sm text-warn">{voice.error}</p>}
              <p className="max-w-xs text-center text-xs text-muted">Talk over her any time and she'll stop and listen. If you're in danger, call 112.</p>
            </div>

            <div className="card flex h-[520px] flex-col p-5">
              {!started ? (
                <div className="flex flex-1 flex-col justify-center gap-3 p-4">
                  <div className="text-sm text-muted">Try saying or typing:</div>
                  {(EXAMPLES[lang] || EXAMPLES.en).map((e) => (
                    <button key={e} onClick={() => sendText(e)} className="rounded-2xl border border-line bg-white px-4 py-3 text-left transition hover:border-ink">{e}</button>
                  ))}
                </div>
              ) : (
                <Transcript items={items} partial={voice.partial} className="flex-1 px-1" />
              )}
              {thinking && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-1 px-2 py-2">
                  {[0, 1, 2].map((i) => <motion.span key={i} className="h-2 w-2 rounded-full bg-violet" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.12 }} />)}
                </motion.div>
              )}
              <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); sendText() }}>
                <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Or type here…" className="flex-1 rounded-full border border-line bg-white px-5 py-3 text-[15px] outline-none focus:border-violet" />
                <button className="pill pill-dark !px-4" aria-label="Send"><Send size={16} /></button>
              </form>
            </div>
          </div>
        </div>
      </LightField>

      {card && (
        <section ref={cardRef} className="mx-auto max-w-4xl scroll-mt-24 px-5 pb-24">
          <MargCard card={card} lang={lang} />
          <div className="relative mt-6 h-64 overflow-hidden rounded-[24px] sm:h-72">
            <Scene name="scene-legal-aid" alt="A woman meeting a legal-aid advocate across a desk in a sunlit office" position="45% 45%" sizes="(max-width: 900px) 100vw, 900px" />
            <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/50 to-transparent" />
            <div className="absolute left-6 top-1/2 max-w-xs -translate-y-1/2 sm:left-10">
              <div className="font-display text-2xl leading-tight">You don't have to do this alone.</div>
              <p className="mt-2 text-sm text-ink-2">Your District Legal Services Authority gives a free lawyer to eligible people.</p>
              <a href="tel:15100" className="pill pill-dark mt-4 !py-2 text-sm">Call 15100</a>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
