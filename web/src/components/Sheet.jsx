import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import { SectionLabel } from './ui'

/** A side sheet over a one-screen view: the view itself never scrolls. */
export default function Sheet({ open, title, onClose, children }) {
  useEffect(() => {
    if (!open) return
    const esc = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [open, onClose])
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="veil" className="fixed inset-0 z-40 bg-ink/20 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside
            key="sheet"
            className="scroll-soft fixed inset-y-3 right-3 z-50 w-[min(94vw,560px)] overflow-y-auto rounded-[28px] border border-line bg-white p-6 shadow-[0_30px_80px_-20px_rgba(16,24,40,.45)]"
            initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 40, opacity: 0 }} transition={{ duration: 0.25 }}
          >
            <div className="flex items-center justify-between">
              <SectionLabel>{title}</SectionLabel>
              <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full hover:bg-canvas" aria-label="Close"><X size={16} /></button>
            </div>
            <div className="mt-4">{children}</div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
