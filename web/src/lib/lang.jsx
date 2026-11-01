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

// Nav labels in each language: [help door, practice door, call to action]
export const NAV = {
  en: ['Get help', 'Practise', 'Get help'],
  hi: ['सहाय', 'अभ्यास', 'मदद लें'],
  bn: ['সহায়তা', 'অনুশীলন', 'সাহায্য নিন'],
  mr: ['मदत', 'सराव', 'मदत घ्या'],
  te: ['సహాయం', 'అభ్యాసం', 'సహాయం పొందండి'],
  ta: ['உதவி', 'பயிற்சி', 'உதவி பெறுங்கள்'],
  gu: ['મદદ', 'અભ્યાસ', 'મદદ મેળવો'],
  kn: ['ಸಹಾಯ', 'ಅಭ್ಯಾಸ', 'ಸಹಾಯ ಪಡೆಯಿರಿ'],
  ml: ['സഹായം', 'പരിശീലനം', 'സഹായം നേടുക'],
  pa: ['ਮਦਦ', 'ਅਭਿਆਸ', 'ਮਦਦ ਲਓ'],
}

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
