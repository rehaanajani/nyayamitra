import { useState } from 'react'
import { motion } from 'motion/react'
import { AlarmClock, FileText, Gavel, Landmark, Phone, Printer, Scale, Wallet, X } from 'lucide-react'
import { api } from '../lib/api'

/** मार्ग: the path card. Everything here comes from the vetted knowledge base. */
export default function MargCard({ card, lang }) {
  const [draft, setDraft] = useState(null)
  const [drafting, setDrafting] = useState(false)
  const [name, setName] = useState('')

  async function makeDraft() {
    setDrafting(true)
    try { setDraft(await api('/api/sahay/draft', { issue_id: card.issue_id, facts: card.factMap || {}, name, lang })) } catch (e) { setDraft({ title: 'Could not draft', body: e.message }) }
    setDrafting(false)
  }

  const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }

  return (
    <motion.div initial="hidden" animate="show" transition={{ staggerChildren: 0.07 }} className="card overflow-hidden">
      <div className={`p-7 ${card.urgent ? 'bg-gradient-to-br from-peach/80 to-white' : 'bg-gradient-to-br from-cyan/50 via-white to-lav/60'}`}>
        <motion.div variants={item} className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted">
          <span className="font-deva text-base normal-case tracking-normal text-ink">मार्ग</span> Your path
          {!card.reviewed && <span className="chip ml-auto !text-[10px] normal-case tracking-normal">Draft guidance · verify with legal aid</span>}
        </motion.div>
        <motion.h3 variants={item} className="font-display mt-3 text-3xl leading-tight">{card.title}</motion.h3>
        <motion.div variants={item} className="mt-3 flex items-start gap-2 text-ink-2"><Landmark size={18} className="mt-0.5 shrink-0" />{card.forum}</motion.div>
      </div>

      <div className="grid gap-6 p-7">
        <motion.ol variants={item} className="grid gap-3">
          {card.steps.map((s, i) => (
            <li key={i} className="flex gap-4">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink text-xs font-medium text-white">{i + 1}</span>
              <span className="text-[15px] leading-relaxed">{s}</span>
            </li>
          ))}
        </motion.ol>

        <motion.div variants={item} className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-canvas p-4">
            <div className="flex items-center gap-2 text-sm font-medium"><FileText size={16} /> Carry these</div>
            <ul className="mt-2 grid gap-1 text-sm text-ink-2">{card.documents.map((d) => <li key={d}>• {d}</li>)}</ul>
          </div>
          <div className="grid gap-4">
            <div className="rounded-2xl bg-cream p-4">
              <div className="flex items-center gap-2 text-sm font-medium"><AlarmClock size={16} /> Deadline</div>
              <p className="mt-1 text-sm text-ink-2">{card.deadline}</p>
            </div>
            <div className="rounded-2xl bg-canvas p-4">
              <div className="flex items-center gap-2 text-sm font-medium"><Wallet size={16} /> Cost</div>
              <p className="mt-1 text-sm text-ink-2">{card.cost}</p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="flex flex-wrap gap-2">
          {card.helplines.map((h) => (
            <a key={h.id} href={`tel:${h.number}`} className="chip !py-1.5 hover:border-ink"><Phone size={13} /> {h.number} · {h.label}</a>
          ))}
        </motion.div>

        <motion.div variants={item} className="rounded-2xl border border-line p-4">
          <div className="flex items-center gap-2 text-sm font-medium"><Scale size={16} /> {card.legal_aid.title}</div>
          <p className="mt-1 text-sm text-ink-2">{card.legal_aid.body}</p>
        </motion.div>

        <motion.div variants={item} className="flex flex-wrap items-center gap-3">
          {card.draft && (
            <>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name for the letter" className="rounded-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-violet" />
              <button className="pill pill-dark" onClick={makeDraft} disabled={drafting}>
                <span className="font-deva">लेख</span> {drafting ? 'Drafting…' : 'Draft my letter'}
              </button>
            </>
          )}
          {card.practice_case && (
            <a className="pill pill-light" href={`#/abhyas?case=${card.practice_case}`}><Gavel size={16} /> Practise this hearing</a>
          )}
        </motion.div>
      </div>

      {draft && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/30 p-4 backdrop-blur-sm" onClick={() => setDraft(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="printable card max-h-[85vh] w-full max-w-2xl overflow-y-auto bg-white p-8 scroll-soft" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2">
              <span className="font-deva text-xl">लेख</span>
              <span className="text-sm text-muted">{draft.title}</span>
              <div className="ml-auto flex gap-2 print:hidden">
                <button className="pill pill-light !py-2" onClick={() => navigator.clipboard.writeText(draft.body)}>Copy</button>
                <button className="pill pill-dark !py-2" onClick={() => window.print()}><Printer size={15} /> PDF</button>
                <button className="rounded-full p-2 hover:bg-canvas" onClick={() => setDraft(null)}><X size={18} /></button>
              </div>
            </div>
            <pre className="mt-6 whitespace-pre-wrap font-sans text-[15px] leading-relaxed">{draft.body}</pre>
            <p className="mt-6 text-xs text-muted print:hidden">A starting draft, not legal advice. Fill the [brackets] and have it checked by a legal-aid lawyer (15100) before sending.</p>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
