import { motion } from 'motion/react'
import { RotateCcw, Share2 } from 'lucide-react'
import { SectionLabel } from './ui'

const AXES = [
  { id: 'law', label: 'Law', deva: 'विधि' },
  { id: 'facts', label: 'Facts', deva: 'तथ्य' },
  { id: 'bench_handling', label: 'Bench handling', deva: 'उत्तर' },
  { id: 'delivery', label: 'Delivery', deva: 'वाणी' },
]

/** निर्णय: the debrief after a hearing. */
export default function Nirnay({ result, matter, onAgain, seconds }) {
  const scores = result.scores || {}
  const vals = AXES.map((a) => scores[a.id] ?? 0)
  const overall = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0
  const fillers = Object.entries(result.fillers || {})

  function share() {
    const t = `I argued "${matter.title}" on न्यायमित्र and scored ${overall}/100. The AI bench caught ${result.old_citations?.length || 0} repealed citation(s). #GnaniAI #GreatIndianAIInternshipChallenge`
    if (navigator.share) navigator.share({ text: t, url: location.origin }).catch(() => {})
    else navigator.clipboard.writeText(`${t} ${location.origin}`)
  }

  return (
    <section className="mx-auto max-w-4xl px-5 pb-24">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden">
        <div className="bg-gradient-to-br from-lav via-white to-peach/70 p-8">
          <div className="flex items-baseline gap-3">
            <span className="font-deva text-5xl">निर्णय</span>
            <span className="font-display text-xl text-muted">Verdict</span>
          </div>
          <div className="mt-6 flex flex-wrap items-end gap-8">
            <div>
              <motion.div className="font-display text-8xl leading-none" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, type: 'spring', bounce: 0.35 }}>
                {overall}
              </motion.div>
              <div className="mt-1 text-sm text-muted">out of 100 · {Math.floor(seconds / 60)}m {seconds % 60}s · {result.turns} submissions</div>
            </div>
            {result.verdict && <p className="font-display max-w-md text-2xl leading-snug">"{result.verdict}"</p>}
          </div>
        </div>

        <div className="grid gap-8 p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            {AXES.map((a, i) => (
              <div key={a.id}>
                <div className="flex items-baseline justify-between text-sm">
                  <span><span className="font-deva text-base">{a.deva}</span> <span className="text-muted">{a.label}</span></span>
                  <span className="font-medium">{scores[a.id] ?? '—'}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-canvas">
                  <motion.div className="h-full rounded-full bg-gradient-to-r from-violet to-royal" initial={{ width: 0 }} animate={{ width: `${scores[a.id] ?? 0}%` }} transition={{ delay: 0.3 + i * 0.1, duration: 0.9, ease: [0.22, 1, 0.36, 1] }} />
                </div>
              </div>
            ))}
          </div>

          {result.notes?.length > 0 && (
            <div>
              <SectionLabel>From the senior's notebook</SectionLabel>
              <ul className="mt-3 grid gap-3">
                {result.notes.map((n, i) => (
                  <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.1 }} className="rounded-2xl bg-canvas p-4 text-[15px]">{n}</motion.li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-line p-4">
              <div className="text-sm font-medium">Repealed sections you cited</div>
              {result.old_citations?.length ? (
                <ul className="mt-2 grid gap-1 text-sm">{result.old_citations.map((c, i) => <li key={i}><s className="text-muted">{c.old}</s> → <b>{c.new}</b> <span className="text-muted">({c.topic})</span></li>)}</ul>
              ) : <p className="mt-2 text-sm text-go">None. Clean citations.</p>}
            </div>
            <div className="rounded-2xl border border-line p-4">
              <div className="text-sm font-medium">Filler words</div>
              {fillers.length ? (
                <div className="mt-2 flex flex-wrap gap-2">{fillers.map(([w, n]) => <span key={w} className="chip">{w} × {n}</span>)}</div>
              ) : <p className="mt-2 text-sm text-go">None caught.</p>}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="pill pill-dark" onClick={onAgain}><RotateCcw size={16} /> Another hearing</button>
            <button className="pill pill-light" onClick={share}><Share2 size={16} /> Share my score</button>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
