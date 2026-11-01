import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { Mic, MicOff, RotateCcw, Send } from 'lucide-react'
import { api } from '../lib/api'
import useVoice from '../lib/useVoice'
import { LightField, Reveal } from '../components/ui'
import Mitra from '../components/Mitra'
import { motion as m } from 'motion/react'
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

          <div className="mt-10 grid items-start gap-8 lg:grid-cols-[320px_1fr]">
            <div className="flex flex-col items-center gap-5">
              <div className="relative grid w-[260px] place-items-center pt-4">
                <m.div
                  className="absolute bottom-6 h-44 w-44 rounded-full blur-2xl"
                  style={{ background: 'conic-gradient(from 90deg, #a2ebfc, #e2e0fb, #ffd3b7, #bdb9f7, #a2ebfc)' }}
                  animate={{ scale: 1 + orbLevel * 0.5, opacity: voice.listening || voice.speaking ? 0.9 : 0.55 }}
                  transition={{ duration: 0.15 }}
                />
                <div className="relative" style={{ WebkitMaskImage: 'linear-gradient(to bottom, #000 72%, transparent 100%)', maskImage: 'linear-gradient(to bottom, #000 72%, transparent 100%)' }}>
                  <Mitra width={230} talking={voice.speaking} level={voice.outLevel} listening={voice.listening && !voice.speaking} />
                </div>
                <div className="relative -mt-1 h-5 text-sm text-muted">
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
        </section>
      )}
    </div>
  )
}
