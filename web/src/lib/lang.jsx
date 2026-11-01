import { createContext, useContext, useEffect, useState } from 'react'

// The ten languages Gnani Prisma and Timbre support for voice.
export const LANGUAGES = [
  { code: 'en', name: 'English', english: 'English', voice: true },
  { code: 'hi', name: 'हिन्दी', english: 'Hindi', voice: true },
  { code: 'bn', name: 'বাংলা', english: 'Bengali', voice: true },
  { code: 'mr', name: 'मराठी', english: 'Marathi', voice: true },
  { code: 'te', name: 'తెలుగు', english: 'Telugu', voice: true },
  { code: 'ta', name: 'தமிழ்', english: 'Tamil', voice: true },
  { code: 'gu', name: 'ગુજરાતી', english: 'Gujarati', voice: true },
  { code: 'kn', name: 'ಕನ್ನಡ', english: 'Kannada', voice: true },
  { code: 'ml', name: 'മലയാളം', english: 'Malayalam', voice: true },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', english: 'Punjabi', voice: true },
]

export const langInfo = (code) => LANGUAGES.find((l) => l.code === code) || LANGUAGES[1]

const STORE = 'nm_lang'
const LangContext = createContext(['hi', () => {}])

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      const saved = localStorage.getItem(STORE)
      return LANGUAGES.some((l) => l.code === saved) ? saved : 'hi'
    } catch { return 'hi' }
  })
  useEffect(() => {
    try { localStorage.setItem(STORE, lang) } catch { /* private mode */ }
  }, [lang])
  return <LangContext.Provider value={[lang, setLang]}>{children}</LangContext.Provider>
}

export const useLang = () => useContext(LangContext)
