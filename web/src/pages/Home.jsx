import { motion } from 'motion/react'
import { ArrowRight, AudioLines, Gavel, PhoneCall, ScrollText, ShieldCheck } from 'lucide-react'
import { FadeUp, LightField, Reveal, SectionLabel } from '../components/ui'

const DOORS = [
  {
    href: '#/sahay',
    deva: 'सहाय',
    roman: 'Sahāya',
    who: 'I need help',
    line: 'Salary stuck, deposit gone, police won\'t file an FIR, money lost to a scam. Say it in your own words and language.',
    points: ['Asks you one thing at a time', 'Where to go, what to carry, the deadline', 'Drafts your notice or complaint', 'Free legal aid, 15100'],
    icon: PhoneCall,
    tint: 'from-cyan/70 via-white to-lav/80',
  },
  {
    href: '#/abhyas',
    deva: 'अभ्यास',
    roman: 'Abhyāsa',
    who: 'I\'m a lawyer',
    line: 'Argue in front of a district bench that cuts you off, in Hindi, Tamil or English, the way real courts do.',
    points: ['Judge interrupts mid-argument', 'Catches repealed IPC/CrPC citations', 'Opposing counsel rebuts you', 'Scorecard after every round'],
    icon: Gavel,
    tint: 'from-lav/80 via-white to-peach/80',
  },
]

const DIFFERENT = [
  { icon: AudioLines, title: 'Your court\'s language', body: 'Lower courts run in Hindi, Tamil and everything in between. Prisma hears code-mixed speech; Timbre answers in it.' },
  { icon: ShieldCheck, title: 'Law from a checked book', body: 'The model listens and asks. The routes, sections and deadlines come from a vetted knowledge base, never from its memory.' },
  { icon: ScrollText, title: 'One case, both doors', body: 'A citizen\'s problem becomes a case brief, and the same case becomes a practice hearing for the lawyer who takes it.' },
]

export default function Home() {
  return (
    <>
      <LightField className="pb-24 pt-36 sm:pt-44">
        <div className="mx-auto flex max-w-5xl flex-col items-center px-5 text-center">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="chip mb-8 bg-white/80">
            Built on Gnani Prisma · Timbre · Evon
          </motion.div>
          <Reveal text="न्यायमित्र" className="font-deva text-[clamp(4rem,13vw,9.5rem)] leading-[0.95] text-ink" />
          <Reveal
            as="p"
            text="A friend in court, whichever side of it you're on."
            className="font-display mt-6 max-w-2xl text-[clamp(1.6rem,3.6vw,2.6rem)] leading-tight text-ink"
            delay={0.35}
          />
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 0.8 }} className="mt-5 max-w-xl text-lg text-ink-2">
            Legal help for people who can't afford a lawyer, and courtroom practice for the lawyers who'll stand up for them. In Hindi, Tamil and English, by voice.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, duration: 0.6 }} className="mt-9 flex flex-wrap justify-center gap-3">
            <a href="#/sahay" className="pill pill-dark">मुझे मदद चाहिए · Get help <ArrowRight size={16} /></a>
            <a href="#/abhyas" className="pill pill-light">I'm a lawyer · Practise</a>
          </motion.div>
        </div>
      </LightField>

      <section className="mx-auto -mt-10 grid max-w-6xl gap-5 px-5 md:grid-cols-2">
        {DOORS.map((d, i) => (
          <FadeUp key={d.href} delay={i * 0.1}>
            <a href={d.href} className="group card relative block h-full overflow-hidden p-8 transition hover:-translate-y-1">
              <div className={`absolute inset-0 bg-gradient-to-br ${d.tint} opacity-0 transition duration-500 group-hover:opacity-100`} />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <SectionLabel>{d.who}</SectionLabel>
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-ink text-white transition group-hover:rotate-[-8deg]"><d.icon size={18} /></div>
                </div>
                <div className="mt-6 flex items-baseline gap-3">
                  <span className="font-deva text-6xl leading-none">{d.deva}</span>
                  <span className="font-display text-xl text-muted">{d.roman}</span>
                </div>
                <p className="mt-4 max-w-md text-ink-2">{d.line}</p>
                <ul className="mt-6 grid gap-2 text-sm sm:grid-cols-2">
                  {d.points.map((p) => (
                    <li key={p} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-violet" />{p}</li>
                  ))}
                </ul>
                <div className="mt-8 inline-flex items-center gap-2 text-sm font-medium">
                  Open <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                </div>
              </div>
            </a>
          </FadeUp>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-5 py-28">
        <FadeUp>
          <SectionLabel>Why it's different</SectionLabel>
          <h2 className="font-display mt-3 max-w-3xl text-[clamp(2rem,4.5vw,3.4rem)] leading-tight">
            Law school teaches in English. The district court answers in Tamil.
          </h2>
        </FadeUp>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {DIFFERENT.map((d, i) => (
            <FadeUp key={d.title} delay={i * 0.08}>
              <div className="card h-full p-7">
                <d.icon size={22} className="text-violet-deep" />
                <div className="font-display mt-5 text-2xl">{d.title}</div>
                <p className="mt-2 text-ink-2">{d.body}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <span><span className="font-deva text-ink">न्यायमित्र</span> gives legal information, not legal advice. In danger? Call 112.</span>
          <span>Free legal aid: NALSA 15100 · Cyber fraud: 1930</span>
        </div>
      </footer>
    </>
  )
}
