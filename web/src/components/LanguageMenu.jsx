import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Check, ChevronDown, Globe, Mic } from 'lucide-react'
import { LANGUAGES, langInfo, useLang } from '../lib/lang'

export default function LanguageMenu({ align = 'right' }) {
  const [lang, setLang] = useLang()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const current = langInfo(lang)

  useEffect(() => {
    if (!open) return
    const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    const esc = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', esc) }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-ink-2 transition hover:bg-canvas hover:text-ink"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Globe size={16} />
        <span className="max-w-[7rem] truncate">{current.name}</span>
        <ChevronDown size={14} className={`transition ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className={`absolute top-full z-50 mt-2 w-[min(92vw,26rem)] rounded-3xl border border-line bg-white p-2 shadow-[0_24px_60px_-20px_rgba(16,24,40,.35)] ${align === 'right' ? 'right-0' : 'left-0'}`}
            role="listbox"
          >
            <div className="flex items-center justify-between px-3 pb-2 pt-2 text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
              <span>Language · भाषा</span>
              <span className="inline-flex items-center gap-1 normal-case tracking-normal"><Mic size={12} /> voice in all</span>
            </div>
            <div className="grid max-h-[60vh] grid-cols-2 gap-1 overflow-y-auto scroll-soft">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  role="option"
                  aria-selected={l.code === lang}
                  onClick={() => { setLang(l.code); setOpen(false) }}
                  className={`flex items-center gap-2 rounded-2xl px-3 py-2.5 text-left transition ${l.code === lang ? 'bg-ink text-white' : 'hover:bg-canvas'}`}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] leading-tight" dir={l.rtl ? 'rtl' : undefined}>{l.name}</span>
                    <span className={`block text-xs ${l.code === lang ? 'text-white/60' : 'text-muted'}`}>{l.english}</span>
                  </span>
                  {l.code === lang && <Check size={14} />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
