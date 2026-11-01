// All API keys live in server/.env; the browser never sees them.
// In production the backend runs separately (Cloud Run); VITE_API_BASE points at it.
export const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '')

export async function api(path, body, opts = {}) {
  const res = await fetch(API_BASE + path, {
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
