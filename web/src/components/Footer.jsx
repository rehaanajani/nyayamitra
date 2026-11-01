import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'

/** Peeking character for the footer card; its eyes follow the cursor.
 *  Placeholder until the mascot is designed. */
function Peeker() {
  const ref = useRef(null)
  const [eye, setEye] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const on = (e) => {
      const r = ref.current?.getBoundingClientRect()
      if (!r) return
      const dx = e.clientX - (r.left + r.width / 2)
      const dy = e.clientY - (r.top + r.height / 3)
      const d = Math.hypot(dx, dy) || 1
      setEye({ x: (dx / d) * Math.min(7, d / 40), y: (dy / d) * Math.min(6, d / 40) })
    }
    window.addEventListener('pointermove', on)
    return () => window.removeEventListener('pointermove', on)
  }, [])

  return (
    <motion.div
      ref={ref}
      className="absolute bottom-0 left-1/2 h-36 w-52 -translate-x-1/2 sm:h-44 sm:w-64"
      initial={{ y: 60 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true }}
      transition={{ type: 'spring', bounce: 0.35, duration: 1 }}
    >
      <div className="absolute inset-0 rounded-t-full bg-white shadow-[inset_0_-20px_40px_rgba(137,129,241,.15)]" />
      {[-1, 1].map((s) => (
        <div key={s} className="absolute top-[34%] h-12 w-9 rounded-full bg-ink sm:h-14 sm:w-10" style={{ left: `calc(50% + ${s * 34}px - 18px)` }}>
          <motion.div className="absolute left-1/2 top-1/3 h-3 w-3 rounded-full bg-white" animate={{ x: eye.x - 6, y: eye.y }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} />
        </div>
      ))}
      <div className="absolute left-1/2 top-[66%] h-3 w-8 -translate-x-1/2 rounded-b-full border-b-[3px] border-ink" />
      <motion.div className="absolute -right-16 top-10 rounded-full rounded-bl-sm bg-ink px-3 py-1.5 text-sm text-white" animate={{ rotate: [-4, 4, -4] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}>
        <span className="font-deva">नमस्ते!</span>
      </motion.div>
    </motion.div>
  )
}

const COLUMNS = [
  {
    title: 'Doors',
    links: [['सहाय · Get help', '#/sahay'], ['अभ्यास · Practise', '#/abhyas'], ['Bring your own case', '#/abhyas']],
  },
  {
    title: 'Helplines',
    links: [['112 · Emergency', 'tel:112'], ['15100 · Free legal aid', 'tel:15100'], ['1930 · Cyber fraud', 'tel:1930'], ['1915 · Consumer', 'tel:1915']],
  },
  {
    title: 'Project',
    links: [['GitHub', 'https://github.com/rehaanajani/nyayamitra'], ['Gnani AI', 'https://www.gnani.ai'], ['MIT licence', 'https://github.com/rehaanajani/nyayamitra/blob/main/LICENSE']],
  },
]

export default function Footer() {
  return (
    <footer className="px-3 pb-3 pt-44 sm:px-5 sm:pb-5">
      <div className="relative mx-auto max-w-[1360px] rounded-[32px] bg-ink px-6 pb-8 pt-56 text-white sm:rounded-[44px] sm:px-12 sm:pt-64">
        <div className="absolute inset-x-4 -top-32 mx-auto max-w-4xl overflow-hidden rounded-[32px] wash shadow-[0_30px_60px_-20px_rgba(11,11,15,.45)] sm:inset-x-10 sm:-top-36 sm:rounded-[44px]">
          <div className="rays absolute -inset-[40%] opacity-70" />
          <div className="relative flex h-80 flex-col items-center px-6 pt-9 text-center sm:h-[22rem] sm:pt-10">
            <div className="font-deva text-4xl text-ink sm:text-6xl">न्याय सबका है।</div>
            <div className="font-display mt-2 text-lg text-ink-2 sm:text-2xl">Justice should speak your language.</div>
          </div>
          <Peeker />
        </div>

        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="font-deva text-3xl">न्यायमित्र</div>
            <p className="mt-3 max-w-xs text-sm text-white/60">
              A friend in court, whichever side of it you're on. Legal help and courtroom practice in Hindi, Tamil and English, by voice.
            </p>
            <p className="mt-5 text-xs text-white/40">Built on Gnani Prisma · Timbre · Evon</p>
          </div>
          {COLUMNS.map((c) => (
            <div key={c.title}>
              <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/40">{c.title}</div>
              <ul className="mt-4 grid gap-3 text-sm">
                {c.links.map(([label, href]) => (
                  <li key={label}>
                    <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="group inline-flex items-center gap-1 text-white/80 transition hover:text-white">
                      {label}
                      {href.startsWith('http') && <ArrowUpRight size={13} className="opacity-50 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <span>Legal information, not legal advice. In danger, call 112.</span>
          <span>© 2026 Rehaan Ajani · #GreatIndianAIInternshipChallenge</span>
        </div>
      </div>
    </footer>
  )
}
