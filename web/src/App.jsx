import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { api } from './lib/api'
import Home from './pages/Home'
import Sahay from './pages/Sahay'
import Abhyas from './pages/Abhyas'

function useRoute() {
  const read = () => {
    const [path, query = ''] = location.hash.replace(/^#/, '').split('?')
    return { path: path || '/', params: Object.fromEntries(new URLSearchParams(query)) }
  }
  const [route, setRoute] = useState(read)
  useEffect(() => {
    const on = () => { setRoute(read()); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return route
}

export function go(path) { location.hash = path }

function StatusDot({ on, label }) {
  return (
    <span className="chip" title={on ? `${label} connected` : `${label} not configured`}>
      <span className={`h-1.5 w-1.5 rounded-full ${on ? 'bg-go' : 'bg-[#d0d5dd]'}`} />
      {label}
    </span>
  )
}

export default function App() {
  const route = useRoute()
  const [status, setStatus] = useState({})

  useEffect(() => {
    api('/api/status').then(setStatus).catch(() => setStatus({ offline: true }))
  }, [])

  const page = route.path.startsWith('/sahay') ? 'sahay' : route.path.startsWith('/abhyas') ? 'abhyas' : 'home'

  return (
    <div className="min-h-screen">
      <header className="fixed inset-x-0 top-0 z-30">
        <div className="mx-auto mt-3 flex max-w-6xl items-center gap-4 rounded-full border border-line/70 bg-white/70 px-4 py-2 backdrop-blur-xl sm:px-5">
          <a href="#/" className="flex items-baseline gap-2">
            <span className="font-deva text-2xl leading-none">न्यायमित्र</span>
          </a>
          <nav className="ml-2 hidden gap-1 sm:flex">
            {[['#/sahay', 'सहाय', 'Get help'], ['#/abhyas', 'अभ्यास', 'Practise']].map(([href, deva, en]) => (
              <a key={href} href={href} className={`rounded-full px-3 py-1.5 text-sm transition ${page === href.slice(2) ? 'bg-ink text-white' : 'text-ink-2 hover:bg-canvas'}`}>
                <span className="font-deva">{deva}</span> <span className="opacity-60">· {en}</span>
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden gap-1.5 md:flex">
              <StatusDot on={status.gnani} label="Prisma" />
              <StatusDot on={status.gnani} label="Timbre" />
              <StatusDot on={status.llm} label={status.evon ? 'Evon' : 'LLM'} />
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.main
          key={page}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
        >
          {page === 'home' && <Home status={status} />}
          {page === 'sahay' && <Sahay status={status} />}
          {page === 'abhyas' && <Abhyas status={status} params={route.params} />}
        </motion.main>
      </AnimatePresence>
    </div>
  )
}
