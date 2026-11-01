import { motion } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'

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
      <div className="relative mx-auto max-w-[1360px] rounded-[32px] bg-ink px-6 pb-8 pt-44 text-white sm:rounded-[44px] sm:px-12 sm:pt-52">
        <div className="absolute inset-x-4 -top-32 mx-auto max-w-4xl overflow-hidden rounded-[32px] wash shadow-[0_30px_60px_-20px_rgba(11,11,15,.45)] sm:inset-x-10 sm:-top-36 sm:rounded-[44px]">
          <div className="rays absolute -inset-[40%] opacity-70" />
          <div className="relative flex h-60 flex-col items-center justify-center px-6 text-center sm:h-72">
            <div className="font-deva text-4xl text-ink sm:text-6xl">न्याय सबका है।</div>
            <div className="font-display mt-2 text-lg text-ink-2 sm:text-2xl">Justice should speak your language.</div>
          </div>
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
