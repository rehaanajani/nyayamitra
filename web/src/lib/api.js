// Keys live in this browser only (Settings panel) and ride along as headers.
// Anything left empty falls back to the server's .env.
const KEY_STORE = 'nm_keys'

export function loadKeys() {
  try { return JSON.parse(localStorage.getItem(KEY_STORE)) || {} } catch { return {} }
}

export function saveKeys(keys) {
  try { localStorage.setItem(KEY_STORE, JSON.stringify(keys)) } catch { /* private mode */ }
  window.dispatchEvent(new Event('nm-keys'))
}

export function keyHeaders() {
  const k = loadKeys()
  const h = {}
  if (k.gnani) h['x-gnani-key'] = k.gnani
  if (k.llmBase) h['x-llm-base'] = k.llmBase
  if (k.llmKey) h['x-llm-key'] = k.llmKey
  if (k.llmModel) h['x-llm-model'] = k.llmModel
  return h
}

export async function api(path, body, opts = {}) {
  const res = await fetch(path, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...keyHeaders() },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: opts.signal,
  })
  if (!res.ok) {
    let msg = res.statusText
    try { msg = (await res.json()).detail || msg } catch { /* not json */ }
    throw new Error(msg)
  }
  return opts.raw ? res : res.json()
}

export const LANGS = [
  { id: 'hi', label: 'हिंदी', sub: 'Hindi · Hinglish' },
  { id: 'ta', label: 'தமிழ்', sub: 'Tamil · Tanglish' },
  { id: 'en', label: 'English', sub: 'Indian English' },
]
