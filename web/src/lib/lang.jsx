import { createContext, useContext, useEffect, useState } from 'react'

// Same 17 languages as Zuraksha. `voice`: Gnani Prisma + Timbre support it;
// the rest work by typing (the LLM reads and writes them).
export const LANGUAGES = [
  { code: 'en', name: 'English', english: 'English', voice: true },
  { code: 'hi', name: 'हिन्दी', english: 'Hindi', voice: true },
  { code: 'bn', name: 'বাংলা', english: 'Bengali', voice: true },
  { code: 'mr', name: 'मराठी', english: 'Marathi', voice: true },
  { code: 'te', name: 'తెలుగు', english: 'Telugu', voice: true },
  { code: 'ta', name: 'தமிழ்', english: 'Tamil', voice: true },
  { code: 'gu', name: 'ગુજરાતી', english: 'Gujarati', voice: true },
  { code: 'ur', name: 'اردو', english: 'Urdu', voice: false, rtl: true },
  { code: 'kn', name: 'ಕನ್ನಡ', english: 'Kannada', voice: true },
  { code: 'or', name: 'ଓଡ଼ିଆ', english: 'Odia', voice: false },
  { code: 'ml', name: 'മലയാളം', english: 'Malayalam', voice: true },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', english: 'Punjabi', voice: true },
  { code: 'as', name: 'অসমীয়া', english: 'Assamese', voice: false },
  { code: 'ks', name: 'کٲشُر', english: 'Kashmiri', voice: false, rtl: true },
  { code: 'sat', name: 'ᱥᱟᱱᱛᱟᱲᱤ', english: 'Santali', voice: false },
  { code: 'mni', name: 'ꯃꯤꯇꯩꯂꯣꯟ', english: 'Meitei (Manipuri)', voice: false },
  { code: 'sa', name: 'संस्कृतम्', english: 'Sanskrit', voice: false },
]

export const langInfo = (code) => LANGUAGES.find((l) => l.code === code) || LANGUAGES[1]

const STORE = 'nm_lang'
const LangContext = createContext(['hi', () => {}])

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem(STORE) || 'hi' } catch { return 'hi' }
  })
  useEffect(() => {
    try { localStorage.setItem(STORE, lang) } catch { /* private mode */ }
  }, [lang])
  return <LangContext.Provider value={[lang, setLang]}>{children}</LangContext.Provider>
}

export const useLang = () => useContext(LangContext)
