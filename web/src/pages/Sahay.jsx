import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { Map, RotateCcw, Send } from 'lucide-react'
import { api } from '../lib/api'
import useVoice from '../lib/useVoice'
import { langInfo, useLang } from '../lib/lang'
import Transcript from '../components/Transcript'
import MargCard from '../components/MargCard'
import MicOrb from '../components/MicOrb'
import Sheet from '../components/Sheet'

const EXAMPLES = {
  hi: ['मेरे boss ने 3 महीने से salary नहीं दी', 'Landlord deposit वापस नहीं कर रहा', 'UPI से 20 हज़ार कट गए, fraud call था', 'पुलिस FIR नहीं लिख रही'],
  ta: ['மூன்று மாதமாக salary வரவில்லை', 'Landlord deposit திருப்பித் தரவில்லை', 'UPI fraud, 20,000 போய்விட்டது', 'போலீஸ் FIR போட மறுக்கிறார்கள்'],
  en: ['My salary hasn\'t been paid for 3 months', 'Landlord won\'t return my deposit', 'I lost ₹20,000 to a UPI scam call', 'Police refused to file my FIR'],
}

const LABELS = {
  hi: { off: 'बोलने के लिए रिंग दबाएँ', listen: 'सुन रही हूँ · बोलिए', heard: 'सुन रही हूँ · रुकें या Done दबाएँ', speak: 'सहाय बोल रही है · बीच में बोल सकते हैं', think: 'सोच रही हूँ…' },
  en: { off: 'Tap the ring to talk', listen: 'Listening · speak now', heard: 'Listening · pause or tap Done', speak: 'Sahay is speaking · talk to interrupt', think: 'Thinking…' },
}

export default function Sahay({ status }) {
  const [lang] = useLang()
  const canTalk = status.gnani && langInfo(lang).voice
  const [items, setItems] = useState([])
  const [state, setState] = useState({})
  const [card, setCard] = useState(null)
  const [showCard, setShowCard] = useState(false)
  const [text, setText] = useState('')
  const [thinking, setThinking] = useState(false)
  const [micOn, setMicOn] = useState(false)
  const stateRef = useRef(state)
  stateRef.current = state
  const itemsRef = useRef(items)
  itemsRef.current = items

  // one screen, like the courtroom: the page never scrolls
  useEffect(() => {
    window.scrollTo(0, 0)
    const root = document.documentElement
    const prev = root.style.overflow
    root.style.overflow = 'hidden'
    return () => { root.style.overflow = prev }
  }, [])

  async function handleTurn(userText) {
    setItems((x) => [...x, { role: 'user', text: userText }])
    setThinking(true)
    try {
      const r = await api('/api/sahay/turn', { lang, text: userText, state: stateRef.current, history: itemsRef.current })
      setState(r.state)
      setItems((x) => [...x, { role: 'sahay', text: r.reply }])
      if (r.card) {
        setCard({ ...r.card, factMap: r.state.facts })
        setTimeout(() => setShowCard(true), 600)
      }
      if (canTalk) voice.say(r.reply, { lang, role: 'sahay' })
    } catch (e) {
      voice.setError(e.message)
    } finally {
      setThinking(false)
    }
  }

  const voice = useVoice({ lang, onTurn: handleTurn })

  async function greet() {
    const g = await api(`/api/sahay/greeting?lang=${lang}`)
    setItems([{ role: 'sahay', text: g.reply }])
    return g.reply
  }

  async function toggleMic() {
    if (micOn) { setMicOn(false); voice.stop(); return }
    setMicOn(true)
    await voice.start()
    if (!items.length) voice.say(await greet(), { lang, role: 'sahay' })
  }

  function reset() {
    voice.pause(); voice.stopSpeaking(); setMicOn(false)
    setItems([]); setState({}); setCard(null); setShowCard(false); setText('')
  }

  useEffect(() => { reset() }, [lang]) // eslint-disable-line react-hooks/exhaustive-deps

  function sendText(t) {
    const v = (t ?? text).trim()
    if (!v) return
    setText('')
    if (!items.length) greet().then(() => handleTurn(v))
    else handleTurn(v)
  }

  const started = items.length > 0
  const L = LABELS[lang] || LABELS.en
  const label = !canTalk ? (status.gnani ? `Voice isn't available in ${langInfo(lang).english} yet · type` : 'Voice is off · typing works')
    : thinking ? L.think
    : voice.speaking ? L.speak
    : !micOn ? L.off
    : voice.partial ? L.heard
    : L.listen
  const tone = voice.speaking || thinking ? 'speak' : micOn ? 'go' : 'wait'

  return (
    <div className="relative h-[100dvh] overflow-hidden wash grain">
      <div className="rays pointer-events-none absolute -inset-[40%] opacity-80" />
      <section className="relative mx-auto flex h-full max-w-[1180px] flex-col px-3 pb-3 pt-[84px] sm:px-5 sm:pb-5">
        {/* top bar */}
        <div className="card flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3">
          <div className="font-deva text-3xl leading-none">सहाय</div>
          <div className="hidden min-w-0 flex-1 truncate text-sm text-muted sm:block">Tell me what happened. In your words, in your language.</div>
          <div className="ml-auto flex items-center gap-2">
            {card && <button className="pill pill-dark !py-2 text-sm" onClick={() => setShowCard(true)}><Map size={14} /> <span className="font-deva">मार्ग</span> Your path</button>}
            {started && <button className="pill pill-light !py-2 text-sm" onClick={reset}><RotateCcw size={14} /> New</button>}
          </div>
        </div>

        <div className="mt-3 grid min-h-0 flex-1 gap-3 lg:grid-cols-[340px_1fr] lg:gap-4">
          {/* the ring: tap to talk, and it always says what's happening */}
          <div className="card flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-lav/60 via-white/80 to-white p-5 text-center">
            <MicOrb voice={voice} on={micOn} onToggle={toggleMic} disabled={!canTalk} label={label} tone={tone} size={190} />
            {voice.error && <p className="max-w-xs text-sm text-warn">{voice.error}</p>}
            <p className="max-w-[16rem] text-xs text-muted">Talk over her any time and she'll stop and listen. If you're in danger, call 112.</p>
          </div>

          {/* the conversation */}
          <div className="card flex min-h-0 flex-col p-4 sm:p-5">
            {!started ? (
              <div className="flex flex-1 flex-col justify-center gap-3 p-2">
                <div className="text-sm text-muted">Try saying or typing:</div>
                {(EXAMPLES[lang] || EXAMPLES.en).map((e) => (
                  <button key={e} onClick={() => sendText(e)} className="rounded-2xl border border-line bg-white px-4 py-3 text-left transition hover:border-ink">{e}</button>
                ))}
              </div>
            ) : (
              <Transcript items={items} partial={voice.partial} className="scroll-soft min-h-0 flex-1 overflow-y-auto px-1" />
            )}
            {thinking && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-1 px-2 py-2">
                {[0, 1, 2].map((i) => <motion.span key={i} className="h-2 w-2 rounded-full bg-violet" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.12 }} />)}
              </motion.div>
            )}
            <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); sendText() }}>
              <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Or type here…" className="min-w-0 flex-1 rounded-full border border-line bg-white px-5 py-3 text-[15px] outline-none focus:border-violet" />
              <button className="pill pill-dark !px-4" aria-label="Send"><Send size={16} /></button>
            </form>
          </div>
        </div>
      </section>

      <Sheet open={showCard && !!card} title="मार्ग · Your path" onClose={() => setShowCard(false)}>
        {card && <MargCard card={card} lang={lang} />}
        <div className="mt-4 rounded-2xl bg-canvas p-5">
          <div className="font-display text-xl">You don't have to do this alone.</div>
          <p className="mt-1 text-sm text-ink-2">Your District Legal Services Authority gives a free lawyer to eligible people.</p>
          <a href="tel:15100" className="pill pill-dark mt-3 !py-2 text-sm">Call 15100</a>
        </div>
      </Sheet>
    </div>
  )
}
