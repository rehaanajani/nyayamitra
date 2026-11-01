import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { KeyRound, X } from 'lucide-react'
import { api, loadKeys, saveKeys } from '../lib/api'

const FIELDS = [
  { id: 'gnani', label: 'Gnani API key', hint: 'From app.gnani.ai/voice. Powers Prisma (listening) and Timbre (speaking).', secret: true },
  { id: 'llmBase', label: 'LLM base URL', hint: 'OpenAI-compatible. Evon on vLLM: http://<host>:8000/v1', secret: false },
  { id: 'llmModel', label: 'LLM model', hint: 'e.g. gnani/gnani-evon-v3.3', secret: false },
  { id: 'llmKey', label: 'LLM API key', hint: 'Leave empty for a self-hosted Evon without auth.', secret: true },
]

export default function Settings({ open, onClose }) {
  const [keys, setKeys] = useState(loadKeys)
  const [result, setResult] = useState(null)
  const [testing, setTesting] = useState(false)

  useEffect(() => { if (open) { setKeys(loadKeys()); setResult(null) } }, [open])

  async function test() {
    saveKeys(keys)
    setTesting(true)
    try { setResult(await api('/api/check', {})) } catch (e) { setResult({ error: e.message }) }
    setTesting(false)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-40 bg-ink/20 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col gap-6 overflow-y-auto bg-white p-8 shadow-2xl"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.45 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-lav"><KeyRound size={18} /></div>
                <div>
                  <div className="font-display text-2xl">API keys</div>
                  <div className="text-sm text-muted">Saved in this browser only. Empty fields use the server's .env.</div>
                </div>
              </div>
              <button onClick={onClose} className="rounded-full p-2 hover:bg-canvas"><X size={18} /></button>
            </div>

            {FIELDS.map((f) => (
              <label key={f.id} className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">{f.label}</span>
                <input
                  type={f.secret ? 'password' : 'text'}
                  value={keys[f.id] || ''}
                  onChange={(e) => setKeys({ ...keys, [f.id]: e.target.value.trim() })}
                  className="rounded-xl border border-line bg-canvas px-4 py-2.5 text-sm outline-none transition focus:border-violet focus:bg-white"
                  autoComplete="off"
                  spellCheck={false}
                />
                <span className="text-xs text-muted">{f.hint}</span>
              </label>
            ))}

            <div className="flex gap-3">
              <button className="pill pill-dark" onClick={() => { saveKeys(keys); onClose() }}>Save</button>
              <button className="pill pill-light" onClick={test} disabled={testing}>{testing ? 'Testing…' : 'Save & test'}</button>
              <button className="pill pill-light ml-auto" onClick={() => { setKeys({}); saveKeys({}) }}>Clear</button>
            </div>

            {result && (
              <div className="rounded-2xl bg-canvas p-4 text-sm">
                {result.error && <div className="text-warn">{result.error}</div>}
                {'gnani' in result && <div>Gnani: <b>{result.gnani || 'no key set'}</b></div>}
                {'llm' in result && <div>LLM: <b>{result.llm || 'not set (offline fallbacks will be used)'}</b></div>}
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
