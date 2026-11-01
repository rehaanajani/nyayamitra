import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'

const WHO = {
  user: { label: 'You', cls: 'ml-auto bg-ink text-white rounded-br-md' },
  sahay: { label: 'सहाय', cls: 'bg-white border border-line rounded-bl-md' },
  judge: { label: 'Bench', cls: 'bg-gradient-to-br from-lav to-white border border-line rounded-bl-md' },
  opponent: { label: 'Opposing counsel', cls: 'bg-gradient-to-br from-peach/70 to-white border border-line rounded-bl-md' },
}

export default function Transcript({ items, partial, className = '' }) {
  const end = useRef(null)
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }) }, [items.length, partial])

  return (
    <div className={`flex flex-col gap-3 overflow-y-auto scroll-soft ${className}`}>
      <AnimatePresence initial={false}>
        {items.map((m, i) => {
          const w = WHO[m.role] || WHO.sahay
          return (
            <motion.div
              key={i}
              layout
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`max-w-[85%] rounded-3xl px-5 py-3 ${w.cls} ${m.role === 'user' ? '' : 'mr-auto'}`}
            >
              <div className={`mb-0.5 text-[11px] font-medium uppercase tracking-wider ${m.role === 'user' ? 'text-white/60' : 'text-muted'}`}>
                {w.label}{m.interrupt ? ' · interrupted' : ''}
              </div>
              <div className="text-[15px] leading-relaxed">{m.text}</div>
              {m.flags?.map((f, j) => f.type === 'old_citation' && (
                <div key={j} className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-warn/10 px-2.5 py-1 text-xs font-medium text-warn">
                  {f.old} → {f.new}
                </div>
              ))}
            </motion.div>
          )
        })}
      </AnimatePresence>
      {partial && (
        <div className="ml-auto max-w-[85%] rounded-3xl rounded-br-md border border-dashed border-ink/30 px-5 py-3 text-[15px] text-ink-2">
          {partial}<span className="ml-1 inline-block h-4 w-1 animate-pulse bg-ink/40 align-middle" />
        </div>
      )}
      <div ref={end} />
    </div>
  )
}
