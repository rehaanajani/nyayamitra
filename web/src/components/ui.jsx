import { useEffect, useState } from 'react'
import { motion } from 'motion/react'

/** Gnani-style headline: words rise in one by one out of a soft blur. */
export function Reveal({ text, as: Tag = 'h1', className = '', delay = 0, stagger = 0.06 }) {
  const words = text.split(' ')
  return (
    <Tag className={className}>
      {words.map((w, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.7, delay: delay + i * stagger, ease: [0.22, 1, 0.36, 1] }}
        >
          {w}{i < words.length - 1 ? ' ' : ''}
        </motion.span>
      ))}
    </Tag>
  )
}

export function FadeUp({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

/** Light rays + pastel wash, the gnani.ai hero look. */
export function LightField({ className = '', children }) {
  return (
    <div className={`relative overflow-hidden wash grain ${className}`}>
      <div className="rays absolute -inset-[40%] opacity-80" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-canvas" />
      <div className="relative">{children}</div>
    </div>
  )
}

/** Breathing pastel orb that reacts to voice level. */
// Text that arrives word by word as it is spoken. With `voiced`, it follows `reveal` from the
// speaker, sentence by sentence; without a voice it runs on a timer. `live` false shows it whole.
export function Streamed({ text = '', live = true, voiced = false, reveal, onGrow }) {
  const [chars, setChars] = useState(live ? 0 : text.length)
  useEffect(() => { setChars(live ? 0 : text.length) }, [text, live])

  useEffect(() => { // no voice, or the voice never arrived: don't leave the text hidden
    if (!live) return
    let i = 0, t
    const tick = () => { i += 6; setChars((c) => Math.max(c, i)); if (i < text.length) t = setTimeout(tick, 90) }
    t = setTimeout(tick, voiced ? 9000 : 60)
    return () => clearTimeout(t)
  }, [text, live, voiced])

  useEffect(() => { // pace this sentence across its own audio
    if (!live || !voiced || reveal?.text !== text) return
    if (!reveal.seconds) { setChars(text.length); return }
    let raf
    const step = () => {
      const p = Math.min(1, (performance.now() - reveal.at) / (reveal.seconds * 1000))
      setChars((c) => Math.max(c, reveal.from + (reveal.to - reveal.from) * p))
      onGrow?.()
      if (p < 1) raf = requestAnimationFrame(step)
    }
    step()
    return () => cancelAnimationFrame(raf)
  }, [reveal, text, live, voiced]) // eslint-disable-line react-hooks/exhaustive-deps

  // never cut a word in half
  let end = Math.floor(chars)
  if (end < text.length) { const sp = text.lastIndexOf(' ', end); end = sp > 0 ? sp : 0 }
  else end = text.length
  return <>{text.slice(0, end)}{end < text.length && <span className="ml-1 inline-block h-[1em] w-[3px] animate-pulse bg-violet align-[-0.15em]" />}</>
}

export function Orb({ level = 0, active = false, tone = 'calm', size = 220, label }) {
  const scale = 1 + Math.min(level, 1) * 0.28
  const grad = tone === 'bench'
    ? 'conic-gradient(from 210deg, #8981f1, #a2ebfc, #ffd3b7, #e2e0fb, #8981f1)'
    : 'conic-gradient(from 90deg, #a2ebfc, #e2e0fb, #ffd3b7, #bdb9f7, #a2ebfc)'
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <motion.div
        className="absolute inset-0 rounded-full blur-2xl opacity-70"
        style={{ background: grad }}
        animate={{ rotate: 360, scale: active ? scale * 1.08 : 1 }}
        transition={{ rotate: { duration: 18, repeat: Infinity, ease: 'linear' }, scale: { duration: 0.15 } }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{ inset: size * 0.12, background: grad, boxShadow: 'inset 0 0 40px rgba(255,255,255,.75)' }}
        animate={{ rotate: -360, scale: active ? scale : [1, 1.035, 1] }}
        transition={active
          ? { rotate: { duration: 24, repeat: Infinity, ease: 'linear' }, scale: { duration: 0.12 } }
          : { rotate: { duration: 24, repeat: Infinity, ease: 'linear' }, scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' } }}
      />
      <div className="absolute rounded-full bg-white/55 backdrop-blur-md" style={{ inset: size * 0.3 }} />
      {label && <span className="relative font-deva text-2xl text-ink/80">{label}</span>}
    </div>
  )
}

export function SectionLabel({ children }) {
  return <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted">{children}</div>
}
