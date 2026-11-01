import { motion } from 'motion/react'
import { AlarmClock, ArrowRight, Landmark, Phone } from 'lucide-react'
import { SectionLabel } from './ui'

// gnani.ai-style sticky stack: each card pins a little lower than the last,
// and shows the real product UI instead of an illustration.
const BACKGROUNDS = [
  'linear-gradient(120deg, #ffffff 0%, #ffffff 42%, #e2e0fb 72%, #bdb9f7 100%)',
  'linear-gradient(115deg, #ffffff 0%, #ffffff 40%, #ffd3b7 80%, #e2e0fb 100%)',
  'linear-gradient(130deg, #a2ebfc 0%, #ffffff 45%, #ffffff 60%, #e2e0fb 100%)',
  'linear-gradient(120deg, #ffffff 0%, #ffffff 45%, #e2e0fb 75%, #ffd3b7 100%)',
  'linear-gradient(125deg, #fcf7f2 0%, #ffffff 40%, #a2ebfc 85%, #bdb9f7 100%)',
]

function Window({ title, children }) {
  return (
    // frosted macOS-style window: the card's gradient glows through the glass
    <div className="w-full max-w-[600px] overflow-hidden rounded-[22px] border border-white/70 bg-white/55 shadow-[0_40px_80px_-30px_rgba(16,24,40,.40),inset_0_1px_0_rgba(255,255,255,.9)] ring-1 ring-ink/5 backdrop-blur-2xl backdrop-saturate-150">
      <div className="flex items-center gap-2 border-b border-white/60 bg-white/40 px-5 py-3.5">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57] shadow-[inset_0_0_0_.5px_rgba(0,0,0,.12)]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e] shadow-[inset_0_0_0_.5px_rgba(0,0,0,.12)]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840] shadow-[inset_0_0_0_.5px_rgba(0,0,0,.12)]" />
        <span className="ml-3 text-[15px] font-medium text-ink-2">{title}</span>
      </div>
      <div className="p-7">{children}</div>
    </div>
  )
}

function Bubble({ who, children, dark, tint }) {
  return (
    <div className={`max-w-[88%] rounded-2xl px-5 py-3 text-[15px] leading-relaxed ${dark ? 'ml-auto rounded-br-md bg-ink text-white' : `mr-auto rounded-bl-md border border-white/70 ${tint || 'bg-white/80'}`}`}>
      <div className={`mb-0.5 text-[11px] font-medium uppercase tracking-wider ${dark ? 'text-white/55' : 'text-muted'}`}>{who}</div>
      {children}
    </div>
  )
}

function Wave() {
  return (
    <div className="flex h-10 items-center gap-[3px]">
      {Array.from({ length: 28 }).map((_, i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full bg-violet"
          animate={{ height: [6, 8 + ((i * 7) % 22), 6] }}
          transition={{ repeat: Infinity, duration: 0.9 + (i % 5) * 0.12, delay: i * 0.03, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

const STEPS = [
  {
    deva: 'सुनना', title: 'It listens the way you talk',
    body: 'Hindi, Tamil, Hinglish, a noisy street, a bad phone line. Gnani Prisma hears it, and सहाय asks one calm question at a time.',
    ui: (
      <Window title="सहाय · call in progress">
        <div className="mb-5 flex items-center gap-3 rounded-xl bg-white/60 px-4 py-2.5"><Phone size={14} className="text-violet-deep" /><Wave /><span className="ml-auto text-[12.5px] text-muted">00:42</span></div>
        <div className="grid gap-2">
          <Bubble who="You" dark>Boss ne teen mahine se salary nahi di, aur ab phone bhi nahi utha raha.</Bubble>
          <Bubble who="सहाय">समझ रही हूँ। कोई proof है? Salary slip, bank credit या WhatsApp messages?</Bubble>
        </div>
      </Window>
    ),
  },
  {
    deva: 'मार्ग', title: 'You get a path, not a lecture',
    body: 'Where to go, what to carry, the deadline, the cost, and the free legal aid number. The law comes from a checked book, never from the model\'s memory.',
    ui: (
      <Window title="मार्ग · your path">
        <div className="font-display text-[28px] leading-snug">Salary or wages not paid</div>
        <div className="mt-1.5 flex items-start gap-2 text-[14px] text-ink-2"><Landmark size={14} className="mt-0.5 shrink-0" />Labour Department of your district</div>
        <ol className="mt-4 grid gap-2.5">
          {['Ask in writing for the exact amount by a date', 'Send a legal notice: pay within 15 days', 'File a wage claim with the Labour Department'].map((s, i) => (
            <li key={s} className="flex gap-3 text-[15px]"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink text-[12.5px] text-white">{i + 1}</span>{s}</li>
          ))}
        </ol>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="chip"><AlarmClock size={12} /> Act quickly</span>
          <span className="chip"><Phone size={12} /> 15100 · free legal aid</span>
        </div>
      </Window>
    ),
  },
  {
    deva: 'लेख', title: 'It drafts the letter for you',
    body: 'A legal notice, a consumer complaint, a complaint to the SP when the police won\'t file an FIR. Print it, sign it, send it.',
    ui: (
      <Window title="लेख · legal notice">
        <div className="space-y-2.5 font-serif text-[14.5px] leading-relaxed text-ink-2">
          <p>To,<br />[Name of the employer]</p>
          <p className="font-medium text-ink">Subject: Legal notice demanding unpaid salary within 15 days</p>
          <p>I, Meena Kumari, was employed with you from March and have not been paid my salary for June, July and August, amounting to ₹54,000…</p>
          <p>You are called upon to pay the said amount within 15 days of receiving this notice, failing which I shall approach the Labour Department…</p>
        </div>
        <div className="mt-4 flex gap-2"><span className="pill pill-dark !px-3 !py-1.5 !text-xs">PDF</span><span className="pill pill-light !px-3 !py-1.5 !text-xs">Copy</span></div>
      </Window>
    ),
  },
  {
    deva: 'अभ्यास', title: 'Lawyers practise against a bench that cuts in',
    body: 'Argue a bail matter in Hindi or a cheque-bounce case in Tamil. Cite a repealed section and the judge stops you mid-sentence, like a real district court.',
    ui: (
      <Window title="अभ्यास · State v. Ravi Kumar">
        <div className="grid gap-2">
          <Bubble who="You · interrupted" dark>My Lord, under Section 438 CrPC the applicant deserves—</Bubble>
          <Bubble who="Bench" tint="bg-gradient-to-br from-lav to-white">
            रुकिए counsel। CrPC 438? वो अब लागू नहीं है। Anticipatory bail के लिए BNSS 482 है।
            <div className="mt-2 inline-flex rounded-full bg-warn/10 px-2.5 py-1 text-[12.5px] font-medium text-warn">CrPC 438 → BNSS 482</div>
          </Bubble>
        </div>
      </Window>
    ),
  },
  {
    deva: 'निर्णय', title: 'And tells you how you did',
    body: 'Law, facts, how you handled the bench, how you sounded. Filler words counted, repealed sections caught, one line you should have said.',
    ui: (
      <Window title="निर्णय · verdict">
        <div className="flex items-end gap-4">
          <div className="font-display text-[84px] leading-none">72</div>
          <div className="pb-1 text-[14px] text-muted">out of 100 · 4m 12s</div>
        </div>
        <div className="mt-4 grid gap-3">
          {[['विधि · Law', 64], ['तथ्य · Facts', 81], ['उत्तर · Bench', 70], ['वाणी · Delivery', 73]].map(([l, v]) => (
            <div key={l}>
              <div className="flex justify-between text-[14px]"><span>{l}</span><span className="font-medium">{v}</span></div>
              <div className="mt-1.5 h-2.5 rounded-full bg-white/70"><div className="h-full rounded-full bg-gradient-to-r from-violet to-royal" style={{ width: `${v}%` }} /></div>
            </div>
          ))}
        </div>
      </Window>
    ),
  },
]

export default function HowItWorks() {
  return (
    <section className="mx-auto max-w-[1360px] px-3 pb-10 pt-28 sm:px-5">
      <div className="mx-auto mb-14 max-w-3xl px-2 text-center">
        <SectionLabel>How it works</SectionLabel>
        <h2 className="font-display mt-3 text-[clamp(2rem,4.5vw,3.4rem)] leading-tight">From "I don't know what to do" to a hearing you're ready for.</h2>
      </div>
      <div className="relative">
        {STEPS.map((s, i) => (
          <div key={s.deva} className="sticky mb-8" style={{ top: 96 + i * 26 }}>
            <div
              className="grid min-h-[520px] items-center gap-8 overflow-hidden rounded-[28px] border border-line p-7 shadow-[0_-12px_40px_-24px_rgba(16,24,40,.25)] sm:p-12 md:grid-cols-[0.9fr_1.1fr]"
              style={{ background: BACKGROUNDS[i % BACKGROUNDS.length] }}
            >
              <div>
                <div className="flex items-baseline gap-3">
                  <span className="text-sm font-medium text-muted">0{i + 1}</span>
                  <span className="font-deva text-2xl text-ink-2">{s.deva}</span>
                </div>
                <h3 className="font-display mt-4 text-[clamp(1.8rem,3.4vw,2.8rem)] leading-tight">{s.title}</h3>
                <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-2">{s.body}</p>
                <a href={i < 3 ? '#/sahay' : '#/abhyas'} className="pill pill-dark mt-7 !py-2.5 text-sm">
                  {i < 3 ? 'Try सहाय' : 'Enter the court'} <ArrowRight size={15} />
                </a>
              </div>
              <div className="flex justify-center md:justify-end">{s.ui}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
