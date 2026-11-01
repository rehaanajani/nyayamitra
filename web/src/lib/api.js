// All API keys live in server/.env; the browser never sees them.
export async function api(path, body, opts = {}) {
  const res = await fetch(path, {
    method: body === undefined ? 'GET' : 'POST',
    headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
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
