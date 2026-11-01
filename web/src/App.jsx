import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import { api } from './lib/api'
import Footer from './components/Footer'
import LanguageMenu from './components/LanguageMenu'
import { NAV, useLang } from './lib/lang'
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

const LINKS = [
  ['#/sahay', 'sahay', 0],
  ['#/abhyas', 'abhyas', 1],
]

export default function App() {
  const route = useRoute()
  const [lang] = useLang()
  const nav = NAV[lang] || NAV.en
  const [status, setStatus] = useState({})
  const [scrolled, setScrolled] = useState(false)
  const [inCourt, setInCourt] = useState(false)   // a live hearing owns the whole screen

  useEffect(() => {
    api('/api/status').then(setStatus).catch(() => setStatus({ offline: true }))
  }, [])

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  const page = route.path.startsWith('/sahay') ? 'sahay' : route.path.startsWith('/abhyas') ? 'abhyas' : 'home'

  return (
    <div className="min-h-screen">
      <header className="fixed inset-x-0 top-0 z-30 px-3 sm:px-5">
        <div
          className={`relative mx-auto mt-3 flex max-w-[1360px] items-center gap-3 rounded-full border px-3 py-2 transition-all duration-300 sm:px-4 ${
            scrolled ? 'border-line/80 bg-white/80 shadow-[0_8px_30px_-12px_rgba(16,24,40,.18)] backdrop-blur-xl' : 'border-transparent bg-white/40 backdrop-blur-md'
          }`}
        >
          <a href="#/" className="flex items-center pl-3" aria-label="Nyayamitra home">
            <span className="font-deva text-[26px] leading-none">न्यायमित्र</span>
          </a>

          <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full border border-white/80 bg-white/60 p-1 shadow-[0_6px_20px_-12px_rgba(16,24,40,.25)] backdrop-blur-xl md:flex">
            {LINKS.map(([href, id, i]) => (
              <a key={id} href={href} className={`relative rounded-full px-5 py-2 text-[15px] transition ${page === id ? 'text-white' : 'text-ink hover:bg-white/80'}`}>
                {page === id && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-ink" transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }} />}
                <span className={`relative text-[15px] font-medium ${lang === 'en' ? '' : 'font-deva text-[16px]'}`}>{nav[i]}</span>
              </a>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <LanguageMenu />
            <a href="https://github.com/rehaanajani/nyayamitra" target="_blank" rel="noreferrer" className="hidden rounded-full px-4 py-2 text-sm text-ink-2 transition hover:bg-canvas hover:text-ink sm:inline-flex sm:items-center sm:gap-1">
              GitHub <ArrowUpRight size={14} />
            </a>
            <a href="#/sahay" className="pill pill-dark !py-2 text-sm md:hidden">{nav[0]}</a>
            <a href="#/abhyas" className="pill pill-light !py-2 text-sm md:hidden">{nav[1]}</a>
            <a href="#/sahay" className="pill pill-dark hidden !py-2 text-sm md:inline-flex">{nav[2]} <ArrowUpRight size={14} /></a>
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
          {page === 'abhyas' && <Abhyas status={status} params={route.params} onCourt={setInCourt} />}
        </motion.main>
      </AnimatePresence>

      {!(page === 'abhyas' && inCourt) && <Footer />}
    </div>
  )
}
