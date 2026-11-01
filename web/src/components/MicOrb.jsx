import { motion } from 'motion/react'
import { Mic, MicOff, Send } from 'lucide-react'
import { Orb } from './ui'

/**
 * The voice control: the violet ring with the mic in the middle, a status line
 * that always says whose turn it is, and a "Done" button while you're talking.
 *
 * on: voice mode wanted by the user; tone: 'go' (your turn), 'wait', 'speak'
 */
export default function MicOrb({ voice, on, onToggle, disabled, label, tone = 'go', size = 150 }) {
  const level = voice.speaking ? voice.outLevel : voice.micLevel
  const live = voice.listening || voice.speaking
  const dot = { go: 'bg-go animate-pulse', wait: 'bg-muted', speak: 'bg-violet animate-pulse' }[tone]
  return (
    <div className="flex flex-col items-center">
      <button
        onClick={onToggle}
        disabled={disabled}
        className="group relative grid place-items-center disabled:opacity-50"
        aria-label={on ? 'Turn voice off' : 'Turn voice on'}
        aria-pressed={on}
      >
        <Orb tone="bench" level={level} active={live} size={size} />
        <span className={`absolute grid h-14 w-14 place-items-center rounded-full shadow-lg transition group-hover:scale-105 ${voice.listening ? 'bg-ink text-white' : 'bg-white text-ink'}`}>
          {on ? <Mic size={24} /> : <MicOff size={22} />}
        </span>
      </button>
      <div className={`mt-2 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium ${tone === 'go' && voice.listening ? 'bg-ink text-white' : 'bg-white/80 text-ink'}`}>
        <span className={`h-2 w-2 rounded-full ${dot}`} />
        {label}
      </div>
      {voice.listening && voice.partial && (
        <motion.button
          initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          onClick={voice.submitNow}
          className="pill pill-dark mt-2 !py-1.5 text-sm"
        >
          <Send size={14} /> Done, submit
        </motion.button>
      )}
    </div>
  )
}
